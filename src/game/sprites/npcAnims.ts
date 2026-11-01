// Round 17: painted 8-direction town NPCs (reference/compact-cast-v2/sprit-model/npc): idle + talk, 4 frames each,
// built by blender/sprites/build_npc_atlas.py into public/art/anim/npc-<slug>.webp (each clip = 8 facings × 4 frames).
import type { SpriteAnim } from './anims';
export const NPC_ANIMS: Record<string, SpriteAnim> = {
  'npc-elder-corvin': {"cw":250,"ch":236,"cols":16,"n":64,"fx":0.5,"fy":0.0169,"bodyPx":221.5,"clips":{"idle":[0,4],"talk":[32,4]},"dirs":8},
  'npc-mira-ashvale': {"cw":266,"ch":243,"cols":16,"n":64,"fx":0.5,"fy":0.0165,"bodyPx":219.5,"clips":{"idle":[0,4],"talk":[32,4]},"dirs":8},
  'npc-brannoc-ironhand': {"cw":268,"ch":243,"cols":16,"n":64,"fx":0.5,"fy":0.0165,"bodyPx":220.5,"clips":{"idle":[0,4],"talk":[32,4]},"dirs":8},
  'npc-quartermaster-hale': {"cw":264,"ch":236,"cols":16,"n":64,"fx":0.5,"fy":0.0169,"bodyPx":221.0,"clips":{"idle":[0,4],"talk":[32,4]},"dirs":8},
  'npc-old-jessa': {"cw":262,"ch":230,"cols":16,"n":64,"fx":0.5,"fy":0.0174,"bodyPx":219.5,"clips":{"idle":[0,4],"talk":[32,4]},"dirs":8},
  'npc-sister-lumen': {"cw":258,"ch":248,"cols":16,"n":64,"fx":0.5,"fy":0.0161,"bodyPx":221.0,"clips":{"idle":[0,4],"talk":[32,4]},"dirs":8},
  'npc-silas-vane': {"cw":266,"ch":236,"cols":16,"n":64,"fx":0.5,"fy":0.0169,"bodyPx":221.0,"clips":{"idle":[0,4],"talk":[32,4]},"dirs":8},
  'npc-master-ysolde': {"cw":266,"ch":251,"cols":16,"n":64,"fx":0.5,"fy":0.0159,"bodyPx":223.0,"clips":{"idle":[0,4],"talk":[32,4]},"dirs":8},
  'npc-gatewarden-orrin': {"cw":278,"ch":242,"cols":16,"n":64,"fx":0.5,"fy":0.0165,"bodyPx":222.5,"clips":{"idle":[0,4],"talk":[32,4]},"dirs":8},
  'npc-ranger-kestrel': {"cw":152,"ch":235,"cols":16,"n":64,"fx":0.5,"fy":0.017,"bodyPx":217.5,"clips":{"idle":[0,4],"talk":[32,4]},"dirs":8},
};
