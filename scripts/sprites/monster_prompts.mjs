// Image-generation prompts for every monster, elite and boss — left / right only (paint facing RIGHT, the game mirrors
// it for left). Writes docs/prompts/MONSTER_BOSS_PROMPTS_2DIR.md and public/inspector/prompts.json (the sprite inspector
// shows the prompt of the selected actor and pose with a copy button).
//   node scripts/sprites/monster_prompts.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** how the body moves — picks the walk wording */
const GAIT = {
  quad: 'slow, calm four-legged walk: diagonal legs move together, head gently bobbing, body level, no galloping, no running',
  biped: 'slow, heavy, deliberate walk on two legs: one step per half cycle, arms swinging slightly, no running, no jumping',
  giant: 'slow, ponderous stomping walk: huge weight shifting from leg to leg, shoulders rolling, no running',
  spider: 'slow creeping walk: legs move in alternating sets of four, body stays low and level, no scuttling burst',
  flyer: 'slow hovering glide: wings beat calmly in a loop, body bobs gently up and down, feet never touch the ground',
  float: 'slow drifting glide: no legs, robes and wisps trail behind and ripple, body bobs gently, never touches the ground',
  serpent: 'slow slithering: the body ripples in an S-wave from head to tail, head held steady, no lunging',
  drake: 'slow prowling walk on four legs, wings folded against the body, tail swaying, no flying, no running',
};

