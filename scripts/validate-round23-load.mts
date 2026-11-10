import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import WebSocket from '../apps/game-server/node_modules/ws/index.js';
import {portalsOf, type CityId} from '../src/game/content';
import {mapRoute} from '../src/game/world/mapRoute';
import '../src/game/world/registry';
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const port=4007;
const server=spawn(process.execPath,['dist/index.js'],{cwd:'apps/game-server',env:{...process.env,REALM_MEMORY:'1',PORT:String(port)},stdio:['ignore','pipe','pipe']});
server.stderr.on('data',d=>process.stderr.write(d));
const clients:any[]=[];
async function until(ok:()=>boolean,ms=15000){const end=Date.now()+ms;while(!ok()){if(Date.now()>end)throw Error('load validation timeout');await sleep(25);}}
try{
 await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('realm startup timeout')),15000);server.stdout.on('data',d=>{if(String(d).includes('listening')){clearTimeout(timer);resolve();}});server.on('exit',c=>reject(Error(`realm exited ${c}`)));});
 const started=Date.now();
 for(let i=0;i<100;i++){
  const ws=new WebSocket(`ws://127.0.0.1:${port}`),c:any={ws,state:null,snapshots:0,maxPlayers:0,seq:0,acks:[],latencies:[]};clients.push(c);
  ws.on('open',()=>ws.send(JSON.stringify({type:'AUTH',token:`dev-u${String(i).padStart(5,'0')}`})));
  ws.on('error',e=>{c.error=String(e);});
  ws.on('message',raw=>{const m=JSON.parse(String(raw));if(m.type==='CHAR')c.state=m.state;if(m.type==='STATE')c.state={...c.state,...m.patch};if(m.type==='ACK')c.acks.push(m);if(m.type==='WORLD_SNAPSHOT'){c.snapshots++;c.maxPlayers=Math.max(c.maxPlayers,m.players.length);}if(m.type==='POS_FIX')c.fix=m;if(m.type==='CHANNELS'&&c.sent){c.latencies.push(Date.now()-c.sent);c.sent=0;}});
 }
 await until(()=>clients.every(c=>c.state));const loginMs=Date.now()-started;
 const gate=portalsOf('hollow').find(p=>p.to==='wild0')!;
 const route=mapRoute('hollow',clients[0].state.player.position,[gate.x,gate.z]);if(!route)throw Error('No route to farm');
 let pos=clients[0].state.player.position as [number,number];
 for(const to of route){const from=pos,d=Math.hypot(to[0]-from[0],to[1]-from[1]),steps=Math.ceil(d/.35);for(let j=1;j<=steps;j++){pos=[from[0]+(to[0]-from[0])*j/steps,from[1]+(to[1]-from[1])*j/steps];for(const c of clients)c.ws.send(JSON.stringify({type:'POS',city:'hollow',x:pos[0],z:pos[1]}));await sleep(100);}}
 for(const c of clients)c.ws.send(JSON.stringify({type:'ACT',seq:++c.seq,op:'travel',args:['wild0',true],ids:[]}));
 await until(()=>clients.every(c=>c.state.player.cityId==='wild0'));
 const before=clients.map(c=>c.snapshots),sampleStart=Date.now();
 for(let i=0;i<100;i++){for(const c of clients){const [x,z]=c.state.player.position;c.ws.send(JSON.stringify({type:'POS',city:'wild0',x,z}));if(i%10===0){c.sent=Date.now();c.ws.send(JSON.stringify({type:'CHANNELS'}));}}await sleep(100);}
 const latency=clients.flatMap(c=>c.latencies).sort((a,b)=>a-b),snapshots=clients.map((c,i)=>c.snapshots-before[i]);
 const result={date:new Date().toISOString(),players:100,map:'wild0',loginMs,sampleMs:Date.now()-sampleStart,minSnapshots:Math.min(...snapshots),maxVisiblePlayers:Math.max(...clients.map(c=>c.maxPlayers)),channelResponseP95Ms:latency[Math.floor(latency.length*.95)],connected:clients.filter(c=>c.ws.readyState===WebSocket.OPEN).length,allTravelAccepted:clients.every(c=>c.acks.some(a=>a.op==='travel'&&a.ok)),movementCorrections:clients.filter(c=>c.fix).length,scope:'100 real WebSocket clients, legitimate capital-to-farm travel, 10 Hz position reports and snapshots. No GPU rendering, combat or shared-monster simulation benchmark.'};
 if(result.connected!==100||result.minSnapshots<5||!result.allTravelAccepted||result.movementCorrections)throw Error(JSON.stringify(result));
 await fs.writeFile('../output/maps-round23/load-100.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{for(const c of clients)c.ws.close();server.kill('SIGTERM');}
