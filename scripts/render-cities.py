"""Import the shipped GLBs into Blender, save editable scenes and render QA previews."""
import bpy
import shutil
from pathlib import Path
from mathutils import Vector

project = Path(__file__).resolve().parents[1]
destination = project.parent / 'reference' / 'city-modeling' / 'blender'
destination.mkdir(parents=True, exist_ok=True)
previews = project / 'public' / 'art' / 'cities'
previews.mkdir(parents=True, exist_ok=True)
for city in ('hollow', 'dawnveil', 'thornwatch'):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(project / 'public' / 'models' / 'cities' / f'{city}.glb'))
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 16
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1100
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.world = bpy.data.worlds.new('Overcast dusk')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.24, .29, .36, 1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = .65
    bpy.ops.object.light_add(type='SUN', location=(-15, -20, 35))
    sun = bpy.context.object
    sun.name = 'Moonlight_key'
    sun.data.energy = 2
    sun.data.angle = .15
    sun.rotation_euler = (Vector((0, 0, 0)) - sun.location).to_track_quat('-Z', 'Y').to_euler()
    # glTF importer maps Y-up into Blender Z-up; original north becomes +Y.
    bpy.ops.object.camera_add(location=(45, -55, 62))
    camera = bpy.context.object
    camera.name = 'Isometric_review_camera'
    camera.rotation_euler = (Vector((0, 0, 1)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 87
    scene.camera = camera
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = str(destination / f'{city}-model-preview.png')
    bpy.ops.wm.save_as_mainfile(filepath=str(destination / f'{city}.blend'))
    bpy.ops.render.render(write_still=True)
    shutil.copyfile(scene.render.filepath, previews / f'{city}-model-preview.png')
    print(f'CITY_COMPLETE {city}', flush=True)