/** id → [name, Thai name, gait, look, basic attack, skill]  (look taken from the game's current painted art) */
const MONSTERS = [
  ['grave-crawler', 'Grave Crawler', 'แบดเจอร์สุสาน', 'quad', 'stocky badger with grey-black fur and a pale stripe down the back, short legs, long claws, snarling', 'lunges forward and rakes with both front claws', 'rears up and slams down, a burst of grave dust and bone shards'],
  ['ash-hound', 'Ash Hound', 'สุนัขเถ้า', 'quad', 'lean grey wolf-hound with ash-streaked fur, bristling mane, bared fangs, smoky embers in the fur', 'snapping bite forward with a quick head lunge', 'howls, then leaps forward trailing a short cone of glowing ash'],
  ['bone-sentinel', 'Bone Sentinel', 'หมูป่ากระดูก', 'quad', 'hulking dark wild boar with coarse black bristles, scarred hide and long pale tusks', 'tusk gore: head drops and sweeps up', 'paws the ground and charges a short distance, dust cloud and shockwave at the end'],
  ['oathscar-aurochs', 'Oathscar Aurochs', 'กระทิงตราคำสาบาน', 'quad', 'massive brown aurochs bull with shaggy shoulders, wide curved horns and glowing scar runes on the flank', 'horn thrust forward with a heavy head swing', 'stamps the ground, runes flare red and a quaking shockwave ring spreads forward'],
  ['tide-wraith', 'Tide Wraith', 'วิญญาณน้ำขึ้น', 'float', 'hooded sea-green wraith of tattered robes and seaweed, glowing teal eyes, holding a coral-and-driftwood staff', 'swipes the staff forward releasing a splash of dark water', 'raises the staff, a swirling whirlpool of teal water erupts in front of it'],
  ['root-reaper', 'Root Reaper', 'เคียวรากไม้', 'spider', 'dark thorny root creature on six spindly root legs, purple glowing core, two scythe-like root claws', 'slashes forward with both root scythes', 'stabs its legs into the ground, purple thorn roots burst up in a line in front of it'],
  ['grave-marshal', 'Grave Marshal', 'จอมพลสุสาน', 'giant', 'towering minotaur-like undead warlord: dark horned bull head, black iron armor with skull ornaments, torn crimson cape, giant cleaver axe', 'two-handed overhead cleaver chop', 'raises the cleaver and slams it into the ground, a cracking red shockwave and flying grave stones'],
  ['briar-wolf', 'Briar Wolf', 'หมาป่าหนามไม้', 'quad', 'green-brown wolf with mossy fur and thorny briar growing along its back, amber eyes', 'quick bite and claw swipe forward', 'snarls, thorn spikes burst from its back and fly forward in a short fan'],
  ['thorn-spider', 'Thorn Spider', 'แมงมุมหนาม', 'spider', 'large brown hairy spider with thorny spines on its abdomen and legs, many small glinting eyes', 'rears up and strikes forward with front legs and fangs', 'sprays a web of sticky thorned silk forward'],
  ['bark-guardian', 'Bark Guardian', 'หมีเปลือกไม้', 'quad', 'large brown bear with bark-like plates on the shoulders and back, small moss tufts', 'heavy paw swipe forward', 'stands up on hind legs and slams both paws down, bark splinters and a ground shockwave'],
  ['reed-stalker', 'Reed Stalker', 'จระเข้กกน้ำ', 'quad', 'long olive-green crocodile with ridged armored back, low to the ground, reeds caught on its scales', 'jaw snap forward with a head lunge', 'death-roll lunge: twists forward with a splash of muddy water'],
  ['tide-crab', 'Tide Crab', 'ปูน้ำขึ้น', 'spider', 'big rust-red armored crab covered in barnacles, two huge pincers raised, many legs', 'pincer snap forward with one big claw', 'raises both pincers and hammers the ground, a spray of sea foam and pebbles'],
  ['fen-maw-otter', 'Fen Maw Otter', 'นากปากบึง', 'quad', 'dark brown giant otter with sleek wet fur, long body, oversized jaws and a long tail', 'lunging bite forward', 'spins and lashes the tail, throwing an arc of muddy fen water forward'],
  ['cinder-beetle', 'Cinder Beetle', 'ด้วงถ่านเพลิง', 'spider', 'large dark red-black rhinoceros beetle with a glossy shell, one long curved horn, six legs, glowing ember cracks', 'horn jab forward', 'shell splits open and sprays a cone of burning cinders forward'],
  ['ironhide-rhino', 'Ironhide Rhino', 'แรดหนังเหล็ก', 'quad', 'grey armored rhinoceros with iron-plated wrinkled hide and a large front horn', 'horn thrust with a head swing forward', 'lowers its head and charges a short distance, sparks and dust at the impact'],
  ['slag-hound', 'Slag Hound', 'ไฮยีนาตะกรัน', 'quad', 'spotted orange-brown hyena-like beast with molten slag in its spots, hunched back, wide jaws', 'snapping bite forward', 'opens its jaws and spits a glob of molten slag forward that splashes on the ground'],
  ['moon-moth', 'Moon Moth', 'ผีเสื้อจันทรา', 'flyer', 'giant purple moth with crescent-moon patterns on its wings, fluffy white body, glowing eyes', 'darts forward and slaps with its wings', 'beats the wings hard, releasing a shimmering cloud of glowing moon-dust forward'],
  ['root-weaver', 'Root Weaver', 'แมงมุมทอราก', 'spider', 'orange-brown spider with a bark-textured body, root-like legs and amber glowing sacs', 'front legs stab forward', 'weaves a net of glowing roots that shoots forward and wraps the ground'],
  ['ancient-treant', 'Ancient Treant', 'พฤกษาโบราณ', 'giant', 'huge walking tree with gnarled bark body, root feet, branch arms, moss and a glowing amber face hollow', 'heavy branch-arm swing forward', 'slams its root-feet down, roots erupt from the ground in front of it'],
  ['frost-wraith', 'Frost Wraith', 'วิญญาณน้ำแข็ง', 'float', 'pale icy-blue hooded wraith of frozen tattered robes and icicles, no legs, dark empty hood with cold glow', 'claws forward with an icy hand, frost shards burst', 'raises both arms, a ring of ice spikes erupts in front of it'],
  ['crystal-golem', 'Crystal Golem', 'โกเลมคริสตัล', 'giant', 'massive golem of dark rock with large glowing blue crystals growing from shoulders and back', 'heavy crystal fist punch forward', 'smashes both fists into the ground, blue crystal spikes burst forward in a line'],
  ['rime-serpent', 'Rime Serpent', 'งูน้ำค้างแข็ง', 'serpent', 'coiled ice-blue serpent with frosty scales, crystalline fin crest and white mane', 'quick strike forward with open fangs', 'frost breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the freezing white-blue mist pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the canvas (it may reach close to the edge but stays inside the canvas), starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover'],
  ['anvil-guard', 'Anvil Guard', 'องครักษ์ทั่ง', 'biped', 'bulky armored knight of blackened iron with glowing forge cracks, anvil-shaped hammer in one hand, tall cross shield in the other, red tabard', 'hammer smash forward', 'raises the shield and bashes forward, a bright orange forge-spark shockwave'],
  ['furnace-golem', 'Furnace Golem', 'โกเลมเตาหลอม', 'giant', 'round iron furnace golem with a blazing grated belly, chimney on its head, chain-wrapped stone fists', 'heavy stone fist punch forward', 'belly grate opens and blasts a wave of fire forward'],
  ['ember-drake', 'Ember Drake', 'มังกรเพลิงอ่อน', 'drake', 'dark rocky drake with glowing orange lava cracks, spiked back, bat-like orange wings, horned head', 'claw swipe and bite forward', 'fire breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the orange fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the canvas (it may reach close to the edge but stays inside the canvas), starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover'],
  ['venom-spider', 'Venom Spider', 'แมงมุมพิษ', 'spider', 'black armored spider with a huge glowing toxic-green abdomen, green eyes, dripping venom', 'fang strike forward', 'spits a glob of toxic green venom forward that splashes into a poison puddle'],
  ['spore-beast', 'Spore Beast', 'อสูรสปอร์', 'giant', 'hunched beast covered in red-brown mushroom caps and glowing green spore pods, thick legs', 'heavy forward headbutt with mushroom cap', 'shakes violently, releasing a thick cloud of glowing green spores forward'],
  ['thorn-hydra', 'Thorn Hydra', 'ไฮดราหนาม', 'serpent', 'three-headed serpent hydra with thorny green-brown scales and red frills, coiled thick body', 'the three heads bite forward one after another', 'all three heads rear back and spit thorn barbs forward'],
  ['astral-wraith', 'Astral Wraith', 'วิญญาณดวงดาว', 'float', 'dark violet hooded wraith with starry cosmic robes, glowing purple core in the chest, clawed hands', 'claws forward leaving a purple star-trail', 'opens its arms and fires a beam of violet starlight forward'],
  ['prism-sentinel', 'Prism Sentinel', 'ผู้พิทักษ์ปริซึม', 'float', 'floating dark-green crystal construct with a glowing emerald core and blade-shaped crystal arms', 'crystal blade-arm slash forward', 'core flares and fires a prism beam forward that splits into rainbow shards'],
  ['halo-seraph', 'Halo Seraph', 'เทวทูตรัศมี', 'biped', 'tall fallen seraph with white feathered wings, golden halo, dark-and-white armored robes, holding a golden radiant spear', 'spear thrust forward with a golden flash', 'raises the spear, golden light pillars fall in front of it'],
  ['void-reaper', 'Void Reaper', 'เคียวความว่าง', 'float', 'black hooded reaper with glowing purple eyes and a huge curved violet scythe, smoky void robes', 'wide scythe sweep forward with a violet arc', 'vanishes into smoke and reappears mid-slash, leaving a dark void rift'],
  ['eclipse-drake', 'Eclipse Drake', 'มังกรสุริยคราส', 'drake', 'dark purple-black drake with folded membrane wings, glowing violet eyes and spiked tail', 'claw swipe and bite forward', 'eclipse fire breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the dark violet eclipse fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the canvas (it may reach close to the edge but stays inside the canvas), starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover'],
  ['crown-colossus', 'Crown Colossus', 'ยักษ์มงกุฎหิน', 'giant', 'colossal stone giant with a small ruined castle crowning its head and shoulders, glowing purple cracks', 'slow massive stone fist slam forward', 'stamps, stone pillars and rubble erupt from the ground in front of it'],
  ['drowned-hierophant', 'Drowned Hierophant', 'มหาปุโรหิตจมน้ำ', 'float', 'skeletal hooded high priest in rotting sea-green robes and chains, ghostly green flames; a long curved reaper SCYTHE with a rusted iron blade always held in his RIGHT hand and a glowing green soul-lantern on a chain always held in his LEFT hand, both items visible in every frame', 'sweeps the scythe from back to front in a wide arc toward the right, leaving a ghostly green slash trail; the lantern stays in the left hand', 'raises the lantern in the left hand while the right hand plants the scythe, a huge vortex of drowned green souls swirls up in front of him on the right side'],
  ['worldroot-devourer', 'Worldroot Devourer', 'อสูรกลืนรากโลก', 'drake', 'colossal violet-black dragon with root-like horns and spines, glowing purple veins, folded leathery wings', 'massive bite and claw rake forward', 'violet root-fire breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the violet-black fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the canvas (it may reach close to the edge but stays inside the canvas), starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; on the strongest frames small dark roots burst from the ground under the end of the flame, in front of the dragon'],
  ['abyssal-forge-titan', 'Abyssal Forge Titan', 'ไททันเตาหลอมนรก', 'giant', 'hulking titan of black iron and magma, glowing red heart-core in the chest, molten cracks, massive forge-hammer arms', 'giant hammer-arm smash forward', 'slams both arms down, a ring of magma bursts outward and lava geysers erupt forward'],
];

