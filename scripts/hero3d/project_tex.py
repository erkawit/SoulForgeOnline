# blender -b -P project_tex.py -- <in.fbx> <refdir> <prefix m|f> <out_dir> [size]
# Paints a Meshy base body from its 4 orthographic reference pictures (front / left / back / right, transparent PNG):
# every texel of the existing UV map is placed back on the mesh, projected into the views that face it (weighted by
# the surface normal) and averaged. Writes <prefix>_base.png and the model as GLB + FBX with that texture.
import bpy, sys, os, math
import numpy as np
from mathutils import Vector

a = sys.argv[sys.argv.index('--') + 1:]
SRC, REF, PFX, OUT = a[0], a[1], a[2], a[3]
SIZE = int(a[4]) if len(a) > 4 else 2048
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SRC)
ob = next(o for o in bpy.data.objects if o.type == 'MESH')
bpy.context.view_layer.update()
me = ob.data; me.calc_loop_triangles()
mw = ob.matrix_world; nm = mw.to_3x3().inverted().transposed()
V = np.array([tuple(mw @ v.co) for v in me.vertices]); N = np.array([tuple((nm @ v.normal).normalized()) for v in me.vertices])
zmin, zmax = V[:, 2].min(), V[:, 2].max(); H = zmax - zmin
# which way the model faces: the toes stick out further than the heels
low = V[:, 2] < zmin + 0.04 * H; ankle = (V[:, 2] > zmin + 0.07 * H) & (V[:, 2] < zmin + 0.11 * H)
toe = (V[low, 1].min() + V[low, 1].max()) / 2 - V[ankle, 1].mean()
FRONT = -1.0 if toe < 0 else 1.0   # model faces -Y (FRONT=-1) or +Y
ARMZ = V[np.argmax(V[:, 0]), 2]  # T-pose arm height (the side pictures show the arm foreshortened over the shoulder)
print('[proj] height', round(H, 3), 'faces', 'negY' if FRONT < 0 else 'posY', 'verts', len(V))

def load(name):
    im = bpy.data.images.load(os.path.join(REF, name)); w, h = im.size
    px = np.array(im.pixels[:], dtype=np.float32).reshape(h, w, 4)[::-1]  # top row first
    al = px[:, :, 3] > 0.3; ys, xs = np.nonzero(al)
    return px, (xs.min(), ys.min(), xs.max(), ys.max())
# view: (picture, camera direction toward the model's surface it sees, world axis that is screen-right)
f = FRONT
VIEWS = [
    (f'{PFX}_front.png', Vector((0, -f, 0)), Vector((-f, 0, 0))),   # d = the camera's looking direction
    (f'{PFX}_back.png', Vector((0, f, 0)), Vector((f, 0, 0))),
    (f'{PFX}_left.png', Vector((f, 0, 0)), Vector((0, -f, 0))),     # face points to the picture's left
    (f'{PFX}_right.png', Vector((-f, 0, 0)), Vector((0, f, 0))),
]
views = []
for name, d, right in VIEWS:
    px, (x0, y0, x1, y1) = load(name)
    s = (y1 - y0) / H                         # picture px per world unit (height decides)
    proj = V @ np.array(tuple(right)); cw = (proj.min() + proj.max()) / 2 if name.endswith(('front.png', 'back.png')) else None
    if cw is None:  # side views: centre on the body (the arms point at the camera)
        xc = (V[:, 0].min() + V[:, 0].max()) / 2; body = np.abs(V[:, 0] - xc) < 0.12 * H
        cw = ((V[body] @ np.array(tuple(right))).min() + (V[body] @ np.array(tuple(right))).max()) / 2
    # depth buffer along this view (coarse grid in picture space): a surface point only takes this picture's colour
    # if nothing of the model sits in front of it (the arms hide the shoulders in the side views)
    dd = np.array(tuple(d)); G = 3.0  # picture px per depth cell
    uu = ((V @ np.array(tuple(right))) - cw) * s / G; yy = (zmax - V[:, 2]) * s / G; dep = -(V @ dd)  # larger = nearer the camera
    ox, oy = uu.min(), yy.min(); gi = (uu - ox).astype(int); gj = (yy - oy).astype(int)
    zbuf = np.full((gj.max() + 2, gi.max() + 2), -1e9, np.float32); np.maximum.at(zbuf, (gj, gi), dep)
    # the reference pictures are perspective renders: parts near the camera (the hands in the side views) look bigger
    # than on the orthographic model, so grow every occluder a little before testing
    R = 5 if abs(d.x) > 0.5 else 2
    zb2 = zbuf.copy()
    for a in range(-R, R + 1):
        for b in range(-R, R + 1): zb2 = np.maximum(zb2, np.roll(np.roll(zbuf, a, 0), b, 1))
    zbuf = zb2
    views.append(dict(px=px, d=dd, r=np.array(tuple(right)), s=s, cx=(x0 + x1) / 2, cw=cw, top=y0, zb=zbuf, ox=ox, oy=oy, G=G))

