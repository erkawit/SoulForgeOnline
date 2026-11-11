"""Remove the faint rectangular haze ChatGPT leaves around painted sprites and effect sheets.

class sheets (RGBA flipbooks, public/art/anim/m-<Class>.webp):
  inside every cell, pixels weaker than STRONG alpha keep their alpha only near the solid body / glow core and fade
  to 0 over FADE px — the soft glow stays, the hard-edged box of leftover background disappears.
effect sheets (additive on black, public/art/fx/class/<key>.webp, 3 x 2 cells):
  the dark noise floor (which additive blending turns into a grey box) is crushed to black and every cell edge fades out.

usage: python3 scripts/sprites/clean_haze.py anim <file.webp> <cw> <ch> <cols>
       python3 scripts/sprites/clean_haze.py fx <file.webp>
"""
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt

STRONG, KEEP, FADE, FLOOR = 140, 2, 10, 10


def clean_anim(path, cw, ch, cols):
    im = np.array(Image.open(path).convert('RGBA'))
    H, W = im.shape[:2]
    for y0 in range(0, H - ch + 1, ch):
        for x0 in range(0, W - cw + 1, cw):
            cell = im[y0:y0 + ch, x0:x0 + cw]
            a = cell[..., 3].astype(np.float32)
            strong = a >= STRONG
            if not strong.any():
                continue
            dist = distance_transform_edt(~strong)
            fall = np.clip(1 - (dist - KEEP) / FADE, 0, 1)
            weak = ~strong
            na = np.where(weak, a * fall, a)
            na[(na < FLOOR) & weak] = 0
            cell[..., 3] = na.astype(np.uint8)
            cell[cell[..., 3] == 0, :3] = 0
    Image.fromarray(im).save(path, 'WEBP', quality=92, alpha_quality=100, method=6)


def clean_fx(path, cols=3, rows=2, cut=30, edge=0.06):
    im = np.array(Image.open(path).convert('RGB')).astype(np.float32)
    H, W = im.shape[:2]
    cw, ch = W // cols, H // rows
    m = im.max(-1, keepdims=True)
    # black-level crush: everything at or below `cut` becomes pure black, the rest is stretched back to full range
    scale = np.clip((m - cut) / (255 - cut), 0, 1) / np.maximum(m / 255, 1e-6)
    im = im * np.minimum(scale, 1 / max(1e-6, 1 - cut / 255))
    # per-cell vignette so a frame never shows a straight edge
    yy, xx = np.mgrid[0:ch, 0:cw].astype(np.float32)
    ex, ey = cw * edge, ch * edge
    v = np.clip(np.minimum(np.minimum(xx, cw - 1 - xx) / ex, np.minimum(yy, ch - 1 - yy) / ey), 0, 1)[..., None]
    for r in range(rows):
        for c in range(cols):
            im[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw] *= v
    Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).save(path, 'WEBP', quality=90, method=6)


if __name__ == '__main__':
    kind, path = sys.argv[1], sys.argv[2]
    if kind == 'anim':
        clean_anim(path, int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]))
    else:
        clean_fx(path)
    print('cleaned', path)
