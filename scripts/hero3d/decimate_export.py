# blender -b -P decimate_export.py -- <in.fbx> <target_faces> <out_base>   -> <out_base>.fbx (embedded texture) + .glb
import bpy, sys, os
a = sys.argv[sys.argv.index('--') + 1:]; SRC, TARGET, OUT = a[0], int(a[1]), a[2]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.fbx(filepath=SRC)
ms = [o for o in bpy.data.objects if o.type == 'MESH']
for o in ms:
    n = len(o.data.polygons); m = o.modifiers.new('dec', 'DECIMATE'); m.decimate_type = 'COLLAPSE'; m.ratio = min(1.0, TARGET / max(1, sum(len(x.data.polygons) for x in ms)))
    m.use_collapse_triangulate = False
    bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier=m.name)
    print('[dec]', o.name, n, '->', len(o.data.polygons))
# keep only the base colour (the game lights it like a painting); embed it in the FBX for Mixamo
for o in ms:
    for sl in o.material_slots:
        nt = sl.material.node_tree if sl.material and sl.material.use_nodes else None
        if not nt: continue
        bs = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        for inp in ('Metallic', 'Roughness'):
            if bs and bs.inputs[inp].is_linked: nt.links.remove(bs.inputs[inp].links[0])
        if bs: bs.inputs['Metallic'].default_value = 0.0; bs.inputs['Roughness'].default_value = 0.8
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.fbx(filepath=OUT + '.fbx', path_mode='COPY', embed_textures=True)
bpy.ops.export_scene.gltf(filepath=OUT + '.glb', export_format='GLB')
print('[dec] wrote', OUT)
