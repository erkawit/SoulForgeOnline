"""Round 20: ChatGPT icon sheets (3x3: 6 actives then 3 passives, in skills/classes.ts order) -> one atlas
public/art/ui-forge/skills-classes.webp, 9 columns (skill slot) x 7 rows (class, CLASS_ROWS order), 128 px cells.
usage: python3 build_class_icons.py <folder with <Class>_icon_skill.png>"""
import os, sys
from PIL import Image
SRC = sys.argv[1]; ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ROWS = ['Paladin', 'Hawkeye', 'RuneMaster', 'Elementalist', 'Assassin', 'HighPriest', 'Inquisitor']; C = 128
atlas = Image.new('RGB', (C * 9, C * len(ROWS)), (0, 0, 0))
for r, cls in enumerate(ROWS):
    im = Image.open(os.path.join(SRC, f'{cls}_icon_skill.png')).convert('RGB'); W, H = im.size; inset = round(W * 0.012)
    for i in range(9):
        x0, y0 = (i % 3) * W / 3, (i // 3) * H / 3
        cell = im.crop((round(x0 + inset), round(y0 + inset), round(x0 + W / 3 - inset), round(y0 + H / 3 - inset))).resize((C, C), Image.LANCZOS)
        atlas.paste(cell, (i * C, r * C))
out = os.path.join(ROOT, 'public', 'art', 'ui-forge', 'skills-classes.webp'); atlas.save(out, 'WEBP', quality=90, method=6); print(out, atlas.size)
