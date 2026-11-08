'use client';
import './world-map.css';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { CITIES, CITY_IDS, WORLD_LIMIT, FIELD_ART, portalsOf, walkable, type CityId } from '@/game/content';
import { CAPITAL_PIECES, ROLE_BUILDING, doorSpot } from '@/game/world/capitalPlan';
import { cityToAtlas, atlasToCity } from '@/game/world/cityAtlas';
import type { MainCityId } from '@/game/content';
import { natureLayout } from '@/game/world/layout';
import { collidersOf } from '@/game/world/colliders';
import { mapRoute, type Point } from '@/game/world/mapRoute';
import { NPC_BY_ID, npcsIn, npcPosition } from '@/game/npcs';
import { spawnPoints } from '@/game/spawns';
import {navigationOverlay,NAVIGATION_COLORS} from '@/game/world/navigationOverlay';
import {navigationPlan} from '@/game/world/terrainNavigation';
import { useGameStore, MAP_WARP, mapWarpCost } from '@/store/useGameStore';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';

type Category = 'building' | 'monster' | 'npc' | 'warp';
type Place = { id: string; kind: Category | 'pin'; name: string; detail: string; pos: Point; entry?: Point; to?: CityId };
const labels = {building:'อาคาร', monster: 'มอนสเตอร์', npc: 'NPC', warp: 'วาร์ป'};
const symbols = {building:'⌂', monster: '✦', npc: '♙', warp: '◇', pin: '⚑'};
const palette = {building:'#f1d098', monster: '#ff9777', npc: '#91e3bf', warp: '#8acfff', pin: '#ffe19a'};
const middle: Point = [500, 340];
function regionArt(city: CityId) {
  const a = FIELD_ART[city];
  if (!CITIES[city].parent) return `/art/atlas/${city}.webp`;
  return `/art/world/${a?.city??city}/${a?.map??'city'}.webp`;
}
function project(city: CityId, [x,z]: Point): Point {
  if (!CITIES[city].parent) return cityToAtlas(x,z);
  const lim = WORLD_LIMIT[city] ?? 23;
  return [500+(x-z)*232/lim,340+(x+z)*136/lim];
}
function unproject(city: CityId, [u,v]: Point): Point {
  if (!CITIES[city].parent) return atlasToCity(u,v);
  const lim = WORLD_LIMIT[city] ?? 23;
  const a = (u-500)*lim/232, b = (v-340)*lim/136;
  return [(b+a)/2,(b-a)/2];
}

