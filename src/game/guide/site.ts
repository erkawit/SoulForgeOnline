// SoulForge Codex — the dark game-information website. Built from the live game data (classes, skills, balance,
// NPCs, zones), so it never drifts from the game. Served by the Next route /guide and exported as a static page.
import { CLASS_KEYS, ATTRIBUTES, ATTRIBUTE_LABEL, DEFAULT_CONFIG, RARITY_KEYS, SPECIAL_LABEL, type ClassKey, type GameConfig } from '../balance/config';
import { ATTRIBUTE_HELP } from '../balance/stats';
import { CLASS_SPECIALS } from '../balance/options';
import { DEFAULT_SKILLS, DEFAULT_HOTBAR } from '../skills/defaults';
import type { TreeNode } from '../skills/engine';
import { NPCS, npcHomes } from '../npcs';
import { CITIES, ZONE_IDS, DUNGEON_IDS, type CityId } from '../content';

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
/** round 13: one class and its Lv60 advancement */
const CLASS_TH: Record<ClassKey, [string, string, string]> = {
  Paladin: ['พาลาดิน', '#ffe08a', 'แทงก์แนวหน้า ดาบมือเดียว + โล่ ป้องกันแน่นที่สุด มีแสงศักดิ์สิทธิ์ทั้งโจมตีและรักษา'],
  Hawkeye: ['ฮอว์คอาย', '#8bdb9a', 'นักธนูยิงไกลที่สุด คริสูง ตีเร็ว ต้องรักษาระยะ'],
  RuneMaster: ['รูนมาสเตอร์', '#62dfdf', 'เวทอักขระ วางกับดัก ทำให้ศัตรูช้า เสริมพลังปาร์ตี้'],
  Elementalist: ['อีลีเมนทัลลิสต์', '#b685ff', 'เวทไฟ น้ำแข็ง สายฟ้า ดาเมจพื้นที่สูงที่สุด ตัวบาง'],
  Assassin: ['แอสแซสซิน', '#c97bff', 'มีดคู่ ตีเร็ว คริแรง พุ่งเข้าปิดฉากเป้าเลือดน้อย'],
  HighPriest: ['ไฮพรีสต์', '#ffdb86', 'รักษาและบัฟปาร์ตี้ เกราะพลัง และแสงเผาศัตรู'],
  Inquisitor: ['อินควิซิเตอร์', '#ffb35c', 'หน้าไม้ระยะกลาง ประทับตราบาปลดเกราะ ปิดฉากด้วยลูกดอกเดียว'],
  Berserker: ['เบอร์เซิร์กเกอร์', '#ff4a3a', 'นักรบอาวุธสองมือ (ดาบใหญ่ / ขวานใหญ่ / ค้อนใหญ่) สะสม Rage จากการฟันและการถูกตี ใช้ Rage ปล่อยสกิลรุนแรง ยิ่งเลือดน้อยยิ่งแรง'],
  Reaver: ['รีเวอร์ · เลื่อนขั้น Lv60', '#c03cff', 'ร่างเลื่อนขั้นของ Berserker — ค่าพื้นฐานสูงขึ้น สกิลทั้ง 12 วิวัฒน์ (สกิลเดิมถูกแทน ไม่ซ้อนกัน) ดูดวิญญาณคืนเลือด ปิดฉากศัตรูเลือดน้อย'],
}
const RARITY_COLOR: Record<string, string> = { Common: '#b9c6d2', Uncommon: '#69cf7b', Rare: '#4db7ff', Epic: '#b477ff', Legendary: '#e35a64', God: '#ffd36e', 'Pre-arch': '#fb9446', Arch: '#c58aef' };

