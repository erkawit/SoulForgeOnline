 'use client';
import {useState} from 'react';
import {getSupabaseBrowser} from '@/lib/supabase';
import {useMultiplayerStore} from '@/store/useMultiplayerStore';
import {gameConnection} from '@/lib/multiplayer/socket';
export default function OnlinePanel(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState('');
 const state=useMultiplayerStore();
 async function login(){const supabase=getSupabaseBrowser();if(!supabase){useMultiplayerStore.getState().setState({status:'Configure Supabase first'});return;}
  const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error||!data.session){useMultiplayerStore.getState().setState({status:error?.message||'Login failed'});return;}await gameConnection.connect(data.session.access_token);
 }
 return <aside className="online-panel">
  <strong style={{color:'#8ee8e6'}}>🌐 REALTIME ROOM</strong><div style={{margin:'6px 0'}}>{state.status}</div>
  {!state.connected?<><input placeholder="Supabase email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',color:'#111',padding:5,marginBottom:4}}/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',color:'#111',padding:5,marginBottom:5}}/><button onClick={login}>Connect Online</button></>:<><div>Players: {state.players.length}</div><div>{state.boss?`🐉 Boss ${Math.ceil(state.boss.hp/state.boss.maxHp*100)}%`:'Boss spawning soon'}</div><button onClick={()=>gameConnection.attack()}>⚔ Attack Boss</button> <button onClick={()=>gameConnection.attack('abyssal-forge-titan','soul_burst')}>✦ Burst</button><br/><button onClick={()=>gameConnection.disconnect()}>Disconnect</button></>}
 </aside>;
}
