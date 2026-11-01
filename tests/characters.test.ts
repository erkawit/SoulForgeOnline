import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {AnimationMixer,Box3,SkinnedMesh} from 'three';
import {CLASS_IDS} from '../src/game/content';
import {CHARACTER_CLIPS,CLIP_GROUND_SPEED,MAX_LOCOMOTION_SCALE,MONSTER_MODELS,characterClip,characterModelUrl,locomotionTimeScale,monsterModel,monsterModelUrl} from '../src/game/characterModels';
for(const job of CLASS_IDS)test(`${job} GLB loads with a bound skeleton and twelve finite playable clips`,async()=>{
 const buffer=readFileSync(`public${characterModelUrl(job)}`);assert.equal(buffer.readUInt32LE(0),0x46546c67);assert.equal(buffer.readUInt32LE(8),buffer.length);
 const gltf=await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'');
 assert.deepEqual(gltf.animations.map(a=>a.name).sort(),[...CHARACTER_CLIPS].sort());let skins=0;gltf.scene.traverse(o=>{if(o instanceof SkinnedMesh){skins++;assert.ok(o.skeleton.bones.length>=20);const w=o.geometry.attributes.skinWeight;for(let i=0;i<w.count;i++)assert.ok(Math.abs(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i)-1)<1e-5);}});assert.ok(skins>0);
 const copy=clone(gltf.scene);assert.notEqual(copy.getObjectByName('Hips'),gltf.scene.getObjectByName('Hips'));
 for(const clip of gltf.animations){const mixer=new AnimationMixer(copy);mixer.clipAction(clip).play();for(const t of [0,.25,.5,.9]){mixer.setTime(clip.duration*t);copy.updateMatrixWorld(true);copy.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));const b=new Box3().setFromObject(copy);assert.ok(Number.isFinite(b.min.x)&&b.max.y-b.min.y<5);}mixer.stopAllAction();mixer.uncacheRoot(copy);}
});
test('character action selection prioritizes death and active combat over locomotion',()=>{assert.equal(characterClip('attack',true,true,true),'Death');assert.equal(characterClip('attack',true,false,true),'Attack');assert.equal(characterClip('special',false,false,true),'Run');assert.equal(characterClip('death',true,false,false),'Death');assert.equal(characterClip('death',false,false,false),'Idle');});

test('locomotion picks Run at game speeds and scales playback to the real ground speed',()=>{assert.equal(characterClip('idle',false,false,true,1),'Run');assert.equal(characterClip('idle',false,false,true,3.6),'Run');assert.equal(characterClip('idle',false,false,false),'Idle');assert.equal(characterClip('walk',true,false,false),'Walk');assert.equal(characterClip('attack',true,false,true,6),'Attack');assert.ok(Math.abs(locomotionTimeScale('Run',CLIP_GROUND_SPEED.Run)-1)<1e-9);assert.equal(locomotionTimeScale('Run',20),MAX_LOCOMOTION_SCALE);assert.ok(8/CLIP_GROUND_SPEED.Run<=MAX_LOCOMOTION_SCALE);assert.equal(locomotionTimeScale('Idle',5),1);});

for(const spec of MONSTER_MODELS)test(`${spec.id} monster GLB loads with its clips`,async()=>{
 const buffer=readFileSync(`public${monsterModelUrl(spec.id)}`);assert.equal(buffer.readUInt32LE(0),0x46546c67);
 const gltf=await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'');
 assert.deepEqual(gltf.animations.map(a=>a.name).sort(),[...spec.clips].sort());let skins=0;gltf.scene.traverse(o=>{if(o instanceof SkinnedMesh)skins++;});assert.ok(skins>0);
 const copy=clone(gltf.scene);for(const clip of gltf.animations){const mixer=new AnimationMixer(copy);mixer.clipAction(clip).play();mixer.setTime(clip.duration*.5);copy.updateMatrixWorld(true);const b=new Box3().setFromObject(copy);assert.ok(Number.isFinite(b.min.x)&&b.max.y-b.min.y<6);mixer.uncacheRoot(copy);}
});
test('monster names map to chibi models',()=>{assert.equal(monsterModel('Ash Hound')?.id,'ash-hound');assert.equal(monsterModel('Grave Marshal')?.id,'grave-marshal');assert.equal(monsterModel('Bark Guardian'),null);});
