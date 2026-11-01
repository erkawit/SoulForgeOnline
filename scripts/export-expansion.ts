import {writeFileSync} from 'node:fs';
import {ITEM_DEFINITIONS} from '../src/game/items';
import {SKILLS} from '../src/game/skills';
import {CITIES} from '../src/game/content';
import {cityMonsters} from '../src/store/useGameStore';
const q=(s:string)=>`'${s.replaceAll("'","''")}'`;
writeFileSync('supabase/migrations/202610220004_catalog.sql',`-- Canonical server-side prices; never trust values supplied by a client.\nbegin;\ninsert into public.item_definitions(id,name,rarity,npc_value,category) values\n${ITEM_DEFINITIONS.map(d=>`(${q(d.id)},${q(d.name)},${q(d.rarity)},${d.npcValue},${q(d.family)})`).join(',\n')}\non conflict(id) do update set name=excluded.name,rarity=excluded.rarity,npc_value=excluded.npc_value,category=excluded.category;\ncommit;\n`);
writeFileSync('docs/expansion-catalog.json',JSON.stringify({currency:'SoulGod',items:ITEM_DEFINITIONS,skills:SKILLS,maps:Object.values(CITIES).map(c=>({...c,monsters:cityMonsters(c.id)}))},null,2));
