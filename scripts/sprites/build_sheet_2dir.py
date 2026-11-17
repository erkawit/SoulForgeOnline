"""Build left / right sprite sheets from one-frame-per-image art generated off a Master Reference.

Input (one folder per actor, see docs/prompts/MONSTER_BOSS_PROMPTS_2DIR.md):
  reference/sprites-2dir/<id>/master.png
  reference/sprites-2dir/<id>/<right|left>/<idle|walk|attack|skill>/01.png, 02.png …

What it does:
  1. removes the flat green (#00FF00) background, or keeps the alpha if the image is transparent;
  2. measures the character in master.png (height, width, foot line) — the single source of size;
  3. checks every frame against it: body height must match the master (±4 %), never resized silently;
  4. places each frame in a cell 4 × the master body WIDTH and 4 × the master body HEIGHT, body centred
     horizontally and the feet on one line — so the empty space on every side is exact (1.5 × the body);
  5. writes reference/sprites-2dir/<id>/sheet-right.png and sheet-left.png — the 4×-spaced review sheets, one row
     per pose (scaled with --review-scale);
  6. writes public/art/anim/<id>.webp (+ <id>-left.webp) for the game: the same frames cropped to what is actually
     drawn (4×-empty cells would make a texture too big for the GPU) at --game-body px, and prints the SPRITE_ANIMS entry.

  python scripts/sprites/build_sheet_2dir.py drowned-hierophant
  python scripts/sprites/build_sheet_2dir.py drowned-hierophant --game-body 360 --review-scale 0.25
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CLIPS = ['idle', 'walk', 'attack', 'skill']
TOL = 0.04          # body height may differ from the master by 4 %
CELL_X = CELL_Y = 4  # cell = 4 × body width / height


def clean(path):
    im = np.array(Image.open(path).convert('RGBA')).astype(np.int16)
    r, g, b, al = im[..., 0], im[..., 1], im[..., 2], im[..., 3]
    corners = [im[0, 0], im[0, -1], im[-1, 0], im[-1, -1]]
    if all(c[3] > 250 for c in corners):
        bg = im[0, 0, :3]
        key = ((g > 150) & (r < 120) & (b < 120)) | (np.abs(im[..., :3] - bg).sum(-1) < 60)
        al = np.where(key, 0, al)
        fringe = (al > 0) & (g > r + 40) & (g > b + 40)          # green spill on the edge
        g = np.where(fringe, (r + b) // 2, g)
        im = np.stack([r, g, b, al], -1)
    return Image.fromarray(im.clip(0, 255).astype(np.uint8), 'RGBA')


def bbox(im):
    box = im.getchannel('A').point(lambda a: 255 if a > 40 else 0).getbbox()
    if not box:
        raise ValueError('empty image')
    return box  # l, t, r, b


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('id')
    ap.add_argument('--game-body', type=int, default=0, help='body height in the game sheet (px); default = master / 2.5')
    ap.add_argument('--review-scale', type=float, default=0.25, help='scale of the 4×-spaced review sheets')
    a = ap.parse_args()
    base = os.path.join(ROOT, 'reference/sprites-2dir', a.id)
    master_path = os.path.join(base, 'master.png')
    if not os.path.exists(master_path):
        sys.exit('missing ' + master_path + ' — make the MASTER REFERENCE first')
    m = clean(master_path); ml, mt, mr, mb = bbox(m)
    body_h, body_w = mb - mt, mr - ml
    foot_x = (ml + mr) / 2
    print(f'master: body {body_w}×{body_h} px, feet at y={mb}')
    cw, ch = CELL_X * body_w, CELL_Y * body_h
    foot_y_cell = int(ch * 0.5 + body_h * 0.5)          # body centred vertically in the cell
    game_body = a.game_body or round(body_h / 2.5)
    k = game_body / body_h
    problems = 0
    for side in ['right', 'left']:
        rows = []
        for clip in CLIPS:
            d = os.path.join(base, side, clip)
            files = sorted(f for f in os.listdir(d) if f.lower().endswith(('.png', '.webp', '.jpg'))) if os.path.isdir(d) else []
            if not files:
                print(f'  {side}/{clip}: no frames'); problems += 1; continue
            frames = []
            for f in files:
                im = clean(os.path.join(d, f)); l, t, r, b = bbox(im)
                h = b - t
                if abs(h - body_h) / body_h > TOL and clip in ('idle', 'walk'):
                    print(f'  ! {side}/{clip}/{f}: body {h}px vs master {body_h}px ({(h / body_h - 1) * 100:+.0f}%) — regenerate at master size'); problems += 1
                if abs(im.size[0] - m.size[0]) > 2 or abs(im.size[1] - m.size[1]) > 2:
                    print(f'  ! {side}/{clip}/{f}: canvas {im.size} differs from master {m.size}'); problems += 1
                # place: same scale as the master (never resized), feet on the cell foot line, centred on the master's foot x
                cell = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
                fx = (l + r) / 2 if clip in ('idle', 'walk') else foot_x   # attacks keep the master anchor (body may lean)
                cell.alpha_composite(im, (int(cw / 2 - fx), int(foot_y_cell - b)))
                frames.append(cell)
            rows.append((clip, frames))
        if not rows:
            continue
        cols = max(len(fr) for _, fr in rows)
        sheet = Image.new('RGBA', (cols * cw, len(rows) * ch), (0, 0, 0, 0))
        for y, (_, fr) in enumerate(rows):
            for x, cell in enumerate(fr):
                sheet.alpha_composite(cell, (x * cw, y * ch))
        rv = sheet.resize((max(1, int(sheet.width * a.review_scale)), max(1, int(sheet.height * a.review_scale))), Image.LANCZOS)
        rv.save(os.path.join(base, f'sheet-{side}.png'))
        # game sheet: the review sheet's 4× cells are mostly empty space, which would make a texture far too big for
        # the GPU — crop every cell to the union of what is drawn in any frame (+4 % margin), then scale to game_body
        u = None
        for _, fr in rows:
            for cell in fr:
                bb = cell.getchannel('A').getbbox()
                if bb: u = bb if u is None else (min(u[0], bb[0]), min(u[1], bb[1]), max(u[2], bb[2]), max(u[3], bb[3]))
        pad = int(body_h * 0.04); u = (max(0, u[0] - pad), max(0, u[1] - pad), min(cw, u[2] + pad), min(ch, u[3] + pad))
        tw, th = u[2] - u[0], u[3] - u[1]
        gcw, gch = max(1, round(tw * k)), max(1, round(th * k))
        gs = Image.new('RGBA', (cols * gcw, len(rows) * gch), (0, 0, 0, 0))
        for y, (_, fr) in enumerate(rows):
            for x, cell in enumerate(fr):
                gs.alpha_composite(cell.crop(u).resize((gcw, gch), Image.LANCZOS), (x * gcw, y * gch))
        if max(gs.size) > 16383:
            print(f'  ! game sheet {gs.size} too large for WebP — use a smaller --game-body'); problems += 1; continue
        out = os.path.join(ROOT, 'public/art/anim', a.id + ('' if side == 'right' else '-left') + '.webp')
        gs.save(out, 'WEBP', quality=92, method=6)
        clips = {clip: [i * cols, len(fr)] for i, (clip, fr) in enumerate(rows)}
        entry = {'cw': gcw, 'ch': gch, 'cols': cols, 'n': cols * len(rows), 'fx': round((cw / 2 - u[0]) / tw, 4),
                 'fy': round(1 - (foot_y_cell - u[1]) / th, 4), 'bodyPx': game_body, 'clips': clips}
        print(f'{side}: {out}  {gs.size[0]}×{gs.size[1]}')
        print(f"  SPRITE_ANIMS['{a.id}{'' if side == 'right' else '-left'}'] =", json.dumps(entry))
    print('OK' if not problems else f'{problems} problem(s) — fix and run again')


if __name__ == '__main__':
    main()
