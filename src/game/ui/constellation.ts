// "กลุ่มดาววิญญาณ" (Soul Constellation): the existing skill tree drawn as a star map you can drag and zoom.
// Same data as the list view — tier = distance from the core star, column = angle inside the fan.
export type TreeNodeLike = { skillId: string; tier: number; col: number; requires?: { skillId: string; level: number }[] };
export type StarNode = { id: string; x: number; y: number; tier: number; col: number };
export type StarMap = { nodes: StarNode[]; links: [string, string][]; core: { x: number; y: number }; box: [number, number, number, number] };

export function layoutConstellation(tree: TreeNodeLike[]): StarMap {
  const core = { x: 0, y: 0 }; const nodes: StarNode[] = [];
  for (const n of tree) {
    const r = 80 + n.tier * 82, spread = 32 - n.tier * 1.5, a = (-90 + (n.col - 1) * spread) * Math.PI / 180;
    // a little per-node jitter so it reads as a constellation, not a grid (deterministic)
    const j = ((n.tier * 7 + n.col * 13) % 9 - 4) * 2.2;
    nodes.push({ id: n.skillId, x: Math.cos(a) * r + j, y: Math.sin(a) * r - j * 0.5, tier: n.tier, col: n.col });
  }
  const byId = new Map(nodes.map(n => [n.id, n])); const links: [string, string][] = [];
  for (const n of tree) {
    const req = (n.requires ?? []).filter(q => byId.has(q.skillId));
    if (req.length) for (const q of req) links.push([q.skillId, n.skillId]);
    else if (n.tier === 1) links.push(['core', n.skillId]);
    else { const prev = tree.find(x => x.tier === n.tier - 1 && x.col === n.col) ?? tree.filter(x => x.tier === n.tier - 1).sort((a, b) => Math.abs(a.col - n.col) - Math.abs(b.col - n.col))[0]; if (prev) links.push([prev.skillId, n.skillId]); }
  }
  const xs = nodes.map(n => n.x).concat(0), ys = nodes.map(n => n.y).concat(0), pad = 60;
  return { nodes, links, core, box: [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2] };
}

/** drag to pan, wheel / pinch / buttons to zoom an SVG <g>; returns controls + a cleanup */
export function attachPanZoom(svg: SVGSVGElement, g: SVGGElement, onChange?: (s: { x: number; y: number; k: number }) => void, init?: { x: number; y: number; k: number }) {
  const st = { x: init?.x ?? 0, y: init?.y ?? 0, k: init?.k ?? 1 }; const pts = new Map<number, { x: number; y: number }>(); let lastDist = 0, moved = 0;
  const apply = () => { g.setAttribute('transform', `translate(${st.x} ${st.y}) scale(${st.k})`); onChange?.(st); };
  const unit = () => { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return vb.width / Math.max(1, r.width); };
  const zoom = (f: number) => { st.k = Math.max(0.6, Math.min(2.6, st.k * f)); apply(); };
  const down = (e: PointerEvent) => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; if (pts.size === 2) { const [a, b] = [...pts.values()]; lastDist = Math.hypot(a.x - b.x, a.y - b.y); } };
  const move = (e: PointerEvent) => {
    const p = pts.get(e.pointerId); if (!p) return; const u = unit();
    if (pts.size === 1) { st.x += (e.clientX - p.x) * u; st.y += (e.clientY - p.y) * u; moved += Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y); apply(); }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (lastDist) zoom(d / lastDist); lastDist = d; moved = 99; }
  };
  const up = (e: PointerEvent) => { pts.delete(e.pointerId); if (pts.size < 2) lastDist = 0; };
  const wheel = (e: WheelEvent) => { e.preventDefault(); zoom(e.deltaY > 0 ? 0.9 : 1.1); };
  svg.addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up); svg.addEventListener('wheel', wheel, { passive: false });
  apply();
  return { zoom, reset: () => { st.x = st.y = 0; st.k = 1; apply(); }, /** true if the last pointer gesture was a drag, not a click */ dragged: () => moved > 6,
    dispose: () => { svg.removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); svg.removeEventListener('wheel', wheel); } };
}
