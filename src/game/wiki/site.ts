// The SoulForge Online website: home page (with the big "เข้าเกม" button in the middle of the top menu) and the
// player Wiki. Plain HTML strings built from the live game data (wiki/data.ts), served by the Next routes / and /wiki
// and exported as static pages for the preview — the same builder everywhere, so the site never drifts from the game.
import { monsterEntries, BOSSES, bossRaidInfo, zoneEntries, cityEntries, craftTable, WIKI_REWARDS, MATERIAL_TH, MONSTER_TH } from './data';
import { CITIES, FIELD_ART, ZONE_IDS, DUNGEON_IDS, fieldGate, portalsOf, type CityId, type MainCityId } from '../content';
import { QUESTS } from '../quests';
import { TIPS } from '../tutorial';
import { NPCS } from '../npcs';
import { CRYSTAL_INFO, FOOD_ITEMS, COSTUMES } from '../items';
import { DEFAULT_CONFIG } from '../balance/config';
import { VOICE_LINES } from '../audio/engine';
import { GAME_VERSION, PATCHES } from '../patches';

export type SiteOpts = { gameUrl?: string; homeUrl?: string; wikiUrl?: string; codexUrl?: string; art?: string; playAttr?: string };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const RC: Record<string, string> = { Common: '#b9c6d2', Uncommon: '#69cf7b', Rare: '#4db7ff', Epic: '#b477ff', Legendary: '#e35a64', God: '#ffd36e', 'Pre-arch': '#fb9446', Arch: '#c58aef' };
/** [class, Thai name, colour, blurb, painted look] — round 13: one class and its Lv60 advancement */
const CLASSES: [string, string, string, string, string][] = [
  // round 20: the seven new classes (they show the Berserker art until their own sheets ship)
  ['Paladin', 'พาลาดิน', '#ffe08a', 'อัศวินดาบมือเดียวกับโล่ ยืนรับแรงปะทะแทนเพื่อน ป้องกันแน่นที่สุด มีแสงศักดิ์สิทธิ์ทั้งโจมตีและรักษา', 'look-Berserker'],
  ['Hawkeye', 'ฮอว์คอาย', '#8bdb9a', 'นักธนูยิงไกลที่สุดในเกม คริสูง ตีเร็ว ต้องรักษาระยะห่างจากศัตรู', 'look-Berserker'],
  ['RuneMaster', 'รูนมาสเตอร์', '#62dfdf', 'นักดาบเวท ฟันแล้วปล่อยคลื่นดาบเวท ปักเสาอักขระโจมตี ตรึง ฟื้นฟู บัฟปาร์ตี้ และสาปศัตรู พร้อมระเบิดพิษหมู่', 'look-Berserker'],
  ['Elementalist', 'อีลีเมนทัลลิสต์', '#b685ff', 'บัญชาไฟ น้ำแข็ง สายฟ้า ดาเมจพื้นที่สูงที่สุด แต่ตัวบางที่สุด', 'look-Berserker'],
  ['Assassin', 'แอสแซสซิน', '#c97bff', 'มีดคู่ ตีเร็ว คริแรง พุ่งเข้าประชิดแล้วปิดฉากเป้าที่ใกล้ตาย', 'look-Berserker'],
  ['HighPriest', 'ไฮพรีสต์', '#ffdb86', 'รักษาและอวยพรเพื่อนร่วมทีม เกราะพลังให้ทั้งปาร์ตี้ และเผาศัตรูด้วยแสง', 'look-Berserker'],
  ['Inquisitor', 'อินควิซิเตอร์', '#8fd3ff', 'ค้อนและโล่กับเวทสายฟ้า ร่ายเมฆพายุให้ฟ้าผ่าหมู่ ปักเสาสายฟ้า และเรียกค้อนเทพธอร์ลงมาทุบ', 'look-Berserker'],
  ['Berserker', 'เบอร์เซิร์กเกอร์', '#ff4a3a', 'นักรบอาวุธสองมือ (ดาบใหญ่ ขวานใหญ่ ค้อนใหญ่) สะสม Rage จากการฟันและการถูกตี แล้วระเบิดออกเป็นสกิลรุนแรง ยิ่งเลือดน้อยยิ่งแรง', 'look-Berserker'],
  ['Reaver', 'รีเวอร์ · เลื่อนขั้น Lv60', '#c03cff', 'ร่างเลื่อนขั้นของ Berserker — สกิลทั้ง 12 วิวัฒน์เป็นเวอร์ชันมืด ดูดวิญญาณคืนเลือด ปิดฉากศัตรูที่เลือดน้อย และ Cataclysm Descent', 'look-Reaver'],
]
const opt = (o: SiteOpts) => ({ game: o.gameUrl ?? '/play', home: o.homeUrl ?? '/', wiki: o.wikiUrl ?? '/wiki', codex: o.codexUrl ?? '/guide', art: (o.art ?? '/art/').replace(/\/?$/, '/'), play: o.playAttr ?? '' });

function shell(title: string, o: ReturnType<typeof opt>, active: 'home' | 'wiki', body: string, extraCss = '') {
  /** [href, label, active, drawer glyph] — the bar shows the label in a painted slot, the mobile drawer adds the glyph */
  const links: [string, string, boolean, string][] = [[o.home, 'หน้าแรก', active === 'home', 'home'], [o.home + '#world', 'โลก', false, 'external'], [o.home + '#classes', 'อาชีพ', false, 'party'],
    [o.wiki, 'Wiki', active === 'wiki', 'book'], [o.wiki + '#bosses', 'บอส', false, 'trophy'], [o.home + '#patch', 'แพตช์', false, 'scroll']];
  return `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<meta name="description" content="SoulForge Online — MMORPG แฟนตาซีมืด 2.5D ไอโซเมตริก เล่นเป็น Berserker ล่าบอสหลายร้อยคน คราฟอุปกรณ์ 8 ระดับ">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Noto+Sans+Thai:wght@400;600;700&display=swap" rel="stylesheet">
<style>${SITE_CSS}${kitCss(o.art)}${FORGE_SITE_CSS}${extraCss}.sf-sound{position:fixed;right:16px;bottom:16px;z-index:50;display:flex;align-items:center;gap:6px;padding:6px 12px 6px 6px;border:1px solid #6b5326;border-radius:22px;background:rgba(14,11,16,.92);color:#dccfb3;font:600 13px 'Noto Sans Thai',sans-serif;cursor:pointer}.sf-sound img{width:30px;height:30px;opacity:.55}.sf-sound.on{border-color:#e2bd6a;color:#fff3d6}.sf-sound.on img{opacity:1}</style></head><body class="page-${active}">
<header class="top"><div class="top-in">
  <input type="checkbox" id="sf-nav" class="sf-navt" aria-hidden="true" tabindex="-1">
  <div class="sfbar">
    <a class="brand" href="${o.home}" aria-label="SoulForge Online — หน้าแรก"><span class="medal"></span>SOULFORGE</a>
    <nav class="main">${links.map(([h, t, on]) => `<a href="${h}" class="${on ? 'on' : ''}">${t}</a>`).join('<i class="sep"></i>')}</nav>
    <label class="burger" for="sf-nav" aria-label="เปิดเมนู"></label>
  </div>
  <label class="scrim" for="sf-nav" aria-label="ปิดเมนู"></label>
  <nav class="drawer" aria-label="เมนู"><div class="dtop"><label class="dclose" for="sf-nav" aria-label="ปิดเมนู"></label></div>${links.map(([h, t, on, g]) => `<a href="${h}" class="${on ? 'on' : ''}"><img src="${o.art}web/g-${g}.webp" alt="">${t}</a>`).join('')}<div class="dbot"></div></nav>
</div></header>
${body}
<footer class="foot"><div>SoulForge Online · Closed Beta · ข้อมูลทุกหน้าสร้างจากข้อมูลจริงของเกม (สมดุลเวอร์ชัน v${DEFAULT_CONFIG.version})</div><div><a href="${o.wiki}">Wiki</a> · <a href="${o.codex}">Codex</a> · <a href="${o.game}" ${o.play}>เข้าเกม</a></div></footer>
<button class="sf-sound" type="button" aria-pressed="false" title="เปิด/ปิดเสียงเพลงประกอบ"><img src="${o.art}icons/menu/sound.webp" alt=""><span>เสียง: ปิด</span></button>
<audio id="sf-bgm" src="${o.art.replace(/art\/$/, 'audio/')}music/title.mp3" loop preload="none"></audio>
<script>(()=>{const b=document.querySelector('.sf-sound'),a=document.getElementById('sf-bgm'),K='sf-site-sound';let on=false;try{on=localStorage.getItem(K)==='on'}catch(e){}
a.volume=.45;const show=()=>{b.setAttribute('aria-pressed',on);b.querySelector('span').textContent='เสียง: '+(on?'เปิด':'ปิด');b.classList.toggle('on',on)};
const apply=()=>{if(on)a.play().catch(()=>{});else a.pause();show()};
b.addEventListener('click',()=>{on=!on;try{localStorage.setItem(K,on?'on':'off')}catch(e){}apply()});
// browsers only start sound after the visitor interacts with the page
if(on)addEventListener('pointerdown',function go(){removeEventListener('pointerdown',go);apply()});show();})();</script>
</body></html>`;
}

