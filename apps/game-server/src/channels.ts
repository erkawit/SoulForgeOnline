// Map channels (round 16). Every map — capital, field or dungeon — is split into a fixed set of channels (CH1…CH5 by
// default). Players only see — and are sent — the players of their own map and channel. A full channel takes nobody
// new: someone entering a map goes to a party member's channel when it has room, otherwise to the lowest channel with
// room. Players can move to any other channel that has room. The world boss and the economy stay shared (one realm).
import type { Actor } from './protocol.js';

/** players per channel (env REALM_CHANNEL_CAP, default 100) */
export const CHANNEL_CAP = Math.max(1, Number(process.env.REALM_CHANNEL_CAP ?? 100) || 100);
/** channels per map (env REALM_CHANNELS, default 5) */
export const MAX_CHANNELS = Math.min(20, Math.max(1, Number(process.env.REALM_CHANNELS ?? 5) || 5));
const cityOf = (a: Actor) => a.city ?? 'hollow';

/** how many players are in each channel of a map (excluding `skip`) */
export function channelCounts(all: Iterable<Actor>, city: string, skip?: Actor) {
  const n = new Map<number, number>();
  for (const a of all) if (a !== skip && cityOf(a) === city) n.set(a.channel ?? 1, (n.get(a.channel ?? 1) ?? 0) + 1);
  return n;
}
/** the channel `me` should be in for its current map: a party member's (if it has room), else the lowest with room.
 *  When every channel is full the least crowded one takes the overflow (nobody is refused entry to a map). */
export function pickChannel(all: Iterable<Actor>, me: Actor, partyIds: ReadonlySet<string> = new Set(), cap = CHANNEL_CAP, channels = MAX_CHANNELS): number {
  const list = [...all], city = cityOf(me), counts = channelCounts(list, city, me);
  const mate = list.find(a => a !== me && partyIds.has(a.id) && cityOf(a) === city && (a.channel ?? 1) <= channels);
  if (mate && (counts.get(mate.channel ?? 1) ?? 0) < cap) return mate.channel ?? 1;
  for (let c = 1; c <= channels; c++) if ((counts.get(c) ?? 0) < cap) return c;
  let best = 1; for (let c = 2; c <= channels; c++) if ((counts.get(c) ?? 0) < (counts.get(best) ?? 0)) best = c;
  return best;
}
/** a player asks for channel `want` — allowed when it is another valid channel of this map and has room */
export function canSwitch(all: Iterable<Actor>, me: Actor, want: number, cap = CHANNEL_CAP, channels = MAX_CHANNELS): boolean {
  if (!Number.isInteger(want) || want < 1 || want > channels || want === (me.channel ?? 1)) return false;
  return (channelCounts(all, cityOf(me), me).get(want) ?? 0) < cap;
}
/** the channel list a client shows: every channel of the map as [channel, players], empty ones included */
export function channelList(all: Iterable<Actor>, city: string, channels = MAX_CHANNELS): [number, number][] {
  const counts = channelCounts(all, city);
  return Array.from({ length: channels }, (_, i) => [i + 1, counts.get(i + 1) ?? 0] as [number, number]);
}
