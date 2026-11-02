"""Round 20: ChatGPT class sheets (5 rows S, SW, W, NW, N facing screen-left x 4 idle frames, transparent PNG)
-> 8-direction flipbook atlas public/art/anim/<g>-<Class>.webp (NE / E / SE mirrored from NW / W / SW),
   still public/art/sprites/<g>-<Class>.webp (S, frame 1) and src/game/sprites/classAnims.ts.
usage: python3 build_class_idle.py <folder with sheets named <Class> or <Class>-<g>[.png]> [<g>=m]"""
import sys, os, json
import numpy as np
from PIL import Image

SRC, G = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'm')
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CLASSES = ['Paladin', 'Hawkeye', 'RuneMaster', 'Elementalist', 'Assassin', 'HighPriest', 'Inquisitor']
BODY_PX, PAD, WORLD_H = 200, 6, 1.62

from scipy import ndimage

def peaks(profile, want, min_dist):
    """centres of `want` evenly spaced figures: the spacing / offset whose sample points collect the most opaque mass"""
    k = np.ones(41) / 41; p = np.convolve(profile, k, mode='same'); n = len(p); best = (-1, 0, 0)
    for d in range(min_dist, n // (want - 1) + 1, 2):
        for x0 in range(0, n - d * (want - 1), 2):
            v = p[x0 + d * np.arange(want)].sum()
            if v > best[0]: best = (v, x0, d)
    return [best[1] + best[2] * i for i in range(want)]

def gap(counts, lo, hi):
    """the emptiest line between two figure centres (smoothed, ties -> the middle)"""
    seg = np.convolve(counts[lo:hi].astype(float), np.ones(5) / 5, mode='same'); m = seg.min()
    idx = np.where(seg <= m + 0.5)[0]; return lo + int(idx[len(idx) // 2])

def cut(path):
    """5 x 4 figures on a regular grid. Centres = evenly spaced peaks of the opaque mass; the line between two neighbours is
    the emptiest line inside that column (rows) / that row (columns), so a head never goes to the row above and a sword
    tip stays with its owner."""
    im = Image.open(path).convert('RGBA'); arr = np.array(im); a = arr[:, :, 3]; H, W = a.shape; solid = a > 60
    ys_c = peaks((a > 200).sum(1).astype(float), 5, H // 7); xs_c = peaks((a > 200).sum(0).astype(float), 4, W // 6)
    xb = [0] + [(xs_c[i] + xs_c[i + 1]) // 2 for i in range(3)] + [W]   # rough column strips to find the row gaps
    out = []
    for r in range(5):
        frames = []
        for c in range(4):
            strip = solid[:, xb[c]:xb[c + 1]].sum(1)
            top = 0 if r == 0 else gap(strip, ys_c[r - 1], ys_c[r]); bot = H if r == 4 else gap(strip, ys_c[r], ys_c[r + 1])
            band = solid[top:bot].sum(0)
            left = 0 if c == 0 else gap(band, xs_c[c - 1], xs_c[c]); right = W if c == 3 else gap(band, xs_c[c], xs_c[c + 1])
            px = arr[top:bot, left:right].copy()
            # slivers of a neighbour cut by the cell line: small blobs touching the cell edge
            lab, n = ndimage.label(px[:, :, 3] > 8); sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); big = sizes.max()
            for i, sl in enumerate(ndimage.find_objects(lab), start=1):
                edge = sl[0].start == 0 or sl[1].start == 0 or sl[0].stop == lab.shape[0] or sl[1].stop == lab.shape[1]
                if edge and sizes[i - 1] < big * 0.05: px[lab == i] = 0
            s = px[:, :, 3] > 40; ys, xs = np.where(s)
            px = px[ys.min():ys.max() + 1, xs.min():xs.max() + 1]; s = px[:, :, 3] > 40; crop = Image.fromarray(px, 'RGBA')
            h = s.shape[0]; bandf = s[int(h * 0.88):]; bx = np.where(bandf.any(0))[0]
            # horizontal anchor: centre of the feet (lowest 12 % of the figure), so weapons do not shift the body
            frames.append((crop, (bx[0] + bx[-1]) / 2 if len(bx) else s.shape[1] / 2))
        out.append(frames)
    return out

anims, frames = {}, {}
for cls in CLASSES:
    cand = [f for f in os.listdir(SRC) if os.path.splitext(f)[0] in (cls, f'{cls}-{G}')]
    if not cand: print('skip', cls); continue
    grid = cut(os.path.join(SRC, cand[0]))
    body = np.median([f[0].size[1] for f in grid[0]])  # south-facing idle height
    k = BODY_PX / body
    scaled = [[(c.resize((max(1, round(c.size[0] * k)), max(1, round(c.size[1] * k))), Image.LANCZOS), fx * k) for c, fx in row] for row in grid]
    # cell: wide enough for the furthest reach either side of the feet, tall enough for the tallest frame
    left = max(fx for row in scaled for _, fx in row); right = max(c.size[0] - fx for row in scaled for c, fx in row)
    half = int(np.ceil(max(left, right))) + PAD; cw = half * 2; ch = int(max(c.size[1] for row in scaled for c, _ in row)) + PAD * 2
    dirs = scaled + [[(c.transpose(Image.FLIP_LEFT_RIGHT), c.size[0] - fx) for c, fx in scaled[i]] for i in (3, 2, 1)]  # NE, E, SE
    cols, n = 16, 32; atlas = Image.new('RGBA', (cw * cols, ch * (n // cols)), (0, 0, 0, 0))
    for d, row in enumerate(dirs):
        for f, (c, fx) in enumerate(row):
            i = d * 4 + f; cx, cy = (i % cols) * cw, (i // cols) * ch
            atlas.alpha_composite(c, (cx + int(round(half - fx)), cy + ch - PAD - c.size[1]))
    key = f'{G}-{cls}'
    atlas.save(os.path.join(ROOT, 'public', 'art', 'anim', key + '.webp'), 'WEBP', quality=90, method=6)
    still = atlas.crop((0, 0, cw, ch)); bb = still.getbbox(); still = still.crop((bb[0], 0, bb[2], ch))
    still.save(os.path.join(ROOT, 'public', 'art', 'sprites', key + '.webp'), 'WEBP', quality=90, method=6)
    sh = ch - PAD  # still: feet at PAD from the bottom
    anims[key] = {'cw': cw, 'ch': ch, 'cols': cols, 'n': n, 'fx': 0.5, 'fy': round(PAD / ch, 4), 'bodyPx': BODY_PX, 'clips': {'idle': [0, 4]}, 'dirs': 8}
    hs = WORLD_H * ch / BODY_PX
    frames[key] = {'w': round(hs * still.size[0] / ch, 4), 'h': round(WORLD_H, 4), 'fx': round((half - bb[0]) / still.size[0], 4), 'fy': round(PAD / ch, 4), 'px': [still.size[0], ch]}
    print(key, 'cell', cw, ch, 'scale', round(k, 3))

ts = os.path.join(ROOT, 'src', 'game', 'sprites', 'classAnims.ts')
old = {}
if os.path.exists(ts):
    t = open(ts, encoding='utf-8').read()
    for name in ('ANIMS', 'FRAMES'):
        s = t.index(f'CLASS_{name}') ; s = t.index('{', t.index('=', s)); e = t.index('\n};', s) + 2
        old[name] = json.loads(t[s:e].replace("'", '"'))
anims = {**old.get('ANIMS', {}), **anims}; frames = {**old.get('FRAMES', {}), **frames}
with open(ts, 'w', encoding='utf-8', newline='\n') as f:
    f.write('// Round 20: 8-direction idle sheets of the new classes (ChatGPT, 5 painted facings + 3 mirrored), built by\n')
    f.write('// scripts/sprites/build_class_idle.py — do not edit by hand. Walk / attack / skill play as rig motion on these frames\n')
    f.write('// until the per-action sheets ship.\n')
    f.write("import type { SpriteAnim } from './anims';\nimport type { SpriteFrame } from './frames';\n")
    f.write('export const CLASS_ANIMS: Record<string, SpriteAnim> = ' + json.dumps(anims, indent=1) + ';\n')
    f.write('export const CLASS_FRAMES: Record<string, SpriteFrame> = ' + json.dumps(frames, indent=1) + ';\n')
print('wrote', ts)
