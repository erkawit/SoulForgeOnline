// Round 20: 8-direction idle sheets of the new classes (ChatGPT, 5 painted facings + 3 mirrored), built by
// scripts/sprites/build_class_idle.py — do not edit by hand. Actions without a sheet play as rig motion on the idle frames
import type { SpriteAnim } from './anims';
import type { SpriteFrame } from './frames';
export const CLASS_ANIMS: Record<string, SpriteAnim> = {
 "m-Paladin": {
  "cw": 388,
  "ch": 236,
  "cols": 10,
  "n": 128,
  "fx": 0.5,
  "fy": 0.0254,
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
   ]
  },
  "dirs": 8
 },
 "m-Hawkeye": {
  "cw": 360,
  "ch": 223,
  "cols": 11,
  "n": 128,
  "fx": 0.5,
  "fy": 0.0269,
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
   ]
  },
  "dirs": 8
 },
 "m-RuneMaster": {
  "cw": 490,
  "ch": 232,
  "cols": 8,
  "n": 128,
  "fx": 0.5,
  "fy": 0.0259,
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
   ]
  },
  "dirs": 8
 },
 "m-Elementalist": {
  "cw": 416,
  "ch": 241,
  "cols": 9,
  "n": 128,
  "fx": 0.5,
  "fy": 0.0249,
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
   ]
  },
  "dirs": 8
 },
 "m-Assassin": {
  "cw": 314,
  "ch": 224,
  "cols": 13,
  "n": 128,
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
   ]
  },
  "dirs": 8
 },
 "m-HighPriest": {
  "cw": 476,
  "ch": 232,
  "cols": 8,
  "n": 128,
  "fx": 0.5,
  "fy": 0.0259,
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
   ]
  },
  "dirs": 8
 },
 "m-Inquisitor": {
  "cw": 268,
  "ch": 264,
  "cols": 15,
  "n": 128,
  "fx": 0.5,
  "fy": 0.0227,
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
   ]
  },
  "dirs": 8
 },
 "m-Berserker": {
  "cw": 426,
  "ch": 251,
  "cols": 9,
  "n": 200,
  "fx": 0.5,
  "fy": 0.0239,
  "bodyPx": 200,
  "clips": {
   "idle": [
    0,
    4
   ],
   "attack": [
    32,
    6
   ],
   "skill": [
    80,
    6
   ],
   "buff": [
    128,
    4
   ],
   "death": [
    160,
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
  "fy": 0.0254,
  "px": [
   193,
   236
  ]
 },
 "m-Hawkeye": {
  "w": 1.1259,
  "h": 1.62,
  "fx": 0.4676,
  "fy": 0.0269,
  "px": [
   139,
   223
  ]
 },
 "m-RuneMaster": {
  "w": 1.6686,
  "h": 1.62,
  "fx": 0.6068,
  "fy": 0.0259,
  "px": [
   206,
   232
  ]
 },
 "m-Elementalist": {
  "w": 1.1016,
  "h": 1.62,
  "fx": 0.5,
  "fy": 0.0249,
  "px": [
   136,
   241
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
   149,
   232
  ]
 },
 "m-Inquisitor": {
  "w": 1.4094,
  "h": 1.62,
  "fx": 0.546,
  "fy": 0.0227,
  "px": [
   174,
   264
  ]
 },
 "m-Berserker": {
  "w": 1.8468,
  "h": 1.62,
  "fx": 0.4781,
  "fy": 0.0239,
  "px": [
   228,
   251
  ]
 }
};
