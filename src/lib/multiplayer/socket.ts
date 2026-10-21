import type {Snapshot} from '@/lib/types';
import {useMultiplayerStore} from '@/store/useMultiplayerStore';
import {createSnapshot,useGameStore} from '@/store/useGameStore';
class GameConnection {
 private ws:WebSocket|null=null;
 private guest:Snapshot|null=null;
 private restore(){if(this.guest){useGameStore.getState().hydrate(this.guest);this.guest=null;}}
 async connect(token:string){
  this.disconnect();this.guest=createSnapshot();useGameStore.setState(s=>({deadUntil:0,pending:null,selectedMonster:null,action:{kind:'idle',stamp:0,duration:0},player:{...s.player,position:[0,0]}}));const base=process.env.NEXT_PUBLIC_GAME_SERVER_URL||'ws://localhost:3001';
  const ws=new WebSocket(base);this.ws=ws;
  useMultiplayerStore.getState().setState({online:true,status:'Connecting...'});
  ws.onopen=()=>ws.send(JSON.stringify({type:'AUTH',token}));
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch{return;}
   if(m.type==='WELCOME')useMultiplayerStore.getState().setState({connected:true,playerId:m.playerId,status:'Online · '+m.roomId});
   if(m.type==='WORLD_SNAPSHOT'){useMultiplayerStore.getState().setState({players:m.players,boss:m.boss,loot:m.loot});const self=m.players.find((p:{id:string;x:number;z:number})=>p.id===useMultiplayerStore.getState().playerId);if(self)useGameStore.setState(s=>({player:{...s.player,position:[self.x,self.z]}}));}
   if(m.type==='REJECTED'||m.type==='ERROR')useMultiplayerStore.getState().setState({status:m.reason||m.message});
  };
  ws.onclose=()=>{if(this.ws===ws){useMultiplayerStore.getState().setState({connected:false,online:false,status:'Disconnected'});this.restore();}};
  ws.onerror=()=>useMultiplayerStore.getState().setState({status:'Socket failed'});
 }
 send(payload:object){if(this.ws?.readyState===WebSocket.OPEN)this.ws.send(JSON.stringify(payload));}
 move(dx:number,dz:number){this.send({type:'MOVE',dx,dz});}
 attack(targetId='abyssal-forge-titan',skillId:'basic'|'soul_burst'='basic'){this.send({type:'ATTACK',targetId,skillId});}
 pickup(lootId:string){this.send({type:'PICKUP',lootId});}
 disconnect(){this.ws?.close();this.ws=null;this.restore();useMultiplayerStore.getState().setState({connected:false,online:false,players:[],boss:null,loot:[],status:'Guest Demo'});}
}
export const gameConnection=new GameConnection();
