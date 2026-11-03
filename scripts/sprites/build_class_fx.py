"""Round 20: ChatGPT skill-effect sheets (black background, 3x2 frames) -> public/art/fx/class/<key>.webp (320 px cells,
played additively by fx/skillFx.ts paintedAnim, so the black disappears).  usage: build_class_fx.py <effect_skill folder>"""
import os, sys
from PIL import Image
SRC = sys.argv[1]; ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); C = 320
MAP = {'Rune-Master/Sword-Wave.png': 'sword-wave', 'Rune-Master/Venom-of-burst.png.png': 'venom-burst', 'Rune-Master/Pillar-of-Valor.png': 'pillar-valor',
       'Rune-Master/Pillar-of-Binding.png': 'pillar-binding', 'Rune-Master/Pillar-of-Renewal.png': 'pillar-renewal', 'Rune-Master/Pillar-of-Hexes.png': 'pillar-hexes',
       'Rune-Master/Pillar-of-Ruin.png': 'pillar-ruin', 'Rune-Master/Rune-Circle.png': 'rune-circle',
       'Inquisitor/Thunder-Smite.png': 'thunder-smite', 'Inquisitor/Lightning-Burst.png': 'lightning-burst', 'Inquisitor/Thunder-Storm.png': 'thunder-storm',
       'Berserker/Rending-Rush.png': 'b-rending-rush', 'Berserker/Blood-Howl.png': 'b-blood-howl', 'Berserker/Carnage-Cyclone.png': 'b-carnage-cyclone',
       'Berserker/Bloodquake.png': 'b-bloodquake', 'Berserker/Execution-Frenzy.png': 'b-execution-frenzy', 'Berserker/Whilewind.png': 'b-whirlwind',
       'Berserker/Savage-Rend.png': 'r-savage-rend', 'Berserker/Dread-Howl.png': 'r-dread-howl', 'Berserker/Reaping-Cyclone.png': 'r-reaping-cyclone',
       'Berserker/Ruinbreaker.png': 'r-ruinbreaker', 'Berserker/Soul-reave.png': 'r-soul-reave', 'Berserker/Cataclysm-Descent.png': 'r-cataclysm-descent',
       'Inquisitor/Shock-Pillar.png': 'shock-pillar', 'Inquisitor/Thunder-Spike.png': 'thunder-spike', 'Inquisitor/Thor-Hammer.png': 'thor-hammer', 'Inquisitor/Impact-Ring.png': 'impact-ring'}
out_dir = os.path.join(ROOT, 'public', 'art', 'fx', 'class'); os.makedirs(out_dir, exist_ok=True)
for src, key in MAP.items():
    p = os.path.join(SRC, src)
    if not os.path.exists(p): print('missing', src); continue
    im = Image.open(p).convert('RGB'); W, H = im.size; out = Image.new('RGB', (C * 3, C * 2))
    for i in range(6):
        x0, y0 = (i % 3) * W / 3, (i // 3) * H / 2
        out.paste(im.crop((round(x0), round(y0), round(x0 + W / 3), round(y0 + H / 2))).resize((C, C), Image.LANCZOS), ((i % 3) * C, (i // 3) * C))
    out.save(os.path.join(out_dir, key + '.webp'), 'WEBP', quality=85, method=6); print(key)
