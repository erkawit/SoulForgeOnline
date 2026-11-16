"""Cut a left/right (2-direction) sheet out of an existing 8-way sheet — no repainting needed.

The 8-way sheets list each clip as 8 runs of `count` frames in the order S, SW, W, NW, N, NE, E, SE.
This keeps ONE run per clip (the facing you pick, default E = screen right), lays the clips out one per row,
and writes a sheet the game mirrors for the left side (no `dirs`, facesLeft false).

  python scripts/sprites/extract_2dir.py m-Paladin --row E
  python scripts/sprites/extract_2dir.py --all --row SE        # every 8-way sheet in the inspector manifest

Output: public/art/anim2/<key>.webp + public/art/anim2/anims2.json (paste the entries into SPRITE_ANIMS / CLASS_ANIMS
once the inspector shows them clean). The game's own sheets are never touched.
"""
import argparse, json, math, os, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ROWS = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE']


def extract(key, sheet, row, out_dir):
    src = Image.open(os.path.join(ROOT, 'public/art/anim', key + '.webp')).convert('RGBA')
    cw, ch, cols = sheet['cw'], sheet['ch'], sheet['cols']
    r = ROWS.index(row)
    clips = sheet['clips']
    width = max(c[1] for c in clips.values())
    out = Image.new('RGBA', (width * cw, len(clips) * ch), (0, 0, 0, 0))
    new_clips = {}
    for y, (name, (start, count)) in enumerate(clips.items()):
        for i in range(count):
            idx = start + r * count + i
            sx, sy = (idx % cols) * cw, (idx // cols) * ch
            out.paste(src.crop((sx, sy, sx + cw, sy + ch)), (i * cw, y * ch))
        new_clips[name] = [y * width, count]
    out.save(os.path.join(out_dir, key + '.webp'), 'WEBP', quality=92, method=6)
    return {'cw': cw, 'ch': ch, 'cols': width, 'n': len(clips) * width, 'fx': sheet['fx'], 'fy': sheet['fy'],
            'bodyPx': sheet['bodyPx'], 'clips': new_clips}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('keys', nargs='*')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--row', default='E', choices=ROWS, help='which painted facing becomes "right" (E = side, SE = three-quarter front)')
    a = ap.parse_args()
    manifest = json.load(open(os.path.join(ROOT, 'public/inspector/manifest.json')))
    sheets = manifest['sheets']
    keys = [k for k, s in sheets.items() if s.get('dirs') == 8] if a.all else a.keys
    if not keys:
        sys.exit('name at least one sheet, or pass --all')
    out_dir = os.path.join(ROOT, 'public/art/anim2'); os.makedirs(out_dir, exist_ok=True)
    index_file = os.path.join(out_dir, 'anims2.json')
    index = json.load(open(index_file)) if os.path.exists(index_file) else {}
    for k in keys:
        s = sheets.get(k)
        if not s or s.get('dirs') != 8:
            print('skip', k, '(not an 8-way sheet)'); continue
        index[k] = extract(k, s, a.row, out_dir)
        index[k]['sourceRow'] = a.row
        print('ok  ', k, '→ public/art/anim2/%s.webp' % k, index[k]['clips'])
    json.dump(index, open(index_file, 'w'), indent=1)


if __name__ == '__main__':
    main()
