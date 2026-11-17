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
  ['rime-serpent', 'Rime Serpent', 'งูน้ำค้างแข็ง', 'serpent', 'coiled ice-blue serpent with frosty scales, crystalline fin crest and white mane', 'quick strike forward with open fangs', 'frost breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the freezing white-blue mist pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the cell, starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; in this skill the creature stands in the LEFT half of its own cell (feet on the same baseline) so the whole flame fits inside the same cell'],
  ['anvil-guard', 'Anvil Guard', 'องครักษ์ทั่ง', 'biped', 'bulky armored knight of blackened iron with glowing forge cracks, anvil-shaped hammer in one hand, tall cross shield in the other, red tabard', 'hammer smash forward', 'raises the shield and bashes forward, a bright orange forge-spark shockwave'],
  ['furnace-golem', 'Furnace Golem', 'โกเลมเตาหลอม', 'giant', 'round iron furnace golem with a blazing grated belly, chimney on its head, chain-wrapped stone fists', 'heavy stone fist punch forward', 'belly grate opens and blasts a wave of fire forward'],
  ['ember-drake', 'Ember Drake', 'มังกรเพลิงอ่อน', 'drake', 'dark rocky drake with glowing orange lava cracks, spiked back, bat-like orange wings, horned head', 'claw swipe and bite forward', 'fire breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the orange fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the cell, starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; in this skill the creature stands in the LEFT half of its own cell (feet on the same baseline) so the whole flame fits inside the same cell'],
  ['venom-spider', 'Venom Spider', 'แมงมุมพิษ', 'spider', 'black armored spider with a huge glowing toxic-green abdomen, green eyes, dripping venom', 'fang strike forward', 'spits a glob of toxic green venom forward that splashes into a poison puddle'],
  ['spore-beast', 'Spore Beast', 'อสูรสปอร์', 'giant', 'hunched beast covered in red-brown mushroom caps and glowing green spore pods, thick legs', 'heavy forward headbutt with mushroom cap', 'shakes violently, releasing a thick cloud of glowing green spores forward'],
  ['thorn-hydra', 'Thorn Hydra', 'ไฮดราหนาม', 'serpent', 'three-headed serpent hydra with thorny green-brown scales and red frills, coiled thick body', 'the three heads bite forward one after another', 'all three heads rear back and spit thorn barbs forward'],
  ['astral-wraith', 'Astral Wraith', 'วิญญาณดวงดาว', 'float', 'dark violet hooded wraith with starry cosmic robes, glowing purple core in the chest, clawed hands', 'claws forward leaving a purple star-trail', 'opens its arms and fires a beam of violet starlight forward'],
  ['prism-sentinel', 'Prism Sentinel', 'ผู้พิทักษ์ปริซึม', 'float', 'floating dark-green crystal construct with a glowing emerald core and blade-shaped crystal arms', 'crystal blade-arm slash forward', 'core flares and fires a prism beam forward that splits into rainbow shards'],
  ['halo-seraph', 'Halo Seraph', 'เทวทูตรัศมี', 'biped', 'tall fallen seraph with white feathered wings, golden halo, dark-and-white armored robes, holding a golden radiant spear', 'spear thrust forward with a golden flash', 'raises the spear, golden light pillars fall in front of it'],
  ['void-reaper', 'Void Reaper', 'เคียวความว่าง', 'float', 'black hooded reaper with glowing purple eyes and a huge curved violet scythe, smoky void robes', 'wide scythe sweep forward with a violet arc', 'vanishes into smoke and reappears mid-slash, leaving a dark void rift'],
  ['eclipse-drake', 'Eclipse Drake', 'มังกรสุริยคราส', 'drake', 'dark purple-black drake with folded membrane wings, glowing violet eyes and spiked tail', 'claw swipe and bite forward', 'eclipse fire breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the dark violet eclipse fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the cell, starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; in this skill the creature stands in the LEFT half of its own cell (feet on the same baseline) so the whole flame fits inside the same cell'],
  ['crown-colossus', 'Crown Colossus', 'ยักษ์มงกุฎหิน', 'giant', 'colossal stone giant with a small ruined castle crowning its head and shoulders, glowing purple cracks', 'slow massive stone fist slam forward', 'stamps, stone pillars and rubble erupt from the ground in front of it'],
  ['drowned-hierophant', 'Drowned Hierophant', 'มหาปุโรหิตจมน้ำ', 'float', 'skeletal hooded high priest in rotting sea-green robes and chains, ghostly green flames; a long curved reaper SCYTHE with a rusted iron blade held in his RIGHT hand (the hand nearer the viewer, blade pointing forward to the right) and a glowing green soul-lantern on a chain held in his LEFT hand (the far hand), both items visible in every frame', 'sweeps the scythe from back to front in a wide arc toward the right, leaving a ghostly green slash trail; the lantern stays in the left hand', 'raises the lantern in the left hand while the right hand plants the scythe, a huge vortex of drowned green souls swirls up in front of him on the right side'],
  ['worldroot-devourer', 'Worldroot Devourer', 'อสูรกลืนรากโลก', 'drake', 'colossal violet-black dragon with root-like horns and spines, glowing purple veins, folded leathery wings', 'massive bite and claw rake forward', 'violet root-fire breath — the head and neck stretch FORWARD toward the right and the jaws open wide; the violet-black fire pours straight out of the open mouth as a long horizontal cone that widens as it travels toward the right edge of the cell, starting at the teeth, never upward, never sideways, never behind or under the body; frames: inhale and rear back, head snaps forward, full breath (longest flame), breath thins and fades, close jaws and recover; in this skill the creature stands in the LEFT half of its own cell (feet on the same baseline) so the whole flame fits inside the same cell; on the strongest frames small dark roots burst from the ground under the end of the flame, in front of the dragon'],
  ['abyssal-forge-titan', 'Abyssal Forge Titan', 'ไททันเตาหลอมนรก', 'giant', 'hulking titan of black iron and magma, glowing red heart-core in the chest, molten cracks, massive forge-hammer arms', 'giant hammer-arm smash forward', 'slams both arms down, a ring of magma bursts outward and lava geysers erupt forward'],
];

