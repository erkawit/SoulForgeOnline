// Player-side display settings (per device): graphics quality, shadows, floating numbers, camera shake, wind, UI scale.
import { create } from 'zustand';

export type Quality = 'low' | 'medium' | 'high';
export type CharacterMode = '3d' | 'sprite';
export type Settings = { quality: Quality; shadows: boolean; damageNumbers: boolean; shake: boolean; wind: number; windDir: number; uiScale: number; fps: boolean; characterMode: CharacterMode };
export const DEFAULT_SETTINGS: Settings = { quality: 'medium', shadows: true, damageNumbers: true, shake: true, wind: 0.55, windDir: 25, uiScale: 1, fps: false, characterMode: '3d' };
const KEY = 'soulforge-settings';
const load = (): Settings => { try { return { ...DEFAULT_SETTINGS, ...JSON.parse(globalThis.localStorage?.getItem(KEY) ?? '{}') }; } catch { return { ...DEFAULT_SETTINGS }; } };
export const useSettingsStore = create<Settings & { set: (p: Partial<Settings>) => void; reset: () => void }>((set, get) => ({
  ...load(),
  set: p => { set(p); try { const { set: _s, reset: _r, ...rest } = { ...get(), ...p }; void _s; void _r; localStorage.setItem(KEY, JSON.stringify(rest)); } catch { /* private mode */ } },
  reset: () => { set({ ...DEFAULT_SETTINGS }); try { localStorage.removeItem(KEY); } catch { /* ignore */ } },
}));
