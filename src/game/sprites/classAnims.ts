// Round 20: 8-direction idle sheets of the new classes (ChatGPT, 5 painted facings + 3 mirrored), built by
// scripts/sprites/build_class_idle.py — do not edit by hand. Actions without a sheet play as rig motion on the idle frames
import type { SpriteAnim } from './anims';
import type { SpriteFrame } from './frames';
export const CLASS_ANIMS: Record<string, SpriteAnim> = {
 "m-Paladin": {
  "cw": 170,
  "ch": 203,
  "cols": 24,
  "n": 472,
  "fx": 0.5353,
  "fy": 0.1133,
  "bodyPx": 130.0,
  "clips": {
   "idle": [
    0,
    1
   ],
   "walk": [
    8,
    8
   ],
   "attack": [
    72,
    8
   ],
   "death": [
    136,
    6
   ],
   "sk:p-shield-bash": [
    184,
    6
   ],
   "sk:p-sacred-vow": [
    232,
    6
   ],
   "sk:p-judgement-blade": [
    280,
    6
   ],
   "sk:p-holy-cleave": [
    328,
    6
   ],
   "sk:p-bulwark": [
    376,
    6
   ],
   "sk:p-dawn-crusade": [
    424,
    6
   ],
   "skill": [
    280,
    6
   ],
   "buff": [
    232,
    6
   ]
  },
  "dirs": 8
 },
 "m-Hawkeye": {
  "cw": 360,
  "ch": 242,
  "cols": 11,
  "n": 176,
  "fx": 0.5,
  "fy": 0.0248,
  "bodyPx": 200,
  "clips": {
   "idle": [
    0,
    4
   ],
   "walk": [
    32,
    6
   ],
   "attack": [
    80,
    6
   ],
   "skill": [
    128,
    6
   ]
  },
  "dirs": 8
 },
 "m-RuneMaster": {
  "cw": 429,
  "ch": 204,
  "cols": 9,
  "n": 176,
  "fx": 0.5,
  "fy": 0.0258,
  "bodyPx": 175.11,
  "clips": {
   "idle": [
    0,
    4
   ],
   "walk": [
    32,
    6
   ],
   "attack": [
    80,
    6
   ],
   "skill": [
    128,
    6
   ]
  },
  "dirs": 8
 },
 "m-Elementalist": {
  "cw": 374,
  "ch": 227,
  "cols": 10,
  "n": 176,
  "fx": 0.5,
  "fy": 0.0238,
  "bodyPx": 180.16,
  "clips": {
   "idle": [
    0,
    4
   ],
   "walk": [
    32,
    6
   ],
   "attack": [
    80,
    6
   ],
   "skill": [
    128,
    6
   ]
  },
  "dirs": 8
 },
 "m-Assassin": {
  "cw": 314,
  "ch": 224,
  "cols": 13,
  "n": 176,
  "fx": 0.5,
  "fy": 0.0268,
  "bodyPx": 200,
  "clips": {
   "idle": [
    0,
    4
   ],
   "walk": [
    32,
    6
   ],
   "attack": [
    80,
    6
   ],
   "skill": [
    128,
    6
   ]
  },
  "dirs": 8
 },
 "m-HighPriest": {
  "cw": 419,
  "ch": 204,
  "cols": 9,
  "n": 176,
  "fx": 0.5,
  "fy": 0.0259,
  "bodyPx": 175.86,
  "clips": {
   "idle": [
    0,
    4
   ],
   "walk": [
    32,
    6
   ],
   "attack": [
    80,
    6
   ],
   "skill": [
    128,
    6
   ]
  },
  "dirs": 8
 },
 "m-Inquisitor": {
  "cw": 326,
  "ch": 273,
  "cols": 12,
  "n": 176,
  "fx": 0.5,
  "fy": 0.0214,
  "bodyPx": 194.31,
  "clips": {
   "idle": [
    0,
    4
   ],
   "walk": [
    32,
    6
   ],
   "attack": [
    80,
    6
   ],
   "skill": [
    128,
    6
   ]
  },
  "dirs": 8
 },
 "m-Berserker": {
  "cw": 330,
  "ch": 195,
  "cols": 12,
  "n": 248,
  "fx": 0.5,
  "fy": 0.0239,
  "bodyPx": 155.38,
  "clips": {
   "idle": [
    0,
    4
   ],
   "walk": [
    32,
    6
   ],
   "attack": [
    80,
    6
   ],
   "skill": [
    128,
    6
   ],
   "buff": [
    176,
    4
   ],
   "death": [
    208,
    5
   ]
  },
  "dirs": 8
 }
};
export const CLASS_FRAMES: Record<string, SpriteFrame> = {
 "m-Paladin": {
  "w": 1.5633,
  "h": 1.62,
  "fx": 0.4197,
  "fy": 0.0243,
  "px": [
   170,
   217
  ]
 },
 "m-Hawkeye": {
  "w": 1.1259,
  "h": 1.62,
  "fx": 0.4676,
  "fy": 0.0248,
  "px": [
   139,
   242
  ]
 },
 "m-RuneMaster": {
  "w": 1.6686,
  "h": 1.62,
  "fx": 0.6068,
  "fy": 0.0258,
  "px": [
   180,
   204
  ]
 },
 "m-Elementalist": {
  "w": 1.1016,
  "h": 1.62,
  "fx": 0.5,
  "fy": 0.0238,
  "px": [
   122,
   227
  ]
 },
 "m-Assassin": {
  "w": 1.701,
  "h": 1.62,
  "fx": 0.4905,
  "fy": 0.0268,
  "px": [
   210,
   224
  ]
 },
 "m-HighPriest": {
  "w": 1.2069,
  "h": 1.62,
  "fx": 0.5101,
  "fy": 0.0259,
  "px": [
   131,
   204
  ]
 },
 "m-Inquisitor": {
  "w": 1.4094,
  "h": 1.62,
  "fx": 0.546,
  "fy": 0.0214,
  "px": [
   169,
   273
  ]
 },
 "m-Berserker": {
  "w": 1.8468,
  "h": 1.62,
  "fx": 0.4781,
  "fy": 0.0239,
  "px": [
   177,
   195
  ]
 }
};
