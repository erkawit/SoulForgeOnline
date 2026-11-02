// Skill codex for the expansion journal — round 13: built from the playable library (skills/defaults.ts), so the journal
// always shows what the game really has: Berserker (class 1, 6 active + 6 passive) and Reaver (Lv60, 6 + 6 that evolve
// the Berserker skills). The old five-class design catalog (64 design-only skills per class) is retired.
import {type PromotionId} from './advancement';
import {type ClassId} from './content';
import {DEFAULT_SKILLS} from './skills/defaults';
export type Skill={id:string;name:string;base:ClassId;job:string;stage:1|2|3|4;kind:'active'|'passive'|'ultimate1'|'ultimate2'|'architected';description:string;icon:number;locked:boolean};
export const SKILLS:Skill[]=DEFAULT_SKILLS.defs.map((d,icon)=>({
 id:d.id,name:d.name,base:d.cls as ClassId,job:d.promotion??d.cls,stage:d.promotion?3:1,
 kind:d.ultimate?(d.promotion?'ultimate2':'ultimate1'):d.kind,description:`${d.th} · ${d.description}`,icon,locked:false,
}));
export function unlockedSkills(base:ClassId,promotion?:PromotionId){return SKILLS.filter(s=>s.base===base&&!s.locked&&(s.stage===1||s.job===promotion));}
/** one ultimate in the loadout: the Reaver's Cataclysm Descent replaces Whirlwind, they are never equipped together */
export function validUltimateLoadout(kinds:Skill['kind'][]){return !(kinds.includes('ultimate1')&&(kinds.includes('ultimate2')||kinds.includes('architected')))&&new Set(kinds).size===kinds.length;}