const ROLE_OF = {
  'grave-marshal': 'boss', 'drowned-hierophant': 'boss', 'worldroot-devourer': 'boss', 'abyssal-forge-titan': 'boss',
  'oathscar-aurochs': 'elite', 'tide-wraith': 'elite', 'root-reaper': 'elite',
};
/** canvas = one generated image (square, one frame per image); body = character height in px, identical in the master
 *  reference and in every frame. Boss body = 3 × monster body. The sheet builder (build_sheet_2dir.py) then places each
 *  frame in a cell 4 × the master's body width and height, body centred — so the spacing is exact, not left to the AI. */
const SPEC = {
  monster: { canvas: 1024, body: 340, frames: { idle: 4, walk: 6, attack: 6, skill: 6 } },
  elite: { canvas: 1024, body: 442, frames: { idle: 4, walk: 6, attack: 6, skill: 6 } },
  boss: { canvas: 2048, body: 1020, frames: { idle: 6, walk: 8, attack: 8, skill: 10 } },
};
const CLIP_TH = { idle: 'ยืน', walk: 'เดิน (ช้า)', attack: 'โจมตี', skill: 'สกิล' };
/** key poses spread over n frames */
const PHASES = {
  idle: ['neutral ready stance', 'breathing in, chest slightly raised', 'top of the breath, cloth / fur / wisps lifted a little', 'breathing out, settling', 'back down, almost the neutral stance', 'neutral ready stance (same as frame 1, loop point)'],
  walk: ['contact: front foot just touching down, back foot behind', 'down: weight on the front foot, body at its lowest', 'passing: back foot passing under the body', 'up: body at its highest, pushing off', 'contact with the other foot in front', 'down on the other foot', 'passing the other foot', 'up on the other foot'],
  attack: ['ready stance', 'wind-up: weapon / claws / head pulled back', 'start of the strike moving forward', 'strike: full reach forward, motion trail', 'impact: hit effect at the end of the reach', 'follow-through', 'recovering', 'back to ready stance'],
  glide: ['body at its lowest point of the bob, trailing parts streaming back', 'rising, trailing parts curling', 'highest point of the bob', 'starting to sink, trailing parts lifting', 'sinking', 'lowest point again (loop)'],
  skill: ['ready stance', 'gathering power, first glow', 'power building, pose tightens', 'peak of the wind-up', 'release begins', 'full release: strongest effect', 'effect at its widest', 'effect fading', 'recovering', 'back to ready stance'],
};
function phasesFor(clip, n) {
  const L = PHASES[clip]; return Array.from({ length: n }, (_, i) => L[Math.round(i * (L.length - 1) / Math.max(1, n - 1))]);
}
const ACTION = {
  idle: () => 'standing idle in a ready stance (no stepping, no attack)',
  walk: (g) => `walking in place toward the {DIR}: ${GAIT[g]}`,
  attack: (_g, m) => `basic attack toward the {DIR} — ${m}; the strike and any slash or splash point to the {DIR}, nothing behind the body`,
  skill: (_g, _m, sk) => `special skill toward the {DIR} — ${sk}; every effect goes to the {DIR}, nothing behind the body`,
};
/** words that describe the facing flip for the left set; anatomical hands (RIGHT hand / LEFT hand) never flip */
function forDir(text, dir) {
  if (dir === 'right') return text.replaceAll('{DIR}', 'RIGHT').replaceAll('{dir}', 'right');
  const keep = [];
  const t = text.replace(/\b(RIGHT|LEFT|right|left) (hand|arm|claw|pincer)/g, (m) => { keep.push(m); return `@@${keep.length - 1}@@`; });
  return t.replace(/\b(RIGHT|LEFT|right|left)\b/g, (w) => ({ RIGHT: 'LEFT', LEFT: 'RIGHT', right: 'left', left: 'right' })[w])
    .replaceAll('{DIR}', 'LEFT').replaceAll('{dir}', 'left').replace(/@@(\d+)@@/g, (_, i) => keep[+i]);
}
const VIEW = (dir) => `Three-quarter view facing ${dir.toUpperCase()} (body turned to the ${dir} edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).`;
const VIEW_T = 'Three-quarter view facing {DIR} (body turned to the {dir} edge of the image, face slightly toward the viewer, camera looking down about 35 degrees).';
const STYLE = '2D game sprite for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light.';
const BG = 'Plain flat pure green background #00FF00 (or transparent), no ground shadow, no scenery, no text, no frame numbers, no borders.';

