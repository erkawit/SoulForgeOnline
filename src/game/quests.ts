// Quests: data + a pure state machine shared by the game, the preview and the wiki.
// A quest is offered by a giver NPC (gold "!"), tracks objectives from game events, becomes "ready" (gold "?") at the
// turn-in NPC, and pays XP / SoulGod / items when handed in. Chains unlock the next quest automatically.
export type QuestEvent =
  | { type: 'talk'; npc: string } | { type: 'kill'; species: string; elite?: boolean; boss?: boolean; zone?: string | null }
  | { type: 'buy'; item: string } | { type: 'craft'; rarity: string } | { type: 'equip'; slot: string } | { type: 'learn'; skill: string }
  | { type: 'enhance' } | { type: 'visit'; zone: string } | { type: 'level'; level: number } | { type: 'auto' } | { type: 'blessing' };
export type Objective =
  | { type: 'talk'; npc: string; text: string } | { type: 'kill'; count: number; species?: string; elite?: boolean; boss?: boolean; zone?: string; text: string }
  | { type: 'buy'; count: number; item?: string; text: string } | { type: 'craft'; count: number; text: string } | { type: 'equip'; count: number; slot?: string; text: string }
  | { type: 'learn'; count: number; text: string } | { type: 'enhance'; count: number; text: string } | { type: 'visit'; zone: string; text: string }
  | { type: 'level'; level: number; text: string } | { type: 'auto'; text: string } | { type: 'blessing'; text: string };
export type QuestDef = {
  id: string; title: string; giver: string; turnIn: string; minLevel: number; requires?: string; story: string; hint: string;
  objectives: Objective[]; rewards: { xp: number; soulGod: number; items?: [string, number][]; skills?: SkillReward[] };
  /** round 12: a class-advancement trial — finishing it lets the player take that advancement stage at Master Ysolde */
  unlocksStage?: 2 | 3;
};
/** round 12: quests teach skills — the hotbar skill of that slot for the player's class (skills/defaults DEFAULT_HOTBAR, extras) */
export type SkillReward = 'buff' | 'special' | 'extra1' | 'extra2' | 'extra3';
export type QuestStatus = 'active' | 'ready' | 'done';
export type QuestState = { id: string; status: QuestStatus; progress: number[]; acceptedAt: number };
export type QuestLog = Record<string, QuestState>;

/** NPC ids from game/npcs.ts: guide shop merchant supplier buyer blessing broker mentor warden ranger.
 *  Every capital has all nine service NPCs (world/capitalPlan.ts); Kestrel (Thornwatch) is the one specialist. The early hunt is
 *  Ashen Outskirts, behind Hollow Reach's south waygate, with the Sorrowlands ruins. */
