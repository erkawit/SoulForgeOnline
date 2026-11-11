"""Repack the 8 class flipbooks so every sheet fits a 4096 x 4096 texture (most phones' limit; larger sheets were being
resized by the browser on the main thread at first sight — a visible hitch — and took 60-100 MB of GPU memory each).

Frames keep their order; the cell is scaled down just enough that ceil(n / cols) rows fit, then the grid is rewritten.
cw / ch / cols, bodyPx and CLASS_FRAMES.px in src/game/sprites/classAnims.ts are updated to match (fx / fy are fractions).
usage: python3 scripts/sprites/fit_class_sheets.py
"""
import json, math, re
from PIL import Image

P = 'src/game/sprites/classAnims.ts'
src = open(P).read()
def block(name):
    a = src.index(f'export const {name}'); b = src.index('{', a); depth = 0
    for i in range(b, len(src)):
        depth += src[i] == '{'; depth -= src[i] == '}'
        if depth == 0: return b, i + 1
anims_span, frames_span = block('CLASS_ANIMS'), block('CLASS_FRAMES')
anims, frames = json.loads(src[slice(*anims_span)]), json.loads(src[slice(*frames_span)])
LIMIT = 4096
for key, a in anims.items():
    path = f'public/art/anim/{key}.webp'; im = Image.open(path).convert('RGBA')
    cw, ch, cols, n = a['cw'], a['ch'], a['cols'], a['n']
    if cols * cw <= LIMIT and math.ceil(n / cols) * ch <= LIMIT: print(key, 'fits'); continue
    s = 1.0
    while True:
        ncw, nch = round(cw * s), round(ch * s); ncols = LIMIT // ncw; rows = math.ceil(n / ncols)
        if rows * nch <= LIMIT and ncols * ncw <= LIMIT: break
        s -= 0.005
    out = Image.new('RGBA', (ncols * ncw, rows * nch), (0, 0, 0, 0))
    for i in range(n):
        x, y = (i % cols) * cw, (i // cols) * ch
        cell = im.crop((x, y, x + cw, y + ch)).resize((ncw, nch), Image.LANCZOS)
        out.paste(cell, ((i % ncols) * ncw, (i // ncols) * nch))
    out.save(path, 'WEBP', quality=92, alpha_quality=100, method=4)
    sy = nch / ch
    a.update(cw=ncw, ch=nch, cols=ncols, bodyPx=round(a['bodyPx'] * sy, 2))
    if key in frames: frames[key]['px'] = [round(frames[key]['px'][0] * ncw / cw), round(frames[key]['px'][1] * sy)]
    print(key, (im.width, im.height), '->', out.size, 'scale %.3f' % sy)
new = src[:anims_span[0]] + json.dumps(anims, indent=1) + src[anims_span[1]:frames_span[0]] + json.dumps(frames, indent=1) + src[frames_span[1]:]
open(P, 'w').write(new)