/** "อัปเดตล่าสุด" on the home page — newest first; keep it to what a player notices */
const NEWS_DATE = '25 ต.ค. 2026';
const NEWS: [string, string][] = [
  ['🗺 สามเมืองหลวงสร้างใหม่ตามแผนที่', 'Hollow Reach · Dawnveil · Thornwatch วางผังใหม่ตามแผนที่เมือง — กำแพงสี่ด้าน ลานเข็มทิศกลางเมือง และอาคารบริการ 9 หลังติดป้าย วาดไว้ 8 มุมมอง หมุนกล้องแล้วอาคารเปลี่ยนมุมตาม'],
  ['⟁ ประตูวาร์ปทั้งสี่มุมเมือง', 'เดินเข้าวงที่มุมกำแพงเพื่อไปทุ่งล่าของภูมิภาคได้ทันที ไม่เสียค่าเดินทาง · ดันเจี้ยนอยู่สุดปลายทุ่งทางเหนือของแต่ละเมือง · ในเมืองไม่มีมอนสเตอร์'],
  ['🧭 NPC ครบทุกเมือง', 'ทั้ง 9 บริการ (ผู้นำทาง อาจารย์ ช่างตีบวก ร้านค้า เสบียง รับซื้อ ตลาด ผู้ประทานพร ผู้เฝ้าประตู) ยืนหน้าประตูอาคารของตัวเองในทุกเมืองหลวง · พรานเคสเทรลอยู่ข้างป้อมยาม Thornwatch'],
  ['☠ ดินแดนแห่งความโศกเศร้าย้ายไป Ashen Outskirts', 'หมู่บ้านร้าง ปราสาท มหาวิหาร และถ้ำ อยู่ในทุ่งนอกประตูทิศใต้ของ Hollow Reach (Lv 1–10) พร้อมบอส Grave Marshal'],
  ['🎞 ตัวละครและมอนสเตอร์ขยับแบบเฟรมจริง', 'Berserker ชาย/หญิง (กำลังทำภาพเคลื่อนไหว 8 ทิศ) มอนสเตอร์ 28 ชนิด และบอส Abyssal Forge Titan มีท่ายืน เดิน วิ่ง โจมตี และสกิลแบบภาพวาดทีละเฟรม'],
  ['📱 เล่นบนมือถือได้เต็มรูปแบบ', 'หน้าจอแยกชุด PC กับมือถือ · มือถือมีจอยสติ๊ก วงล้อโจมตี + สกิล 4 ปุ่ม และกระเป๋าแบบดึงขึ้นจากด้านล่าง'],
  ['🎒 กระเป๋า 10×10 และสี Tier', 'ไอเทมกินพื้นที่ตามขนาดจริง ลากวาง ลากสวมได้ · ช่องอุปกรณ์ 12 ช่อง · ป้ายระดับ T1–T8 ทุกไอเทม'],
  ['🔥 ไฟเตาหลอม · Tooltip สองชั้น', 'เกจกลางแถบสกิลลุกโชนเมื่อสู้ต่อเนื่อง · กด Alt ค้างดูช่วงค่าออปชัน และเทียบกับของที่ใส่อยู่'],
  ['✦ กลุ่มดาววิญญาณ', 'ต้นไม้สกิลแบบแผนที่ดาว ลากและซูมได้ · หน้าสเตตัสแบ่งหมวด พับเก็บได้ เห็นค่าที่จะเปลี่ยนก่อนสวม'],
];

const DIR_TH = { top: 'เหนือ', right: 'ตะวันออก', bottom: 'ใต้', left: 'ตะวันตก' } as const;
const lvOf = (id: CityId) => { const l = CITIES[id].levels; return l ? `Lv ${l[0]}${l[1] > l[0] ? '–' + l[1] : ''}` : 'เมืองหลวง'; };
/** the four corner waygates of a capital and where they lead (content.portalsOf / CAPITAL_GATES), dungeon doors included */
function gateList(city: MainCityId, wiki: string) {
  return `<ul class="gates">${[...portalsOf(city)].sort((p, q) => ORDER.indexOf(p.dir) - ORDER.indexOf(q.dir)).map(p => { const t = CITIES[p.to], d = portalsOf(p.to).find(q => q.kind === 'dungeon');
    return `<li><b>⟁ ประตู${DIR_TH[p.dir]}</b> → ${t.parent ? `<a href="${wiki}#field-${p.to}">${esc(t.name)}</a> · ${esc(FIELD_ART[p.to]?.th ?? '')}` : `${esc(t.name)} <small>(ทางลัดเมืองหลวง)</small>`} <span class="chip">${lvOf(p.to)}</span>${d ? `<br><small>↳ ปลายทุ่งมีประตูดันเจี้ยน ${esc(CITIES[d.to].name)} · ${esc(FIELD_ART[d.to]?.th ?? '')} <span class="chip elite">${lvOf(d.to)}</span></small>` : ''}</li>`; }).join('')}</ul>`;
}
const ORDER = ['top', 'right', 'bottom', 'left'];
const CAPS: MainCityId[] = ['hollow', 'dawnveil', 'thornwatch'];