export const QUESTS: QuestDef[] = [
  { id: 'q-awakening', title: 'เสียงกระซิบจากวิหาร', giver: 'guide', turnIn: 'supplier', minLevel: 1, story: 'ผู้เฒ่าคอร์วินบอกว่าเจ้าตื่นขึ้นในวิหารแห่ง Hollow Reach พร้อมวิญญาณที่ยังไม่ถูกหลอม', hint: 'เดินไปหาเสนาธิการเฮลที่ลานเมือง แล้วกด F เพื่อคุย', objectives: [{ type: 'talk', npc: 'supplier', text: 'คุยกับเสนาธิการเฮล' }], rewards: { xp: 60, soulGod: 100, items: [['potion-hp-s', 3]] } },
  { id: 'q-first-blood', title: 'เลือดแรกนอกกำแพง', giver: 'supplier', turnIn: 'supplier', minLevel: 1, requires: 'q-awakening', story: 'สัตว์ป่าคลั่งรุกเข้ามาใกล้ประตูเมือง เฮลอยากรู้ว่าเจ้าใช้อาวุธเป็นหรือไม่', hint: 'ออกทางประตูวาร์ปทิศใต้ของเมืองไป Ashen Outskirts (Lv 1–10) แล้วคลิกมอนสเตอร์เพื่อไล่ตี', objectives: [{ type: 'kill', count: 5, text: 'ปราบมอนสเตอร์ใดก็ได้ 5 ตัว' }], rewards: { xp: 180, soulGod: 150, items: [['potion-hp-s', 3], ['material-ore', 6]], skills: ['buff'] } },
  { id: 'q-supplies', title: 'เสบียงของมิร่า', giver: 'shop', turnIn: 'shop', minLevel: 1, requires: 'q-first-blood', story: 'มิร่าบอกว่าคนที่ออกล่าโดยไม่มียาติดตัวมักกลับมาเป็นศพ', hint: 'เปิดร้านของมิร่า (F) แล้วซื้อยาหรืออาหาร 1 ชิ้น', objectives: [{ type: 'buy', count: 1, text: 'ซื้อยาหรืออาหารที่ร้านมิร่า' }], rewards: { xp: 80, soulGod: 150, items: [['food-hunter-stew', 2]] } },
  { id: 'q-gear', title: 'สวมเกราะแห่งผู้กล้า', giver: 'supplier', turnIn: 'supplier', minLevel: 2, requires: 'q-first-blood', story: 'เกราะในกระเป๋าไม่ได้ปกป้องใคร', hint: 'กด I เปิดกระเป๋า แล้วลากอุปกรณ์ไปวางในช่องสวมใส่', objectives: [{ type: 'equip', count: 1, text: 'สวมอุปกรณ์ 1 ชิ้น' }], rewards: { xp: 120, soulGod: 100, items: [['potion-mp-s', 3]], skills: ['special'] } },
  { id: 'q-forge', title: 'ไฟแห่งโรงตีเหล็ก', giver: 'merchant', turnIn: 'merchant', minLevel: 3, requires: 'q-gear', story: 'แบรนน็อคอยากเห็นว่าเจ้าหลอมเหล็กได้ไหม — แร่หลอมวิญญาณหาได้จากมอนสเตอร์ทุกตัว', hint: 'คุยกับแบรนน็อค เลือกแท็บ “คราฟ” แล้วคราฟอุปกรณ์ 1 ชิ้น', objectives: [{ type: 'craft', count: 1, text: 'คราฟอุปกรณ์ 1 ชิ้น' }], rewards: { xp: 220, soulGod: 400, items: [['material-ore', 10]] } },
  { id: 'q-blessing', title: 'พรแห่งรุ่งอรุณ', giver: 'guide', turnIn: 'blessing', minLevel: 2, requires: 'q-first-blood', story: 'ซิสเตอร์ลูเมนมอบพรแก่ผู้มาใหม่ทุกคน', hint: 'คุยกับซิสเตอร์ลูเมนแล้วรับพร', objectives: [{ type: 'blessing', text: 'รับพรจากซิสเตอร์ลูเมน' }], rewards: { xp: 100, soulGod: 100 } },
  { id: 'q-skill', title: 'ดวงดาวแห่งวิชา', giver: 'guide', turnIn: 'guide', minLevel: 3, requires: 'q-first-blood', story: 'ทุกเลเวลให้แต้มสกิล 1 แต้ม ผู้เฒ่าคอร์วินเล่าว่าอาจารย์อีโซลด์ที่สำนักฝึกของทุกเมืองหลวงคือผู้รีเซ็ตต้นไม้สกิลได้ แต่การอัปแต้มแรกทำเองได้เลย', hint: 'กด K เปิดต้นไม้สกิล แล้วอัปสกิลใดก็ได้ 1 ครั้ง', objectives: [{ type: 'learn', count: 1, text: 'อัปสกิล 1 ครั้ง' }], rewards: { xp: 150, soulGod: 100, items: [['potion-hp-s', 3]], skills: ['extra1'] } },
  { id: 'q-auto', title: 'ล่าอย่างผู้ชำนาญ', giver: 'guide', turnIn: 'guide', minLevel: 4, requires: 'q-skill', story: 'นักล่าที่ดีรู้ว่าเมื่อใดควรดื่มยาและเมื่อใดควรร่าย', hint: 'กดปุ่ม AUTO ข้างลูกแก้วมานา ตั้งค่าแล้วเปิดใช้งาน', objectives: [{ type: 'auto', text: 'เปิดโหมดล่าอัตโนมัติ' }], rewards: { xp: 120, soulGod: 200, items: [['potion-mp-s', 5]] } },
  { id: 'q-hounds', title: 'ฝูงหมาเถ้าถ่าน', giver: 'supplier', turnIn: 'supplier', minLevel: 4, requires: 'q-gear', story: 'Ash Hound ล่าเป็นฝูงใน Ashen Outskirts ทำลายเสบียงของเมือง', hint: 'Ash Hound อยู่ใน Ashen Outskirts นอกประตูวาร์ปทิศใต้ ฝูงใหญ่อยู่ที่หมู่บ้านร้างแอชเฟน', objectives: [{ type: 'kill', count: 8, species: 'Ash Hound', text: 'ปราบ Ash Hound 8 ตัว' }], rewards: { xp: 420, soulGod: 300, items: [['food-iron-bread', 2], ['potion-hp-s', 5]], skills: ['extra2'] } },
  { id: 'q-ruins', title: 'ดินแดนแห่งความโศกเศร้า', giver: 'warden', turnIn: 'warden', minLevel: 5, requires: 'q-hounds', story: 'ผู้เฝ้าประตูออร์รินเล่าถึงหมู่บ้านร้าง ปราสาทพัง มหาวิหารและถ้ำที่ความโศกเศร้ากลายเป็นอสูร', hint: 'ออกประตูวาร์ปทิศใต้ไป Ashen Outskirts แล้วเดินไปยังเขตซากปรักหักพัง (วงแดงบนแผนที่) แล้วล่าที่นั่น', objectives: [{ type: 'visit', zone: 'any', text: 'ไปถึงเขตซากปรักหักพัง' }, { type: 'kill', count: 10, zone: 'any', text: 'ล่ามอนสเตอร์ในเขตซากปรักหักพัง 10 ตัว' }], rewards: { xp: 900, soulGod: 500, items: [['material-3', 3], ['potion-hp-m', 3]] } },
  { id: 'q-enhance', title: 'คมกว่าเดิม', giver: 'merchant', turnIn: 'merchant', minLevel: 5, requires: 'q-forge', story: 'อาวุธที่ดีต้องถูกตีซ้ำแล้วซ้ำอีก', hint: 'คุยกับแบรนน็อค แท็บ “ตีบวก” เลือกอุปกรณ์แล้วกดตีบวก', objectives: [{ type: 'enhance', count: 1, text: 'ตีบวกอุปกรณ์ 1 ครั้ง' }], rewards: { xp: 300, soulGod: 600 } },
  { id: 'q-elite', title: 'ภัยเหนือธรรมดา', giver: 'warden', turnIn: 'warden', minLevel: 6, requires: 'q-ruins', story: 'มีบางตัวที่ตัวใหญ่กว่าและฉลาดกว่า — Elite มีสกิลพิเศษของตัวเอง', hint: 'มองหามอนสเตอร์ป้ายชื่อทองในเขตซากปรักหักพังของ Ashen Outskirts', objectives: [{ type: 'kill', count: 1, elite: true, text: 'ปราบมอนสเตอร์ Elite 1 ตัว' }], rewards: { xp: 700, soulGod: 500, items: [['material-4', 1], ['potion-mp-m', 3]], skills: ['extra3'] } },
  { id: 'q-marshal', title: 'ขวานแห่งหลุมศพ', giver: 'warden', turnIn: 'guide', minLevel: 6, requires: 'q-elite', story: 'Grave Marshal ตื่นขึ้นที่มหาวิหารแห่งเสียงร่ำไห้ ปลายทิศเหนือของ Ashen Outskirts ต้องรวมพลหลายคนจึงจะล้มได้', hint: 'บอสใช้เวลา 15–30 นาที รวมปาร์ตี้แล้วหลบวงเตือนสีส้ม', objectives: [{ type: 'kill', count: 1, boss: true, text: 'ร่วมปราบ Grave Marshal' }], rewards: { xp: 3000, soulGod: 2000, items: [['material-6', 1], ['potion-hp-m', 5]] } },
  // round 12: the class-advancement trials at Master Ysolde (mentor) — the advancement itself is taken in her dialog
  { id: 'q-path', title: 'ทางแยกแห่งสายเลือด', giver: 'mentor', turnIn: 'mentor', minLevel: 10, requires: 'q-first-blood', unlocksStage: 2, story: 'อาจารย์อีโซลด์เห็นเพลิงโทสะในตัวเจ้า แต่ความโกรธที่ไม่มีวินัยคือความตาย จงพิสูจน์ว่าเจ้าควบคุมมันได้ต่อหน้าภัยที่แท้จริง', hint: 'ล่ามอนสเตอร์ Elite (ป้ายชื่อทอง) ในเขตซากปรักหักพังของ Ashen Outskirts แล้วกลับมาหาอาจารย์อีโซลด์', objectives: [{ type: 'kill', count: 3, elite: true, text: 'ปราบมอนสเตอร์ Elite 3 ตัว' }], rewards: { xp: 1500, soulGod: 800, items: [['potion-hp-m', 5], ['potion-mp-m', 5]] } },
  { id: 'q-ascension', title: 'ยอดเขาแห่งปรมาจารย์', giver: 'mentor', turnIn: 'mentor', minLevel: 60, requires: 'q-path', unlocksStage: 3, story: 'Berserker ที่จะกลายเป็น Reaver ผู้เก็บเกี่ยววิญญาณ ต้องก้าวข้ามสิ่งที่คนส่วนใหญ่ทำไม่ได้ จงล้มบอสร่วมกับสหาย และกวาดล้าง Elite ในดันเจี้ยน แล้วกลับมาเลื่อนขั้นที่ลานกลางเมือง (Lv60)', hint: 'รวมปาร์ตี้ลงดันเจี้ยน ล้มบอส 1 ตัว และ Elite 20 ตัว', objectives: [{ type: 'kill', count: 1, boss: true, text: 'ร่วมปราบบอส 1 ตัว' }, { type: 'kill', count: 20, elite: true, text: 'ปราบ Elite 20 ตัว' }], rewards: { xp: 20000, soulGod: 5000, items: [['potion-hp-l', 5], ['material-6', 1]] } },
];
/** advancement stage this quest log allows (1 = none yet) */
export const stageUnlocked = (log: QuestLog) => QUESTS.reduce((s, q) => q.unlocksStage && log[q.id]?.status === 'done' ? Math.max(s, q.unlocksStage) : s, 1);
export const QUEST_BY_ID = Object.fromEntries(QUESTS.map(q => [q.id, q])) as Record<string, QuestDef>;
const need = (o: Objective) => 'count' in o ? o.count : 1;
export const objectiveNeed = need;

