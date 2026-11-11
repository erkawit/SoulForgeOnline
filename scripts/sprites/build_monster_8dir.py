"""Build an 8-direction monster flipbook from the ChatGPT/Codex sheets in soulforge-transfer/output/monster-sheets.

Each source sheet (<id>-<action>-8dir-padding2x.png + .json) has non-uniform cells, so frames are cut by the JSON
`visibleBand` boxes, never by an equal grid. Actions come at different scales (the idle sheet is ~2.5x bigger), so each
action is scaled to the walk body height (S facing, first frame). Every frame is pasted into one uniform cell, feet on the
cell's bottom line, horizontally centred on the frame's own footprint.

Atlas layout matches SpriteAnim dirs:8 — each clip is 8 runs of `count` frames in the order S SW W NW N NE E SE.
usage: python3 scripts/sprites/build_monster_8dir.py <sheets dir> <monster id> <out webp> <body px>
prints the SPRITE_ANIMS entry (JSON) on stdout.
"""
import json, sys, os
from PIL import Image

DIRS = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE']
ACTIONS = [('idle', 'idle'), ('walk', 'walk'), ('attack', 'attack'), ('death', 'death')]
PAD = 6

src, mid, out, body = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])

def load(action):
    base = os.path.join(src, f'{mid}-{action}-8dir-padding2x')
    meta = json.load(open(base + '.json')); im = Image.open(base + '.png').convert('RGBA')
    by = {d: [] for d in DIRS}
    for f in sorted(meta['frames'], key=lambda f: (DIRS.index(f['direction']), f['frame'])):
        b = f['visibleBand']; crop = im.crop((b['x'], b['y'], b['x'] + b['width'], b['y'] + b['height']))
        bb = crop.getbbox()  # trim to the visible pixels
        by[f['direction']].append(crop.crop(bb) if bb else crop)
    return by

clips = {name: load(action) for name, action in ACTIONS}
ref = clips['walk']['S'][0].height
scale = {name: body / ref for name in clips}
for name in ('idle', 'attack'):
    scale[name] = body / clips[name]['S'][0].height
scale['death'] = body / clips['death']['S'][0].height  # first death frame is still standing

frames = []  # (clip, dir, image)
for name, by in clips.items():
    for d in DIRS:
        for im in by[d]:
            s = scale[name]; frames.append((name, d, im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)))
cw = max(f[2].width for f in frames) + 2 * PAD; ch = max(f[2].height for f in frames) + 2 * PAD
counts = {name: len(by['S']) for name, by in clips.items()}
assert all(len(by[d]) == counts[name] for name, by in clips.items() for d in DIRS), 'every direction needs the same frame count'
n = len(frames); cols = max(1, min(n, 4096 // cw)); rows = -(-n // cols)
assert cols * cw <= 4096 and rows * ch <= 4096, (cw, ch, cols, rows)
atlas = Image.new('RGBA', (cols * cw, rows * ch), (0, 0, 0, 0))
for i, (_, _, im) in enumerate(frames):
    x0, y0 = (i % cols) * cw, (i // cols) * ch
    atlas.paste(im, (x0 + (cw - im.width) // 2, y0 + ch - PAD - im.height), im)
atlas.save(out, 'WEBP', quality=90, alpha_quality=100, method=4)
start, clip_ranges = 0, {}
for name, _ in ACTIONS:
    clip_ranges[name] = [start, counts[name]]; start += counts[name] * 8
print(json.dumps({'cw': cw, 'ch': ch, 'cols': cols, 'n': n, 'fx': 0.5, 'fy': round(PAD / ch, 4), 'bodyPx': float(body), 'clips': clip_ranges, 'dirs': 8}))
