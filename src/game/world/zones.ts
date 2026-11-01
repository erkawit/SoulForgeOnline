// The Sorrowlands: four ruined farming grounds around Hollow Reach (outside the 46 × 46 city square).
// Data only — world/ruins.ts builds the 3D ruins from it, spawns.ts / the preview place monsters, the wiki lists it.
export const WORLD_HALF = 50;
export type ZoneSpawn = { x: number; z: number; species: string; level: number; elite?: boolean; boss?: boolean; count?: number };
export type Zone = {
  id: 'ashfen' | 'ashen-keep' | 'weeping-cathedral' | 'shadowtear-cave';
  name: string; th: string; kind: 'village' | 'castle' | 'cathedral' | 'cave'; x: number; z: number; radius: number; levels: [number, number];
  story: string; tint: string; spawns: ZoneSpawn[];
};
export const ZONES: Zone[] = [
  { id: 'ashfen', name: 'Ashfen Hollow', th: 'หมู่บ้านร้างแอชเฟน', kind: 'village', x: -37, z: 2, radius: 12, levels: [2, 6], tint: '#6b5a4a',
    story: 'หมู่บ้านชาวนาที่ถูกทิ้งร้างในคืนสุริยคราส บ้านเรือนหลังคาพัง บ่อน้ำแห้ง และรั้วไม้ผุ — เสียงหมาป่าเถ้าถ่านดังทุกคืน',
    spawns: [{ x: -33, z: -4, species: 'Grave Crawler', level: 2, count: 3 }, { x: -41, z: 6, species: 'Ash Hound', level: 4, count: 3 }, { x: -36, z: 10, species: 'Grave Crawler', level: 3, count: 2 }, { x: -44, z: -2, species: 'Crypt Crawler', level: 6, elite: true }] },
  { id: 'ashen-keep', name: 'Ashen Keep', th: 'ปราสาทเถ้าธุลี', kind: 'castle', x: 37, z: 2, radius: 13, levels: [4, 8], tint: '#55525a',
    story: 'ป้อมชายแดนที่ถูกเผาจนเหลือแต่หอคอยครึ่งซีกและกำแพงดำ หมูป่าและหมาป่าหนามยึดลานฝึกเป็นรัง',
    spawns: [{ x: 33, z: -3, species: 'Bone Sentinel', level: 5, count: 3 }, { x: 40, z: 6, species: 'Briar Wolf', level: 6, count: 3 }, { x: 37, z: 11, species: 'Bone Sentinel', level: 6, count: 2 }, { x: 43, z: -5, species: 'Oathscar Aurochs', level: 8, elite: true }] },
  { id: 'weeping-cathedral', name: 'Cathedral of Weeping', th: 'มหาวิหารแห่งเสียงร่ำไห้', kind: 'cathedral', x: 2, z: -38, radius: 13, levels: [6, 10], tint: '#4c4a58',
    story: 'มหาวิหารที่หลังคาถล่มลงทับผู้สวดภาวนา ระฆังยังดังเองทุกเที่ยงคืน และ Grave Marshal ตื่นขึ้นท่ามกลางหลุมศพของอัศวิน',
    spawns: [{ x: -5, z: -33, species: 'Ash Hound', level: 7, count: 3 }, { x: 8, z: -34, species: 'Bone Sentinel', level: 8, count: 2 }, { x: -7, z: -42, species: 'Tide Wraith', level: 9, elite: true }, { x: 2, z: -45, species: 'Grave Marshal', level: 10, boss: true }] },
  { id: 'shadowtear-cave', name: 'Shadowtear Cave', th: 'ถ้ำน้ำตาเงา', kind: 'cave', x: 0, z: 38, radius: 12, levels: [5, 9], tint: '#3d4a4c',
    story: 'ถ้ำหินที่ผลึกสีฟ้าเรืองแสงหยดน้ำตาลงไม่หยุด แมงมุมหนามและผีเสื้อจันทร์ทำรังในความมืด',
    spawns: [{ x: -6, z: 34, species: 'Thorn Spider', level: 5, count: 3 }, { x: 6, z: 36, species: 'Moon Moth', level: 7, count: 2 }, { x: 0, z: 43, species: 'Thorn Spider', level: 7, count: 2 }, { x: 9, z: 44, species: 'Root Reaper', level: 9, elite: true }] },
];
export const ZONE_BY_ID = Object.fromEntries(ZONES.map(z => [z.id, z])) as Record<Zone['id'], Zone>;
/** which ruined zone a point is in (null = city / road) */
export function zoneAt(x: number, z: number): Zone | null { return ZONES.find(o => Math.hypot(x - o.x, z - o.z) <= o.radius + 2) ?? null; }