function masterPrompt(look, spec, role) {
  return [
    `MASTER REFERENCE — ${STYLE}`,
    `Character: ${look}.`,
    `${VIEW('right')} Full body, neutral ready stance, arms and weapons clearly visible, nothing cropped.`,
    `ONE character only, centred, on a ${spec.canvas}x${spec.canvas} px square canvas. The character is exactly ${spec.body} px tall`
      + (role === 'boss' ? ' (a boss: three times the height of a normal monster or a hero)' : '')
      + `, feet on a horizontal line ${Math.round(spec.canvas * 0.78)} px from the top, with wide empty space on every side.`,
    'Maximum detail on face, armor, cloth, fur, bone and weapon: this image is the single source of truth for every later frame.',
    BG,
  ].join('\n');
}
function framePrompt(look, gait, atk, sk, clip, dir, n, spec) {
  const ph = phasesFor(clip === 'walk' && ['float', 'flyer', 'serpent'].includes(gait) ? 'glide' : clip, n).map((x, i) => `  frame ${i + 1}/${n}: ${x}`).join('\n');
  return forDir([
    `${STYLE} Image = ONE single animation frame (generate one image per frame).`,
    'REFERENCE: use ONLY the attached MASTER REFERENCE image. Copy the character exactly — same face, body proportions, colors, armor, cloth, '
      + 'weapons and which hand holds what. Do NOT invent, add, remove or redesign anything, do not change the art style. Only the pose changes.',
    `Pose: ${ACTION[clip](gait, atk, sk)}.`,
    `Frame to draw (replace with one line per image):\n${ph}`,
    VIEW_T + '@@NOTE@@',
    `SIZE: exactly the same size as the MASTER REFERENCE — ${spec.body} px tall on the same ${spec.canvas}x${spec.canvas} px canvas, feet on the same line `
      + `${Math.round(spec.canvas * 0.78)} px from the top, same horizontal position. Never shrink or enlarge, never crop, never lower the detail.`,
    'ONE character only in the image, with wide empty space on every side; effects stay inside the canvas.',
    BG,
  ].join('\n'), dir).replace('@@NOTE@@', dir === 'left'
    ? ' The master reference faces right: turn the whole body to face LEFT, but keep every weapon and item in the SAME hand as in the master — do not simply mirror the image.'
    : '');
}

