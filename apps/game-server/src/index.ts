import 'dotenv/config';
import { WebSocketServer, WebSocket } from 'ws';
import { createClient } from '@supabase/supabase-js';
import { Intent, type Actor } from './protocol.js';
import { Room } from './world.js';
const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_PUBLISHABLE_KEY, secret=process.env.SUPABASE_SECRET_KEY;
if(!url||!key||!secret) throw new Error('Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY');
const auth=createClient(url,key,{auth:{persistSession:false}});
const db=createClient(url,secret,{auth:{persistSession:false}});
const room=new Room();const clients=new Map<string,WebSocket>();const motion=new Map<string,{dx:number;dz:number}>();
const wss=new WebSocketServer({port:Number(process.env.PORT??3001),maxPayload:2048,perMessageDeflate:false});
const send=(s:WebSocket,p:unknown)=>{if(s.readyState===WebSocket.OPEN)s.send(JSON.stringify(p));};
const broadcast=(p:unknown)=>{for(const s of clients.values())send(s,p);};
const distance=(a:{x:number;z:number},b:{x:number;z:number})=>Math.hypot(a.x-b.x,a.z-b.z);
// Trust ONLY server-owned actor state. Never accept HP, damage, position, stats, loot or currency from clients.
// MVP fixed starting stats: integrate server-side character/equipment tables before economy launch.
wss.on('connection',(socket,request)=>{
 const origin=request.headers.origin;
 if(process.env.ALLOWED_ORIGIN && origin!==process.env.ALLOWED_ORIGIN){socket.close(1008,'Origin rejected');return;}
 let player:Actor|null=null;let id:string|null=null;let strikes=0;let received=0;let lastSecond=Date.now();
 const authTimeout=setTimeout(()=>{if(!player)socket.close(1008,'Auth timeout');},5000);
 socket.on('message',async(raw)=>{
  const bytes = Array.isArray(raw) ? Buffer.concat(raw) : raw instanceof ArrayBuffer ? Buffer.from(raw) : raw;
  if(bytes.length>2048){socket.close(1009);return;}
  const now=Date.now();if(now-lastSecond>=1000){lastSecond=now;received=0;}if(++received>45){socket.close(1008,'Rate limit');return;}
  let msg:unknown;try{msg=JSON.parse(bytes.toString());}catch{return;}
  if(!player){
   if(!msg||typeof msg!=='object'||!('type'in msg)||msg.type!=='AUTH'||!('token'in msg)||typeof msg.token!=='string')return;
   const result=await auth.auth.getUser(msg.token);if(result.error||!result.data.user){socket.close(1008,'Invalid JWT');return;}
   const verifiedId=result.data.user.id;id=verifiedId;const previous=clients.get(verifiedId);if(previous)previous.close(4001,'Session replaced');
   player={id:verifiedId,x:0,z:0,hp:150,maxHp:150,attack:40,defense:15,crit:.08,mp:100,speed:4,level:1,lastBasic:0,lastSkill:0};
   room.players.set(verifiedId,player);clients.set(verifiedId,socket);motion.set(verifiedId,{dx:0,dz:0});clearTimeout(authTimeout);
   send(socket,{type:'WELCOME',playerId:id,roomId:room.id});send(socket,room.snapshot());broadcast({type:'PLAYER_JOINED',playerId:id});return;
  }
  const r=Intent.safeParse(msg);if(!r.success){if(++strikes>15)socket.close(1008,'Invalid intents');return;}
  const intent=r.data;const a=player;
  if(intent.type==='MOVE'){motion.set(a.id,{dx:intent.dx,dz:intent.dz});return;}
  if(intent.type==='PING'){send(socket,{type:'PONG',serverTime:now});return;}
  if(intent.type==='ATTACK'){
   const boss=room.boss;if(!boss||intent.targetId!==boss.id){send(socket,{type:'REJECTED',reason:'Unknown target'});return;}
   const skill=intent.skillId==='soul_burst';const cooldown=skill?4000:700;const last=skill?a.lastSkill:a.lastBasic;const range=skill?5:3;
   if(distance(a,boss)>range||now-last<cooldown||a.hp<=0||(skill&&a.mp<20)){send(socket,{type:'REJECTED',reason:'Range, MP or cooldown'});return;}
   if(skill){a.lastSkill=now;a.mp-=20;}else a.lastBasic=now;
   const critical=Math.random()<a.crit;const dealt=Math.max(1,Math.floor(a.attack*(skill?1.9:1)*(critical?1.65:1)*(0.9+Math.random()*.2)-boss.defense*.12));
   const outcome=room.damageBoss(a.id,dealt,now);broadcast({type:'COMBAT_RESULT',playerId:a.id,targetId:boss.id,damage:outcome.dealt,critical});
   if(outcome.killed){
    // Best effort demonstration only: production requires a transactional boss-defeat/loot creation RPC.
    if(outcome.drops){const {error}=await db.from('world_loot').insert(outcome.drops.map(l=>({id:l.id,room_id:room.id,boss_instance_id:l.bossInstanceId,item_definition_id:l.itemDefinitionId,rarity:l.rarity.toLowerCase(),x:l.x,z:l.z,expires_at:new Date(l.expiresAt).toISOString()})));if(error){for(const l of outcome.drops)room.loot.delete(l.id);send(socket,{type:'ERROR',message:'Loot persistence failed'});}}
    broadcast({type:'BOSS_DEFEATED',playerId:a.id});
   }return;
  }
  if(intent.type==='PICKUP'){
   const l=room.loot.get(intent.lootId);if(!l||distance(a,l)>2.5){send(socket,{type:'REJECTED',reason:'Loot unavailable or out of range'});return;}
   const {data,error}=await db.rpc('claim_world_loot',{p_loot_id:l.id,p_player_id:a.id,p_room_id:room.id,p_x:a.x,p_z:a.z});
   if(error){send(socket,{type:'REJECTED',reason:'Already claimed or inventory unavailable'});return;}
   room.loot.delete(l.id);broadcast({type:'LOOT_CLAIMED',lootId:l.id,playerId:a.id});send(socket,{type:'PICKUP_OK',lootId:l.id,itemId:data});
  }
 });
 socket.on('close',()=>{clearTimeout(authTimeout);if(id&&clients.get(id)===socket){clients.delete(id);room.players.delete(id);motion.delete(id);broadcast({type:'PLAYER_LEFT',playerId:id});}});
});
let previous=Date.now();setInterval(()=>{const now=Date.now();const dt=Math.min((now-previous)/1000,.1);previous=now;
 for(const a of room.players.values()){const v=motion.get(a.id);if(!v)continue;const len=Math.hypot(v.dx,v.dz);if(len>0){const factor=Math.min(1,len);a.x=Math.max(-23,Math.min(23,a.x+v.dx/len*a.speed*factor*dt));a.z=Math.max(-23,Math.min(23,a.z+v.dz/len*a.speed*factor*dt));}}
 room.tick(dt,now);broadcast(room.snapshot());
},50);
console.log('SOULFORGE authoritative room listening on '+(process.env.PORT??3001));