const Terrain = memo(function Terrain({city,plan}: {city:CityId;plan:boolean}) {
  if (!plan) return <image href={regionArt(city)} width="1000" height="680" preserveAspectRatio="none"/>;
  const area = CITIES[city], lim = WORLD_LIMIT[city] ?? 23, layout = natureLayout(city);
  walkable(city,0,0); // initialise the same prop footprints used by movement
  return <g transform={`matrix(${232/lim} ${136/lim} ${-232/lim} ${136/lim} 500 340)`}>
    <rect x={-lim} y={-lim} width={2*lim} height={2*lim} fill={area.ground} stroke="#76644c" strokeWidth=".35"/>
    {area.water && <rect x={area.water.x-area.water.w/2} y={-lim} width={area.water.w} height={lim*2} fill="#29454e"/>}
    <path d={area.mapPath} fill="none" stroke="#af9872" opacity=".46" strokeWidth="1.4"/>
    {collidersOf(city).map((c,i)=>c.kind==='box' ? <rect key={i} x={-c.hw} y={-c.hd} width={2*c.hw} height={2*c.hd} transform={`translate(${c.x} ${c.z}) rotate(${-(c.rot??0)*180/Math.PI})`} fill="#272425" stroke="#756952" strokeWidth=".15"/> : null)}
    {area.buildings.map((b,i)=><rect key={i} x={b.x-b.w/2} y={b.z-b.d/2} width={b.w} height={b.d} fill={area.roof} stroke={area.stone} strokeWidth=".25"/>)}
    {layout.trees.map((t,i)=><circle key={i} cx={t.x} cy={t.z} r={t.s} fill={layout.palette.leaf[i%layout.palette.leaf.length]} stroke="#202524" strokeWidth=".2"/>)}
    {layout.rocks.map((r,i)=><ellipse key={i} cx={r.x} cy={r.z} rx={r.s*.65} ry={r.s*.45} fill={layout.palette.rock}/>)}
  </g>;
});
const Walkability=memo(function Walkability({city}:{city:CityId}){
 const paths=navigationOverlay(city);
 const o=project(city,[0,0]),x=project(city,[1,0]),z=project(city,[0,1]);
 return <g pointerEvents="none" opacity=".68" transform={`matrix(${x[0]-o[0]} ${x[1]-o[1]} ${z[0]-o[0]} ${z[1]-o[1]} ${o[0]} ${o[1]})`}>
  {Object.entries(paths).map(([key,d])=><path key={key} d={d} fill={NAVIGATION_COLORS[key as keyof typeof NAVIGATION_COLORS]}/>)}
 </g>;
});
function snapshot() {
  const {player, monsters} = useGameStore.getState();
  const net = useMultiplayerStore.getState();
  return {player, monsters, party:net.players.filter(p=>p.id!==net.playerId && net.party?.members.some(m=>m.id===p.id))};
}
export default function WorldMap({onWalk}:{onWalk:()=>void}) {
  const [live,setLive] = useState(snapshot);
  const here = live.player.cityId ?? 'hollow';
  const [preview,setPreview] = useState<CityId|null>(null);
  const city = preview ?? here;
  useEffect(()=>{const timer = setInterval(()=>setLive(snapshot()),400);return ()=>clearInterval(timer);},[]);
  return <Region key={city} city={city} live={live} here={here} browse={id=>setPreview(id===here?null:id)} onWalk={onWalk}/>;
}
function Region({city,live,here,browse,onWalk}:{city:CityId;live:ReturnType<typeof snapshot>;here:CityId;browse:(id:CityId)=>void;onWalk:()=>void}) {
  const area = CITIES[city], local = city===here;
  const [plan,setPlan] = useState(!!area.parent);
  const [showWalkable,setShowWalkable] = useState(true);
  const [tab,setTab] = useState<Category>(area.parent?'monster':'building');
  const [selected,setSelected] = useState<Place|null>(null);
  const [route,setRoute] = useState<Point[]|null>(null);
  const [zoom,setZoom] = useState(1), [center,setCenter] = useState<Point>(middle);
  const svg = useRef<SVGSVGElement>(null);
  const [unit,setUnit] = useState(1);
  const [cluster,setCluster] = useState<string[]>([]);
  useEffect(()=>{
    const el=svg.current!;
    const resize=new ResizeObserver(([box])=>{const {width,height}=box.contentRect;if(width && height)setUnit(1/Math.min(width/1000,height/680));});
    resize.observe(el);
    return ()=>resize.disconnect();
  },[]);
  const drag = useRef<{x:number;y:number;center:Point;moved:boolean}|null>(null);
  const places = useMemo(()=>{
    const out: Place[] = npcsIn(city).map(n=>({id:'npc-'+n.id,kind:'npc',name:n.th,detail:n.title,pos:npcPosition(n,city)}));
    if (!area.parent) {
      const capital=city as MainCityId;
      for(const b of CAPITAL_PIECES[capital]) {
        if(!b.role && !b.landmark) continue;
        const npc=b.role ? NPC_BY_ID[b.role] : null;
        const name=b.role ? ROLE_BUILDING[b.role] : b.landmark!;
        const entry:Point=b.role ? doorSpot(capital,b.role) : [b.x+Math.sin(b.facing)*(b.r+1),b.z+Math.cos(b.facing)*(b.r+1)];
        out.push({id:'building-'+name,kind:'building',name,detail:npc ? npc.th+' · '+npc.title : b.description??area.name,pos:[b.x,b.z],entry});
      }
    }
    for(const p of portalsOf(city)) out.push({id:'gate-'+p.dir,kind:'warp',name:CITIES[p.to].name,detail:'ประตูเชื่อมพื้นที่',pos:[p.x,p.z],to:p.to});
    if(local) for(const m of live.monsters) {
      if(m.hp>0) out.push({id:m.id,kind:'monster',name:m.name,detail:'Lv. '+m.level,pos:[m.x,m.z]});
    } else if(area.parent) for(const m of spawnPoints(city)) out.push({id:m.id,kind:'monster',name:m.name,detail:'จุดเกิด · Lv. '+m.level,pos:m.position});
    return out;
  },[city,local,live.monsters,area.parent]);
  const visible = places.filter(p=>p.kind===tab);
  const markerScale=unit/zoom;
  const groups: {pos:Point; items:Place[]}[]=[];
  for(const p of visible) {
    const pos=project(city,p.pos);
    const near=groups.find(g=>Math.hypot(pos[0]-g.pos[0],pos[1]-g.pos[1])<32*markerScale);
    if(near) near.items.push(p); else groups.push({pos,items:[p]});
  }
  const listed=cluster.length ? visible.filter(p=>cluster.includes(p.id)) : visible;
  const choice = selected?.kind==='pin' ? selected : places.find(p=>p.id===selected?.id);
  const reach = (p:Place)=>p.kind==='pin'?0:1.6;
  function select(p:Place,focus=false) {
    setSelected(p);setCluster([]);
    setRoute(local?mapRoute(city,useGameStore.getState().player.position,p.entry??p.pos,reach(p)):null);
    if(focus){setCenter(project(city,p.pos));setZoom(Math.max(zoom,2.3));}
  }
  function walk() {
    const {player,deadUntil} = useGameStore.getState();
    if(!choice || (player.cityId??'hollow')!==city || deadUntil) return;
    const points = mapRoute(city,player.position,choice.entry??choice.pos,reach(choice));
    setRoute(points);
    if(points?.length){window.dispatchEvent(new CustomEvent('sf-map-route',{detail:{city,points}}));onWalk();}
  }
  const [msg,setMsg]=useState('');
  /** round 22: warp straight to the end of the route (a walkable spot within reach of the target) for SoulGod */
  function warp(){
    if(!choice||!local)return;const pts=route??mapRoute(city,useGameStore.getState().player.position,choice.entry??choice.pos,reach(choice));
    const end=pts?.length?pts[pts.length-1]:choice.entry??choice.pos;const err=useGameStore.getState().mapWarp(end[0],end[1]);
    if(err){setMsg(err);return;}setMsg('');onWalk();
  }
  const fmt=(p:Point)=>`X ${p[0].toFixed(1)} · Y ${p[1].toFixed(1)}`;
  const dist=choice&&local?Math.hypot(choice.pos[0]-live.player.position[0],choice.pos[1]-live.player.position[1]):0;
  // warp is charged on the straight hop to the route's end (where the player lands), so price the button the same way
  const warpEnd=route?.length?route[route.length-1]:choice?.entry??choice?.pos;
  const warpD=choice&&local&&warpEnd?Math.hypot(warpEnd[0]-live.player.position[0],warpEnd[1]-live.player.position[1]):0;
  const player = project(city,live.player.position);
  return <div className="atlas-layout">
    <main className="atlas-stage">
      <svg ref={svg} role="group" aria-label={'แผนที่ '+area.name} viewBox={`${center[0]-500/zoom} ${center[1]-340/zoom} ${1000/zoom} ${680/zoom}`}
        onPointerDown={e=>{if(e.button!==0 || (e.target as Element).closest('[data-marker]'))return;drag.current={x:e.clientX,y:e.clientY,center,moved:false};e.currentTarget.setPointerCapture(e.pointerId);}}
        onPointerMove={e=>{const d=drag.current, scale=svg.current?.getScreenCTM()?.a;if(!d||!scale)return; const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>4)d.moved=true;if(d.moved)setCenter([Math.max(0,Math.min(1000,d.center[0]-dx/scale)),Math.max(0,Math.min(680,d.center[1]-dy/scale))]);}}
        onPointerCancel={()=>{drag.current=null;}}
        onPointerUp={e=>{const d=drag.current;drag.current=null;const matrix=svg.current?.getScreenCTM();if(!d||d.moved||!matrix)return;const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());const pos=unproject(city,[pt.x,pt.y]);if(Math.max(...pos.map(Math.abs))<=(WORLD_LIMIT[city]??23))select({id:'pin',kind:'pin',name:'หมุดของคุณ',detail:'จุดที่เลือกบนแผนที่',pos});}}>
        <Terrain city={city} plan={plan}/>
        {showWalkable&&<Walkability city={city}/>}
        {local && route && choice && <polyline points={[player,...route.map(p=>project(city,p))].map(p=>p.join(',')).join(' ')} fill="none" stroke="#ffe396" strokeWidth={3/zoom} strokeDasharray={`1 ${7/zoom}`} strokeLinecap="round"/>}
        {local && live.party.map(m=>{const [x,y]=project(city,[m.x,m.z]);return <circle key={m.id} cx={x} cy={y} pointerEvents="none" r={4*markerScale} fill="#85e6af"><title>{m.name}</title></circle>;})}
        {local && <g transform={`translate(${player}) scale(${1/zoom})`} pointerEvents="none"><circle r="7" fill="#ffe294" stroke="#221c15" strokeWidth="2"/><circle r="10" fill="none" stroke="#fff1c7"/></g>}
        {groups.map(({pos,items})=>{
          const p=items[0], grouped=items.length>1, name=grouped ? items.map(i=>i.name).join(' · ') : p.name;
          function activate(){
            if(!grouped) return select(p);
            setSelected(null);setRoute(null);setCluster(items.map(i=>i.id));
          }
          return <g key={p.id} data-marker="" tabIndex={0} className="atlas-marker" role="button" aria-label={name} onClick={activate}
            onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}}} transform={`translate(${pos}) scale(${markerScale})`}>
            <title>{name}</title><circle r={13} stroke={palette[p.kind]} fill="#101419"/><text fill={palette[p.kind]}>{grouped?items.length:symbols[p.kind]}</text></g>;
        })}
        {choice && <circle cx={project(city,choice.pos)[0]} cy={project(city,choice.pos)[1]} r={16*markerScale} fill="none" stroke="#ffdf8e" strokeWidth={2/zoom} pointerEvents="none"/>}
      </svg>
      <div className="atlas-heading"><small>{area.parent?CITIES[area.parent].name:'เมืองหลวง'} · {local?'พื้นที่ปัจจุบัน':'สำรวจพื้นที่'}</small><h3>{area.name}</h3><span>{area.levels?'Lv. '+area.levels.join('–')+' · '+2*(WORLD_LIMIT[city]??23)+' × '+2*(WORLD_LIMIT[city]??23)+' ม.':area.subtitle}</span></div>
      <div className="atlas-tools">
        <button aria-label="ซูมเข้า" disabled={zoom>=6} onClick={()=>setZoom(Math.min(6,zoom*1.4))}>＋</button><button aria-label="ซูมออก" disabled={zoom<=1} onClick={()=>{const z=Math.max(1,zoom/1.4);setZoom(z);if(z===1)setCenter(middle);}}>−</button>
        <button aria-label="ตำแหน่งของฉัน" title="ตำแหน่งของฉัน" onClick={()=>{if(!local)browse(here);else {setCenter(player);setZoom(1.6);}}}>◎</button>
        {area.parent && <button className="atlas-layer" aria-pressed={plan} onClick={()=>setPlan(!plan)}>{plan?'ดูภาพภูมิภาค':'ดูผังทางเดิน'}</button>}
        <button className="atlas-layer" aria-pressed={showWalkable} onClick={()=>setShowWalkable(!showWalkable)}>เขตเดินได้</button>
        <button aria-label="แสดงทั้งพื้นที่" title="แสดงทั้งพื้นที่" onClick={()=>{setZoom(1);setCenter(middle);}}>⛶</button>
      </div>
      {showWalkable&&<div className="atlas-walk-legend"><span style={{color:NAVIGATION_COLORS.road}}>● ทางเดิน</span><span style={{color:NAVIGATION_COLORS.plaza}}>● ลาน</span><span style={{color:NAVIGATION_COLORS.ground}}>● พื้นเดินได้</span><span style={{color:NAVIGATION_COLORS.blocked}}>● ห้ามเดิน</span><small>{navigationPlan(city)?.blockedName??'อาคาร / กำแพง / คลอง / สิ่งกีดขวาง'}{area.parent&&city!=='wild2'&&!plan?' · ภาพภูมิภาคเป็นภาพอ้างอิง ดูขอบเขตจริงในผังทางเดิน':''}</small></div>}
      {choice && <div className="atlas-pop" role="dialog" aria-label={choice.name}>
        <button className="atlas-pop-x" aria-label="ปิด" onClick={()=>{setSelected(null);setRoute(null);setMsg('');}}>×</button>
        <strong>{choice.name}</strong><small>{choice.detail}</small>
        <p>{fmt(choice.pos)}{local?` · ห่าง ${Math.round(dist)} ม.`:''}</p>
        {local?<div className="atlas-pop-btns">
          <button disabled={!route?.length} onClick={walk}>{route===null?'ไม่พบทางเดิน':route.length?`เดินไป (${Math.round(dist)} ม.)`:'ถึงแล้ว'}</button>
          <button disabled={warpD<MAP_WARP.min} title={warpD<MAP_WARP.min?`วาร์ปได้เมื่อห่าง ${MAP_WARP.min} ม. ขึ้นไป`:undefined} onClick={warp}>{warpD<MAP_WARP.min?`วาร์ป (ต้องห่าง ${MAP_WARP.min} ม.+)`:`วาร์ป · ${mapWarpCost(warpD)} SG`}</button>
        </div>:<p className="atlas-pop-note">อยู่คนละพื้นที่ · เดินทางผ่านประตูวาร์ปก่อน</p>}
        {msg&&<p className="atlas-pop-note">{msg}</p>}
      </div>}
      <div className="atlas-coords">ตำแหน่งของฉัน · {fmt(live.player.position)}</div>
    </main>
    <aside className="atlas-sidebar">
      <label className="atlas-area" style={{backgroundImage:`linear-gradient(90deg,#151319f5,#151319b0),url("${regionArt(city)}")`}}>เลือกพื้นที่
        <select value={city} onChange={e=>browse(e.target.value as CityId)}>{CITY_IDS.map(c=><optgroup key={c} label={CITIES[c].name}>{Object.values(CITIES).filter(a=>a.id===c||a.parent===c).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>)}</select>
      </label>
      <div className="atlas-tabs">{(Object.keys(labels) as Category[]).filter(k=>k!=='building'||!area.parent).map(k=><button key={k} aria-pressed={k===tab} onClick={()=>{setTab(k);setCluster([]);setSelected(null);setRoute(null);}}>{labels[k]}</button>)}</div>
      {cluster.length>0 && <button className="atlas-group-reset" onClick={()=>setCluster([])}>จุดใกล้กัน {listed.length} แห่ง · ดูรายการทั้งหมด</button>}
      <div className="atlas-list">{visible.length===0 && <p>ไม่มี{labels[tab]}ในพื้นที่นี้</p>}{listed.map(p=><button key={p.id} aria-pressed={choice?.id===p.id} onClick={()=>select(p,true)}><i style={{color:palette[p.kind]}}>{symbols[p.kind]}</i><span>{p.name}<small>{p.detail}</small></span><b>⌖</b></button>)}</div>
      <div className="atlas-detail" aria-live="polite">{choice?<><strong>{choice.name}</strong><small>{choice.detail}{local?' · '+Math.round(Math.hypot(choice.pos[0]-live.player.position[0],choice.pos[1]-live.player.position[1]))+' ม.':''}</small>
        {local && <button disabled={!route?.length} onClick={walk}>{choice.kind==='pin'&&!walkable(city,...choice.pos)?'พื้นที่นี้เดินไม่ได้':route===null?'ไม่พบทางเดินถึงจุดนี้':route.length?'เดินไปจุดนี้':'ถึงจุดหมายแล้ว'}</button>}
        {choice.to && <button onClick={()=>browse(choice.to!)}>ดูแผนที่ปลายทาง ›</button>}</>:<span>เลือกจุดจากรายการ หรือแตะแผนที่เพื่อปักหมุด</span>}</div>
    </aside>
  </div>;
}