/** quests this NPC can give right now */
export function questsOffered(npc: string, level: number, log: QuestLog) {
  return QUESTS.filter(q => q.giver === npc && !log[q.id] && level >= q.minLevel && (!q.requires || log[q.requires]?.status === 'done'));
}
export function questsToTurnIn(npc: string, log: QuestLog) { return QUESTS.filter(q => q.turnIn === npc && log[q.id]?.status === 'ready'); }
/** "!" gold = has something to give, "?" gold = something ready, "?" grey = in progress */
export function npcMarker(npc: string, level: number, log: QuestLog): '!' | '?' | '…' | null {
  if (questsToTurnIn(npc, log).length) return '?';
  if (questsOffered(npc, level, log).length) return '!';
  if (QUESTS.some(q => q.turnIn === npc && log[q.id]?.status === 'active')) return '…';
  return null;
}
export function acceptQuest(log: QuestLog, id: string, now = Date.now()): QuestLog {
  const q = QUEST_BY_ID[id]; if (!q || log[id]) return log;
  const st: QuestState = { id, status: 'active', progress: q.objectives.map(() => 0), acceptedAt: now };
  // talking to the giver who is also the turn-in, or objectives already met (e.g. level), complete at once
  return checkReady({ ...log, [id]: st }, id);
}
function checkReady(log: QuestLog, id: string): QuestLog {
  const q = QUEST_BY_ID[id], st = log[id]; if (!q || !st || st.status !== 'active') return log;
  const done = q.objectives.every((o, i) => st.progress[i] >= need(o));
  return done ? { ...log, [id]: { ...st, status: 'ready' } } : log;
}
function matches(o: Objective, e: QuestEvent): boolean {
  if (o.type !== e.type) return false;
  switch (o.type) {
    case 'talk': return (e as { npc: string }).npc === o.npc;
    case 'kill': { const k = e as Extract<QuestEvent, { type: 'kill' }>; if (o.species && o.species !== k.species) return false; if (o.elite && !k.elite) return false; if (o.boss && !k.boss) return false; if (o.zone && !k.zone) return false; if (o.zone && o.zone !== 'any' && o.zone !== k.zone) return false; return true; }
    case 'buy': return !o.item || o.item === (e as { item: string }).item;
    case 'equip': return !o.slot || o.slot === (e as { slot: string }).slot;
    case 'visit': return o.zone === 'any' || o.zone === (e as { zone: string }).zone;
    case 'level': return (e as { level: number }).level >= o.level;
    default: return true;
  }
}
/** feed a game event; returns the new log and the quests that just became ready */
export function questEvent(log: QuestLog, e: QuestEvent): { log: QuestLog; ready: string[]; progressed: string[] } {
  let next = log; const ready: string[] = [], progressed: string[] = [];
  for (const st of Object.values(log)) {
    if (st.status !== 'active') continue; const q = QUEST_BY_ID[st.id]; if (!q) continue;
    let changed = false; const progress = st.progress.map((p, i) => { const o = q.objectives[i]; if (p < need(o) && matches(o, e)) { changed = true; return o.type === 'level' ? need(o) : p + 1; } return p; });
    if (!changed) continue; progressed.push(st.id);
    next = checkReady({ ...next, [st.id]: { ...st, progress } }, st.id);
    if (next[st.id].status === 'ready') ready.push(st.id);
  }
  return { log: next, ready, progressed };
}
export function turnInQuest(log: QuestLog, id: string, npc: string): { log: QuestLog; rewards: QuestDef['rewards'] } | null {
  const q = QUEST_BY_ID[id], st = log[id]; if (!q || !st || st.status !== 'ready' || q.turnIn !== npc) return null;
  return { log: { ...log, [id]: { ...st, status: 'done' } }, rewards: q.rewards };
}
export const activeQuests = (log: QuestLog) => QUESTS.filter(q => log[q.id] && log[q.id].status !== 'done');
export const questProgressText = (q: QuestDef, st: QuestState) => q.objectives.map((o, i) => `${o.text} ${Math.min(st.progress[i], need(o))}/${need(o)}`);
