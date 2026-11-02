// Round 20: 8-direction idle sheets of the new classes (ChatGPT, 5 painted facings + 3 mirrored), built by
// scripts/sprites/build_class_idle.py — do not edit by hand. Walk / attack / skill play as rig motion on these frames
// until the per-action sheets ship.
import type { SpriteAnim } from './anims';
import type { SpriteFrame } from './frames';
export const CLASS_ANIMS: Record<string, SpriteAnim> = {
 "m-Paladin": {
  "cw": 278,
  "ch": 220,
  "cols": 16,
  "n": 32,
  "fx": 0.5,
  "fy": 0.0273,
  "bodyPx": 200,
  "clips": {
   "idle": [
    0,
    4
   ]
  },
  "dirs": 8
 },
 "m-Hawkeye": {
  "cw": 188,
  "ch": 222,
  "cols": 16,
  "n": 32,
  "fx": 0.5,
  "fy": 0.027,
  "bodyPx": 200,
  "clips": {
   "idle": [
    0,
    4
   ]
  },
  "dirs": 8
 },
 "m-RuneMaster": {
  "cw": 264,
  "ch": 229,
  "cols": 16,
  "n": 32,
  "fx": 0.5,
  "fy": 0.0262,
  "bodyPx": 200,
  "clips": {
   "idle": [
    0,
    4
   ]
  },
  "dirs": 8
 },
 "m-Elementalist": {
  "cw": 246,
  "ch": 213,
  "cols": 16,
  "n": 32,
  "fx": 0.5,
  "fy": 0.0282,
  "bodyPx": 200,
  "clips": {
   "idle": [
    0,
    4
   ]
  },
  "dirs": 8
 },
 "m-Assassin": {
  "cw": 258,
  "ch": 224,
  "cols": 16,
  "n": 32,
  "fx": 0.5,
  "fy": 0.0268,
  "bodyPx": 200,
  "clips": {
   "idle": [
    0,
    4
   ]
  },
  "dirs": 8
 },
 "m-HighPriest": {
  "cw": 184,
  "ch": 220,
  "cols": 16,
  "n": 32,
  "fx": 0.5,
  "fy": 0.0273,
  "bodyPx": 200,
  "clips": {
   "idle": [
    0,
    4
   ]
  },
  "dirs": 8
 },
 "m-Inquisitor": {
  "cw": 266,
  "ch": 227,
  "cols": 16,
  "n": 32,
  "fx": 0.5,
  "fy": 0.0264,
  "bodyPx": 200,
  "clips": {
   "idle": [
    0,
    4
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
  "fy": 0.0273,
  "px": [
   193,
   220
  ]
 },
 "m-Hawkeye": {
  "w": 1.1259,
  "h": 1.62,
  "fx": 0.4676,
  "fy": 0.027,
  "px": [
   139,
   222
  ]
 },
 "m-RuneMaster": {
  "w": 1.6686,
  "h": 1.62,
  "fx": 0.6068,
  "fy": 0.0262,
  "px": [
   206,
   229
  ]
 },
 "m-Elementalist": {
  "w": 1.1016,
  "h": 1.62,
  "fx": 0.5,
  "fy": 0.0282,
  "px": [
   136,
   213
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
  "fy": 0.0273,
  "px": [
   149,
   220
  ]
 },
 "m-Inquisitor": {
  "w": 1.4094,
  "h": 1.62,
  "fx": 0.546,
  "fy": 0.0264,
  "px": [
   174,
   227
  ]
 }
};
