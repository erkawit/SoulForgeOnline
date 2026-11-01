# blender -b -P preview_model.py -- <model.fbx> <out_prefix>   front / side / back renders + face count
import bpy, sys, math
from mathutils import Vector
a = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.fbx(filepath=a[0])
ms = [o for o in bpy.data.objects if o.type == 'MESH']
print('[prev] faces', sum(len(o.data.polygons) for o in ms), 'verts', sum(len(o.data.vertices) for o in ms))
P = [o.matrix_world @ v.co for o in ms for v in o.data.vertices]
zmin = min(p.z for p in P); zmax = max(p.z for p in P); H = zmax - zmin; cz = (zmin + zmax) / 2
sc = bpy.context.scene; cam = bpy.data.objects.new('c', bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = H * 1.15; sc.render.resolution_x, sc.render.resolution_y = 600, 700; sc.render.film_transparent = True
for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
    try: sc.render.engine = eng; break
    except TypeError: pass
w = bpy.data.worlds.new('w'); w.use_nodes = True; w.node_tree.nodes['Background'].inputs[1].default_value = 3.0; sc.world = w
for tag, loc in [('front', (0, -10, cz)), ('side', (10, 0, cz)), ('back', (0, 10, cz))]:
    cam.location = loc; cam.rotation_euler = (Vector((0, 0, cz)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = f'{a[1]}_{tag}.png'; bpy.ops.render.render(write_still=True)
print('[prev] done')
