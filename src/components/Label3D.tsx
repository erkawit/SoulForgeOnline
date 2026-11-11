'use client';
// A floating name / title over something in the 3D world — the replacement for drei <Html> on plain text labels.
// drei <Html> mounts a separate React root per label and unmounts it synchronously; with React 19 that throws
// ("Attempted to synchronously unmount a root…", "removeChild … not a child") whenever a map with many labels is torn
// down — after a warp the monsters of the new map could stay invisible until a reload. This label is one plain DOM
// element positioned every frame: nothing to unmount but a node.
import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Vector3 } from 'three';

const v = new Vector3();
/** nameplate over a character, top to bottom: (future ranks / decorations) · guild emblem · guild name · character name */
export default function Label3D({ position = [0, 0, 0], text, sub, className = 'actor-label', color, subColor, z = 20, above, emblem }: {
  position?: [number, number, number]; text: string; sub?: string | null; className?: string; color?: string; subColor?: string; z?: number;
  /** guild name, drawn above the name */ above?: string | null; /** guild emblem image url, drawn above the guild name */ emblem?: string | null;
}) {
  const anchor = useRef<Group>(null), el = useRef<HTMLDivElement | null>(null), inner = useRef<HTMLSpanElement | null>(null);
  const { gl, camera, size } = useThree();
  useLayoutEffect(() => {
    const host = gl.domElement.parentElement; if (!host) return;
    const d = document.createElement('div'), s = document.createElement('span');
    d.style.cssText = `position:absolute;left:0;top:0;pointer-events:none;white-space:nowrap;will-change:transform;z-index:${z};display:none`;
    d.appendChild(s); host.appendChild(d); el.current = d; inner.current = s;
    return () => { d.remove(); el.current = null; inner.current = null; };
  }, [gl, z]);
  useEffect(() => {
    const s = inner.current; if (!s) return;
    s.className = className; s.style.color = color ?? ''; s.replaceChildren();
    if (emblem) { const im = document.createElement('img'); im.src = emblem; im.alt = ''; Object.assign(im.style, { display: 'block', width: '22px', height: '22px', margin: '0 auto 1px', objectFit: 'contain' }); s.appendChild(im); }
    if (above) { const g = document.createElement('small'); Object.assign(g.style, { display: 'block', fontSize: '.78em', opacity: '.9', color: '#e9c46a' }); g.textContent = `<${above}>`; s.appendChild(g); }
    s.appendChild(document.createTextNode(text));
    if (sub) { const sm = document.createElement('small'), st: CSSProperties = { display: 'block', opacity: .85, fontSize: '.8em' }; Object.assign(sm.style, st); if (subColor) sm.style.color = subColor; sm.textContent = sub; s.appendChild(sm); }
  }, [text, sub, className, color, subColor, above, emblem]);
  useFrame(() => {
    const d = el.current, a = anchor.current; if (!d || !a) return;
    a.getWorldPosition(v); v.project(camera);
    if (v.z > 1 || v.z < -1 || Math.abs(v.x) > 1.2 || Math.abs(v.y) > 1.2) { if (d.style.display !== 'none') d.style.display = 'none'; return; }
    if (d.style.display !== 'block') d.style.display = 'block';
    d.style.transform = `translate(-50%,-50%) translate(${((v.x + 1) / 2 * size.width).toFixed(1)}px,${((1 - v.y) / 2 * size.height).toFixed(1)}px)`;
  });
  return <group ref={anchor} position={position} />;
}
