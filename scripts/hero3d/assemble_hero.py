# blender -b -P assemble_hero.py -- <rigged.fbx> <anim_dir> <out.glb> [sword.glb] [preview_dir]
# One game file for the 3D hero: the Mixamo-rigged base body + every Great Sword clip from the Mixamo pack, retargeted
# by bone name (same mixamorig skeleton), made in-place, with a closed grip on the right hand while a weapon is held.
import bpy, sys, os, math, glob
from mathutils import Vector, Quaternion, Matrix

a = sys.argv[sys.argv.index('--') + 1:]
SRC, ANIMS, OUT = a[0], a[1], a[2]; SWORD = a[3] if len(a) > 3 else None; PREV = a[4] if len(a) > 4 else None
CLIPS = {  # game clip -> Mixamo file (Great Sword pack)
    'Idle': 'great sword idle.fbx', 'Walk': 'great sword walk.fbx', 'Run': 'great sword run.fbx',
    'Attack': 'great sword slash.fbx', 'Attack2': 'great sword slash (2).fbx', 'Attack3': 'great sword slash (3).fbx',
    'Skill': 'great sword jump attack.fbx', 'Special': 'great sword high spin attack.fbx', 'Dash': 'great sword slide attack.fbx',
    'Buff': 'great sword power up.fbx', 'Channel': 'great sword casting.fbx', 'Guard': 'great sword blocking.fbx',
    'Hit': 'great sword impact.fbx', 'Death': 'two handed sword death.fbx', 'Draw': 'draw a great sword 1.fbx',
}
LOOP = {'Idle', 'Walk', 'Run', 'Guard', 'Channel'}

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SRC)
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE'); body = next(o for o in bpy.data.objects if o.type == 'MESH')
for o in list(bpy.data.objects):
    if o.type not in ('ARMATURE', 'MESH'): bpy.data.objects.remove(o, do_unlink=True)
for act in list(bpy.data.actions): bpy.data.actions.remove(act)
arm.name = 'Hero'; body.name = 'HeroBody'
def height(objs):
    zs = [(o.matrix_world @ v.co).z for o in objs if o.type == 'MESH' for v in o.data.vertices]
    return (max(zs) - min(zs)) if zs else 0
HIP_H = height([body])  # body height (the anim's root bob is rescaled by body-height ratio)
def fcurves(act):
    if hasattr(act, 'fcurves'): return list(act.fcurves)
    out = []
    for ly in act.layers:
        for st in ly.strips:
            for cb in st.channelbags: out += list(cb.fcurves)
    return out
print('[hero] bones', len(arm.data.bones), 'hip height', round(HIP_H, 3))

def import_action(path):
    before = set(bpy.data.objects); acts = set(bpy.data.actions)
    bpy.ops.import_scene.fbx(filepath=path, automatic_bone_orientation=False)
    new = [o for o in bpy.data.objects if o not in before]; src = next((o for o in new if o.type == 'ARMATURE'), None)
    act = next((x for x in bpy.data.actions if x not in acts), None)
    s_hip = height(new) or HIP_H
    for o in new: bpy.data.objects.remove(o, do_unlink=True)
    return act, (HIP_H / s_hip if s_hip > 1e-6 else 1.0)

arm.animation_data_create()
made = []
for clip, fname in CLIPS.items():
    p = os.path.join(ANIMS, fname)
    if not os.path.exists(p): print('[hero] missing', fname); continue
    act, k = import_action(p)
    if not act: print('[hero] no action in', fname); continue
    act.name = clip; act.use_fake_user = True
    # in place + rescale the root bob to this body: hips location curves (bone-local: x side, y up, z forward)
    for fc in fcurves(act):
        if fc.data_path == 'pose.bones["mixamorig:Hips"].location':
            v0 = fc.keyframe_points[0].co[1] if len(fc.keyframe_points) else 0
            for kp in fc.keyframe_points:
                if fc.array_index == 1: kp.co[1] = kp.co[1] * k; kp.handle_left[1] *= k; kp.handle_right[1] *= k
                elif clip not in ('Dash', 'Death', 'Hit'): kp.co[1] = v0; kp.handle_left[1] = v0; kp.handle_right[1] = v0  # stay on the spot
                else: kp.co[1] = (kp.co[1] - v0) * k + v0; kp.handle_left[1] = (kp.handle_left[1] - v0) * k + v0; kp.handle_right[1] = (kp.handle_right[1] - v0) * k + v0
    made.append(clip)