/** home page: hero, classes (with their voice lines), the Sorrowlands, raid bosses, crafting and the way in */
export function buildHomeHtml(opts: SiteOpts = {}) {
  const o = opt(opts), a = o.art;
  const classes = CLASSES.map(([k, th, c, d, look]) => `<article class="hcls" style="--cc:${c}"><div class="hpics"><img src="${a}sprites/m-${look}.webp" alt="${k} ชาย" loading="lazy"><img src="${a}sprites/f-${look}.webp" alt="${k} หญิง" loading="lazy"></div>
    <h3>${k}<small>${th}</small></h3><p>${d}</p><q>${esc(VOICE_LINES[k])}</q></article>`).join('');
  const zones = zoneEntries().map(z => `<a class="zcard" href="${o.wiki}#zone-${z.id}" style="--zc:${z.tint}"><img src="${a}wiki/zone-${z.id}.webp" alt="${esc(z.th)}" loading="lazy"><div><h4>${esc(z.th)}<small>${esc(z.name)} · Lv.${z.levels[0]}–${z.levels[1]}</small></h4><p>${esc(z.story)}</p></div></a>`).join('');
  const bosses = BOSSES.map(b => `<a class="bcard" href="${o.wiki}#boss-${b.name.toLowerCase().replace(/\s+/g, '-')}"><img src="${a}sprites/${b.name.toLowerCase().replace(/\s+/g, '-')}.webp" alt="${esc(b.name)}" loading="lazy"><div><small>${esc(b.title)} · Lv.${b.level}</small><h4>${esc(b.name)}</h4><p>${esc(b.th)} — ${esc(b.home)}</p></div></a>`).join('');
  const body = `<section class="hero"><div class="hero-art"><img src="${a}ui-forge/cathedral-hero.png" alt="มหาวิหาร SoulForge"></div><div class="hero-in">
    <span class="hero-eyebrow">SOULFORGE ONLINE</span><h1>A DARKER<br>WORLD AWAITS</h1><p class="tag">ดินแดนต้องสาปที่วิญญาณถูกหลอมเป็นอาวุธ — MMORPG แฟนตาซีมืด 2.5D ไอโซเมตริก</p>
    <div class="hero-cta"><a class="big-play" href="${o.game}" ${o.play} aria-label="เข้าเกม">▶ เข้าเกม</a></div>
    <div class="pills"><span>Berserker → Reaver · ชาย/หญิง</span><span>เล่นได้ทั้ง PC และมือถือ</span><span>ล่าบอส 15–30 นาที</span><span>คราฟ 8 ระดับ T1–T8</span><span>ตลาด SoulGod</span><span>AUTO ล่าอัตโนมัติ</span></div></div></section>
  <section id="patch" class="band"><header><h2>แพตช์โน้ต · เวอร์ชัน ${GAME_VERSION}</h2><p>รายละเอียดทุกการอัปเดตของเกม เวอร์ชันล่าสุดอยู่บนสุด</p></header>${PATCHES.map(p => `<details class="card" ${p.version === GAME_VERSION ? 'open' : ''}><summary><b>v${p.version}</b> · ${esc(p.title)} <small>${p.date}</small></summary><ul>${p.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>${p.compat ? `<small class="muted">ต้องใช้ไคลเอนต์ ≥ ${p.compat.minClient} · ฐานข้อมูล ${p.compat.db}</small>` : ''}</details>`).join('')}</section>
  <section id="news" class="band news"><header><h2>อัปเดตล่าสุด</h2><p>Closed Beta · ${NEWS_DATE}</p></header><div class="ngrid">${NEWS.map(n => `<article><b>${n[0]}</b><p>${n[1]}</p></article>`).join('')}</div></section>
  <section id="classes" class="band"><header><h2>8 อาชีพ</h2><p>เลือกได้ตอนสร้างตัวละคร — Berserker เลื่อนขั้นเป็น Reaver ที่ Lv60 · ภาพเฉพาะของแต่ละอาชีพกำลังทำ</p></header><div class="hcls-grid">${classes}</div></section>
  <section id="world" class="band"><header><h2>สามเมืองหลวง · ประตูวาร์ปสู่ทุ่งล่า</h2><p>เมืองกำแพงสี่ด้าน อาคารบริการครบ 9 หลังในทุกเมือง ในเมืองไม่มีมอนสเตอร์ — เดินเข้าวงประตูวาร์ปที่มุมกำแพงเพื่อออกล่า</p></header>
    <div class="capgrid">${CAPS.map(c => `<article class="cap"><a href="${o.wiki}#map"><img class="wide-img" src="${a}world/${c}/city.webp" alt="${esc(CITIES[c].name)}" loading="lazy"></a><h3>${esc(CITIES[c].name)} <small>${esc(CITIES[c].subtitle)}</small></h3>${gateList(c, o.wiki)}</article>`).join('')}</div>
    <h3 class="sub" style="text-align:center;margin-top:34px">ดินแดนแห่งความโศกเศร้า · Ashen Outskirts</h3><p class="muted" style="text-align:center">ทุ่งนอกประตูทิศใต้ของ Hollow Reach — ซากหมู่บ้าน ปราสาท มหาวิหาร และถ้ำ แต่ละเขตมี Elite ที่มีสกิลของตัวเอง</p>
    <div class="zgrid">${zones}</div></section>
  <section class="band"><header><h2>บอสที่ต้องรวมพล</h2><p>เลือดบอสปรับตามจำนวนผู้ท้าชิง ออกแบบให้ใช้เวลา ${DEFAULT_CONFIG.raid.minMinutes}–${DEFAULT_CONFIG.raid.maxMinutes} นาที · จบแล้วจัดอันดับดาเมจ 10 อันดับ อันดับ 1 มีโอกาส 50% ได้ไอเทมระดับสูง</p></header><div class="bgrid">${bosses}</div></section>
  <section class="band feats"><div><h3>⚒ คราฟและคริสตัล</h3><p>ใช้ SoulGod และวัตถุดิบเพิ่มขึ้นตามระดับ · Legendary 75% · God 70% · Pre-arch 60% · Arch 45% · พลาดได้คริสตัลสีตามระดับ ครบ 3 เม็ด = สำเร็จ 100% เลือกประเภทอาวุธได้</p></div>
    <div><h3>⚙ AUTO อัจฉริยะ</h3><p>ตั้ง % ดื่มยา กินอาหารบัฟ เปิด/ปิดสกิลทีละช่อง · รอ Rage ให้พอก่อนกดสกิล และไม่ขัดจังหวะ Whirlwind ที่กำลังหมุน</p></div>
    <div><h3>👘 ชุดแฟชั่น</h3><p>${COSTUMES.map(c => esc(c.th)).join(', ')} — สวมแล้วเปลี่ยนรูปลักษณ์ทั้งเดิน วิ่ง โจมตี ร่ายสกิล ใส่ได้ทั้ง Berserker และ Reaver</p></div>
    <div><h3>❡ เควสนำทาง</h3><p>${QUESTS.length} เควสเรื่องหลักพาตั้งแต่ตื่นในวิหารจนถึงล้ม Grave Marshal พร้อมคำแนะนำที่ขึ้นครั้งเดียว</p></div></section>
  <section class="band cta"><h2>พร้อมหลอมวิญญาณแล้วหรือยัง?</h2><a class="big-play" href="${o.game}" ${o.play} aria-label="เข้าเกม">▶ เข้าเกม</a><p>Closed Beta — ลงทะเบียนด้วยโค้ดเชิญ</p></section>`;
  return shell('SoulForge Online', o, 'home', body);
}

/** the player Wiki: beginner guide, quests, map, monsters (with stats), elites (+1 skill), bosses (lore, no numbers), items, crafting */
export function buildWikiHtml(opts: SiteOpts = {}) {
  const o = opt(opts), a = o.art;
  const sec = (id: string, title: string, sub: string, body: string) => `<section id="${id}"><header><h2>${title}</h2><p>${sub}</p></header>${body}</section>`;
  // beginner guide = the in-game one-time tips, in play order
  const guide = `<ol class="steps">${TIPS.map(t => `<li><b>${esc(t.title)}</b>${t.keys ? ` <kbd>${esc(t.keys)}</kbd>` : ''}<p>${esc(t.body)}</p></li>`).join('')}</ol>`;
  const npcName = Object.fromEntries(NPCS.map(n => [n.id, n.th]));
  const quests = `<div class="qgrid">${QUESTS.map((q, i) => `<article class="card"><small class="muted">#${i + 1} · Lv.${q.minLevel}+${q.requires ? ' · ต่อจาก ' + esc(QUESTS.find(x => x.id === q.requires)?.title ?? '') : ''}</small><h4>${esc(q.title)}</h4><p>${esc(q.story)}</p>
    <ul>${q.objectives.map(ob => `<li>${esc(ob.text)}</li>`).join('')}</ul><p class="muted">รับจาก <b>${esc(npcName[q.giver] ?? q.giver)}</b> · ส่งที่ <b>${esc(npcName[q.turnIn] ?? q.turnIn)}</b><br>💡 ${esc(q.hint)}</p>
    <p class="rw">EXP ${fmt(q.rewards.xp)} · SoulGod ${fmt(q.rewards.soulGod)}${(q.rewards.items ?? []).map(([id, n]) => ` · ${esc(MATERIAL_TH[id] ?? FOOD_ITEMS.find(f => f.id === id)?.th ?? id)} ×${n}`).join('')}</p></article>`).join('')}</div>`;
  const cities = cityEntries().map(c => `<article class="card city" id="city-${c.id}"><img src="${a}world/${c.id}/city.webp" alt="${esc(c.name)}" loading="lazy"><h4>${esc(c.name)} <small>${esc(c.subtitle)}</small></h4><p>${esc(c.description)}</p>${gateList(c.id as MainCityId, '')}</article>`).join('');
  // every field and dungeon with its painting, the gate it hangs off, its levels and monsters
  const fieldCard = (id: CityId) => { const t = CITIES[id], art = FIELD_ART[id]!, g = fieldGate(id), from = g ? `ประตู${DIR_TH[g.dir]}ของ ${CITIES[g.city].name}` : `ปลายทุ่ง ${CITIES[t.entrance!].name}`;
    return `<article class="card field" id="field-${id}"><img src="${a}world/${art.city}/${art.map}.webp" alt="${esc(art.th)}" loading="lazy"><h4>${esc(art.th)} <small>${esc(t.name)}</small></h4><p class="muted">${t.dungeon ? 'ดันเจี้ยน · ' : ''}${lvOf(id)} · เข้าทาง${from}</p><p>${(t.species ?? []).map(sp => `<span class="chip">${esc(sp)}</span>`).join('')}</p></article>`; };
  const fields = ZONE_IDS.map(fieldCard).join(''), dungeons = DUNGEON_IDS.map(fieldCard).join('');
  const zones = zoneEntries().map(z => `<article class="card zone" id="zone-${z.id}" style="--zc:${z.tint}"><img src="${a}wiki/zone-${z.id}.webp" alt="${esc(z.th)}" loading="lazy"><div><h4>${esc(z.th)} <small>${esc(z.name)}</small></h4>
    <p class="muted">${({ village: 'หมู่บ้านร้าง', castle: 'ปราสาทพัง', cathedral: 'มหาวิหาร', cave: 'ถ้ำ' } as Record<string, string>)[z.kind]} · Lv.${z.levels[0]}–${z.levels[1]} · พิกัด (${z.x}, ${z.z})</p><p>${esc(z.story)}</p>
    <p>${z.spawns.map(s => `<span class="chip ${s.boss ? 'boss' : s.elite ? 'elite' : ''}">${s.boss ? '☠ ' : s.elite ? '★ ' : ''}${esc(s.species)} Lv.${s.level}${s.count ? ' ×' + s.count : ''}</span>`).join('')}</p></div></article>`).join('');
  const mons = monsterEntries();
  const card = (m: ReturnType<typeof monsterEntries>[number]) => `<article class="mon ${m.elite ? 'elite' : ''}"><div class="mimg"><img src="${a}sprites/${m.id}.webp" alt="${esc(m.name)}" loading="lazy"></div><div class="mbody">
    <h4>${m.elite ? '★ ' : ''}${esc(m.name)} <small>Lv.${esc(m.levels)}${m.elite ? ' · ELITE' : ''}</small></h4>${m.th ? `<p class="muted">${esc(m.th.look)} · ${esc(m.th.motion)}</p>` : ''}
    <div class="mstats"><span>HP<b>${fmt(m.hp)}</b></span><span>MP<b>${fmt(m.mp)}</b></span><span>ATK<b>${fmt(m.attack)}</b></span><span>DEF<b>${fmt(m.defense)}</b></span></div>
    ${m.spawns.length ? `<p class="mspawn"><b>จุดเกิด:</b> ${m.spawns.map(s => `${esc(s.where)}${s.levels ? ` (Lv.${esc(s.levels)})` : ''}${s.pos ? ` · พิกัด ${s.pos[0]}, ${s.pos[1]}` : ''}`).join(' · ')}</p>` : ''}${m.skill ? `<div class="mskill"><b>สกิล: ${esc(m.skill.name)} · ${esc(m.skill.th)}</b><p>${esc(m.skill.desc)}</p></div>` : ''}<small class="muted">ค่าที่เลเวลกลาง Lv.${m.level}</small></div></article>`;
  const monsters = `<div class="mgrid">${mons.filter(m => !m.elite).map(card).join('')}</div>`;
  const elites = `<div class="mgrid">${mons.filter(m => m.elite).map(card).join('')}</div>`;
  const bosses = BOSSES.map(b => { const r = bossRaidInfo(b), id = b.name.toLowerCase().replace(/\s+/g, '-');
    return `<article class="boss" id="boss-${id}"><div class="bimg"><img src="${a}sprites/${id}.webp" alt="${esc(b.name)}" loading="lazy"></div><div>
      <small class="muted">${esc(b.title)} · Lv.${b.level} · ${esc(b.home)}</small><h3>${esc(b.name)} <small>${esc(b.th)}</small></h3>
      <h5>ที่มา</h5><p>${esc(b.origin)}</p><h5>ตำนาน</h5><p>${esc(b.story)}</p>
      <h5>สกิลของบอส</h5><ul>${b.skills.map(s => `<li><b>${esc(s.name)}</b> — ${esc(s.desc)}</li>`).join('')}</ul>
      <h5>ช่วงการต่อสู้</h5><ul>${b.phases.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      <div class="raidnote">⚔ บอสรวมพล — ไม่เปิดเผยค่าพลัง · เลือดปรับตามจำนวนผู้ท้าชิง (ขั้นต่ำ ${DEFAULT_CONFIG.raid.minPlayers} คน) ให้ใช้เวลา ${r.minutes[0]}–${r.minutes[1]} นาที ขึ้นกับดาเมจของแต่ละคน</div></div></article>`; }).join('');
  const rw = WIKI_REWARDS.ranks.map((r, i) => `<tr><td class="rk">${i + 1}</td><td>${Math.round(r.soulGodPct * 100)}% ของกองรางวัล</td><td>${r.guaranteed ?? '—'}</td><td><b style="color:${i === 0 ? '#ffd36e' : 'inherit'}">${Math.round(r.highTierChance * 100)}%</b></td><td>${r.materials.map(([id, n]) => `${esc(MATERIAL_TH[id] ?? id)} ×${n}`).join(', ')}</td></tr>`).join('');
  const dash = `<table class="wide"><tr><th>อันดับ</th><th>SoulGod</th><th>การันตี</th><th>โอกาสไอเทมระดับสูง</th><th>วัตถุดิบ</th></tr>${rw}<tr><td>11+</td><td colspan="4">รางวัลร่วมรบ: แร่หลอมวิญญาณ ×10 · Eclipse Shard ×1 (ต้องทำดาเมจ ≥ 1%)</td></tr></table>
    <p class="muted">ไอเทมระดับสูงสุ่มจาก ${WIKI_REWARDS.highTiers.map(([r, w]) => `<b style="color:${RC[r]}">${r}</b> ${w}%`).join(' · ')}</p>`;
  const ct = craftTable();
  const craft = `<table class="wide"><tr><th>ระดับ</th><th>โอกาสสำเร็จ</th><th>อาวุธ (SoulGod)</th><th>เกราะ</th><th>หมวก/ถุงมือ/รองเท้า/แหวน</th><th>วัตถุดิบ (อาวุธ)</th><th>ถ้าพลาด</th></tr>${ct.map(r => `<tr><td style="color:${RC[r.rarity]}"><b>${r.rarity}</b></td><td>${Math.round(r.chance * 100)}%</td><td>${fmt(r.weapon.soulGod)}</td><td>${fmt(r.armor.soulGod)}</td><td>${fmt(r.other.soulGod)}</td>
    <td>${r.weapon.materials.map(m => `${esc(MATERIAL_TH[m.id] ?? m.id)} ×${m.qty}`).join('<br>')}</td><td>${r.chance < 1 ? `<span style="color:${CRYSTAL_INFO[r.rarity as keyof typeof CRYSTAL_INFO].color}">● ${esc(CRYSTAL_INFO[r.rarity as keyof typeof CRYSTAL_INFO].th)} ×1</span>` : '—'}</td></tr>`).join('')}</table>
    <div class="grid2"><div class="card"><h4>คริสตัลชดเชย</h4><p>คราฟระดับ Legendary ขึ้นไปไม่สำเร็จ = SoulGod และวัตถุดิบสลาย แต่ได้คริสตัลสีตามระดับ 1 เม็ด สะสมระดับเดียวกันครบ <b>3 เม็ด</b> กด “คราฟด้วยคริสตัล” = สำเร็จ <b>100%</b> เลือกอาชีพและประเภทไอเทมได้ 1 ชิ้น คริสตัลหายทันที ไอเทมที่ได้ขายหรือใช้ได้ตามปกติ</p>
      <p>${Object.entries(CRYSTAL_INFO).map(([r, c]) => `<span class="chip" style="border-color:${c.color};color:${c.color}">● ${esc(c.th)} (${r})</span>`).join('')}</p></div>
      <div class="card"><h4>วัตถุดิบ</h4><ul><li><b>แร่หลอมวิญญาณ</b> — ดรอปจากมอนสเตอร์ทุกชนิด (มากขึ้นในเขตซากปรักหักพัง)</li><li><b>Eclipse Shard</b> — Elite และบอส</li><li><b>Regent Core</b> — Elite (หายาก) และบอส</li><li><b>Solar Heart</b> — บอสเท่านั้น</li></ul><p class="muted">คราฟที่แบรนน็อค มือเหล็ก (โรงตีเหล็ก) แท็บ “คราฟอุปกรณ์” · ค่าคราฟ SoulGod ถูกเผาออกจากระบบ</p></div></div>`;
  const items = `<table class="wide"><tr>${Object.keys(RC).map(r => `<th style="color:${RC[r]}">${r}</th>`).join('')}</tr><tr>${Object.keys(RC).map((_, i) => `<td>Tier ${i}</td>`).join('')}</tr></table>
    <div class="grid2"><div class="card"><h4>ช่องสวมใส่</h4><p>อาวุธ · เกราะ · หมวก · ถุงมือ · รองเท้า · แหวน/ตรา · <b>ชุดแฟชั่น</b> — เปิดกระเป๋า (I) แล้วลากไอเทมไปวางในช่อง หรือดับเบิลคลิก อาวุธมี 3 ประเภท: ดาบใหญ่ ขวานใหญ่ ค้อนใหญ่ (สองมือ ไม่มีโล่)</p></div>
      <div class="card"><h4>อาหารบัฟ (15 นาที)</h4><ul>${FOOD_ITEMS.map(f => `<li><b>${esc(f.th)}</b> — ${Object.entries(f.buff).map(([k, v]) => `${k} +${v}`).join(', ')} · ${fmt(f.price)} SG</li>`).join('')}</ul></div></div>`;
  const auto = `<div class="grid2"><div class="card"><h4>ปุ่ม AUTO (ข้างลูกแก้วมานา)</h4><ul><li>ดื่มยา HP/MP เมื่อต่ำกว่า % ที่ตั้ง</li><li>กินอาหารบัฟเมื่อหมดเวลา</li><li>เปิด/ปิดสกิลทีละช่องจาก 6 ช่อง</li><li>ล่าในรัศมีรอบจุดที่เปิด · ขยับเองแล้วพัก 3 วินาที</li></ul></div>
    <div class="card"><h4>Berserker กับ AUTO</h4><ul><li>สกิลที่ใช้ Rage จะรอจนเกจ Rage พอ</li><li>Blood Howl ใช้เมื่อเริ่มสู้เพื่อเติม Rage</li><li>ไม่กดสกิลซ้อนระหว่าง Whirlwind / Reaping Cyclone</li></ul></div></div>`;
  const nav: [string, string][] = [['guide', 'เริ่มต้นผจญภัย'], ['quests', 'เควส'], ['map', 'แผนที่'], ['monsters', 'มอนสเตอร์'], ['elites', 'Elite'], ['bosses', 'บอส'], ['dashboard', 'อันดับบอส'], ['items', 'ไอเทม'], ['craft', 'การคราฟ'], ['auto', 'AUTO']];
  const body = `<div class="wiki"><aside class="toc"><b>Wiki</b>${nav.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('')}<a class="mini-play" href="${o.game}" ${o.play} aria-label="เข้าเกม">▶ เข้าเกม</a></aside><main>
    <div class="whead"><h1>SoulForge Wiki</h1><p>ทุกอย่างที่นักผจญภัยต้องรู้ ตั้งแต่ก้าวแรกในวิหารจนถึงการล้มบอสรวมพล — ข้อมูลสร้างจากเกมจริง</p></div>
    ${sec('guide', 'เริ่มต้นผจญภัย', 'คำแนะนำที่จะขึ้นในเกมครั้งเดียว (เกมจำไว้ว่าเคยแนะนำแล้ว)', guide)}
    ${sec('quests', 'เควส', `${QUESTS.length} เควสหลัก — “!” สีทองเหนือหัว NPC = รับเควส · “?” = ส่งเควส`, quests)}
    ${sec('map', 'แผนที่', 'เมืองหลวง 3 แห่ง ประตูวาร์ปทั้งสี่มุม ทุ่งล่า 10 แห่ง และดันเจี้ยน 3 แห่ง', `<div class="cgrid">${cities}</div><h3 class="sub">ทุ่งล่า</h3><div class="cgrid">${fields}</div><h3 class="sub">ดันเจี้ยน</h3><div class="cgrid">${dungeons}</div><h3 class="sub">Ashen Outskirts — ดินแดนแห่งความโศกเศร้า (Sorrowlands) เขตล่ามอนสเตอร์</h3><img class="wide-img" src="${a}wiki/sorrowlands.webp" alt="" loading="lazy"><div class="zlist">${zones}</div>`)}
    ${sec('monsters', 'มอนสเตอร์', 'พลังโจมตี ป้องกัน เลือด และมานา (ค่าที่เลเวลกลางของช่วง)', monsters)}
    ${sec('elites', 'มอนสเตอร์ Elite', 'ป้ายชื่อทอง ตัวใหญ่กว่า เลือด ×1.5 · มีสกิลของตัวเอง 1 สกิล พร้อมวงเตือนบนพื้น', elites)}
    ${sec('bosses', 'บอส', 'ตำนาน ที่มา และสกิล — บอสไม่เปิดเผยค่าพลัง เพราะปรับตามจำนวนผู้ท้าชิง', bosses)}
    ${sec('dashboard', 'Dashboard หลังล่าบอส', 'จัดอันดับดาเมจ 10 อันดับ รางวัลลดหลั่น — อันดับ 1 มีโอกาส 50% ได้ไอเทมระดับสูงจากบอส', dash)}
    ${sec('items', 'ไอเทมและระดับ', '8 ระดับ (Tier 0–7) · ระดับสูงมีออปชันพิเศษ', items)}
    ${sec('craft', 'การคราฟอุปกรณ์', 'SoulGod และวัตถุดิบเพิ่มขึ้นตามระดับ · อาวุธ ×1.5 เกราะ ×1.25', craft)}
    ${sec('auto', 'ระบบ AUTO', 'ล่าอัตโนมัติตามเงื่อนไขที่ตั้ง', auto)}
  </main></div>
  <script>const L=[...document.querySelectorAll('.toc a[href^="#"]')];const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)L.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-30% 0px -60% 0px'});document.querySelectorAll('main section').forEach(s=>io.observe(s));</script>`;
  void MONSTER_TH;
  return shell('SoulForge Wiki', o, 'wiki', body);
}


/** the painted website kit (reference/compact-cast-v2/sprit-model/uxui/website, cut by blender/sprites/cut_webkit.py →
 *  art/web/): frames are clean nine-slices with the gem crests as separate pieces, buttons are the painted plates, the
 *  big play button is the painted "เข้าเกมส์" (its four states), the header is the painted top bar. Layered over SITE_CSS. */
export function kitCss(art: string) {
  const u = (f: string) => `url(${art}web/${f}.webp)`;
  return `
body{background:radial-gradient(ellipse at 50% -10%,#2a1216,transparent 55%),radial-gradient(ellipse at 50% 120%,#1a0c10,transparent 60%),var(--bg)}
::-webkit-scrollbar{width:11px;height:11px}::-webkit-scrollbar-track{background:#0a080b}::-webkit-scrollbar-thumb{background:linear-gradient(90deg,#3a2a18,#8a6a34,#3a2a18);border:2px solid #0a080b;border-radius:6px}
/* header: the painted top bar — medallion cap | rails (tiled) | tip, one border-image; links sit in painted slots with gem
   separators, the lit red plate marks the page you are on. Below 1100px the links move into the painted drawer. */
.top{--s:.72;background:linear-gradient(180deg,#060507 0,rgba(6,5,8,.9) 62%,rgba(6,5,8,0))!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;pointer-events:none}
.top::after{display:none}.top-in{display:block!important;max-width:1360px!important;padding:6px 16px 0!important;min-height:0!important}
.sfbar{pointer-events:auto;position:relative;display:flex;align-items:flex-start;box-sizing:border-box;height:calc(170px*var(--s));margin-bottom:calc(-38px*var(--s));padding:calc(61px*var(--s)) calc(52px*var(--s)) 0 calc(244px*var(--s));
  background:${u('nav-l')} left top/auto 100% no-repeat,${u('nav-r')} right top/auto 100% no-repeat;filter:drop-shadow(0 10px 16px rgba(0,0,0,.7))}
.sfbar::before{content:"";position:absolute;z-index:-1;top:0;bottom:0;left:calc(244px*var(--s) - 1px);right:calc(52px*var(--s) - 1px);background:${u('nav-mid')} left top/auto 100% repeat-x}
.sfbar::after{content:"";position:absolute;left:50%;top:calc(128px*var(--s));width:calc(50px*var(--s));height:calc(41px*var(--s));transform:translateX(-50%);background:${u('nav-spike')} center/contain no-repeat;pointer-events:none}
.sfbar .brand{position:relative;display:flex;align-items:center;height:calc(61px*var(--s));padding:0 14px 0 6px;font:900 calc(26px*var(--s)) Cinzel,Georgia,serif;letter-spacing:.24em;color:#f2e3bf;text-decoration:none;text-shadow:0 2px 3px #000,0 0 14px rgba(255,90,40,.25);white-space:nowrap}
.sfbar .medal{position:absolute;left:calc(-244px*var(--s));top:calc(-61px*var(--s));width:calc(230px*var(--s));height:calc(170px*var(--s))}
.sfbar .brand:hover{color:#fff3d6}
.sfbar nav.main{display:flex!important;align-items:center;margin:0 calc(6px*var(--s)) 0 auto;gap:0;flex:none}.top .drawer a{border:0;border-radius:0}
.sfbar nav.main a{display:flex;align-items:center;justify-content:center;height:calc(61px*var(--s));min-width:calc(128px*var(--s));box-sizing:border-box;padding:0 calc(10px*var(--s));border:0 solid transparent!important;border-width:0 calc(14px*var(--s))!important;
  border-image:${u('nav-slot')} 0 14 fill / 0 calc(14px*var(--s)) stretch!important;color:#dccfb3!important;font:600 calc(19px*var(--s)) 'Noto Sans Thai',sans-serif;letter-spacing:.02em;text-decoration:none;text-shadow:0 1px 2px #000;transition:filter .15s,color .15s;white-space:nowrap}
.sfbar nav.main a:hover{filter:brightness(1.35) sepia(.25);color:#ffe9b8!important}
.sfbar nav.main a.on{border-image:${u('nav-on')} 6 24 fill / calc(6px*var(--s)) calc(24px*var(--s)) / calc(6px*var(--s)) 0 stretch!important;border-width:0 calc(24px*var(--s))!important;color:#fff4dc!important;font-weight:700;text-shadow:0 1px 2px #3a0606,0 0 10px rgba(255,170,90,.55)}
.sfbar .sep{flex:none;width:calc(22px*var(--s));height:calc(66px*var(--s));margin-top:calc(-5px*var(--s));background:${u('nav-sep')} center/100% 100% no-repeat}
.burger{display:none;margin-left:auto;flex:none;cursor:pointer;width:calc(64px*var(--s));height:calc(61px*var(--s));background:${u('ico-menu')} center/contain no-repeat;filter:drop-shadow(0 2px 3px #000)}.burger:hover{filter:brightness(1.3)}
.sf-navt{position:absolute;opacity:0;pointer-events:none}
.top .scrim{display:none}.top .drawer{display:none}
.top .drawer{position:fixed;z-index:40;top:calc(110px*var(--s));right:14px;width:274px;pointer-events:auto;filter:drop-shadow(0 18px 30px rgba(0,0,0,.85))}
.top .drawer .dtop{height:102px;background:${u('drawer-top')} center/100% 100% no-repeat;position:relative}.drawer .dbot{height:43px;background:${u('drawer-bot')} center/100% 100% no-repeat}
.dclose{position:absolute;right:20px;top:34px;width:48px;height:48px;cursor:pointer}
.top .drawer a{display:flex;align-items:center;gap:16px;height:48px;padding:0 40px 0 26px;background:${u('drawer-row')} center/100% 100% no-repeat;color:#dccfb3;font:600 15px 'Noto Sans Thai',sans-serif;text-decoration:none}
.top .drawer a img{width:28px;height:26px;object-fit:contain}.top .drawer a:hover{color:#ffe9b8;filter:brightness(1.25)}
.top .drawer a.on{color:#fff4dc;background:linear-gradient(90deg,rgba(200,40,20,.0),rgba(220,60,20,.28) 30%,rgba(220,60,20,.28) 70%,rgba(200,40,20,0)) center/86% 70% no-repeat,${u('drawer-row')} center/100% 100% no-repeat;text-shadow:0 0 10px rgba(255,150,80,.5)}
.toc{top:118px!important}.top .sf-navt:checked~.drawer{display:block}.top .sf-navt:checked~.scrim{display:block;position:fixed;inset:0;z-index:39;background:rgba(4,3,5,.6);pointer-events:auto}
@media(max-width:1100px){.top{--s:.6}.sfbar nav.main{display:none!important}.burger{display:block}}
@media(max-width:560px){.top{--s:.5}.top-in{padding:4px 8px 0!important}.sfbar .brand{font-size:15px;letter-spacing:.18em}.drawer{right:8px;width:258px}}
@media(min-width:1101px){.top .sf-navt:checked~.drawer,.top .sf-navt:checked~.scrim{display:none}}
.play-btn{width:218px;height:90px;margin:-8px 0 -34px;padding:0;border:0;border-radius:0;background:${u('play')} center/contain no-repeat;box-shadow:none;filter:drop-shadow(0 10px 18px rgba(0,0,0,.7)) drop-shadow(0 0 14px rgba(255,90,30,.25));font-size:0;color:transparent;transition:filter .15s,transform .1s}
.play-btn span,.play-btn small,.big-play,.mini-play{font-size:0!important;color:transparent!important}
.play-btn:hover{background-image:${u('play-hover')};filter:drop-shadow(0 10px 18px rgba(0,0,0,.7)) drop-shadow(0 0 22px rgba(255,120,40,.45));transform:none}.play-btn:active{background-image:${u('play-down')};transform:translateY(1px)}
.big-play{width:320px;height:132px;padding:0;border:0;border-radius:0;background:${u('play')} center/contain no-repeat;box-shadow:none;filter:drop-shadow(0 14px 22px rgba(0,0,0,.8)) drop-shadow(0 0 30px rgba(255,90,30,.3));transition:filter .15s,transform .1s}
.big-play:hover{background-image:${u('play-hover')};filter:drop-shadow(0 14px 22px rgba(0,0,0,.8)) drop-shadow(0 0 40px rgba(255,120,40,.5))}.big-play:active{background-image:${u('play-down')};transform:translateY(2px)}
.hero-cta{align-items:center;gap:6px}
.ghost{border:12px solid transparent;border-width:12px 18px;border-image:${u('plate-gold')} 22 30 fill / 12px 18px stretch;padding:2px 10px;color:#f6e3b4;font-size:15px;transition:filter .15s}.ghost:hover{filter:brightness(1.2)}
.pills span{border:8px solid transparent;border-width:8px 12px;border-image:${u('chip-dark')} 14 20 fill / 8px 12px stretch;border-radius:0;padding:0 4px;background:none;color:#cfc4ab}
/* hero */
/* section titles: the gem divider under the title */
.band>header h2::after{content:"";display:block;width:min(398px,80vw);height:31px;margin:6px auto 0;background:${u('divider')} center/contain no-repeat}
section>header{border-bottom:0!important;position:relative;padding-bottom:16px!important}main section>header::after{content:"";position:absolute;left:0;bottom:0;width:min(397px,100%);height:20px;background:${u('divider-thin')} left center/contain no-repeat}
/* every card: the clean painted frame on dark leather, gem crest on the featured ones */
.news article,.hcls,.zcard,.bcard,.feats>div,.card,.mon,.steps li,.boss,.toc{position:relative;border:22px solid transparent!important;border-image:${u('frame')} 44 / 22px round!important;border-radius:0!important;
  background:linear-gradient(180deg,rgba(16,12,16,.55),rgba(7,6,9,.78)) padding-box,${u('tex-dark')} center/cover padding-box,#0d0b0e padding-box!important;box-shadow:0 12px 26px rgba(0,0,0,.55)}
.news article{padding:4px 6px}.hcls{padding:2px 4px}.feats>div{padding:4px 6px}.card{padding:4px 6px}.mon{padding:0}.steps li{padding:4px 6px 4px 46px}.boss{padding:6px}
.zcard,.bcard{overflow:visible;transition:transform .15s,filter .15s}.zcard:hover,.bcard:hover,.hcls:hover{transform:translateY(-3px);filter:brightness(1.12)}.zcard>div,.bcard>div{padding:8px 6px 4px}
.hcls::before,.bcard::before,.boss::before,.feats>div::before{content:"";position:absolute;left:50%;top:-38px;width:44px;height:38px;transform:translateX(-50%);background:${u('crest')} center/contain no-repeat;pointer-events:none;z-index:1}
.hcls{transition:transform .15s,filter .15s}.hcls .hpics img{filter:drop-shadow(0 8px 14px #000) drop-shadow(0 0 12px color-mix(in srgb,var(--cc) 35%,transparent))}
.zcard img,.city img,.zone img{border-radius:0}
/* wide pictures sit in the wide frame */
.wide-img{border:30px solid transparent;border-image:${u('frame-wide')} 66 / 30px round;border-radius:0;box-shadow:0 16px 34px rgba(0,0,0,.6)}
/* monster / boss portraits in the rarity frames */
.mimg{background:${u('rf-common')} center/100% 100% no-repeat,radial-gradient(circle at 50% 70%,#221a24,#08070a 70%);border-radius:0;padding:8px}.mon.elite .mimg{background:${u('rf-gold')} center/100% 100% no-repeat,radial-gradient(circle at 50% 70%,#2a2010,#08070a 70%)}
.mon.elite{border-image-source:${u('frame')}!important;filter:saturate(1.08)}.bimg{background:${u('rf-legend')} center/100% 100% no-repeat,radial-gradient(circle at 50% 60%,#3a1418,#09070b 70%);border-radius:0;padding:16px}
.bcard img{background:${u('rf-legend')} center/100% 100% no-repeat,radial-gradient(circle at 50% 60%,#3a1418,#09070b 70%);padding:18px}
.mstats span{border:0;background:rgba(0,0,0,.35);box-shadow:inset 0 0 0 1px rgba(201,162,90,.18)}
/* chips, step numbers, notes */
.chip{border:6px solid transparent!important;border-width:6px 10px!important;border-image:${u('chip-dark')} 14 20 fill / 6px 10px stretch!important;border-radius:0;padding:0 2px;color:#d6cbb4}.chip.elite{border-image-source:${u('chip-gold')}!important;color:#ffe3a0}.chip.boss{border-image-source:${u('chip-red')}!important;color:#ffc0b0}
.steps li::before{left:4px!important;top:2px!important;width:34px!important;height:36px!important;border:0!important;border-radius:0!important;background:${u('orb-amber')} center/contain no-repeat!important;color:#2a1606!important;font:900 13px Cinzel,serif!important;display:grid;place-items:center}
.raidnote{border:10px solid transparent;border-image:${u('alert-danger')} 20 60 20 60 fill / 10px 30px stretch;border-radius:0;padding:2px 6px 2px 18px}
.mskill{border-left:0;background:linear-gradient(90deg,rgba(201,162,90,.14),transparent);box-shadow:inset 2px 0 0 #c9a25a}
/* wiki menu: painted list, the lit row for the section in view */
.toc{padding:4px 2px;gap:0}.toc b{text-align:center;margin:2px 0 6px}.toc a{border-left:0!important;border-bottom:1px solid rgba(201,162,90,.14);padding:8px 10px 8px 28px;position:relative;color:#cfc4ab}
.toc a::before{content:"";position:absolute;left:8px;top:50%;width:10px;height:10px;margin-top:-5px;transform:rotate(45deg);border:1px solid #8a6a34;background:#1a1410}
.toc a:hover{color:#fff1d2;background:rgba(201,162,90,.06)}.toc a.on{background:${u('menu-row-on')} center/100% 100% no-repeat;color:#fff3df}.toc a.on::before{background:#e0b65a;border-color:#ffe3a0}
.mini-play{width:100%;height:76px;margin-top:10px;border:0!important;background:${u('play')} center/contain no-repeat!important}.mini-play:hover{background-image:${u('play-hover')}!important}
/* tables: header on leather with a gold rule */
th{background:${u('tex-dark')} center/cover;color:#e9cf8e;border-bottom:2px solid #6b4d1c}
.whead h1::after{content:"";display:block;width:min(398px,80%);height:31px;margin-top:6px;background:${u('divider')} left center/contain no-repeat}
/* call to action: the wide frame, title on the painted plate */
.cta{position:relative;max-width:900px;margin:60px auto 0;padding:40px 30px 46px;border:30px solid transparent;border-image:${u('frame-wide')} 66 / 30px round;background:radial-gradient(ellipse at 50% 40%,rgba(90,20,14,.35),transparent 70%) padding-box,linear-gradient(180deg,rgba(14,11,15,.5),rgba(7,6,9,.8)) padding-box,${u('tex-dark')} center/cover padding-box}
.cta h2{display:inline-block;padding:16px 60px 18px;background:${u('title-plate')} center/100% 100% no-repeat;color:#fff0cf!important;font-size:clamp(18px,2.4vw,24px)!important;text-shadow:0 2px 4px #000}
.foot{border-top:0;position:relative;padding-top:36px}.foot::before{content:"";position:absolute;left:50%;top:0;width:min(398px,80%);height:31px;transform:translateX(-50%);background:${u('divider')} center/contain no-repeat}
@media(max-width:900px){.play-btn{width:150px;height:62px;margin:-4px 0 -20px}.big-play{width:250px;height:104px}.cta{border-width:20px;border-image-width:20px;padding:24px 12px}.toc{border-width:14px!important;border-image-width:14px!important}}
@media(max-width:560px){.news article,.hcls,.zcard,.bcard,.feats>div,.card,.mon,.steps li,.boss{border-width:16px!important;border-image-width:16px!important}}
`;
}

export const SITE_CSS = `
:root{--bg:#060508;--p:#100d12;--line:rgba(206,164,86,.2);--line2:rgba(206,164,86,.45);--t:#e9e2d3;--m:#9c937f;--g:#d9b45c;--g2:#f2d58a;--teal:#62d7cb;--blood:#8e1a22}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:86px}body{margin:0;background:radial-gradient(ellipse at 50% -20%,#24121a,transparent 60%),var(--bg);color:var(--t);font:15px/1.65 "Noto Sans Thai",system-ui,sans-serif}
a{color:var(--g2)}img{max-width:100%}
.top{position:sticky;top:0;z-index:20;background:linear-gradient(180deg,rgba(6,5,8,.97),rgba(6,5,8,.88));border-bottom:1px solid var(--line);backdrop-filter:blur(6px)}
.top-in{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:auto 1fr auto 1fr;align-items:center;gap:16px;padding:8px 20px;min-height:68px}
.brand{font:900 18px Cinzel,Georgia,serif;letter-spacing:.24em;color:#f2e3bf;text-decoration:none;line-height:1.1}.brand small{display:block;font-size:9px;letter-spacing:.7em;color:var(--teal)}
.top nav{display:flex;gap:4px}.top nav.left{justify-content:flex-end}.top nav a{color:var(--m);text-decoration:none;padding:8px 12px;font-size:14px;border-bottom:2px solid transparent}.top nav a:hover{color:var(--t)}.top nav a.on{color:var(--g2);border-bottom-color:var(--g)}
.play-btn{display:grid;place-items:center;padding:8px 34px 9px;margin:-2px 0 -18px;border:1px solid #e9c46f;border-radius:0 0 10px 10px;text-decoration:none;color:#fff3d6;background:linear-gradient(180deg,#8a2a22,#4a0e12);box-shadow:0 10px 30px rgba(200,40,30,.35),0 0 0 3px #0a0608,inset 0 1px 0 rgba(255,220,160,.3);font:900 20px Cinzel,Georgia,serif;letter-spacing:.14em;line-height:1.1;transition:filter .15s,transform .1s;cursor:pointer}
.play-btn small{font:700 9px Cinzel,Georgia,serif;letter-spacing:.4em;color:#f2d58a}.play-btn:hover{filter:brightness(1.2);transform:translateY(1px)}
.hero{position:relative;min-height:min(82vh,760px);display:grid;place-items:center;overflow:hidden;border-bottom:1px solid var(--line)}
.hero-art{position:absolute;inset:0}.hero-art img{width:100%;height:100%;object-fit:cover;filter:brightness(.42) saturate(.8)}.hero-art::after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,transparent 20%,rgba(6,5,8,.85) 75%),linear-gradient(180deg,transparent 60%,var(--bg))}
.hero-in{position:relative;text-align:center;padding:60px 20px}.hero h1{margin:0;font:900 clamp(40px,8vw,92px) Cinzel,Georgia,serif;letter-spacing:.2em;color:#f2e3bf;text-shadow:0 0 50px rgba(217,180,92,.35),0 3px 0 #000;line-height:1}.hero h1 small{display:block;font-size:.22em;letter-spacing:.9em;color:var(--teal);margin-top:10px}
.tag{color:#d6cbb4;font-size:17px;max-width:640px;margin:18px auto}.hero-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:22px}
.big-play{display:inline-block;padding:14px 46px;border:1px solid #e9c46f;border-radius:3px;background:linear-gradient(180deg,#8a2a22,#4a0e12);color:#fff3d6;text-decoration:none;font:900 22px Cinzel,Georgia,serif;letter-spacing:.12em;box-shadow:0 0 40px rgba(200,40,30,.35);cursor:pointer}.big-play:hover{filter:brightness(1.2)}
.ghost{display:inline-block;padding:14px 28px;border:1px solid var(--line2);color:var(--g2);text-decoration:none;font:700 16px Cinzel,Georgia,serif;letter-spacing:.06em}
.pills{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:26px}.pills span{padding:4px 12px;border:1px solid var(--line);border-radius:20px;font-size:12.5px;color:var(--m);background:rgba(0,0,0,.4)}
.band{max-width:1240px;margin:0 auto;padding:64px 20px 10px}.band>header{text-align:center;margin-bottom:26px}.band h2,section>header h2{font:700 clamp(22px,3vw,30px) Cinzel,Georgia,serif;letter-spacing:.06em;margin:0;color:var(--g2)}.band>header p{color:var(--m);max-width:760px;margin:6px auto 0}
.hcls-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}.hcls{border:1px solid color-mix(in srgb,var(--cc) 35%,transparent);background:linear-gradient(180deg,color-mix(in srgb,var(--cc) 10%,#0e0b10),#08070a);border-radius:4px;padding:14px;text-align:center}
.news .ngrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}.news article{border:1px solid var(--line);border-radius:4px;padding:12px 14px;background:linear-gradient(180deg,#151016,#09070a)}.news b{font:700 15px Cinzel,Georgia,serif;color:#f2e3bf}.news p{margin:6px 0 0;color:#cfc6b3;font-size:13.5px}
.hpics{display:flex;justify-content:center;gap:4px;height:170px}.hpics img{height:100%;object-fit:contain;filter:drop-shadow(0 8px 14px #000)}.hcls h3{margin:8px 0 2px;font:700 19px Cinzel,Georgia,serif;color:var(--cc)}.hcls h3 small{display:block;font:400 12px "Noto Sans Thai";color:var(--m)}.hcls p{font-size:13px;color:#cfc6b3;margin:6px 0}.hcls q{display:block;font:italic 600 13px Cinzel,Georgia,serif;color:color-mix(in srgb,var(--cc) 60%,#fff)}
.wide-img{width:100%;border:1px solid var(--line);border-radius:4px;display:block;margin-bottom:14px}
.capgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;margin-bottom:10px}.cap h3{margin:10px 0 4px;font-size:20px}.cap h3 small{display:block;font-size:13px;opacity:.7;font-weight:400}.cap .wide-img{aspect-ratio:3/2;object-fit:cover;margin:0;border-width:18px}.gates{list-style:none;padding:0;margin:8px 0 0;display:grid;gap:6px;font-size:14px;text-align:left}.gates li{padding:6px 10px;border-left:2px solid var(--g,#62d7cb);background:rgba(255,255,255,.03)}.gates small{color:#a99f8c}.gates a{color:inherit}.zgrid,.bgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}.zcard,.bcard{display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:4px;overflow:hidden;background:#0c0a0e;transition:border-color .15s,transform .15s}.zcard:hover,.bcard:hover{border-color:var(--g);transform:translateY(-2px)}
.zcard img{width:100%;aspect-ratio:16/9;object-fit:cover}.zcard>div,.bcard>div{padding:10px 14px 14px}.zcard h4,.bcard h4{margin:0;font:700 16px Cinzel,Georgia,serif;color:#f2e3bf}.zcard h4 small{display:block;font:400 12px "Noto Sans Thai";color:var(--m)}.zcard p,.bcard p{font-size:13px;color:#bdb4a0;margin:6px 0 0}
.bcard img{width:100%;aspect-ratio:1;object-fit:contain;background:radial-gradient(circle at 50% 60%,#3a1418,#09070b 70%);padding:10px}.bcard small{color:#ff9a8a;font-size:11.5px;letter-spacing:.05em}
.feats{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.feats>div{border:1px solid var(--line);border-radius:4px;padding:16px;background:#0c0a0e}.feats h3{margin:0 0 6px;font:700 16px Cinzel,Georgia,serif;color:var(--g2)}.feats p{margin:0;font-size:13.5px;color:#cfc6b3}
.cta{text-align:center;padding-bottom:70px}.cta p{color:var(--m)}
.foot{border-top:1px solid var(--line);margin-top:40px;padding:20px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;color:var(--m);font-size:12.5px;max-width:1240px;margin-left:auto;margin-right:auto}
.wiki{max-width:1300px;margin:0 auto;display:grid;grid-template-columns:200px minmax(0,1fr);gap:28px;padding:24px 20px}.wiki main{min-width:0}table.wide{display:block;overflow-x:auto}.toc{position:sticky;top:90px;align-self:start;display:grid;gap:2px}.toc b{font:700 12px Cinzel,Georgia,serif;letter-spacing:.2em;color:var(--g);margin-bottom:6px}.toc a{color:var(--m);text-decoration:none;padding:6px 10px;border-left:2px solid transparent;font-size:14px}.toc a.on,.toc a:hover{color:var(--g2);border-left-color:var(--g);background:rgba(217,180,92,.05)}
.mini-play{margin-top:12px;text-align:center;border:1px solid #e9c46f !important;background:linear-gradient(180deg,#8a2a22,#4a0e12);color:#fff3d6 !important;font:700 14px Cinzel,Georgia,serif}
.whead h1{font:900 clamp(28px,4vw,44px) Cinzel,Georgia,serif;letter-spacing:.1em;margin:0;color:#f2e3bf}.whead p{color:var(--m)}
main section{margin-top:48px}section>header{border-bottom:1px solid var(--line);margin-bottom:16px;padding-bottom:6px}section>header p{color:var(--m);margin:2px 0 0;font-size:13.5px}h3.sub{font:700 18px Cinzel,Georgia,serif;color:var(--g2);margin:22px 0 10px}
.card{background:linear-gradient(180deg,rgba(22,18,24,.95),rgba(10,8,12,.95));border:1px solid var(--line);border-radius:4px;padding:14px 16px}.card h4{margin:0 0 6px;font:700 15px Cinzel,Georgia,serif;color:#f2e3bf}.card h4 small{font:400 12px "Noto Sans Thai";color:var(--m)}.card p{margin:4px 0;font-size:13.5px}.muted{color:var(--m)}.rw{color:var(--g2);font-size:13px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.qgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}.cgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.city img,.field img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:3px;margin-bottom:8px}.gates{list-style:none;padding:0;margin:8px 0 0;display:grid;gap:6px;font-size:14px;text-align:left}.gates li{padding:6px 10px;border-left:2px solid var(--g,#62d7cb);background:rgba(255,255,255,.03)}.gates small{color:#a99f8c}.gates a{color:inherit}
.zlist{display:grid;gap:12px}.zone{display:grid;grid-template-columns:320px 1fr;gap:16px;border-left:3px solid var(--zc)}.zone img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:3px}
.chip{display:inline-block;padding:1px 8px;margin:2px 4px 2px 0;border:1px solid var(--line);border-radius:10px;font-size:12px;color:#cfc6b3}.chip.elite{border-color:#d9b45c;color:#f2d58a}.chip.boss{border-color:#e0453a;color:#ff9a8a}
.steps{counter-reset:s;list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}.steps li{counter-increment:s;position:relative;padding:12px 14px 12px 50px;border:1px solid var(--line);border-radius:4px;background:#0c0a0e}.steps li::before{content:counter(s);position:absolute;left:12px;top:12px;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#2a1e10;border:1px solid var(--g);font:700 12px Cinzel,serif;color:var(--g2)}.steps p{margin:4px 0 0;font-size:13px;color:#cfc6b3}
kbd{display:inline-block;padding:0 6px;border:1px solid var(--line2);border-bottom-width:2px;border-radius:3px;font:700 11px Cinzel,serif;color:var(--g2);background:#0c0a10}
.mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px}.mon{display:grid;grid-template-columns:96px 1fr;gap:12px;border:1px solid var(--line);border-radius:4px;padding:10px;background:#0c0a0e}.mon.elite{border-color:rgba(217,180,92,.55);background:linear-gradient(180deg,#191208,#0a080b)}
.mimg{background:radial-gradient(circle at 50% 70%,#221a24,#08070a 70%);border-radius:3px;display:grid;place-items:center;height:110px}.mimg img{max-height:104px;object-fit:contain}.mon h4{margin:0;font:700 14px Cinzel,Georgia,serif;color:#f2e3bf}.mon.elite h4{color:var(--g2)}.mon h4 small{display:block;font:400 11.5px "Noto Sans Thai";color:var(--m)}.mon p{margin:2px 0;font-size:12px}
.mstats{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:6px 0}.mstats span{font-size:10.5px;color:var(--m);text-align:center;border:1px solid rgba(255,255,255,.06);border-radius:3px;padding:2px}.mstats b{display:block;font-size:13px;color:var(--t)}
.mskill{border-left:2px solid var(--g);padding:4px 8px;background:rgba(217,180,92,.06);margin:4px 0}.mskill b{font-size:12.5px;color:var(--g2)}
.boss{display:grid;grid-template-columns:260px 1fr;gap:20px;border:1px solid rgba(224,69,58,.35);border-radius:4px;padding:16px;margin-bottom:16px;background:linear-gradient(180deg,#160a0c,#09070a)}.bimg{background:radial-gradient(circle at 50% 60%,#3a1418,#09070b 70%);border-radius:4px;display:grid;place-items:center;min-height:240px}.bimg img{max-height:280px;object-fit:contain}
.boss h3{margin:2px 0 6px;font:900 24px Cinzel,Georgia,serif;color:#ffb0a0}.boss h3 small{font:400 14px "Noto Sans Thai";color:var(--m)}.boss h5{margin:12px 0 2px;font:700 12px Cinzel,Georgia,serif;letter-spacing:.14em;color:var(--g)}.boss p{margin:0;font-size:14px;color:#d6cbb4}.raidnote{margin-top:12px;padding:8px 12px;border:1px dashed rgba(224,69,58,.5);border-radius:3px;font-size:13px;color:#ffb0a0}
table{border-collapse:collapse;width:100%;font-size:13px}table.wide{margin-bottom:10px}th{text-align:left;font:600 11.5px Cinzel,Georgia,serif;color:var(--m);border-bottom:1px solid var(--line);padding:6px 8px}td{border-bottom:1px solid rgba(255,255,255,.05);padding:6px 8px;vertical-align:top}.rk{font:900 15px Cinzel,serif;color:var(--g2)}
ul{padding-left:18px;margin:6px 0}li{margin:2px 0}
@media(max-width:900px){.top-in{grid-template-columns:auto 1fr auto;gap:8px;padding:6px 12px}.top nav.left{display:none}.top nav.right a{padding:6px 6px;font-size:12.5px}.play-btn{padding:6px 18px 7px;font-size:16px;margin-bottom:-12px;grid-column:2;justify-self:center}.top nav.right{grid-column:3}
  .brand{font-size:14px}.wiki{grid-template-columns:1fr}.toc{position:static;display:flex;flex-wrap:nowrap;overflow-x:auto;gap:2px}.toc a{white-space:nowrap}.mini-play{display:none}.toc b{width:100%}.zone,.boss{grid-template-columns:1fr}.grid2{grid-template-columns:1fr}}
@media(max-width:560px){.top nav.right a:not(.on){display:none}.top-in{grid-template-columns:auto 1fr auto}.hpics{height:130px}}
`;

const FORGE_SITE_CSS = `
.page-home .hero{min-height:min(840px,92vh);border:1px solid #8e7348;margin:14px auto 0;max-width:1540px;overflow:hidden}
.page-home .hero-art img{filter:brightness(.78) saturate(.8)}
.page-home .hero-art::after{background:linear-gradient(90deg,#050708e0 0%,#05070855 46%,transparent 80%),linear-gradient(0deg,#08090c,transparent 28%)}
.page-home .hero-in{text-align:left;width:min(1280px,100%);margin:auto;padding:110px 6% 65px}
.hero-eyebrow{color:#d5b47a;font:600 16px Cinzel,serif;letter-spacing:.3em;display:block;margin-bottom:30px}
.page-home .hero h1{font-size:clamp(38px,5.3vw,76px);letter-spacing:.045em;line-height:1.13;color:#f1dfb7;max-width:640px}
.page-home .hero .tag{max-width:480px;line-height:1.9;color:#ddceb0;margin:26px 0}
.page-home .hero-cta{justify-content:flex-start;margin:30px 0}
.page-home .big-play{color:#fff1cb;filter:sepia(.3);font-size:25px}
.page-home .hero .pills{justify-content:flex-start;max-width:570px;margin-top:40px;gap:8px}
.page-home .hero .pills span{background:#0c0e10ba;border:1px solid #655235;border-radius:0}
.page-home .band{max-width:1240px}.page-home .band>header h2{color:#dec18d}
.page-home .news article,.page-home .card,.page-home .hcls{background:linear-gradient(130deg,#171b1ce8,#080b0ee8);border-color:#74603e}
.page-home .sfbar{filter:saturate(.65)}
@media(max-width:700px){.page-home .hero-in{padding:72px 22px 36px}.page-home .hero{min-height:730px}.page-home .hero-art img{object-position:65% center}.page-home .hero-art::after{background:linear-gradient(90deg,#050708dc,#05070855),linear-gradient(0deg,#08090c,transparent)}.hero-eyebrow{font-size:12px}.page-home .hero h1{font-size:42px}.page-home .hero .pills{display:none}}
`;
