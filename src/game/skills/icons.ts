// User-provided 33-icon atlas; explicit mapping in current skill-definition order.
import { DEFAULT_SKILLS } from './defaults';
export const SKILL_ICON_ATLAS = '/art/ui-forge/skills.png', SKILL_ICON_COLS = 6, SKILL_ICON_ROWS = 6;
const ORDER = DEFAULT_SKILLS.defs.map(d => d.id);
const REFERENCE_CELLS = [1,4,19,9,17,23,5,8,7,21,22,20,29,20,19,33,31,23,24,32,21,7,22,30];
export const skillIconIndex = (id: string | null | undefined) => (id && ORDER.includes(id) ? REFERENCE_CELLS[ORDER.indexOf(id)] - 1 : -1);
/** CSS for an element that should show the icon of `id` (empty object when the skill has no icon cell) */
export function skillIconStyle(id: string | null | undefined): Record<string, string> {
  const i = skillIconIndex(id); if (i < 0 || i >= SKILL_ICON_COLS * SKILL_ICON_ROWS) return {};
  const c = i % SKILL_ICON_COLS, r = Math.floor(i / SKILL_ICON_COLS);
  return { backgroundImage: `url(${SKILL_ICON_ATLAS})`, backgroundSize: `${1261/210*100}% ${1247/200*100}%`,
    backgroundPosition: `${c*210/(1261-210)*100}% ${r*200/(1247-200)*100}%` };
}
