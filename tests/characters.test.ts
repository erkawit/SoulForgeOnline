import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {AnimationMixer,Box3,SkinnedMesh} from 'three';
import {CHARACTER_CLIPS,CLIP_GROUND_SPEED,MAX_LOCOMOTION_SCALE,MONSTER_MODELS,characterClip,locomotionTimeScale,monsterModel,monsterModelUrl} from '../src/game/characterModels';
// the 3D hero GLBs are retired (heroes are the painted 8-way class sheets); this file keeps the clip logic and monster GLBs
test('character action selection prioritizes death and active combat over locomotion',()=>{assert.equal(characterClip('attack',true,true,true),'Death');assert.equal(characterClip('attack',true,false,true),'Attack');assert.equal(characterClip('special',false,false,true),'Run');assert.equal(characterClip('death',true,false,false),'Death');assert.equal(characterClip('death',false,false,false),'Idle');});

test('locomotion picks Run at game speeds and scales playback to the real ground speed',()=>{assert.equal(characterClip('idle',false,false,true,1),'Run');assert.equal(characterClip('idle',false,false,true,3.6),'Run');assert.equal(characterClip('idle',false,false,false),'Idle');assert.equal(characterClip('walk',true,false,false),'Walk');assert.equal(characterClip('attack',true,false,true,6),'Attack');assert.ok(Math.abs(locomotionTimeScale('Run',CLIP_GROUND_SPEED.Run)-1)<1e-9);assert.equal(locomotionTimeScale('Run',20),MAX_LOCOMOTION_SCALE);assert.ok(8/CLIP_GROUND_SPEED.Run<=MAX_LOCOMOTION_SCALE);assert.equal(locomotionTimeScale('Idle',5),1);});

for(const spec of MONSTER_MODELS)test(`${spec.id} monster GLB loads with its clips`,async()=>{
 const buffer=readFileSync(`public${monsterModelUrl(spec.id)}`);assert.equal(buffer.readUInt32LE(0),0x46546c67);
 const gltf=await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'');
 assert.deepEqual(gltf.animations.map(a=>a.name).sort(),[...spec.clips].sort());let skins=0;gltf.scene.traverse(o=>{if(o instanceof SkinnedMesh)skins++;});assert.ok(skins>0);
 const copy=clone(gltf.scene);for(const clip of gltf.animations){const mixer=new AnimationMixer(copy);mixer.clipAction(clip).play();mixer.setTime(clip.duration*.5);copy.updateMatrixWorld(true);const b=new Box3().setFromObject(copy);assert.ok(Number.isFinite(b.min.x)&&b.max.y-b.min.y<6);mixer.uncacheRoot(copy);}
});
test('monster names map to chibi models',()=>{assert.equal(monsterModel('Ash Hound')?.id,'ash-hound');assert.equal(monsterModel('Grave Marshal')?.id,'grave-marshal');assert.equal(monsterModel('Bark Guardian'),null);});
