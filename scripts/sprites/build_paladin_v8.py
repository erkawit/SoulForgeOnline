"""Round 25: build the Paladin flipbook from the approved-v8 set (sprites-v4/paladin on the art PC).

Inputs (staged copies; pass the folder that holds approved-v8 contents):
  walk/paladin_walk_<D>_spaced.png      4 x 2 cells of 640 x 896, 8 frames, all 8 facings
  death/paladin_death_<D>_spaced.png    same layout, 6 facings (N uses the v3 sheet); SW / W are mirrored from SE / E
  combat/normal_attack/<D>/01..08.png   the basic attack, 640 x 896 frames
  skills-expanded-v1/paladin_male_skill-<id>_<D>_raw_v1.png   one raw ChatGPT sheet per skill and facing (4 x 2 or 5 x 2)

Every frame loses the ChatGPT haze, then each (action, facing) run is scaled so its first frame's body is BODY px tall
and placed with the feet on one anchor; the runs share one cell size. Clips are 8 runs (S SW W NW N NE E SE).
Skills get their own clip ("sk:<skill id>"); "skill" and "buff" point at Judgement Blade and Sacred Vow for the game's
generic Skill / Buff clips. The sheet must fit 4096 x 4096 (phones), so BODY is lowered until it does.

usage: python3 scripts/sprites/build_paladin_v8.py <approved-v8 folder> <combat folder>
writes public/art/anim/m-Paladin.webp, m-Paladin-lite.webp, the m-Paladin entries of classAnims.ts / classLite.ts and
the portraits public/art/portraits/paladin-face.png / -full.png
"""
import json, math, sys
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt

SRC, COMBAT = sys.argv[1], sys.argv[2]
DIRS = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE']
SKILLS = ['p-shield-bash', 'p-sacred-vow', 'p-judgement-blade', 'p-holy-cleave', 'p-bulwark', 'p-dawn-crusade']
STRONG, KEEP, FADE, FLOOR = 140, 2, 10, 10
LIMIT = 4096


def clean(a):
    """ChatGPT haze: weak alpha survives only right next to the solid body.
    Some sheets come back with a translucent white veil over the WHOLE canvas (shield-bash SE: alpha 150-175 everywhere,
    which read as a white square in the game). That veil is measured (5th percentile of alpha) and taken out first:
    alpha is rescaled so the veil level becomes 0, and the solid threshold moves above it."""
    al = a[..., 3].astype(np.float32); veil = float(np.percentile(al, 5))
    if veil > 40:
        al = np.clip((al - veil - 8) / (255 - veil - 8), 0, 1) * 255
        a = a.copy(); a[..., 3] = al.astype(np.uint8)
    strong = al >= STRONG
    if not strong.any(): return a
    fall = np.clip(1 - (distance_transform_edt(~strong) - KEEP) / FADE, 0, 1)
    na = np.where(strong, al, al * fall); na[(na < FLOOR) & ~strong] = 0
    out = a.copy(); out[..., 3] = na.astype(np.uint8); out[out[..., 3] == 0, :3] = 0
    return out


def grid(path, cols, rows):
    im = np.array(Image.open(path).convert('RGBA')); H, W = im.shape[:2]; cw, ch = W // cols, H // rows
    return [im[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw] for r in range(rows) for c in range(cols)]


