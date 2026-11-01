'use client';
import { useId } from 'react';
import { SOUL_STONES } from '@/game/ui/forgeCatalog';
const CELLS: Record<string, [number, number, number, number]> = {
  'potion-hp-s': [20,30,155,178], 'potion-hp-m': [191,20,165,191], 'potion-hp-l': [366,10,175,200],
  'potion-mp-s': [20,237,154,177], 'potion-mp-m': [190,227,167,187], 'material-ore': [5,610,172,137],
};
export function ForgeArt({ id, name = '' }: { id: string; name?: string }) {
  const clipId = useId();
  const stone = SOUL_STONES.find(s => s.id === id), cell = CELLS[id];
  if (cell) {
    return <svg className="forge-art" viewBox={cell.join(' ')} role="img" aria-label={name||id} overflow="hidden"><defs><clipPath id={clipId}><rect x={cell[0]} y={cell[1]} width={cell[2]} height={cell[3]}/></clipPath></defs><image clipPath={`url(#${clipId})`} href="/art/ui-forge/items.png" width="1086" height="1448"/></svg>;
  }
  return <span role="img" aria-label={name || id} className={`forge-art ${stone ? 'soul-stone' : ''}`} style={stone ? {
    backgroundImage: 'url(/art/ui-forge/soul-stones.png)', backgroundSize: '300% 100%', backgroundPosition: `${stone.cell * 50}% center`,
  } : cell ? { backgroundImage: 'url(/art/ui-forge/items.png)', backgroundSize: '600% 800%', backgroundPosition: `${cell[0] * 20}% ${cell[1] / 7 * 100}%` } : { backgroundImage: id.startsWith('food') ? 'url(/art/icons/menu/alchemy.webp)' : `url(/art/icons/items/${id}.webp)`, backgroundSize: 'contain', backgroundPosition: 'center' }} />;
}
export function MenuArt({ name }: { name: string }) { return <img className="forge-menu-icon" src={`/art/icons/menu/${name}.webp`} alt="" />; }
