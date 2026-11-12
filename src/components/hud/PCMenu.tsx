'use client';
// Round 25 (PC, ≥ 768 px): the menu is no longer always on screen. The button in the top-right corner opens a drawer
// docked on the right — the menu icons in groups, with the system row (settings / character select / log out) at the
// bottom. Picking an item closes the drawer and opens that window; every window header has the same menu button.
import { useEffect } from 'react';
import { requestExit } from '@/game/saveSlot';

export type MenuItem = { id: string; label: string; key?: string; art: string; glyph?: string; on?: boolean; run: () => void };
export type MenuGroup = { title: string; items: MenuItem[] };

export function MenuButton({ open, onClick, className = '' }: { open: boolean; onClick: () => void; className?: string }) {
  return <button type="button" className={`pc-menu-btn pointer-events-auto ${open ? 'on' : ''} ${className}`} onClick={onClick}
    aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'} aria-expanded={open} title="เมนู (Esc)"><i /><i /><i /></button>;
}

export default function PCMenu({ groups, system, onClose, noKeys = false }: { groups: MenuGroup[]; system: MenuItem[]; onClose: () => void; noKeys?: boolean }) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); onClose(); } };
    window.addEventListener('keydown', k, true); return () => window.removeEventListener('keydown', k, true); }, [onClose]);
  const tile = (m: MenuItem) => <button key={m.id} type="button" className={`pc-tile ${m.on ? 'on' : ''}`} onClick={() => { onClose(); m.run(); }} title={m.key && !noKeys ? `${m.label} (${m.key})` : m.label}>
    {m.glyph ? <i className="glyph" aria-hidden>{m.glyph}</i> : <img src={`/art/ui-kit/${m.art}.webp`} alt="" />}<span>{m.label}</span>{m.key && !noKeys && <kbd>{m.key}</kbd>}</button>;
  return <>
    <div className="pc-menu-veil pointer-events-auto" onClick={onClose} />
    <aside className={`pc-menu pointer-events-auto${noKeys ? ' touch' : ''}`} role="dialog" aria-label="เมนู">
      <header><h2>เมนู</h2><button type="button" className="sf-close" onClick={onClose} aria-label="ปิด" title="ปิด (Esc)" /></header>
      <div className="pc-menu-body">{groups.map(g => <section key={g.title}><h3>{g.title}</h3><div className="pc-grid">{g.items.map(tile)}</div></section>)}</div>
      <footer className="pc-grid sys" style={{ gridTemplateColumns: `repeat(${Math.min(4, system.length)}, minmax(0, 1fr))` }}>{system.map(tile)}</footer>
    </aside>
  </>;
}

/** the two ways out of the world, shared by the menu and the settings page */
export const exitItems = (): MenuItem[] => [
  { id: 'select', label: 'เลือกตัวละคร', art: 'menu_12_character_helm', run: () => requestExit('select') },
  { id: 'logout', label: 'ออกจากระบบ', art: 'menu_37_exit_game_door', run: () => requestExit('logout') },
];
