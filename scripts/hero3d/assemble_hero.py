# blender -b -P assemble_hero.py -- <rigged.fbx> <anim_dir> <out.glb> [sword.glb] [preview_dir]
# One game file for the 3D hero: the Mixamo-rigged base body + every Great Sword clip from the Mixamo pack, retargeted
# by bone name (same mixamorig skeleton), made in-place, with a closed grip on the right hand while a weapon is held.
import bpy, sys, os, math, glob
from mathutils import Vector, Quaternion, Matrix

a = sys.argv[sys.argv.index('--') + 1:]
def flag(name, default=None):
    if name in a: i = a.index(name); v = a[i + 1]; del a[i:i + 2]; return v
    return default
TEX = flag('--tex'); HAIR = flag('--hair'); OUTFIT = flag('--outfit'); FACES = int(flag('--faces', '18000'))  # --hair "A06=path.glb;A03=path.glb"
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
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
skinned = [o for o in bpy.data.objects if o.type == 'MESH' and any(m.type == 'ARMATURE' for m in o.modifiers)]
body = max(skinned, key=lambda o: len(o.data.vertices)) if skinned else next(o for o in bpy.data.objects if o.type == 'MESH')
for o in list(bpy.data.objects):
    if o not in (arm, body): bpy.data.objects.remove(o, do_unlink=True)  # extra static copies, empties, cameras
for act in list(bpy.data.actions): bpy.data.actions.remove(act)
arm.name = 'Hero'; body.name = 'HeroBody'
if TEX:  # FBX re-exported by Mixamo without its Meshy texture: put it back as the base colour
    img = bpy.data.images.load(TEX); mat = bpy.data.materials.new('Body'); mat.use_nodes = True; nt = mat.node_tree
    bs = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'); tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = img
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); body.data.materials.clear(); body.data.materials.append(mat)

# ---- outfit: a whole dressed body (Meshy, same T-pose mannequin) replaces the base body. It is fitted to the base body's
# bounds, decimated, and skinned by copying the base body's weights from the nearest surface (no Mixamo round trip).
def facing(ob):
    # the toes stick out further in front than the heels behind the ankle
    P = [ob.matrix_world @ v.co for v in ob.data.vertices]
    z0 = min(p.z for p in P); H = max(p.z for p in P) - z0
    low = [p.y for p in P if p.z < z0 + 0.04 * H]; ank = [p.y for p in P if z0 + 0.07 * H < p.z < z0 + 0.11 * H]
    return -1 if (min(low) + max(low)) / 2 - sum(ank) / len(ank) < 0 else 1
def bounds(ob):
    P = [ob.matrix_world @ v.co for v in ob.data.vertices]
    return Vector([min(p[i] for p in P) for i in range(3)]), Vector([max(p[i] for p in P) for i in range(3)])
if OUTFIT:
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=OUTFIT)
    new = [o for o in bpy.data.objects if o not in before]; ms = [o for o in new if o.type == 'MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in ms: o.select_set(True)
    bpy.context.view_layer.objects.active = ms[0]
    if len(ms) > 1: bpy.ops.object.join()
    out = bpy.context.view_layer.objects.active
    for o in new:
        if o != out and o.name in bpy.data.objects: bpy.data.objects.remove(o, do_unlink=True)
    out.parent = None; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    n = len(out.data.polygons)
    if n > FACES:
        m = out.modifiers.new('d', 'DECIMATE'); m.ratio = FACES / n; bpy.ops.object.modifier_apply(modifier=m.name)
    print('[hero] outfit faces', n, '->', len(out.data.polygons))
    if facing(out) != facing(body):
        out.rotation_euler = (0, 0, math.pi); bpy.ops.object.transform_apply(rotation=True); print('[hero] outfit turned 180')
    lo, hi = bounds(body); ol, oh = bounds(out)
    k = (hi.z - lo.z) / (oh.z - ol.z); out.scale = (k, k, k); bpy.ops.object.transform_apply(scale=True)
    ol, oh = bounds(out)
    out.location = Vector(((lo.x + hi.x) / 2 - (ol.x + oh.x) / 2, (lo.y + hi.y) / 2 - (ol.y + oh.y) / 2, lo.z - ol.z)); bpy.ops.object.transform_apply(location=True)
    print('[hero] outfit fit scale', round(k, 4), 'span', round(oh.x - ol.x, 3), 'vs body', round(hi.x - lo.x, 3))
    # weights: every base vertex group, copied from the nearest point on the base body's surface
    arm.data.pose_position = 'REST'; bpy.context.view_layer.update()  # transfer from the bind pose, not the last imported frame
    for vg in body.vertex_groups: out.vertex_groups.new(name=vg.name)
    dt = out.modifiers.new('w', 'DATA_TRANSFER'); dt.object = body; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}
    dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
    bpy.ops.object.select_all(action='DESELECT'); out.select_set(True); bpy.context.view_layer.objects.active = out
    bpy.ops.object.modifier_apply(modifier=dt.name)
    bpy.ops.object.vertex_group_limit_total(group_select_mode='ALL', limit=4); bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    used = {}
    for v in out.data.vertices:
        for g in v.groups:
            if g.weight > 0.01: used[out.vertex_groups[g.group].name] = used.get(out.vertex_groups[g.group].name, 0) + 1
    print('[hero] weighted groups', len(used), 'head', used.get('mixamorig:Head'), 'src groups', len(body.vertex_groups), 'src head', sum(1 for v in body.data.vertices for g in v.groups if body.vertex_groups[g.group].name == 'mixamorig:Head' and g.weight > .5))
    arm.data.pose_position = 'POSE'
    am = out.modifiers.new('Armature', 'ARMATURE'); am.object = arm
    out.parent = arm; out.matrix_parent_inverse = arm.matrix_world.inverted()
    old = body; body = out; bpy.data.objects.remove(old, do_unlink=True); body.name = 'HeroBody'
    for im in bpy.data.images:
        if im.size[0] > 1024: im.scale(1024, 1024)