const out = {}; const md = [];
md.push('# Prompt มอนสเตอร์ / Elite / บอส — Master Reference + หันขวา + หันซ้าย', '',
  'สร้างจาก `scripts/sprites/monster_prompts.mjs` — แก้ที่สคริปต์แล้วรันใหม่', '',
  '## ขั้นตอน (ทำตามลำดับ ห้ามข้าม)', '',
  '1. **สร้าง Master Reference ก่อน 1 ภาพ** (prompt “MASTER” ของตัวนั้น) แนบภาพตัวเดิมในเกมเป็นแนวทางได้ เลือกภาพที่ดีที่สุดแล้วบันทึกเป็น `reference/sprites-2dir/<id>/master.png` — **ภาพนี้คือแบบเดียวที่ใช้ต่อทั้งหมด**',
  '2. **ทุกเฟรมต่อจากนี้ แนบ master.png ภาพเดียว** (ห้ามแนบภาพอื่น) แล้วใช้ prompt ของท่านั้น',
  '3. **สร้างทีละ 1 เฟรมต่อภาพ** — ใน prompt เหลือบรรทัด “frame k/n” แค่บรรทัดเดียวของเฟรมที่จะสร้าง ขนาดภาพ ขนาดตัว และเส้นเท้าต้องเท่ากับ master ทุกภาพ',
  '4. บันทึก `reference/sprites-2dir/<id>/<right|left>/<idle|walk|attack|skill>/01.png, 02.png …`',
  '5. รัน `python scripts/sprites/build_sheet_2dir.py <id>` — สคริปต์ตัดพื้นเขียว จัดเท้าให้ตรงกับ master เตือนถ้าขนาดตัวไม่เท่า master '
    + 'แล้ววางแต่ละเฟรมในช่อง **กว้าง 4 เท่า และสูง 4 เท่าของตัวใน master** (ตัวอยู่กลางช่อง เว้นทุกด้าน 1.5 เท่าของตัว) ได้ชีตตรวจ `sheet-right.png` / `sheet-left.png` และชีตเกม',
  '', '| ประเภท | ขนาดภาพที่สร้าง | ความสูงตัว (เท่ากับ master ทุกภาพ) | ยืน | เดิน | โจมตี | สกิล |', '|---|---|---|---|---|---|---|',
  ...Object.entries(SPEC).map(([r, x]) => `| ${r} | ${x.canvas}×${x.canvas} | ${x.body} px | ${x.frames.idle} | ${x.frames.walk} | ${x.frames.attack} | ${x.frames.skill} |`), '',
  'บอสสูง 1,020 px = 3 เท่าของมอนสเตอร์ทั่วไป (340 px). หันซ้ายสร้างแยกจริง — อาวุธ/ของในมือ **อยู่มือเดิม** (เช่น เคียวมือขวาเสมอ) ไม่สลับมือเหมือนการกลับภาพ', '');