# rasterise every triangle in UV space
uvl = me.uv_layers.active.data
T = SIZE; acc = np.zeros((T, T, 3), np.float32); wsum = np.zeros((T, T), np.float32)
acc2 = np.zeros((T, T, 3), np.float32); wsum2 = np.zeros((T, T), np.float32)  # same without the occlusion test (fallback)
for tri in me.loop_triangles:
    uv = np.array([tuple(uvl[l].uv) for l in tri.loops]) * (T - 1)
    P = V[list(tri.vertices)]; Nn = N[list(tri.vertices)]
    xmin, ymin = np.floor(uv.min(0)).astype(int); xmax, ymax = np.ceil(uv.max(0)).astype(int)
    if xmax < 0 or ymax < 0 or xmin >= T or ymin >= T: continue
    xs, ys = np.meshgrid(np.arange(max(0, xmin - 1), min(T, xmax + 2)), np.arange(max(0, ymin - 1), min(T, ymax + 2)))
    p = np.stack([xs.ravel() + .5, ys.ravel() + .5], 1)
    a0, a1, a2 = uv; den = (a1[1] - a2[1]) * (a0[0] - a2[0]) + (a2[0] - a1[0]) * (a0[1] - a2[1])
    if abs(den) < 1e-12: continue
    l0 = ((a1[1] - a2[1]) * (p[:, 0] - a2[0]) + (a2[0] - a1[0]) * (p[:, 1] - a2[1])) / den
    l1 = ((a2[1] - a0[1]) * (p[:, 0] - a2[0]) + (a0[0] - a2[0]) * (p[:, 1] - a2[1])) / den
    l2 = 1 - l0 - l1; m = (l0 >= -0.02) & (l1 >= -0.02) & (l2 >= -0.02)
    if not m.any(): continue
    L = np.stack([l0[m], l1[m], l2[m]], 1); pos = L @ P; nrm = L @ Nn; nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-9
    col = np.zeros((len(pos), 3), np.float32); ws = np.zeros(len(pos), np.float32); col2 = np.zeros((len(pos), 3), np.float32); ws2 = np.zeros(len(pos), np.float32)
    for v in views:
        w = np.clip(-(nrm @ v['d']), 0, 1) ** 3  # normal toward the camera = against its looking direction  # surface facing this camera
        if not w.any(): continue
        u = v['cx'] + ((pos @ v['r']) - v['cw']) * v['s']; y = v['top'] + (zmax - pos[:, 2]) * v['s']
        ui = np.clip(u.astype(int), 0, v['px'].shape[1] - 1); yi = np.clip(y.astype(int), 0, v['px'].shape[0] - 1)
        c = v['px'][yi, ui]; w = w * (c[:, 3] > 0.5)
        if abs(v['d'][1]) > 0.5: w2 = w + 1e-4 * (c[:, 3] > 0.5); col2 += c[:, :3] * w2[:, None]; ws2 += w2  # fallback: front / back only
        gi = np.clip((((pos @ v['r']) - v['cw']) * v['s'] / v['G'] - v['ox']).astype(int), 0, v['zb'].shape[1] - 1)
        gj = np.clip(((zmax - pos[:, 2]) * v['s'] / v['G'] - v['oy']).astype(int), 0, v['zb'].shape[0] - 1)
        near = np.max([v['zb'][np.clip(gj + a, 0, v['zb'].shape[0] - 1), np.clip(gi + b, 0, v['zb'].shape[1] - 1)] for a in (-1, 0, 1) for b in (-1, 0, 1)], 0)
        w = w * ((near - (-(pos @ v['d']))) < 0.02 * H)
        if abs(v['d'][0]) > 0.5: w = w * ~((pos[:, 2] > ARMZ - 0.13 * H) & (pos[:, 2] < ARMZ + 0.07 * H))
        col += c[:, :3] * w[:, None]; ws += w
    tx = p[m, 0].astype(int); ty = p[m, 1].astype(int)
    np.add.at(acc, (ty, tx), col); np.add.at(wsum, (ty, tx), ws); np.add.at(acc2, (ty, tx), col2); np.add.at(wsum2, (ty, tx), ws2)
