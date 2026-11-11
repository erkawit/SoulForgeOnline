import type {ClassId,ActionId} from './content';
/** chibi-dark v2: two basic-attack swings, a looping cast/draw channel and a shield guard per class */
export const CHARACTER_CLIPS=['Idle','Walk','Run','Attack','Attack2','Channel','Guard','Skill','Buff','Special','Hit','Death'] as const;
export type CharacterClip=typeof CHARACTER_CLIPS[number];
/** Ground speed (m/s) each locomotion clip covers at 1x playback; feet stay planted when playback = speed / this. */
export const CLIP_GROUND_SPEED={Walk:2.393,Run:3.0} as const; // chibi-dark v2 rigs (stride × scale / clip length), from the GLB extras
/** Switch Walk -> Run above RUN_ENTER, back below RUN_EXIT (hysteresis stops flicker at the boundary). */
export const RUN_ENTER=2.2,RUN_EXIT=1.8;
/** Chibi legs are short: the fastest AGI build (8 m/s) needs ~2.9x Run playback. */
export const MAX_LOCOMOTION_SCALE=3;
export function characterClip(action:ActionId,active:boolean,dead:boolean,moving:boolean,speed=0,wasRunning=false):CharacterClip{
 if(dead)return 'Death';
 if(active&&action!=='idle'&&action!=='walk')return ({attack:'Attack',skill:'Skill',buff:'Buff',special:'Special',death:'Death'} as const)[action];
 // run only (no walk cycle in play): any real movement uses Run, scaled to ground speed; Walk stays for previews
 void wasRunning; void speed;
 if(moving)return 'Run';
 return active&&action==='walk'?'Walk':'Idle';
}
/** Playback rate for a looping locomotion clip at the actor's real ground speed (clamped so it never looks frantic or frozen). */
export function locomotionTimeScale(clip:CharacterClip,speed:number):number{
 if(clip!=='Walk'&&clip!=='Run')return 1;
 if(!(speed>0.05))return 1;
 return Math.min(MAX_LOCOMOTION_SCALE,Math.max(0.55,speed/CLIP_GROUND_SPEED[clip]));
}

/** Chibi monster GLBs (public/models/monsters). Species without a model keep the procedural MonsterBody. */
export const MONSTER_MODELS:{test:RegExp;id:string;scale:number;walkSpeed:number;clips:readonly string[]}[]=[
 {test:/Grave Crawler|Crypt Crawler/,id:'grave-crawler',scale:1.24,walkSpeed:1.77,clips:['Idle','Walk','Attack','Hit','Death']},
 {test:/Ash Hound/,id:'ash-hound',scale:1.16,walkSpeed:2.83,clips:['Idle','Walk','Attack','Hit','Death']},
 {test:/Bone Sentinel/,id:'bone-sentinel',scale:1.2,walkSpeed:2.4,clips:['Idle','Walk','Attack','Hit','Death']},
 {test:/Briar Wolf/,id:'briar-wolf',scale:1.16,walkSpeed:3.1,clips:['Idle','Walk','Attack','Hit','Death']},
 {test:/Thorn Spider/,id:'thorn-spider',scale:1.28,walkSpeed:2.0,clips:['Idle','Walk','Attack','Hit','Death']},
 {test:/Grave Marshal/,id:'grave-marshal',scale:0.8,walkSpeed:1.0,clips:['Idle','Walk','Attack','Skill','Special','Hit','Death']},
];
export const monsterModel=(name:string)=>MONSTER_MODELS.find(m=>m.test.test(name))??null;
export const monsterModelUrl=(id:string)=>`/models/monsters/${id}.glb`;
