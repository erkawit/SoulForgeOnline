"""Round 20: HUD / inventory portraits from the ChatGPT idle sheets — the south-facing first frame:
public/art/portraits/<class>-full.png (whole figure) and <class>-face.png (head and chest, square).
usage: build_class_portraits.py <folder with <Class>.png idle sheets>"""
import os, sys
import numpy as np
from PIL import Image
sys.argv = [sys.argv[0], sys.argv[1], 'm']
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'build_class_idle.py')).read().split('# action -> (frames per row')[0]
exec(compile(src, 'build_class_idle.py', 'exec'))
OUT = os.path.join(ROOT, 'public', 'art', 'portraits')
for cls in ['Paladin', 'Hawkeye', 'RuneMaster', 'Elementalist', 'Assassin', 'HighPriest', 'Inquisitor', 'Berserker']:
    p = os.path.join(SRC, cls + '.png')
    if not os.path.exists(p): print('skip', cls); continue
    fig, _ = cut(p, 4)[0][0]  # row south, frame 1
    a = np.array(fig)[:, :, 3] > 40; ys, xs = np.where(a); fig = fig.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    w, h = fig.size; pad = int(h * 0.04)
    full = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0)); full.alpha_composite(fig, (pad, pad))
    full.save(os.path.join(OUT, cls.lower() + '-full.png'))
    # face: the top 48 % of the body (head and chest), centred on the head (the topmost opaque columns), square
    top = fig.crop((0, 0, w, int(h * 0.48))); ta = np.array(top)[:, :, 3] > 40
    # head centre: the opaque mass of the head band (8-30 % of the body height), so a staff or a bow beside the head does not pull it
    band = np.array(fig)[int(h * 0.08):int(h * 0.30), :, 3] > 40; cols = band.sum(0); cx = float((cols * np.arange(w)).sum() / max(1, cols.sum()))
    side = int(h * 0.48); x0 = int(round(cx - side / 2))
    face = Image.new('RGBA', (side, side), (0, 0, 0, 0)); face.alpha_composite(top.crop((max(0, x0), 0, min(w, x0 + side), side)), (max(0, -x0), 0))
    face.resize((256, 256), Image.LANCZOS).save(os.path.join(OUT, cls.lower() + '-face.png'))
    print(cls, full.size)
