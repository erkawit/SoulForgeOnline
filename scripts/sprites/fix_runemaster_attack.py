"""Rune Master attack: the painted W / SW runs turn round and strike toward the east (the sheet's E / SE runs are their
mirrors, so those strike west). Swap the strike frames (1-4) between W<->E and SW<->SE, keeping each run's first and
last frame (the ready pose, which already faces the right way) — every direction now strikes toward its facing.

usage: python3 scripts/sprites/fix_runemaster_attack.py public/art/anim/m-RuneMaster.webp
"""
import sys
from PIL import Image

CW, CH, COLS, START, COUNT = 490, 233, 8, 80, 6   # classAnims.ts m-RuneMaster attack: [80, 6], dirs S SW W NW N NE E SE
PAIRS = [(1, 7), (2, 6)]                          # SW<->SE, W<->E

path = sys.argv[1]
im = Image.open(path).convert('RGBA')
box = lambda i: ((i % COLS) * CW, (i // COLS) * CH, (i % COLS + 1) * CW, (i // COLS + 1) * CH)
for a, b in PAIRS:
    for j in range(1, COUNT - 1):
        ia, ib = START + a * COUNT + j, START + b * COUNT + j
        ca, cb = im.crop(box(ia)), im.crop(box(ib))
        im.paste(cb, box(ia)); im.paste(ca, box(ib))
im.save(path, 'WEBP', quality=92, alpha_quality=100, method=6)
print('swapped', path)