const ROLE_OF = {
  'grave-marshal': 'boss', 'drowned-hierophant': 'boss', 'worldroot-devourer': 'boss', 'abyssal-forge-titan': 'boss',
  'oathscar-aurochs': 'elite', 'tide-wraith': 'elite', 'root-reaper': 'elite',
};
/** cell = cw × ch px, body = how tall the creature is drawn (px). Spacing comes from WIDE cells, never from drawing small:
 *  a boss is drawn 3× the height of a normal monster / hero, with the same detail per pixel. perImage = frames to ask for
 *  in one generated image (big bosses come out cleaner 2 at a time; join the images into the row afterwards). */
const SPEC = {
  monster: { cw: 640, ch: 512, body: 400, perImage: 4, frames: { idle: 4, walk: 6, attack: 6, skill: 6 } },
  elite: { cw: 832, ch: 640, body: 520, perImage: 3, frames: { idle: 4, walk: 6, attack: 6, skill: 6 } },
  boss: { cw: 1920, ch: 1408, body: 1200, perImage: 2, frames: { idle: 6, walk: 8, attack: 8, skill: 10 } },
};
const ACTION = {
  idle: () => 'idle breathing loop: standing still in a ready stance, subtle breathing and small cloth / fur / wisp motion, first and last frame match so it loops',
  walk: (g) => `walking in place toward the right: ${GAIT[g]}, loops seamlessly, the body stays centred in its cell`,
  attack: (_g, m) => `basic attack toward the right: wind-up, fast strike, impact, follow-through, back to stance — ${m}; the strike and any slash or splash point to the RIGHT`,
  skill: (_g, _m, s) => `special skill toward the right: gather power, big release, effect fades, back to stance — ${s}; every effect goes to the RIGHT, nothing behind the body`,
};

