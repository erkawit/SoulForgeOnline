'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import GameHUD from './GameHUD';
import PlayOverlay from './PlayOverlay';
import AuthGate, { type BetaProfile } from './auth/AuthGate';
import { useCallback } from 'react';

import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { createSnapshot, useGameStore } from '@/store/useGameStore';
import { audio } from '@/game/audio/engine';
import { isClass } from '@/game/content';
import AutoPilot from './AutoPilot';
import UiScale from './UiScale';
import { GUEST_RETURN, isGuestKey, saveKey, type ExitTo } from '@/game/saveSlot';
import { getSupabaseBrowser } from '@/lib/supabase';
import { startChat } from '@/game/chat';

const GameWorld = dynamic(() => import('./GameWorld'), { ssr: false,
  loading: () => <div className="world-loading">SUMMONING THE ECLIPSE...</div> });

export default function GameClient() {
  // title music on the login / creation screens; GameRoot switches to the field theme
  useEffect(() => { audio.init(); try { const a = JSON.parse(localStorage.getItem('sf-audio') ?? 'null'); if (a) audio.configure(a); } catch { /* */ } audio.playMusic('title'); }, []);
  const onProfile = useCallback((p: BetaProfile) => useGameStore.getState().applyProfile(p.display_name ?? 'Adventurer', isClass(p.class_id) ? p.class_id : 'Berserker', p.gender === 'f' ? 'f' : 'm'), []);
  return <AuthGate onProfile={onProfile}><GameRoot /></AuthGate>;
}

function GameRoot() {
  // dev only: the store on window for test scripts
  useEffect(() => { if (process.env.NODE_ENV !== 'production') (window as unknown as { __game?: typeof useGameStore }).__game = useGameStore; }, []);
  useEffect(() => startChat(), []);
  useEffect(() => { audio.playMusic('field'); const t = setTimeout(() => useGameStore.getState().tip('start'), 1500); return () => { clearTimeout(t); audio.playMusic('title'); }; }, []);
  useEffect(() => {
    try {
      const cache = window.localStorage.getItem(saveKey());
      if (cache) useGameStore.getState().hydrate(JSON.parse(cache));
    } catch { /* local storage unavailable */ }
    let dirty = false;
    const key = saveKey(); // fixed for this session in the world; leaving it reloads the page
    const save = (force = false) => {
      if ((!dirty && !force) || useMultiplayerStore.getState().online) return;
      try { window.localStorage.setItem(key, JSON.stringify(createSnapshot())); dirty = false; }
      catch { /* storage unavailable or quota exceeded */ }
    };
    const unsubscribe = useGameStore.subscribe(() => { dirty = true; });
    const timer = setInterval(save, 900);
    const onHide = () => save();
    window.addEventListener('pagehide', onHide);
    const worldTick = setInterval(() => useGameStore.getState().tick(), 250);
    // round 25: back to the character screen / log out — save, sign out when asked, then reload so nothing of this
    // character stays in memory (the next account or a new character starts clean)
    const exit = async (e: Event) => {
      const to = (e as CustomEvent<ExitTo>).detail; save(true); clearInterval(timer); clearInterval(worldTick);
      try { if (to === 'select' && isGuestKey(key)) window.sessionStorage.setItem(GUEST_RETURN, '1'); } catch { /* storage blocked */ }
      if (to === 'logout') { try { await getSupabaseBrowser()?.auth.signOut(); } catch { /* offline: the reload still leaves the world */ } }
      window.location.reload();
    };
    window.addEventListener('sf-exit', exit);
    return () => { save(); clearInterval(timer); unsubscribe(); clearInterval(worldTick); window.removeEventListener('pagehide', onHide); window.removeEventListener('sf-exit', exit); };
  }, []);
  return <main className="game-root"><div className="world-surface"><GameWorld /></div><GameHUD /><PlayOverlay /><AutoPilot /><UiScale /></main>;
}