img = np.where(wsum[..., None] > 1e-6, acc / np.maximum(wsum, 1e-6)[..., None], acc2 / np.maximum(wsum2, 1e-6)[..., None])
filled = (wsum > 1e-6) | (wsum2 > 1e-6)
# grow colours into empty texels so seams never show the background
for _ in range(64):
    if filled.all(): break
    sh = [np.roll(img, s, ax) for ax in (0, 1) for s in (1, -1)]; fs = [np.roll(filled, s, ax) for ax in (0, 1) for s in (1, -1)]
    cnt = sum(f.astype(np.float32) for f in fs); add = sum(s * f[..., None] for s, f in zip(sh, fs))
    new = (~filled) & (cnt > 0); img[new] = add[new] / cnt[new][:, None]; filled = filled | new
print('[proj] covered', round(float((wsum > 1e-6).mean()), 3))
out = bpy.data.images.new(f'{PFX}_base', T, T, alpha=False)
rgba = np.concatenate([img, np.ones((T, T, 1), np.float32)], 2)
out.pixels.foreach_set(rgba.ravel()); out.filepath_raw = os.path.join(OUT, f'{PFX}_base.png'); out.file_format = 'PNG'; out.save()
# material: the painted texture as base colour, the Meshy normal map kept
mat = ob.material_slots[0].material if ob.material_slots and ob.material_slots[0].material else bpy.data.materials.new('Base')
mat.use_nodes = True; nt = mat.node_tree; bs = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(OUT, f'{PFX}_base.png'))
nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = 0.75
if not ob.material_slots: ob.data.materials.append(mat)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, f'soulforge_base_{PFX}.glb'), export_format='GLB')
bpy.ops.export_scene.fbx(filepath=os.path.join(OUT, f'soulforge_base_{PFX}.fbx'), path_mode='COPY', embed_textures=True)
# preview: front + side render
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); bpy.context.scene.collection.objects.link(cam); bpy.context.scene.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = H * 1.15
sc = bpy.context.scene; sc.render.resolution_x, sc.render.resolution_y = 600, 700; sc.render.film_transparent = True
for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
    try: sc.render.engine = eng; break
    except TypeError: pass
w = bpy.data.worlds.new('w'); w.use_nodes = True; w.node_tree.nodes['Background'].inputs[1].default_value = 3.0; sc.world = w
cz = (zmin + zmax) / 2
for tag, loc, rot in [('front', (0, f * 10, cz), (math.radians(90), 0, math.radians(0 if f < 0 else 180) + (math.pi if f < 0 else 0))),
                      ('side', (10, 0, cz), (math.radians(90), 0, math.radians(90))), ('back', (0, -f * 10, cz), (math.radians(90), 0, math.radians(180 if f < 0 else 0) + (math.pi if f < 0 else 0)))]:
    cam.location = loc; cam.rotation_euler = rot
    d = (Vector((0, 0, cz)) - cam.location).normalized(); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(OUT, f'{PFX}_preview_{tag}.png'); bpy.ops.render.render(write_still=True)
print('[proj] done')
