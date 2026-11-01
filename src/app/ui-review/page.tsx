'use client';
import '@/styles/soulforge-beta.css';
import '@/styles/hud2.css';
import '@/styles/hud3.css';
import '@/styles/forge-ui.css';
import '@/game/world/registry';
import { useEffect, useState } from 'react';
import { ShopPanel, CraftPanel } from '@/components/WorkshopPanels';
import { Craft, Enhance } from '@/components/NpcDialog';
import { PCInventoryPanel, MobileInventoryDrawer } from '@/components/hud/InventoryPanels';
import { PCStatusPanel, MobileStatusPanel } from '@/components/hud/StatusPanels';
import SkillTreePanel from '@/components/SkillTreePanel';
import NpcDialog from '@/components/NpcDialog';
import { ChannelButton, ChannelDialog } from '@/components/ChannelSwitch';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import CombatTextPreview from '@/components/CombatTextPreview';
import { useGameStore } from '@/store/useGameStore';
import { NPC_SPOTS } from '@/game/npcs';
import { makeItem, makeGear } from '@/game/items';

// Isolated, in-memory review. No GameRoot, persistence, authentication or network connection.
export default function Review() {
  const [tab,setTab]=useState('shop'),[mobile,setMobile]=useState(false),[ready,setReady]=useState(false);
  useEffect(()=>{
    const s=useGameStore.getState();
    const equipment={...s.equipment,weapon:makeGear('weapon-Berserker-2','Berserker'),armor:makeGear('heavy-armor-2','Berserker')};
    const ids=['material-ore','soul-stone-weapon','soul-stone-armor','soul-stone-accessory'];
    const items=ids.map(id=>({...makeItem(id),qty:20}));
    useGameStore.setState({player:{...s.player,name:'The Wanderer',level:30,gold:284750,cityId:'hollow',position:NPC_SPOTS.hollow.shop},equipment,inventory:[...items,...Array(20).fill(null)]});
    setReady(true);
  },[]);
  const choose=(id:string)=>{setTab(id);const s=useGameStore.getState();useGameStore.setState({npc:id==='window'?'shop':null,player:{...s.player,position:id==='shop'||id==='window'?NPC_SPOTS.hollow.shop:NPC_SPOTS.hollow.merchant}} as never);
    // round 16: the channel window with sample counts (CH1 full, CH2 = you, CH3 busy, CH4 quiet, CH5 empty) — review only, no realm
    if(id==='channels')useMultiplayerStore.getState().setState({connected:true,channel:{current:2,list:[[1,100],[2,37],[3,81],[4,8],[5,0]],at:Date.now(),cap:100}});};
  return <main className="ui-review"><header><h1>SOULFORGE <small>UI REVIEW</small></h1><p>ข้อมูลตัวอย่างเฉพาะหน้านี้ · ไม่บันทึกทับตัวละคร</p><a href="/">หน้าเว็บไซต์</a><nav className="forge-tabs">{[['shop','Shop'],['craft','Craft'],['enhance','Enchant'],['character','Character'],['inventory','Inventory'],['skills','Skills'],['window','Shop window'],['channels','Channels'],['combat','Combat text']].map(([id,name])=><button key={id} aria-pressed={tab===id} onClick={()=>choose(id)}>{name}</button>)}<button aria-pressed={mobile} onClick={()=>setMobile(v=>!v)}>Mobile layout</button></nav></header><section className={`ui-review-panel h2 ${mobile?'review-mobile':''}`}>
    {ready&&(tab==='shop'?<ShopPanel/>:tab==='craft'?<CraftPanel gear={category=><Craft key={category} category={category}/>}/>:tab==='enhance'?<Enhance/>:tab==='inventory'?mobile?<MobileInventoryDrawer/>:<PCInventoryPanel/>:tab==='character'?mobile?<MobileStatusPanel/>:<PCStatusPanel/>:tab==='window'?<NpcDialog/>:tab==='channels'?<div style={{width:176}}><ChannelButton/><ChannelDialog onClose={()=>setTab('shop')}/></div>:tab==='combat'?<CombatTextPreview/>:<SkillTreePanel/>)}
  </section></main>;
}