function prompt(look, gait, atk, skill, clip, n, spec, role) {
  return [
    '2D game sprite sheet for a dark fantasy isometric action RPG, painterly hand-painted style, rich textures, soft rim light (match the reference image).',
    `Creature: ${look}.`,
    `ONE horizontal row of ${n} frames, each cell ${spec.cw}x${spec.ch} px (wider than tall): ${ACTION[clip](gait, atk, skill)}.`,
    `SIZE AND DETAIL: draw the creature LARGE and fully detailed — about ${spec.body} px tall in every frame`
      + (role === 'boss' ? ' (a boss: three times the height of a normal monster or a hero, a towering giant with fine detail on armor, cloth, bone and effects)' : '')
      + `; never shrink it to make room and never lower the detail or resolution.`,
    `SPACING: the extra room comes from the wide cell — each frame stands alone in the middle of its own cell, with empty transparent space on both sides; `
      + `neighbouring frames are separated by a clear gap of at least ${Math.round(spec.cw * 0.2)} px. `
      + `Weapons, swings, slash trails and spell effects stay inside their own cell and never touch or overlap the next frame.`,
    'Three-quarter view facing RIGHT (body turned to the right edge of the image, face slightly toward the viewer, camera looking down about 35 degrees). '
      + 'Same creature, same size and same foot position in every frame, feet on one baseline (flyers and ghosts hover at one fixed height). '
      + 'Transparent background, no ground shadow, no text, no frame numbers, no grid lines, nothing crossing the cell edges.',
  ].join('\n');
}

const out = {}; const md = [];
md.push('# Prompt มอนสเตอร์ / Elite / บอส — หันขวาอย่างเดียว (เกมกลับภาพเป็นซ้ายเอง)', '',
  'สร้างจาก `scripts/sprites/monster_prompts.mjs` — แก้ข้อความในสคริปต์แล้วรันใหม่ ไม่ต้องแก้ไฟล์นี้ตรง ๆ', '',
  'วิธีใช้: แนบภาพปัจจุบันของตัวนั้นเป็นภาพอ้างอิง → สั่งทีละท่า (ทีละแถว) → ต่อแถวเป็นชีตเดียวเรียง ยืน / เดิน / โจมตี / สกิล '
  + '→ ตรวจใน `/inspector/sprites.html` (“ทดสอบชีตใหม่”) → ใส่เข้าเกมเป็นชีตไม่มี `dirs` (หันขวา, facesLeft ไม่ต้องใส่)', '',
  '| ประเภท | ขนาดช่อง (กว้าง×สูง) | ความสูงตัว | สั่งต่อ 1 ภาพ | ยืน | เดิน | โจมตี | สกิล |', '|---|---|---|---|---|---|---|---|',
  ...Object.entries(SPEC).map(([r, s]) => `| ${r} | ${s.cw}×${s.ch} | ${s.body} px | ${s.perImage} เฟรม | ${s.frames.idle} | ${s.frames.walk} | ${s.frames.attack} | ${s.frames.skill} |`), '',
  'บอสวาดสูง 3 เท่าของมอนสเตอร์ทั่วไป/ตัวละคร ความละเอียดเท่ากันทุกพิกเซล — ห้ามย่อ ระยะห่างได้จากช่องที่กว้างกว่าตัว ไม่ใช่การวาดตัวเล็ก. ภาพใหญ่ให้สั่งทีละ “สั่งต่อ 1 ภาพ” เฟรม แล้วต่อกันเป็นแถว', '');
for (const role of ['boss', 'elite', 'monster']) {
  md.push(`## ${role === 'boss' ? 'บอส' : role === 'elite' ? 'Elite' : 'มอนสเตอร์ทั่วไป'}`, '');
  for (const [id, name, th, gait, look, atk, skill] of MONSTERS) {
    if ((ROLE_OF[id] ?? 'monster') !== role) continue;
    const spec = SPEC[role]; out[id] = { name, th, role, cell: spec.cw + '×' + spec.ch, body: spec.body, clips: {} };
    md.push(`### ${name} (${th}) — \`${id}\``, '');
    for (const clip of ['idle', 'walk', 'attack', 'skill']) {
      const n = spec.frames[clip], p = prompt(look, gait, atk, skill, clip, n, spec, role);
      out[id].clips[clip] = { frames: n, prompt: p };
      md.push(`**${({ idle: 'ยืน', walk: 'เดิน (ช้า)', attack: 'โจมตี', skill: 'สกิล' })[clip]} — ${n} เฟรม**`, '', '```', p, '```', '');
    }
  }
}
mkdirSync(path.join(ROOT, 'docs/prompts'), { recursive: true });
writeFileSync(path.join(ROOT, 'docs/prompts/MONSTER_BOSS_PROMPTS_2DIR.md'), md.join('\n'));
writeFileSync(path.join(ROOT, 'public/inspector/prompts.json'), JSON.stringify(out));
console.log('prompts for', Object.keys(out).length, 'actors');
