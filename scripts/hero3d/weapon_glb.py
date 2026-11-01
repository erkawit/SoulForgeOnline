# blender -b -P weapon_glb.py -- <in.glb> <out.glb> [faces=3000] [tex=512]
# Game weapon: decimated, small texture, blade along +Y, origin at the grip (between guard and pommel), length 1.
import bpy, sys, os, math
import numpy as np
from mathutils import Vector, Matrix
a = sys.argv[sys.argv.index('--') + 1:]; SRC, OUT = a[0], a[1]; FACES = int(a[2]) if len(a) > 2 else 3000; TEX = int(a[3]) if len(a) > 3 else 512
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=SRC)
ms = [o for o in bpy.data.objects if o.type == 'MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in ms: o.select_set(True)
bpy.context.view_layer.objects.active = ms[0]
if len(ms) > 1: bpy.ops.object.join()
ob = bpy.context.view_layer.objects.active
for o in list(bpy.data.objects):
    if o != ob: bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
n = len(ob.data.polygons)
if n > FACES:
    m = ob.modifiers.new('d', 'DECIMATE'); m.ratio = FACES / n; bpy.ops.object.modifier_apply(modifier=m.name)
V = np.array([tuple(v.co) for v in ob.data.vertices]); ext = V.max(0) - V.min(0); ax = int(np.argmax(ext))
t = (V[:, ax] - V[:, ax].min()) / ext[ax]
# width profile along the long axis: the cross-guard (widest part of the hilt half) is nearer the pommel end
others = [i for i in range(3) if i != ax]
w = np.array([np.ptp(V[(t >= b) & (t < b + 0.05)][:, others], axis=0).max() if ((t >= b) & (t < b + 0.05)).sum() > 2 else 0 for b in np.arange(0, 1, 0.05)])
low_half, high_half = w[:10].max(), w[10:].max()
guard_low = int(np.argmax(w[:10])) if low_half >= high_half else None
pommel_at_min = True
if guard_low is None:  # the guard is in the upper half -> the pommel is at the max end
    pommel_at_min = False
L = ext[ax]; pom = V[:, ax].min() if pommel_at_min else V[:, ax].max(); sgn = 1 if pommel_at_min else -1
grip = pom + sgn * 0.12 * L  # the hands close a little above the pommel
c = (V.max(0) + V.min(0)) / 2; c[ax] = grip
# rotate long axis -> +Y (pointing from pommel to tip)
R = Matrix.Identity(3)
dirv = Vector((0, 0, 0)); dirv[ax] = sgn
R = dirv.rotation_difference(Vector((0, 1, 0))).to_matrix()
M = R.to_4x4() @ Matrix.Scale(1 / L, 4) @ Matrix.Translation(-Vector(c))
ob.data.transform(M); ob.data.update()
for sl in ob.material_slots:
    nt = sl.material.node_tree if sl.material and sl.material.use_nodes else None
    if not nt: continue
    for nd in nt.nodes:
        if nd.type == 'TEX_IMAGE' and nd.image:
            nd.image.scale(TEX, TEX)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_image_format='WEBP', export_animations=False)
print('[wpn]', os.path.basename(OUT), n, '->', len(ob.data.polygons), 'pommel', 'min' if pommel_at_min else 'max', os.path.getsize(OUT) // 1024, 'KB')
