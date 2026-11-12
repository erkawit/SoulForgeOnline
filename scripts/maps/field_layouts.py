"""Round 26: a road network of its own for every 240 m field (they all shared the same '+' before).

Writes roads + plazas into src/game/world/farmPlans.json (hunting groups, gates and everything else untouched), then
bakes each field's 4096² ground (public/art/ground-v1/<id>/ground-basecolor-4096.webp) and its map overview
(public/art/farm/<id>/overview-runtime.webp) from the same geometry, so the minimap, the world map, the walkable
surfaces and the painted ground all agree. Coordinates: metres, x east, y (= world z) south, origin at the centre.
The game always adds a straight 10 m avenue from the centre to every gate (terrainNavigation.ts); this script draws
those too.
usage: python3 scripts/maps/field_layouts.py [--plans-only]
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PLANS = os.path.join(ROOT, 'src/game/world/farmPlans.json')

def circle(cx, cy, r, n=24, a0=0.0):
    return [[round(cx + r * math.cos(a0 + 2 * math.pi * k / n), 2), round(cy + r * math.sin(a0 + 2 * math.pi * k / n), 2)] for k in range(n + 1)]
def wave(p0, p1, amp, waves, n=28):
    (x0, y0), (x1, y1) = p0, p1; dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy); nx, ny = -dy / L, dx / L
    return [[round(x0 + dx * t + nx * amp * math.sin(t * math.pi * 2 * waves), 2), round(y0 + dy * t + ny * amp * math.sin(t * math.pi * 2 * waves), 2)] for t in (k / n for k in range(n + 1))]
def zigzag(xs, ys):
    return [[x, y] for x, y in zip(xs, ys)]
def road(name, pts, w): return {'name': name, 'widthM': w, 'pointsM': pts}
def plaza(name, x, y, d): return {'name': name, 'centerM': [x, y], 'diameterM': d}

# ---------------------------------------------------------------- one layout per field (theme → shape)
LAYOUTS = {
  # ash graveyard: a processional ring around the central crypt, crooked paths between the grave rows
  'wild0': lambda: ([road('ring', circle(0, 0, 62, 28), 7), road('north-west-path', wave([-62, 0], [-108, -70], 6, 1), 5), road('south-east-path', wave([44, 44], [100, 96], 6, 1), 5),
                     road('south-path', wave([0, 62], [0, 112], 5, 1.5), 5)],
                    [plaza('crypt', 0, 0, 36), *[plaza(f'shrine-{i}', round(62 * math.cos(a), 1), round(62 * math.sin(a), 1), 18) for i, a in enumerate([math.pi / 4, 3 * math.pi / 4, 5 * math.pi / 4, 7 * math.pi / 4])]]),
  # bone plains: two great diagonal caravan roads crossing at the rib-cage
  'wild1': lambda: ([road('nw-se', [[-110, -110], [110, 110]], 9), road('ne-sw', [[110, -110], [-110, 110]], 9), road('ring', circle(0, 0, 45, 20, math.pi / 4), 5)],
                    [plaza('rib-cage', 0, 0, 34), plaza('ne-camp', 70, -70, 22), plaza('sw-camp', -70, 70, 22), plaza('se-camp', 72, 72, 18), plaza('nw-camp', -72, -72, 18)]),
  # haunted swamp: meandering boardwalks between dry islands
  'wild2': lambda: ([road('boardwalk-ew', wave([-116, 0], [116, 0], 22, 1.5), 6), road('boardwalk-ns', wave([0, -112], [0, 112], 18, 1), 6), road('north-loop', circle(-40, -58, 22, 16), 4), road('south-loop', circle(50, 56, 20, 16), 4)],
                    [plaza('drowned-chapel', 0, 0, 28), plaza('west-isle', -40, -58, 16), plaza('east-isle', 50, 56, 16), plaza('reed-isle', 80, -40, 14), plaza('bog-isle', -80, 46, 14)]),
  # cursed emerald mine: straight cart tracks on a grid, shafts at the junctions
  'wild3': lambda: ([road('track-w', [[-48, -112], [-48, 112]], 6), road('track-e', [[48, -112], [48, 112]], 6), road('cross-n', [[-112, -52], [112, -52]], 6), road('cross-s', [[-112, 52], [112, 52]], 6)],
                    [plaza('pit', 0, 0, 30), plaza('shaft-nw', -48, -52, 16), plaza('shaft-ne', 48, -52, 16), plaza('shaft-sw', -48, 52, 16), plaza('shaft-se', 48, 52, 16)]),
  # oath garden: a formal square walk with diagonal alleys to the oath stone
  'wild4': lambda: ([road('square-walk', [[-64, -64], [64, -64], [64, 64], [-64, 64], [-64, -64]], 7), road('diag-a', [[-64, -64], [64, 64]], 5), road('diag-b', [[64, -64], [-64, 64]], 5),
                     road('outer-walk', [[-100, -30], [-100, 30]], 5), road('outer-walk-2', [[30, -100], [-30, -100]], 5)],
                    [plaza('oath-stone', 0, 0, 32), plaza('rose-nw', -64, -64, 18), plaza('rose-ne', 64, -64, 18), plaza('rose-sw', -64, 64, 18), plaza('rose-se', 64, 64, 18)]),
  # judgement terraces: four long terraces joined by switchback ramps
  'wild5': lambda: ([*[road(f'terrace-{i}', [[-108, y], [108, y]], 7) for i, y in enumerate([-78, -26, 26, 78])],
                     road('ramp-a', [[-90, -78], [-60, -26]], 5), road('ramp-b', [[90, -26], [60, 26]], 5), road('ramp-c', [[-90, 26], [-60, 78]], 5), road('ramp-d', [[90, 78], [70, 108]], 5)],
                    [plaza('tribunal', 0, 0, 32), plaza('upper-court', -60, -52, 18), plaza('east-court', 66, 0, 18), plaza('lower-court', -66, 52, 18), plaza('gallows', 70, 92, 16)]),
  # dark canals: quays along a grid of canals, small bridges as courts
  'wild6': lambda: ([road('quay-n', [[-112, -40], [112, -40]], 7), road('quay-s', [[-112, 40], [112, 40]], 7), road('quay-w', [[-62, -112], [-62, 112]], 7), road('quay-e', [[62, -112], [62, 112]], 7)],
                    [plaza('lock-house', 0, 0, 30), plaza('bridge-nw', -62, -40, 16), plaza('bridge-ne', 62, -40, 16), plaza('bridge-sw', -62, 40, 16), plaza('bridge-se', 62, 40, 16)]),
  # abandoned dawn farm: field tracks between the plots, a windmill yard at each crossing
  'wild7': lambda: ([road('track-1', [[-112, -38], [112, -38]], 5), road('track-2', [[-112, 38], [112, 38]], 5), road('track-3', [[-38, -112], [-38, 112]], 5), road('track-4', [[38, -112], [38, 112]], 5),
                     road('lane', wave([-112, 90], [112, 90], 6, 2), 4)],
                    [plaza('barnyard', 0, 0, 28), plaza('mill-nw', -38, -38, 16), plaza('mill-ne', 38, -38, 16), plaza('mill-sw', -38, 38, 16), plaza('mill-se', 38, 38, 16)]),
  # demon thorn forest: one winding trail through the thorns, forking deep inside
  'wild8': lambda: ([road('trail', wave([-116, 0], [0, 0], 24, 1), 6), road('fork-ne', wave([0, 0], [96, -92], 14, 1), 5), road('fork-se', wave([0, 0], [96, 92], 14, 1), 5), road('fork-n', wave([-40, -18], [-30, -108], 10, 1), 4)],
                    [plaza('heart-thorn', 0, 0, 30), plaza('ne-clearing', 96, -92, 20), plaza('se-clearing', 96, 92, 20), plaza('n-clearing', -30, -100, 18), plaza('w-clearing', -70, 20, 16)]),
  # dragon-root pass: a switchback road climbing from the south gate to the north
  'wild9': lambda: ([road('switchback', [[0, 112], [-80, 80], [80, 30], [-80, -20], [80, -70], [0, -112]], 8)],
                    [plaza('root-hollow', 0, 0, 28), plaza('bend-1', -80, 80, 18), plaza('bend-2', 80, 30, 18), plaza('bend-3', -80, -20, 18), plaza('bend-4', 80, -70, 18)]),
  # emerald cavern: branching tunnels
  'dungeon1': lambda: ([road('tunnel-w', wave([0, 30], [-100, -30], 12, 1), 7), road('tunnel-e', wave([0, 30], [100, -40], 12, 1), 7), road('tunnel-n', wave([0, 0], [10, -108], 10, 1.5), 7),
                        road('gallery', [[-100, -30], [-70, -90], [0, -100], [70, -90], [100, -40]], 6)],
                       [plaza('crystal-hall', 0, 0, 34), plaza('west-grotto', -100, -30, 20), plaza('east-grotto', 100, -40, 20), plaza('deep-hall', 0, -96, 24), plaza('north-west', -70, -90, 16)]),
  # judgement cathedral: nave, transept, side aisles and the apse
  'dungeon2': lambda: ([road('transept', [[-100, -40], [100, -40]], 10), road('aisle-w', [[-50, 110], [-50, -90]], 6), road('aisle-e', [[50, 110], [50, -90]], 6), road('ambulatory', circle(0, -84, 26, 20), 5)],
                       [plaza('crossing', 0, -40, 32), plaza('apse', 0, -84, 30), plaza('chapel-w', -100, -40, 18), plaza('chapel-e', 100, -40, 18), plaza('narthex', 0, 60, 22)]),
  # volcanic dragon cave: radial lava cracks from the dragon's nest, a broken outer ring
  'dungeon3': lambda: ([*[road(f'spoke-{k}', [[0, 0], [round(100 * math.cos(a), 1), round(100 * math.sin(a), 1)]], 7) for k, a in enumerate([math.radians(d) for d in (-150, -90, -30, 30, 150)])],
                        road('ring-a', circle(0, 0, 70, 10, math.radians(200))[:6], 6), road('ring-b', circle(0, 0, 70, 10, math.radians(20))[:5], 6)],
                       [plaza('nest', 0, 0, 40), plaza('vent-n', 0, -100, 20), plaza('vent-ne', 87, -50, 18), plaza('vent-nw', -87, -50, 18), plaza('vent-se', 87, 50, 18)]),
}

def write_plans():
    data = json.load(open(PLANS))
    for fid, make in LAYOUTS.items():
        roads, plazas = make()
        # every field keeps its 40 m central boss plaza first (layoutConstraints.centralPlazaDiameterM)
        if plazas[0]['centerM'] == [0, 0]: plazas[0]['diameterM'] = 40
        else: plazas.insert(0, plaza('central-court', 0, 0, 40))
        data[fid]['roads'] = roads; data[fid]['plazas'] = plazas
        data[fid]['overviewArtStatus'] = 'round26-baked'
    open(PLANS, 'w').write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return data

# ---------------------------------------------------------------- baking
TINT = {  # theme colour grade (multiplied in), and the glow of the hazards
  'wild0': (0.92, 0.9, 0.95), 'wild1': (1.05, 1.0, 0.86), 'wild2': (0.8, 0.98, 0.92), 'wild3': (0.86, 1.02, 0.94), 'wild4': (0.95, 1.06, 0.88),
  'wild5': (1.04, 1.0, 0.94), 'wild6': (0.82, 0.92, 1.02), 'wild7': (1.08, 1.0, 0.82), 'wild8': (0.9, 0.86, 0.96), 'wild9': (1.02, 0.94, 0.86),
  'dungeon1': (0.8, 1.04, 0.92), 'dungeon2': (0.94, 0.94, 1.04), 'dungeon3': (1.12, 0.86, 0.76)}
N = 4096; M_PER_PX = 240 / N

def tile(name, px):
    im = Image.open(os.path.join(ROOT, f'public/art/farm/materials/tile-{name}.webp')).convert('RGB').resize((px, px), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float32) / 255; reps = N // px + 1
    return np.tile(a, (reps, reps, 1))[:N, :N]

def noise(seed, scale_px, octaves=4):
    rng = np.random.default_rng(seed); acc = np.zeros((N, N), np.float32); amp = 1.0; total = 0
    for o in range(octaves):
        s = max(2, int(N / (scale_px / 2 ** o))); g = rng.random((s, s)).astype(np.float32)
        acc += amp * np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((N, N), Image.BICUBIC), np.float32) / 255; total += amp; amp *= 0.5
    return acc / total

def seg_dist(xx, yy, pts):
    d = np.full(xx.shape, 1e9, np.float32)
    for (ax, ay), (bx, by) in zip(pts[:-1], pts[1:]):
        dx, dy = bx - ax, by - ay; L2 = dx * dx + dy * dy or 1
        t = np.clip(((xx - ax) * dx + (yy - ay) * dy) / L2, 0, 1); d = np.minimum(d, np.hypot(xx - ax - t * dx, yy - ay - t * dy))
    return d

def bake(fid, plan, meta):
    print('bake', fid, flush=True)
    c = (np.arange(N, dtype=np.float32) + .5) * M_PER_PX - 120; xx, yy = np.meshgrid(c, c)
    px8 = int(8 / M_PER_PX)  # one 8 m tile, as in the game shader
    mats = plan['materials']; base_m = mats[0]; det_m = next((m for m in mats if m not in (base_m, 'dirt-road', 'flagstone')), 'rocky')
    base, detail, rd, fl = tile(base_m, px8), tile(det_m, px8), tile('dirt-road', px8), tile('flagstone', px8)
    seed = sum(map(ord, fid)); n1 = noise(seed, 1400); n2 = noise(seed + 7, 300); n3 = noise(seed + 13, 2600, 2)
    # patches of the second material with soft borders, broad light / shadow, fine grain
    patch = np.clip((n1 - .42) / .16, 0, 1)
    col = base * (1 - patch[..., None]) + detail * patch[..., None]
    col *= (0.78 + 0.34 * n3[..., None]) * (0.9 + 0.2 * n2[..., None])
    # scattered pebbles / debris: small dark and light specks, denser in rough fields
    rng = np.random.default_rng(seed); dens = 2600 if any(m in mats for m in ('rocky', 'ash')) else 1400
    spec = np.zeros((N, N), np.float32)
    for _ in range(dens):
        cx, cy, r, v = rng.integers(0, N), rng.integers(0, N), rng.uniform(3, 10), rng.choice([-.35, -.25, .18])
        x0, x1, y0, y1 = max(0, int(cx - r)), min(N, int(cx + r) + 1), max(0, int(cy - r)), min(N, int(cy + r) + 1)
        gx, gy = np.meshgrid(np.arange(x0, x1), np.arange(y0, y1)); d = np.hypot(gx - cx, (gy - cy) * 1.4)
        spec[y0:y1, x0:x1] += v * np.clip(1 - d / r, 0, 1)
    col *= (1 + np.clip(spec, -.45, .3))[..., None]
    # roads (+ the game's straight avenues from the centre to each gate) with darker worn edges
    roads = [(r['pointsM'], r['widthM']) for r in plan['roads']] + [([[0, 0], [g[0], g[1]]], 10) for g in meta['gates']]
    rmask = np.zeros((N, N), np.float32); edge = np.zeros((N, N), np.float32)
    for pts, w in roads:
        d = seg_dist(xx, yy, pts); rmask = np.maximum(rmask, np.clip((w / 2 + .6 - d) / 1.2, 0, 1)); edge = np.maximum(edge, np.clip(1 - abs(d - w / 2) / 1.1, 0, 1))
    col = col * (1 - rmask[..., None]) + rd * (0.9 + .15 * n2[..., None]) * rmask[..., None]
    col *= (1 - .32 * edge[..., None])
    # plazas (+ the gate courts): flagstone discs with a dark rim and a lighter inner ring
    pls = [(p['centerM'], p['diameterM'] / 2) for p in plan['plazas']] + [([g[0], g[1]], 8) for g in meta['gates']]
    for (cx, cy), r in pls:
        d = np.hypot(xx - cx, yy - cy); m = np.clip((r + .5 - d) / 1.0, 0, 1)
        col = col * (1 - m[..., None]) + fl * m[..., None]
        col *= (1 - .45 * np.clip(1 - abs(d - r) / 0.9, 0, 1))[..., None]
        col *= (1 + .12 * np.clip(1 - abs(d - r * .62) / .5, 0, 1))[..., None]
    # hazards: scorched / sunken rims (the hole itself is cut out by the game)
    for hx, hy, hr in meta['hazards']:
        d = np.hypot(xx - hx, yy - hy); col *= (1 - .55 * np.clip((hr + 4 - d) / 4, 0, 1))[..., None]
    # theme grade, a soft vignette toward the field edge
    col *= np.array(TINT.get(fid, (1, 1, 1)), np.float32)
    v = np.clip(1 - (np.maximum(abs(xx), abs(yy)) - 100) / 40, .55, 1); col *= v[..., None]
    img = Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8))
    out = os.path.join(ROOT, f'public/art/ground-v1/{fid}/ground-basecolor-4096.webp'); img.save(out, quality=82, method=6)
    # map overview: the same ground in the map's isometric diamond (WorldMap project(): 1000×680 frame, 1536×1024 file)
    small = img.resize((1024, 1024), Image.LANCZOS); S = 1536 / 1000; lim = 120
    a, b = 232 / lim * S, 136 / lim * S  # u = 500S + (x-z)a ; v = 340S + (x+z)b  (x,z in metres)
    # pixel (i,j) of `small` ↔ x = i*240/1024-120, z = j*240/1024-120 → affine from overview (u,v) back to (i,j)
    k = 1024 / 240; ux, vy = 500 * S, 340 * S * 1024 / 1024
    # x = ((u-ux)/a + (v-vy)/b)/2 ; z = ((v-vy)/b - (u-ux)/a)/2 ; i = (x+120)k ; j = (z+120)k
    A = k / (2 * a); B = k / (2 * b)
    coeffs = (A, B, (-ux * A - vy * B) + 120 * k, -A, B, (ux * A - vy * B) + 120 * k)
    ov = small.transform((1536, 1024), Image.AFFINE, coeffs, resample=Image.BICUBIC, fillcolor=(9, 10, 14))
    mask = Image.new('L', (1024, 1024), 255).transform((1536, 1024), Image.AFFINE, coeffs, resample=Image.BILINEAR, fillcolor=0)
    shadow = mask.filter(ImageFilter.GaussianBlur(14)).point(lambda p: int(p * .7))
    bg = Image.new('RGB', (1536, 1024), (9, 10, 14)); bg.paste((0, 0, 0), mask=shadow.transform((1536, 1024), Image.AFFINE, (1, 0, -6, 0, 1, -10)))
    bg.paste(ov, mask=mask)
    bg.save(os.path.join(ROOT, f'public/art/farm/{fid}/overview-runtime.webp'), quality=84, method=6)

if __name__ == '__main__':
    data = write_plans()
    if '--plans-only' in sys.argv: sys.exit(0)
    meta = json.load(open(os.environ.get('FIELD_META', '/tmp/claude-0/fieldmeta.json')))
    only = [a for a in sys.argv[1:] if not a.startswith('--')]
    for fid in LAYOUTS:
        if only and fid not in only: continue
        bake(fid, data[fid], meta[fid])
