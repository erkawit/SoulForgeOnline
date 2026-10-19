'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import GameHUD from './GameHUD';
import { createSnapshot, useGameStore } from '@/store/useGameStore';

const GameWorld = dynamic(() => import('./GameWorld'), { ssr: false,
  loading: () => <div className="world-loading">SUMMONING THE ECLIPSE...</div> });

export default function GameClient() {
  useEffect(() => {
    try {
      const cache = window.localStorage.getItem('soulforge_guest_v1');
      if (cache) useGameStore.getState().hydrate(JSON.parse(cache));
    } catch { /* local storage unavailable */ }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useGameStore.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try { window.localStorage.setItem('soulforge_guest_v1', JSON.stringify(createSnapshot())); }
        catch { /* storage quota exceeded */ }
      }, 900);
    });
    const worldTick = setInterval(() => useGameStore.getState().tick(), 250);
    return () => { clearTimeout(timer); unsubscribe(); clearInterval(worldTick); };
  }, []);
  return <main className="game-root"><div className="world-surface"><GameWorld /></div><GameHUD /></main>;
}