print('[hero] clips', made)

# NLA: one strip per clip so the glTF exporter writes every action as its own animation
for clip in made:
    tr = arm.animation_data.nla_tracks.new(); tr.name = clip
    st = tr.strips.new(clip, int(bpy.data.actions[clip].frame_range[0]), bpy.data.actions[clip]); tr.mute = False
arm.animation_data.action = None

for im in bpy.data.images:
    if im.size[0] > 1024: im.scale(1024, 1024)  # game texture size
bpy.ops.object.select_all(action='DESELECT'); arm.select_set(True); body.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=True, export_animations=True,
                          export_animation_mode='NLA_TRACKS', export_force_sampling=True, export_frame_step=1,
                          export_yup=True, export_apply=False, export_image_format='WEBP')
print('[hero] wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')

# preview: the walk / slash / jump attack with the sword in the right hand, front 3/4 view
if PREV and SWORD:
    os.makedirs(PREV, exist_ok=True); sc = bpy.context.scene
    b = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=SWORD); sw = [o for o in bpy.data.objects if o not in b]
    ms = [o for o in sw if o.type == 'MESH']
    P = [o.matrix_world @ v.co for o in ms for v in o.data.vertices]
    lo = Vector((min(p[i] for p in P) for i in range(3))); hi = Vector((max(p[i] for p in P) for i in range(3)))
    ext = hi - lo; ax = max(range(3), key=lambda i: ext[i]); L = 0.85 * (body.dimensions.z if body.dimensions.z > 0.5 else 1.9) * 0.55
    holder = bpy.data.objects.new('SwordHolder', None); sc.collection.objects.link(holder)
    for o in sw:
        if o.parent is None: o.parent = holder
    c = (lo + hi) / 2; base = c.copy(); base[ax] = lo[ax]
    R = Matrix.Identity(4)
    if ax == 0: R = Matrix.Rotation(math.pi / 2, 4, 'Z')   # long axis -> local Y
    elif ax == 2: R = Matrix.Rotation(-math.pi / 2, 4, 'X')
    holder.matrix_basis = R @ Matrix.Scale(L / ext[ax], 4) @ Matrix.Translation(-base)
    socket = bpy.data.objects.new('socket_hand_R', None); sc.collection.objects.link(socket)
    socket.parent = arm; socket.parent_type = 'BONE'; socket.parent_bone = 'mixamorig:RightHand'
    socket.location = (0, 0.05, 0.02); socket.rotation_euler = (0, 0, 0)
    holder.parent = socket; holder.location = (0, -0.2 * L, 0)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = 2.6; sc.render.resolution_x, sc.render.resolution_y = 420, 480
    sc.render.film_transparent = True
    for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
        try: sc.render.engine = eng; break
        except TypeError: pass
    w = bpy.data.worlds.new('w'); w.use_nodes = True; w.node_tree.nodes['Background'].inputs[1].default_value = 2.5; sc.world = w
    tgt = Vector((0, 0, 0.95)); cam.location = tgt + Vector((1.8, -5.0, 3.0)); cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler()
    for tr in arm.animation_data.nla_tracks: tr.mute = True
    for clip in ('Idle', 'Walk', 'Attack', 'Skill'):
        if clip not in made: continue
        act = bpy.data.actions[clip]; arm.animation_data.action = act
        f0, f1 = act.frame_range
        for i, t in enumerate((0.0, 0.35, 0.7)):
            sc.frame_set(int(f0 + (f1 - f0) * t)); sc.render.filepath = os.path.join(PREV, f'{clip}_{i}.png'); bpy.ops.render.render(write_still=True)
print('[hero] done')
