// Mobile: switch between portrait and landscape from a button. The Screen Orientation API only locks in fullscreen
// (Android Chrome, installed web app); iOS Safari has no lock, so there the player turns the phone and we say so.
export type Want = 'portrait' | 'landscape';
type Lockable = ScreenOrientation & { lock?: (o: string) => Promise<void>; unlock?: () => void };

export async function lockOrientation(want: Want): Promise<'locked' | 'unsupported'> {
  if (typeof document === 'undefined' || typeof screen === 'undefined') return 'unsupported';
  const so = screen.orientation as Lockable | undefined;
  if (!so?.lock) return 'unsupported';
  try {
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
    if (!document.fullscreenElement) await (el.requestFullscreen?.({ navigationUI: 'hide' }) ?? el.webkitRequestFullscreen?.());
    await so.lock(want);
    return 'locked';
  } catch { return 'unsupported'; }
}
/** back to following the phone (leaves fullscreen too) */
export function unlockOrientation() {
  try { (screen.orientation as Lockable | undefined)?.unlock?.(); } catch { /* not locked */ }
  try { if (document.fullscreenElement) void document.exitFullscreen(); } catch { /* not fullscreen */ }
}
