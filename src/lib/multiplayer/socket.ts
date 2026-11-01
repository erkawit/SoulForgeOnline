// Realm connection (round 9). Online, the realm owns the character: on login it sends the character (CHAR), every
// economy operation goes up as an ACT (src/store/authority.ts) and the realm answers with ACK + STATE patches. The
// browser keeps simulating the fight and reports where the character stands (POS, validated by the realm).
// Leaving the realm (manual disconnect / fatal close) restores the offline guest save this device had before.
import type {Snapshot} from '@/lib/types';
import type {CharState} from '@/game/economy/core';
import {useMultiplayerStore} from '@/store/useMultiplayerStore';
import {applyServerHit,applyServerState,createSnapshot,useGameStore} from '@/store/useGameStore';
import {authority,RNG_OPS,type ActOp} from '@/store/authority';
type Ack={type:'ACK';seq:number;op:ActOp;ok:boolean;msg:string|null};
/** ACTs that need to be judged from where the character stands right now (NPC distance, waygate ring, loot reach) */
/** market / mail operations: the realm answers with an ACK the market window shows (actResult) */
const MARKET_ACTS:string[]=['marketList','marketBuy','marketCancel','mailClaim'];
const POSITIONAL:ActOp[]=['sellJunk','travel','turnIn','buyShop','buyCatalog','enhance','craft','crystalCraft','brewPotion','starter','blessing','resetSkills','pickup','event','promote','kill','marketList','marketBuy','marketCancel'];
class GameConnection {
 private ws:WebSocket|null=null;
 private token:string|null=null;private manual=false;private retries=0;private retryTimer:ReturnType<typeof setTimeout>|null=null;
 private guest:Snapshot|null=null;
 /** the realm's copy of the character (CHAR + every STATE patch); `optimistic` = the last ACT also applied locally */
 private server:CharState|null=null;private seq=0;private optimistic=0;private ready=false;
 private posTimer:ReturnType<typeof setInterval>|null=null;private lastPos='';
 private restore(){if(this.guest){useGameStore.getState().hydrate(this.guest);this.guest=null;}}
 async connect(token:string,resume=false){
  if(!resume){this.disconnect();this.guest=createSnapshot();}this.token=token;this.manual=false;this.ready=false;
  const base=process.env.NEXT_PUBLIC_GAME_SERVER_URL||'ws://localhost:3001';
  const ws=new WebSocket(base);this.ws=ws;
  useMultiplayerStore.getState().setState({online:true,status:'Connecting...'});
  ws.onopen=()=>{this.retries=0;ws.send(JSON.stringify({type:'AUTH',token}));};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch{return;}
   if(m.type==='WELCOME')useMultiplayerStore.getState().setState({connected:true,reconnecting:false,playerId:m.playerId,status:'Online · '+m.roomId});
   if(m.type==='CHAR'){this.server=m.state;this.seq=0;this.optimistic=0;this.ready=true;this.lastPos='';
    authority.install((op,args,ids)=>this.act(op,args,ids),()=>this.ready&&this.ws?.readyState===WebSocket.OPEN);
    applyServerState(m.state,{first:true,message:'เชื่อมต่อเซิร์ฟเวอร์แล้ว · ตัวละครถูกบันทึกที่เซิร์ฟเวอร์'});this.startPos();}
   if(m.type==='ACK'){const a=m as Ack;
    if(!a.ok&&a.msg&&a.op!=='kill'&&a.op!=='event')useGameStore.setState(s=>({log:[a.msg!,...s.log].slice(0,6)}));
    if(a.op==='buyShop'||a.op==='buyCatalog'||a.op==='brewPotion'||a.op==='enhance'||a.op==='craft'||a.op==='crystalCraft'||a.op==='starter'||MARKET_ACTS.includes(a.op))useMultiplayerStore.getState().setState({actResult:{op:a.op,ok:a.ok,msg:a.msg??(a.ok?'สำเร็จ':'ไม่สำเร็จ'),seq:a.seq}});}
   if(m.type==='STATE'&&this.server){const next:CharState={...this.server,...m.patch};this.server=next;
    // apply once the realm has seen every change already shown locally (a newer optimistic change must not be undone)
    if(m.seq>=this.optimistic)applyServerState(next);}
   if(m.type==='POS_FIX'){const s=useGameStore.getState();if((s.player.cityId??'hollow')===m.city)useGameStore.setState({player:{...s.player,position:[m.x,m.z]}});this.lastPos='';}
   if(m.type==='WORLD_SNAPSHOT'){const ch=useMultiplayerStore.getState().channel;useMultiplayerStore.getState().setState({players:m.players,boss:m.boss,loot:m.loot,...(m.channel&&m.channel!==ch.current?{channel:{...ch,current:m.channel}}:{})});}
   if(m.type==='CHANNELS')useMultiplayerStore.getState().setState({channel:{current:m.current,list:m.list,at:Date.now(),cap:m.cap}});
   if(m.type==='BUFF_APPLIED'&&m.to===useMultiplayerStore.getState().playerId)useMultiplayerStore.getState().setState({status:`ได้รับบัฟ ${m.buff} จาก Enchanter`});
   if(m.type==='REJECTED'||m.type==='ERROR')useMultiplayerStore.getState().setState({status:m.reason||m.message});
   if(m.type==='PARTY')useMultiplayerStore.getState().setState({party:m.party});
   if(m.type==='PARTY_INVITE')useMultiplayerStore.getState().setState({partyInvite:{from:m.from,name:m.name,classId:m.classId,until:Date.now()+m.expiresIn*1000}});
   // round 13: the world boss struck someone — if it is this character, the realm's HP is the truth
   if(m.type==='BOSS_STRIKE'&&m.target===useMultiplayerStore.getState().playerId)applyServerHit({damage:Number(m.damage)||0,hp:Number(m.hp),evaded:!!m.evaded,stacks:Number(m.stacks)||0});
   if(m.type==='BOSS_RESULT')useMultiplayerStore.getState().setState({bossResult:{boss:m.boss,minutes:m.minutes,players:m.players,ranked:m.ranked}});
   if(m.type==='NOTICE')useMultiplayerStore.getState().setState({status:m.message});
   if(m.type==='MARKET_VIEW'){const prev=useMultiplayerStore.getState().market;useMultiplayerStore.getState().setState({market:{view:m.view,listings:m.listings??(m.view==='mail'?prev?.listings??[]:[]),mail:m.mail??prev?.mail??[],tax:Number(m.tax)||0,page:m.page??0,error:m.error??null,at:Date.now()},...(m.view==='mail'?{mailCount:(m.mail??[]).length}:{})});}
   if(m.type==='MAIL'){useMultiplayerStore.getState().setState({mailCount:m.count,...(m.note?{status:`📬 ${m.note}`}:{})});if(m.note)useGameStore.setState(s=>({log:[`📬 ${m.note}`,...s.log].slice(0,6)}));}
  };
  // dropped connection: retry quietly inside the server's 120 s party grace (1,2,4,8,15,15… s) — the party seat is kept
  ws.onclose=ev=>{if(this.ws!==ws)return;this.ready=false;this.stopPos();const fatal=ev.code===1008||ev.code===4001||ev.code===4002||ev.code===1013||ev.code===1011;
   if(!this.manual&&!fatal&&this.token&&this.retries<10){const wait=Math.min(15000,1000*2**this.retries++);useMultiplayerStore.getState().setState({connected:false,reconnecting:true,status:`กำลังเชื่อมต่อใหม่… (${Math.round(wait/1000)} วิ) — การกระทำระหว่างนี้จะไม่ถูกบันทึก`});this.retryTimer=setTimeout(()=>{if(this.token)void this.connect(this.token,true);},wait);return;}
   authority.uninstall();this.server=null;
   useMultiplayerStore.getState().setState({connected:false,online:false,reconnecting:false,party:null,status:fatal?(ev.reason||'Disconnected'):'Disconnected'});this.restore();};
  ws.onerror=()=>useMultiplayerStore.getState().setState({status:'Socket failed'});
 }
 private act(op:ActOp,args:unknown[],ids:string[]):number{
  if(POSITIONAL.includes(op))this.sendPos(true);
  const seq=++this.seq;if(!RNG_OPS.includes(op))this.optimistic=seq;this.send({type:'ACT',seq,op,args,ids});return seq;
 }
 private sendPos(force=false){const s=useGameStore.getState(),[x,z]=s.player.position,city=s.player.cityId??'hollow',key=`${city}|${x.toFixed(2)}|${z.toFixed(2)}|${Math.round(s.player.hp)}`;// round 13: an HP change is reported too (the realm limits how fast it may rise)
  if(!force&&key===this.lastPos)return;this.lastPos=key;this.send({type:'POS',city,x:+x.toFixed(3),z:+z.toFixed(3),hp:Math.max(0,Math.round(s.player.hp)),mp:Math.max(0,Math.round(s.player.mp))});}
 private startPos(){this.stopPos();this.posTimer=setInterval(()=>this.sendPos(),100);}
 private stopPos(){if(this.posTimer)clearInterval(this.posTimer);this.posTimer=null;}
 send(payload:object){if(this.ws?.readyState===WebSocket.OPEN)this.ws.send(JSON.stringify(payload));}
 /** kept for old callers: the realm takes positions from POS now and ignores MOVE */
 move(_dx:number,_dz:number){void _dx;void _dz;}
 attack(targetId='abyssal-forge-titan',skillId:'basic'|'soul_burst'='basic'){this.sendPos(true);this.send({type:'ATTACK',targetId,skillId});}
 pickup(lootId:string){this.send({type:'PICKUP',lootId});}
 /** ask the realm for a market page, my listings or my mail (answer: MARKET_VIEW) */
 market(view:'browse'|'mine'|'mail',opts:{text?:string;rarity?:string;page?:number}={}){this.send({type:'MARKET',view,...opts,page:opts.page??0});}
 /** Enchanter → any player within range, no party required (server validates class, range, cooldown, MP). */
 buff(targetId:string,buff:'might'|'ward'|'haste'|'focus'){this.send({type:'BUFF',targetId,buff});}
 /** round 13: city channels — ask for the list / move to another channel (the realm allows one move per 10 s) */
 channels(){this.send({type:'CHANNELS'});}
 switchChannel(channel:number){this.send({type:'CHANNEL',channel});}
 party={invite:(targetId:string)=>this.send({type:'PARTY_INVITE',targetId}),accept:()=>{this.send({type:'PARTY_ACCEPT'});useMultiplayerStore.getState().setState({partyInvite:null});},decline:()=>{this.send({type:'PARTY_DECLINE'});useMultiplayerStore.getState().setState({partyInvite:null});},leave:()=>this.send({type:'PARTY_LEAVE'}),kick:(targetId:string)=>this.send({type:'PARTY_KICK',targetId})};
 disconnect(){this.manual=true;this.ready=false;this.stopPos();authority.uninstall();this.server=null;if(this.retryTimer)clearTimeout(this.retryTimer);this.retryTimer=null;this.token=null;this.ws?.close();this.ws=null;this.restore();useMultiplayerStore.getState().setState({connected:false,online:false,players:[],boss:null,loot:[],party:null,partyInvite:null,reconnecting:false,market:null,mailCount:0,status:'Guest Demo'});}
}
export const gameConnection=new GameConnection();
/** the world boss is in reach: online, in Hollow Reach, within 6 m of the Titan — then attacks go to the realm */
export function titanInReach(){const n=useMultiplayerStore.getState(),s=useGameStore.getState();if(!n.connected||!n.boss||(s.player.cityId??'hollow')!=='hollow')return false;const [x,z]=s.player.position;return Math.hypot(n.boss.x-x,n.boss.z-z)<=6;}