# ---- hair: each style is a mesh parented to the Head bone, named Hair_<style>, fitted to this head
def head_box():
    vg = body.vertex_groups.get('mixamorig:Head')
    if not vg: return None
    pts = []
    for v in body.data.vertices:
        for g in v.groups:
            if g.group == vg.index and g.weight > 0.5: pts.append(body.matrix_world @ v.co)
    if not pts: return None
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi
if HAIR:
    hb = head_box(); print('[hero] head box', hb)
    for item in HAIR.split(';'):
        if '=' not in item: continue
        style, path = item.split('=', 1)
        before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path)
        new = [o for o in bpy.data.objects if o not in before]; ms = [o for o in new if o.type == 'MESH']
        bpy.ops.object.select_all(action='DESELECT')
        for o in ms: o.select_set(True)
        bpy.context.view_layer.objects.active = ms[0]
        if len(ms) > 1: bpy.ops.object.join()
        hair = bpy.context.view_layer.objects.active
        for o in new:
            if o != hair and o.name in bpy.data.objects: bpy.data.objects.remove(o, do_unlink=True)
        hair.parent = None; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        n = len(hair.data.polygons)
        if n > 6000:
            m = hair.modifiers.new('d', 'DECIMATE'); m.ratio = 6000 / n; bpy.ops.object.modifier_apply(modifier=m.name)
        P = [v.co.copy() for v in hair.data.vertices]
        zt = max(p.z for p in P); zb = min(p.z for p in P); top = [p for p in P if p.z > zt - 0.35 * (zt - zb)]
        hw = max(p.x for p in top) - min(p.x for p in top); hcx = (max(p.x for p in top) + min(p.x for p in top)) / 2; hcy = (max(p.y for p in top) + min(p.y for p in top)) / 2
        lo, hi = hb; headw = hi.x - lo.x; k = headw * 1.16 / hw
        hair.scale = (k, k, k); bpy.ops.object.transform_apply(scale=True)
        P = [v.co.copy() for v in hair.data.vertices]; zt = max(p.z for p in P)
        hair.location = Vector(((lo.x + hi.x) / 2 - hcx * k, (lo.y + hi.y) / 2 - hcy * k + 0.03 * (hi.y - lo.y), hi.z + 0.035 * (hi.z - lo.z) - zt))
        bpy.ops.object.transform_apply(location=True)
        for im in bpy.data.images:
            if im.size[0] > 512 and im.users and any(nd.type == 'TEX_IMAGE' and nd.image == im for sl in hair.material_slots if sl.material and sl.material.use_nodes for nd in sl.material.node_tree.nodes): im.scale(512, 512)
        for sl in hair.material_slots:
            if sl.material: sl.material.name = f'Hair_{style}'
        hair.name = f'Hair_{style}'
        # follow the head
        bpy.ops.object.select_all(action='DESELECT'); hair.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
        arm.data.bones.active = arm.data.bones['mixamorig:Head']
        bpy.ops.object.parent_set(type='BONE', keep_transform=True)
        print('[hero] hair', style, n, '->', len(hair.data.polygons), 'scale', round(k, 3))
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
for o in bpy.data.objects:
    if o.name.startswith('Hair_'): o.select_set(True)
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