export function buildGuideHtml(opts: { cfg?: GameConfig; gameUrl?: string } = {}) {
  const cfg = opts.cfg ?? DEFAULT_CONFIG, game = opts.gameUrl ?? '/';
  const sec = (id: string, title: string, sub: string, body: string) => `<section id="${id}"><header><h2>${title}</h2><p>${sub}</p></header>${body}</section>`;
  // classes
  const classes = CLASS_KEYS.map(k => {
    const c = cfg.classes[k], [th, color, desc] = CLASS_TH[k], hot = DEFAULT_HOTBAR.Berserker;
    const actives = DEFAULT_SKILLS.defs.filter(d => d.kind === 'active' && (k === 'Reaver' ? !!d.promotion : !d.promotion));
    return `<article class="cls" style="--cc:${color}"><div class="cls-h"><span class="glyph">${['⚔', '☠'][CLASS_KEYS.indexOf(k)]}</span><div><h3>${k}</h3><small>${th}</small></div></div><p>${desc}</p>
      <div class="stats">${ATTRIBUTES.map(a => `<div title="${esc(ATTRIBUTE_HELP[a])}"><b>${ATTRIBUTE_LABEL[a]}</b><i style="width:${c.base[a] / 24 * 100}%"></i><span>${c.base[a]}</span></div>`).join('')}</div>
      <div class="kv"><span>HP / เลเวล</span><b>${c.hpPerLevel}</b><span>MP / เลเวล</span><b>${c.mpPerLevel}</b><span>ATK / เลเวล</span><b>${c.atkPerLevel}</b><span>DEF / เลเวล</span><b>${c.defPerLevel}</b></div>
      <p class="muted">${k === 'Reaver' ? 'เมื่อเลื่อนขั้น ปุ่มลัดเดิมจะใช้สกิลเวอร์ชัน Reaver อัตโนมัติ' : `ปุ่มลัดเริ่มต้น: ${[hot.skill, hot.buff, hot.special].map(id => esc(DEFAULT_SKILLS.defs.find(d => d.id === id)?.name ?? id)).join(' · ')}`}</p>
      <details><summary>สกิลแอคทีฟทั้งหมด (${actives.length})</summary><table><tr><th>สกิล</th><th>MP</th><th>Rage</th><th>CD</th><th>ร่าย</th><th>ระยะ</th></tr>${actives.map(d => `<tr><td><b>${esc(d.name)}</b><br><small>${esc(d.th)} — ${esc(d.description)}</small></td><td>${d.mpCost}</td><td>${d.rageCost ?? '—'}</td><td>${d.cooldownSec}s</td><td>${d.castMs ? (d.castMs / 1000).toFixed(1) + 's' : 'ทันที'}</td><td>${d.range || '—'}</td></tr>`).join('')}</table></details></article>`;
  }).join('');
  // skill trees
  const trees = (['Berserker'] as const).map(k => {
    const color = CLASS_TH[k][1], tree = DEFAULT_SKILLS.trees[k];
    return `<div class="tree" style="--cc:${color}"><h3>${k}</h3>${[1, 2, 3, 4, 5, 6].map(t => `<div class="tier"><span>ขั้น ${t}<br><small>Lv.${Math.min(...tree.filter(n => n.tier === t).map(n => n.unlockLevel))}+</small></span>${tree.filter((n: TreeNode) => n.tier === t).sort((a: TreeNode, b: TreeNode) => a.col - b.col).map((n: TreeNode) => { const d = DEFAULT_SKILLS.defs.find(x => x.id === n.skillId)!; return `<div class="node ${d.kind}"><b>${esc(d.name)}</b><small>${esc(d.th)} · ${d.kind === 'passive' ? 'ติดตัว' : `MP ${d.mpCost} · CD ${d.cooldownSec}s`}</small><p>${esc(d.description)}</p>${n.requires.length ? `<em>ต้องการ ${n.requires.map((r: TreeNode['requires'][number]) => `${esc(DEFAULT_SKILLS.defs.find(x => x.id === r.skillId)?.name ?? r.skillId)} Lv.${r.level}`).join(', ')}</em>` : ''}</div>`; }).join('')}</div>`).join('')}</div>`;
  }).join('');
  // items & options
  const o = cfg.options;
  const rarity = `<table class="wide"><tr><th>ระดับ</th><th>ออปชันสเตตัส</th><th>ค่าต่อบรรทัด</th><th>ออปชันพิเศษ</th><th>ตัวคูณพิเศษ</th><th>ดรอปได้ตั้งแต่ Lv</th><th>ราคาขั้นต่ำตลาด</th></tr>${RARITY_KEYS.map(r => `<tr><td style="color:${RARITY_COLOR[r]}"><b>${r}</b></td><td>${o.attributeLines[r]}</td><td>${o.attributeRange[r][0]}–${o.attributeRange[r][1]}</td><td>${o.specialLines[r]}</td><td>${o.specialTierMultiplier[r] ? '×' + o.specialTierMultiplier[r] : '—'}</td><td>${cfg.drops.levelGate[r]}</td><td>${fmt(cfg.market.floor[r])}</td></tr>`).join('')}</table>
    <div class="grid2"><div class="card"><h4>ค่าพิเศษระดับ God (ฐาน)</h4><div class="kv">${Object.entries(o.specialGodValue).map(([k, v]) => `<span>${SPECIAL_LABEL[k as keyof typeof SPECIAL_LABEL]}</span><b>${v}%</b>`).join('')}</div><p class="muted">Pre-arch ×2 · Arch ×4 ของค่าฐาน</p></div>
    <div class="card"><h4>ค่าพิเศษที่สุ่มได้</h4>${CLASS_KEYS.map(k => `<p><b style="color:${CLASS_TH[k][1]}">${k}</b> — ${CLASS_SPECIALS[k].map(s => SPECIAL_LABEL[s]).join(', ')}</p>`).join('')}<p class="muted">อาวุธสองมือ 3 ประเภท: ดาบใหญ่ (สมดุล) · ขวานใหญ่ (แรงกว่า ช้ากว่า) · ค้อนใหญ่ (แรงที่สุด ช้าที่สุด) · ไม่มีโล่</p></div></div>`;
  // enhancement
  const e = cfg.enhance;
  const enh = `<table class="wide"><tr><th>ขั้น</th>${e.successRate.map((_, i) => `<th>+${i + 1}</th>`).join('')}</tr><tr><td>โอกาส</td>${e.successRate.map(r => `<td>${Math.round(r * 100)}%</td>`).join('')}</tr><tr><td>ถ้าพลาด</td>${e.successRate.map((_, i) => `<td>${i + 1 <= e.safeLevel ? 'คงเดิม' : '−' + e.downgradeOnFail}</td>`).join('')}</tr></table>
    <ul><li>ตีบวกได้ที่ <b>Brannoc Ironhand (NPC Merchant)</b> ในเมืองหลวงเท่านั้น</li><li>+1 ถึง +${e.safeLevel} พลาดไม่ลดขั้น · ตั้งแต่ +${e.safeLevel + 1} พลาดลด ${e.downgradeOnFail} ขั้น (ใช้คัมภีร์ป้องกันได้ ราคา ${fmt(e.protectionScrollPrice)})</li><li>แต่ละขั้นเพิ่ม ATK/DEF ฐาน ${e.bonusPerLevel * 100}% (หลัง +10 เพิ่ม ${e.bonusPerLevelAfter10 * 100}% ต่อขั้น) · สูงสุด +${e.maxLevel}</li><li>ค่าตีบวก = ราคาฐานตามระดับ × (ขั้นปัจจุบัน+1)^${e.costExponent}</li></ul>`;
  // market
  const m = cfg.market;
  const market = `<div class="grid2"><div class="card"><h4>กติกาตลาด</h4><ul><li>ลงขายผ่าน <b>Silas Vane</b> นายหน้าตลาด</li><li>ไม่มีเพดานราคา แต่มี <b>ราคาขั้นต่ำ</b> ตามระดับไอเทม +${m.floorPerEnhance * 100}% ต่อขั้นการตีบวก และไม่ต่ำกว่า ${m.medianFloorRatio * 100}% ของราคากลาง 7 วันเมื่อมีการซื้อขายแล้ว</li><li>ค่าลงขาย ${m.listingFeePct * 100}% (ขั้นต่ำ ${m.listingFeeMin}) ไม่คืนแม้ยกเลิก</li><li>ภาษีขาย ${m.salesTaxPct * 100}% หักจากผู้ขาย</li><li>ลงขายพร้อมกันได้ ${m.maxActiveListings} รายการ · อยู่ในตลาด ${m.listingHours} ชม. · ยกเลิกแล้วลงชิ้นเดิมใหม่ได้หลัง ${m.relistCooldownMinutes} นาที</li></ul></div>
    <div class="card"><h4>SoulGod Burn — ค่าเงินไม่เฟ้อ</h4><p>ค่าลงขาย ภาษีขาย ค่าตีบวก ค่ารีเซ็ตสกิล และค่าเดินทาง <b>ถูกเผาทิ้งทั้งหมด</b> SoulGod จึงหายไปจากระบบทุกครั้งที่มีการใช้ ทำให้ราคาของในตลาดคงที่</p><div class="kv"><span>SoulGod เริ่มต้น</span><b>${fmt(cfg.economy.startingSoulGod)}</b><span>ค่าเดินทาง / โซน</span><b>${fmt(cfg.economy.travelFeePerZone)}</b><span>ค่ารีเซ็ตสกิล</span><b>${fmt(cfg.economy.skillResetBase)} + ${cfg.economy.skillResetPerLevel}/Lv</b></div></div></div>`;
  // drops
  const drops = `<table class="wide"><tr><th>แหล่ง</th><th>โอกาสดรอป</th><th>จำนวนครั้ง</th>${RARITY_KEYS.map(r => `<th style="color:${RARITY_COLOR[r]}">${r}</th>`).join('')}</tr>${(['field', 'elite', 'boss', 'farm'] as const).map(s => { const t = cfg.drops.tables[s], sum = RARITY_KEYS.reduce((a, r) => a + t.weights[r], 0) || 1; return `<tr><td>${({ field: 'มอนสเตอร์ทั่วไป', elite: 'อีลีท', boss: 'บอส', farm: 'จุดฟาร์ม' })[s]}</td><td>${Math.round(t.chance * 100)}%</td><td>${t.rolls}</td>${RARITY_KEYS.map(r => `<td>${t.weights[r] ? (t.weights[r] / sum * 100).toFixed(t.weights[r] / sum < 0.01 ? 2 : 1) + '%' : '—'}</td>`).join('')}</tr>`; }).join('')}</table><p class="muted">ดรอปเป็นอุปกรณ์ของอาชีพคุณ 70% และของอาชีพอื่น 30% (เอาไปขายในตลาดได้) · ระดับสูงต้องการเลเวลมอนสเตอร์ตามตาราง “ดรอปได้ตั้งแต่ Lv”</p>`;
  // NPCs
  const npcs = `<div class="npcs">${NPCS.map(n => `<div class="card npc" style="--cc:${n.color}"><span class="glyph">${n.icon}</span><div><h4>${esc(n.th)} <small>${esc(n.name)}</small></h4><em>${esc(n.title)} · ${npcHomes(n).length === 3 ? 'ทุกเมืองหลวง' : npcHomes(n).map(c => CITIES[c].name).join(', ')}</em><p>${esc(n.look)}</p><p class="muted">“${esc(n.greeting[0])}”</p></div></div>`).join('')}</div>`;
  // buffs
  const nb = cfg.newbieBuff;
  const buffs = `<div class="grid2"><div class="card"><h4>พรผู้มาใหม่ · Sister Lumen</h4><table><tr><th>เลเวล</th><th>ขั้นบัฟ</th><th>ATK</th><th>DEF</th><th>EXP</th><th>ฟื้น HP</th><th>วิ่ง</th></tr>${nb.tiers.map(t => { const f = nb.effects[String(t.buffLevel)]; return `<tr><td>${t.from}–${t.to}</td><td>Lv.${t.buffLevel}</td><td>+${f.atkPct}%</td><td>+${f.defPct}%</td><td>+${f.expPct}%</td><td>+${f.hpRegen}</td><td>+${f.moveSpeed}%</td></tr>`; }).join('')}</table><p class="muted">นาน ${nb.durationMinutes} นาที · ทีมงานปรับช่วงเลเวลและค่าได้จากหน้า Admin</p></div>
    <div class="card"><h4>บัฟของ Berserker</h4><p>Blood Howl (Q) เพิ่ม ATK และความเร็วโจมตี และเติม Rage ทันที · Reaver ได้ Dread Howl ที่ลด DEF ศัตรูรอบตัวด้วย</p><p class="muted">บัฟชนิดเดียวกันไม่ซ้อนกัน ระบบเลือกค่าที่แรงที่สุดให้อัตโนมัติ (เช่น พรผู้มาใหม่ vs จารึกของ Enchanter)</p></div></div>`;
  // world
  const capitals: CityId[] = ['hollow', 'dawnveil', 'thornwatch'];
  const world = `<div class="regions">${capitals.map(c => `<div class="card"><h4>${esc(CITIES[c].name)} <small>${esc(CITIES[c].subtitle)}</small></h4><p>${esc(CITIES[c].description)}</p><ul>${ZONE_IDS.filter(z => CITIES[z].parent === c).map(z => `<li><b>${esc(CITIES[z].name)}</b> · Lv.${CITIES[z].levels?.[0]}–${CITIES[z].levels?.[1]} — ${esc((CITIES[z].species ?? []).join(', '))}</li>`).join('')}${DUNGEON_IDS.filter(d => CITIES[d].parent === c).map(d => `<li><b>☠ ${esc(CITIES[d].name)}</b> · ดันเจี้ยน Lv.${CITIES[d].levels?.[0]}–${CITIES[d].levels?.[1]}</li>`).join('')}</ul></div>`).join('')}</div>`;
  const controls = `<div class="grid2"><div class="card"><h4>คีย์บอร์ดและเมาส์</h4><div class="kv"><span>วิ่ง</span><b>WASD / คลิกพื้น</b><span>เลือกเป้า + ตีอัตโนมัติ</span><b>คลิกมอนสเตอร์ · Tab</b><span>โจมตีพื้นฐาน</span><b>1</b><span>สกิล</span><b>Space · Q · E · R · T</b><span>เป้าฮีล/บัฟ</span><b>F1 ตนเอง · F2/F3 เพื่อน</b><span>คุยกับ NPC</span><b>F</b><span>ยา HP / MP</span><b>7 · 8</b><span>เมนู</span><b>I C K P B M G O</b></div></div>
    <div class="card"><h4>การต่อสู้</h4><ul><li>กดสกิลระหว่างท่ากำลังเล่นได้ — ระบบเก็บคำสั่งไว้ (input buffer) แล้วปล่อยต่อทันทีเมื่อท่าจบ ทำให้คอมโบลื่น</li><li>สกิลที่มีเวลาร่ายจะแสดงหลอดร่าย · เดินเพื่อยกเลิก · ถูกตีอาจทำให้สะดุด</li><li>Berserker ฟัน 3 จังหวะ จังหวะที่ 3 แรงที่สุด · ทุกการฟันโดนได้ Rage +8 · ถูกตีได้ Rage +3 · ไม่สู้ 5 วินาที Rage ค่อยๆ ลด</li><li>Whirlwind / Reaping Cyclone หมุนต่อเนื่อง เดินได้ช้าลงระหว่างหมุน · เลือดต่ำกว่า 30% ดาเมจเพิ่มจากพาสซีฟ</li><li>ตัวเลขดาเมจ: ขาว = ปกติ · ทอง “CRITICAL” = คริ · สีอาชีพ = สกิล · เขียว = ฮีล · แดง = ดาเมจที่ได้รับ</li></ul></div></div>`;
  const beta = `<div class="grid2"><div class="card"><h4>Closed Beta</h4><ul><li>รับผู้ทดสอบ ${fmt(cfg.beta.maxPlayers)} คน · ลงทะเบียนด้วย <b>โค้ดเชิญ</b> รูปแบบ XXXX-XXXX-XXXX-XXXX เท่านั้น</li><li>กรอกโค้ดถูกต้อง = ได้บัญชีทันที แล้วไปหน้าสร้างตัวละคร</li><li>1 โค้ดใช้ได้ 1 บัญชี ห้ามซื้อขายโค้ด</li></ul></div><div class="card"><h4>แพลตฟอร์ม</h4><ul><li>เว็บ (เล่นบนเบราว์เซอร์) — ตอนนี้</li><li>มือถือ Android / iOS — แพ็กด้วย Capacitor พร้อมปุ่มจอยสัมผัส</li><li>PC Windows / macOS — แพ็กด้วย Tauri</li></ul></div></div>`;
  const nav: [string, string][] = [['start', 'เริ่มต้น'], ['classes', 'อาชีพ'], ['skills', 'ต้นไม้สกิล'], ['combat', 'การต่อสู้'], ['items', 'ไอเทมและออปชัน'], ['drops', 'อัตราดรอป'], ['enhance', 'การตีบวก'], ['market', 'ตลาดและ SoulGod'], ['buffs', 'บัฟ'], ['npcs', 'NPC'], ['world', 'โลกของเกม']];
  return `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SoulForge Codex</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Noto+Sans+Thai:wght@400;600;700&display=swap" rel="stylesheet">
<style>${GUIDE_CSS}</style></head><body>
<aside><a class="brand" href="#start">SOULFORGE<small>CODEX</small></a><nav>${nav.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('')}</nav><a class="play" href="${esc(game)}">เข้าสู่เกม ▸</a></aside>
<main><div class="hero" id="start"><h1>SoulForge Codex</h1><p>คู่มือฉบับสมบูรณ์ของ SoulForge Online — ทุกตัวเลขในหน้านี้ดึงจากข้อมูลเกมจริง อัปเดตอัตโนมัติเมื่อทีมงานปรับสมดุล</p>${beta}</div>
${sec('classes', 'Berserker และ Reaver', 'อาชีพเดียว เลื่อนขั้นครั้งเดียวที่ Lv60 · สเตตัส 6 ค่าตายตัว (ไม่มีการอัปแต้ม) — เพิ่มได้จากออปชันอุปกรณ์', `<div class="classes">${classes}</div>`)}
${sec('skills', 'ต้นไม้สกิล', 'ได้ 1 แต้มต่อเลเวล + โบนัสทุก 10 เลเวล · 6 ขั้น · ฝั่งขวา (Reaver) ปลดหลังเลื่อนขั้น Lv60', trees)}
${sec('combat', 'การควบคุมและการต่อสู้', 'คอมโบ คิวคำสั่ง หลอดร่าย และเกจ Rage', controls)}
${sec('items', 'ไอเทม ระดับ และออปชัน', 'Rare 1 · Epic 2 · Legendary 3 · God 4+1 · Pre-arch 4+2 · Arch 4+3 — ค่าพิเศษเพิ่มเป็นเท่าตัวในแต่ละขั้น', rarity)}
${sec('drops', 'อัตราดรอป', 'คำนวณจากตารางน้ำหนักของเซิร์ฟเวอร์', drops)}
${sec('enhance', 'การตีบวก', 'ทำได้ที่ NPC Merchant เท่านั้น', enh)}
${sec('market', 'ตลาดและ SoulGod', 'ราคาขั้นต่ำ ไม่มีเพดาน และระบบเผาเงินกันเงินเฟ้อ', market)}
${sec('buffs', 'บัฟ', 'พรผู้มาใหม่ และบัฟของ Berserker', buffs)}
${sec('npcs', 'NPC ในเมือง', 'ร้านค้า รับซื้อ ตลาด ช่างตีบวก และผู้เฝ้าประตู มีครบทุกเมืองหลวง ส่วนผู้เชี่ยวชาญอยู่ในเมืองที่เข้ากับธีม — ยืนอยู่หน้าอาคารของตัวเอง', npcs)}
${sec('world', 'โลกของเกม', '3 อาณาเขต · 10 โซนล่า · 3 ดันเจี้ยน', world)}
<footer>SoulForge Online · Closed Beta · ข้อมูลอัปเดตจากเวอร์ชันสมดุล v${cfg.version}</footer></main>
<script>const links=[...document.querySelectorAll('nav a')];const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-40% 0px -55% 0px'});document.querySelectorAll('section,.hero').forEach(s=>io.observe(s));</script>
</body></html>`;
}