for (const role of ['boss', 'elite', 'monster']) {
  md.push(`## ${role === 'boss' ? 'บอส' : role === 'elite' ? 'Elite' : 'มอนสเตอร์ทั่วไป'}`, '');
  for (const [id, name, th, gait, look, atk, sk] of MONSTERS) {
    if ((ROLE_OF[id] ?? 'monster') !== role) continue;
    const spec = SPEC[role], master = masterPrompt(look, spec, role);
    out[id] = { name, th, role, cell: spec.canvas + '×' + spec.canvas, body: spec.body, master, clips: {} };
    md.push(`### ${name} (${th}) — \`${id}\``, '', '**MASTER REFERENCE (สร้างก่อน 1 ภาพ)**', '', '```', master, '```', '');
    for (const clip of ['idle', 'walk', 'attack', 'skill']) {
      const n = spec.frames[clip], right = framePrompt(look, gait, atk, sk, clip, 'right', n, spec), left = framePrompt(look, gait, atk, sk, clip, 'left', n, spec);
      out[id].clips[clip] = { frames: n, prompt: '— MASTER REFERENCE —\n' + master + '\n\n— หันขวา —\n' + right + '\n\n— หันซ้าย —\n' + left };
      md.push(`**${CLIP_TH[clip]} — ${n} เฟรม · หันขวา**`, '', '```', right, '```', '', `**${CLIP_TH[clip]} — ${n} เฟรม · หันซ้าย**`, '', '```', left, '```', '');
    }
  }
}
mkdirSync(path.join(ROOT, 'docs/prompts'), { recursive: true });
writeFileSync(path.join(ROOT, 'docs/prompts/MONSTER_BOSS_PROMPTS_2DIR.md'), md.join('\n'));
writeFileSync(path.join(ROOT, 'public/inspector/prompts.json'), JSON.stringify(out));
console.log('prompts for', Object.keys(out).length, 'actors');