def raw_grid(path):
    """4 x 2 or 5 x 2: the layout whose cell borders cross the least of the (cleaned) body"""
    im = clean(np.array(Image.open(path).convert('RGBA'))); H, W = im.shape[:2]; a = im[..., 3]
    def cost(cols): return sum(int((a[:, round(W * c / cols)] >= STRONG).sum()) for c in range(1, cols))
    cols = min((4, 5), key=cost)
    return [im[r * H // 2:(r + 1) * H // 2, c * W // cols:(c + 1) * W // cols] for r in range(2) for c in range(cols)]


def pick(frames, n):
    if len(frames) <= n: return frames
    return [frames[round(i)] for i in np.linspace(0, len(frames) - 1, n)]


def body(a):
    """(top, bottom, foot x) of the body — rows thinner than a quarter of the typical row (a raised blade) don't count"""
    s = a[..., 3] >= STRONG; rows = s.sum(1); nz = np.nonzero(rows)[0]
    med = np.median(rows[nz]); solid = np.nonzero(rows >= med * 0.25)[0]
    top, bot = solid[0], nz[-1]
    legs = s[bot - (bot - top) // 4:bot + 1]; xs = np.nonzero(legs)[1]
    return top, bot, xs.mean()


# ---------- load ----------
runs = {}  # (clip, dir) -> list of RGBA frames
for d in DIRS:
    runs['walk', d] = [clean(f) for f in grid(f'{SRC}/walk/paladin_walk_{d}_spaced.png', 4, 2)]
    runs['attack', d] = [clean(np.array(Image.open(f'{COMBAT}/normal_attack/{d}/{i:02d}.png').convert('RGBA'))) for i in range(1, 9)]
    runs['idle', d] = [runs['attack', d][0]]
    for s in SKILLS: runs['sk:' + s, d] = pick(raw_grid(f'{SRC}/skills-expanded-v1/paladin_male_skill-{s}_{d}_raw_v1.png'), 6)
death_src = {'S': 'S', 'SE': 'SE', 'E': 'E', 'NE': 'NE', 'N': 'N_v3', 'NW': 'NW'}
for d, f in death_src.items(): runs['death', d] = pick([clean(x) for x in grid(f'{SRC}/death/paladin_death_{f}_spaced.png', 4, 2)], 6)
runs['death', 'SW'] = [x[:, ::-1].copy() for x in runs['death', 'SE']]  # no SW / W death painted: mirrored (falls, the hands read either way)
runs['death', 'W'] = [x[:, ::-1].copy() for x in runs['death', 'E']]

CLIPS = ['idle', 'walk', 'attack', 'death'] + ['sk:' + s for s in SKILLS]


def place(body_px):
    """scale every run to body_px and measure the shared cell around the foot anchor"""
    out, ext = {}, []
    for k, fr in runs.items():
        top, bot, fx = body(fr[0]); sc = body_px / (bot - top)
        out[k] = (sc, bot, fx)
        for f in fr:
            ys, xs = np.nonzero(f[..., 3] >= 24)
            ext.append(((xs.min() - fx) * sc, (xs.max() - fx) * sc, (ys.min() - bot) * sc, (ys.max() - bot) * sc))
    e = np.array(ext)
    # the cell holds 99 % of every extent (a few long sword tips are clipped rather than doubling every cell)
    L, R, T, B = np.percentile(e[:, 0], 1), np.percentile(e[:, 1], 99), np.percentile(e[:, 2], 1), e[:, 3].max()
    return out, (math.floor(L) - 2, math.ceil(R) + 2, math.floor(T) - 2, math.ceil(B) + 3)


n = sum(len(runs[c, 'S']) * 8 for c in CLIPS)
bp = 200.0
while True:
    pos, (L, R, T, B) = place(bp); cw, ch = R - L, B - T; cols = LIMIT // cw
    if cols and math.ceil(n / cols) * ch <= LIMIT: break
    bp -= 2
print('body px', bp, 'cell', cw, ch, 'cols', cols, 'cells', n)

sheet = Image.new('RGBA', (cols * cw, math.ceil(n / cols) * ch), (0, 0, 0, 0))
clips, i = {}, 0


def cell_img(k, f, cwid, chei, Lx, Ty, ps):
    sc, bot, fx = ps[k]; im = Image.fromarray(f)
    w, h = round(im.width * sc), round(im.height * sc); im = im.resize((w, h), Image.LANCZOS)
    c = Image.new('RGBA', (cwid, chei), (0, 0, 0, 0)); c.paste(im, (round(-Lx - fx * sc), round(-Ty - bot * sc)), im)
    return c


for c in CLIPS:
    cnt = len(runs[c, 'S']); clips[c] = [i, cnt]
    for d in DIRS:
        fr = runs[c, d]; assert len(fr) == cnt, (c, d, len(fr))
        for f in fr:
            sheet.paste(cell_img((c, d), f, cw, ch, L, T, pos), ((i % cols) * cw, (i // cols) * ch)); i += 1
clips['skill'] = clips['sk:p-judgement-blade']; clips['buff'] = clips['sk:p-sacred-vow']
sheet.save('public/art/anim/m-Paladin.webp', 'WEBP', quality=90, alpha_quality=100, method=6)
anim = {'cw': cw, 'ch': ch, 'cols': cols, 'n': n, 'fx': round(-L / cw, 4), 'fy': round(B / ch, 4), 'bodyPx': bp, 'clips': clips, 'dirs': 8}
print('sheet', sheet.size)

# ---------- login lineup (facing S only, 0.6 scale): idle 1 · attack · skill ----------
lb = round(bp * 0.6); lpos, (lL, lR, lT, lB) = place(lb); lcw, lch = lR - lL, lB - lT
lite_runs = [('idle', runs['idle', 'S']), ('attack', pick(runs['attack', 'S'], 6)), ('skill', runs['sk:p-judgement-blade', 'S'])]
ln = sum(len(r) for _, r in lite_runs); lite = Image.new('RGBA', (8 * lcw, math.ceil(ln / 8) * lch), (0, 0, 0, 0)); lclips, j = {}, 0
for name, fr in lite_runs:
    lclips[name] = [j, len(fr)]; key = ('idle', 'S') if name == 'idle' else ('attack', 'S') if name == 'attack' else ('sk:p-judgement-blade', 'S')
    for f in fr: lite.paste(cell_img(key, f, lcw, lch, lL, lT, lpos), ((j % 8) * lcw, (j // 8) * lch)); j += 1
lite.save('public/art/anim/m-Paladin-lite.webp', 'WEBP', quality=90, alpha_quality=100, method=6)
lite_anim = {'cw': lcw, 'ch': lch, 'cols': 8, 'n': ln, 'fx': round(-lL / lcw, 4), 'fy': round(lB / lch, 4), 'bodyPx': lb, 'clips': lclips}


def put(path, name, key, value):
    src = open(path).read(); a = src.index(f'export const {name}'); s = src.index(f'"{key}": {{', a); b = src.index('{', s); depth = 0
    for k in range(b, len(src)):
        depth += src[k] == '{'; depth -= src[k] == '}'
        if depth == 0: break
    body_ = json.dumps(value, indent=1).replace('\n', '\n ')
    open(path, 'w').write(src[:b] + body_ + src[k + 1:])


put('src/game/sprites/classAnims.ts', 'CLASS_ANIMS', 'm-Paladin', anim)
put('src/game/sprites/classLite.ts', 'CLASS_LITE', 'm-Paladin-lite', lite_anim)

# ---------- portraits from the approved facing-S pose ----------
idle = Image.fromarray(runs['idle', 'S'][0]); bb = idle.getbbox(); full = idle.crop(bb)
full.thumbnail((420, 420), Image.LANCZOS); full.save('public/art/portraits/paladin-full.png', optimize=True)
top, bot, fx = body(runs['idle', 'S'][0]); hgt = bot - top; side = round(hgt * 0.42)
face = idle.crop((round(fx - side / 2), top - round(side * 0.04), round(fx + side / 2), top + side - round(side * 0.04))).resize((256, 256), Image.LANCZOS)
face.save('public/art/portraits/paladin-face.png', optimize=True)
print('done', anim['fx'], anim['fy'], lite_anim)
