// Player-side display settings (per device): graphics quality, render scale, frame cap, shadows, floating numbers, wind, UI size.
import { create } from 'zustand';

export type Quality = 'low' | 'medium' | 'high';
export type CharacterMode = '3d' | 'sprite';
export type FpsCap = 30 | 60 | 0;
/** renderScale: share of the screen's pixel density the 3D view draws at (0.5 = a quarter of the pixels).
 *  fpsCap: frames per second the 3D view may draw (0 = as fast as the screen); both cut GPU / battery use */
export type Settings = { quality: Quality; shadows: boolean; damageNumbers: boolean; shake: boolean; wind: number; windDir: number; uiScale: number; fps: boolean; characterMode: CharacterMode; renderScale: number; fpsCap: FpsCap };
export const DEFAULT_SETTINGS: Settings = { quality: 'medium', shadows: true, damageNumbers: true, shake: true, wind: 0.55, windDir: 25, uiScale: 1, fps: false, characterMode: '3d', renderScale: 1, fpsCap: 60 };
const KEY = 'soulforge-settings';
const load = (): Settings => { try { return { ...DEFAULT_SETTINGS, ...JSON.parse(globalThis.localStorage?.getItem(KEY) ?? '{}') }; } catch { return { ...DEFAULT_SETTINGS }; } };
export const useSettingsStore = create<Settings & { set: (p: Partial<Settings>) => void; reset: () => void }>((set, get) => ({
  ...load(),
  set: p => { set(p); try { const { set: _s, reset: _r, ...rest } = { ...get(), ...p }; void _s; void _r; localStorage.setItem(KEY, JSON.stringify(rest)); } catch { /* private mode */ } },
  reset: () => { set({ ...DEFAULT_SETTINGS }); try { localStorage.removeItem(KEY); } catch { /* ignore */ } },
}));
