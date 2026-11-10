import { walkable, type CityId } from '../content';
import { lineClear } from '../monsterAI';

export type Point = [number, number];
const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const steps = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];

/** Search outward from the exact player position. A landmark can be solid (e.g. an NPC),
 * so accept a nearby approach point. Free map pins must be reachable themselves. */
export function mapRoute(city: CityId, start: Point, end: Point, reach = 0, maxDistance = Infinity, maxNodes = Infinity): Point[] | null {
  if(![...start,...end,reach].every(Number.isFinite)||reach<0||Number.isNaN(maxDistance))return null;
  if (!reach && !walkable(city, ...end)) return null;
  if(distance(start,end)>maxDistance+reach)return null;
  if(distance(start,end)<=maxDistance&&lineClear(city,start,end))return [end];
  type Node = { pos: Point; cost: number; score: number; parent?: Node };
  const root: Node = {pos: start, cost: 0, score: distance(start, end)};
  const open = new Map<number, Node>([[0, root]]);
  const closed = new Set<number>();
  // round 23: binary heap — 240 m fields make the old linear scan of the open set too slow
  const heap:{key:number;node:Node}[]=[{key:0,node:root}];
  const push=(entry:{key:number;node:Node})=>{heap.push(entry);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p].node.score<=entry.node.score)break;heap[i]=heap[p];i=p;}heap[i]=entry;};
  const pop=()=>{const first=heap[0],last=heap.pop()!;if(heap.length){let i=0;while(i*2+1<heap.length){let j=i*2+1;if(j+1<heap.length&&heap[j+1].node.score<heap[j].node.score)j++;if(last.node.score<=heap[j].node.score)break;heap[i]=heap[j];i=j;}heap[i]=last;}return first;};
  let expanded = 0;
  while (heap.length) {
    const {key,node}=pop();
    if(open.get(key)!==node)continue;
    if (++expanded > maxNodes) return null; // round 22: click-to-move gives up quickly instead of freezing a frame
    open.delete(key);
    closed.add(key);
    const remaining = distance(node.pos, end);
    const direct = remaining < 4 && node.cost+remaining<=maxDistance && lineClear(city, node.pos, end);
    if (direct || remaining <= reach) {
      const path: Point[] = direct ? [end] : [];
      for (let n: Node | undefined = node; n?.parent; n = n.parent) path.push(n.pos);
      return path.reverse();
    }
    for (const [dx, dz] of steps) {
      // All map extents are under 256 world units from the start on each axis.
      const k = key + dx * 512 + dz;
      if (closed.has(k)) continue;
      const pos: Point = [node.pos[0] + dx, node.pos[1] + dz];
      const cost = node.cost + Math.hypot(dx, dz);
      if(cost+Math.max(0,distance(pos,end)-reach)>maxDistance)continue;
      if (cost >= (open.get(k)?.cost ?? Infinity) || !lineClear(city, node.pos, pos)) continue;
      const next={pos,cost,score:cost+distance(pos,end),parent:node};open.set(k,next);push({key:k,node:next});
    }
  }
  return null;
}

/** round 22: a click on a building / wall lands on its walkable edge — the nearest walkable spot to `p` (rings of 0.5 m out
 * to `max`), preferring the side facing `from` among equally near spots. Returns `p` itself when it is walkable. */
export function nearestWalkable(city: CityId, p: Point, from: Point, max = 14): Point | null {
  if (walkable(city, ...p)) return p;
  for (let r = 0.5; r <= max; r += 0.5) {
    let best: Point | null = null, bestD = Infinity;
    const n = Math.max(12, Math.round(r * 8));
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, q: Point = [p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r];
      if (!walkable(city, ...q)) continue;
      const d = distance(q, from); if (d < bestD) { bestD = d; best = q; }
    }
    if (best) return best;
  }
  return null;
}