export const GUIDE_CSS = `
:root{--bg:#07060a;--p:#121017;--p2:#18151f;--line:rgba(217,180,92,.2);--line2:rgba(217,180,92,.45);--t:#e9e2d3;--m:#9c937f;--g:#d9b45c;--g2:#f2d58a;--teal:#62d7cb}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:20px}body{margin:0;background:radial-gradient(ellipse at 70% -10%,#1d1626,transparent 60%),var(--bg);color:var(--t);font:15px/1.6 "Noto Sans Thai",system-ui,sans-serif;display:grid;grid-template-columns:240px 1fr;min-height:100vh}
aside{position:sticky;top:0;height:100vh;padding:24px 18px;border-right:1px solid var(--line);background:linear-gradient(180deg,#0f0d14,#08070b);display:flex;flex-direction:column;gap:18px}
.brand{font:900 22px Cinzel,Georgia,serif;letter-spacing:.2em;color:#f2e3bf;text-decoration:none;text-shadow:0 0 24px rgba(217,180,92,.35)}.brand small{display:block;font-size:10px;letter-spacing:.6em;color:var(--teal)}
nav{display:grid;gap:2px}nav a{color:var(--m);text-decoration:none;padding:7px 10px;border-left:2px solid transparent;font-size:14px}nav a:hover{color:var(--t)}nav a.on{color:var(--g2);border-left-color:var(--g);background:rgba(217,180,92,.06)}
.play{margin-top:auto;text-align:center;padding:10px;border:1px solid #e2bd6a;background:linear-gradient(180deg,#6b4d1c,#3a2810);color:#fff3d6;text-decoration:none;font:700 14px Cinzel,Georgia,serif;letter-spacing:.06em;border-radius:3px}
main{padding:36px clamp(16px,4vw,56px) 60px;max-width:1240px}
.hero h1{font:900 clamp(30px,5vw,54px) Cinzel,Georgia,serif;letter-spacing:.12em;margin:0;color:#f2e3bf;text-shadow:0 0 40px rgba(217,180,92,.3)}.hero>p{color:var(--m);max-width:720px}
section{margin-top:56px}section>header{border-bottom:1px solid var(--line);margin-bottom:18px;padding-bottom:8px}section h2{font:700 24px Cinzel,Georgia,serif;letter-spacing:.06em;margin:0;color:var(--g2)}section>header p{margin:2px 0 0;color:var(--m);font-size:13.5px}
.card,.cls,.tree{background:linear-gradient(180deg,rgba(24,21,31,.95),rgba(12,10,16,.95));border:1px solid var(--line);border-radius:4px;padding:16px 18px}.card h4{margin:0 0 8px;font:700 15px Cinzel,Georgia,serif;color:var(--g2)}.card h4 small{font:400 12px "Noto Sans Thai";color:var(--m)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}@media(max-width:900px){.grid2{grid-template-columns:1fr}body{grid-template-columns:1fr}aside{position:static;height:auto;flex-direction:row;flex-wrap:wrap;align-items:center}nav{display:flex;flex-wrap:wrap}.play{margin:0}}
.classes{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:16px}.cls{border-color:color-mix(in srgb,var(--cc) 35%,transparent)}.cls-h{display:flex;gap:12px;align-items:center}.cls h3{margin:0;font:700 22px Cinzel,Georgia,serif;color:#fff2d2}.cls small{color:var(--cc)}
.glyph{width:46px;height:46px;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--cc) 40%,#000),#09070c);border:1px solid color-mix(in srgb,var(--cc) 50%,transparent);font-size:22px;flex:none}
.stats{display:grid;gap:4px;margin:10px 0}.stats div{display:grid;grid-template-columns:36px 1fr 24px;gap:8px;align-items:center;font-size:12px}.stats b{font:700 11px Cinzel,Georgia,serif;color:var(--g2)}.stats i{height:6px;border-radius:3px;background:linear-gradient(90deg,color-mix(in srgb,var(--cc) 50%,#000),var(--cc))}.stats span{text-align:right}
.kv{display:grid;grid-template-columns:1fr auto;gap:3px 14px;font-size:13px}.kv span{color:var(--m)}.kv b{text-align:right}
.muted{color:var(--m);font-size:13px}details{margin-top:8px}summary{cursor:pointer;color:var(--g2);font-size:13.5px}
table{border-collapse:collapse;width:100%;font-size:13px;margin-top:8px}th{text-align:left;font:600 11.5px Cinzel,Georgia,serif;color:var(--m);letter-spacing:.04em;border-bottom:1px solid var(--line);padding:6px 8px}td{border-bottom:1px solid rgba(255,255,255,.05);padding:6px 8px;vertical-align:top}table.wide{overflow-x:auto;display:block}td small{color:var(--m)}
.tree{margin-bottom:16px;border-color:color-mix(in srgb,var(--cc) 30%,transparent)}.tree h3{margin:0 0 10px;font:700 18px Cinzel,Georgia,serif;color:var(--cc)}.tier{display:grid;grid-template-columns:70px repeat(3,1fr);gap:8px;margin-bottom:8px}.tier>span{font:600 12px Cinzel,Georgia,serif;color:var(--m);border-right:1px solid var(--line)}
.node{padding:8px 10px;border:1px solid rgba(255,255,255,.07);border-radius:3px;background:#0d0b11;font-size:12.5px}.node b{color:#fff2d2;font-family:Cinzel,Georgia,serif}.node small{display:block;color:var(--m)}.node p{margin:4px 0 0;color:#c9c0ac}.node em{display:block;color:var(--g);font-size:11.5px;margin-top:4px;font-style:normal}.node.passive b{color:#c8bfa8}
@media(max-width:760px){.tier{grid-template-columns:1fr}.tier>span{border:0}}
.npcs{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px}.npc{display:flex;gap:14px;border-color:color-mix(in srgb,var(--cc) 30%,transparent)}.npc em{color:var(--cc);font-style:normal;font-size:13px}.npc p{margin:6px 0 0;font-size:13px}
.regions{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}ul{padding-left:18px;margin:6px 0}li{margin:3px 0}
footer{margin-top:60px;color:var(--m);font-size:12px;border-top:1px solid var(--line);padding-top:14px}
`;
