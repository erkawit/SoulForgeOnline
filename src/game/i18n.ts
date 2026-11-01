// Round 12: Thai / English / Chinese (Simplified). One dictionary per language for the game's UI chrome — menus, panel
// titles, settings, the title / sign-in / first-run screens, HUD labels and common buttons. Story text (quests, NPC
// lines, item lore) is written in Thai first; `tr()` falls back to Thai for any key a language does not have yet, so a
// missing translation never shows a raw key. Chinese strings are a first pass and need a native speaker's review.
export type Lang = 'th' | 'en' | 'zh';
export const LANGS: [Lang, string][] = [['th', 'ไทย'], ['en', 'English'], ['zh', '中文']];
const TH = {
  'menu.inv': 'กระเป๋า · อุปกรณ์', 'menu.char': 'ข้อมูลตัวละคร', 'menu.skills': 'สกิล', 'menu.quests': 'สมุดเควส', 'menu.codex': 'สมุดสะสมอสูร',
  'menu.party': 'ปาร์ตี้', 'menu.wardrobe': 'ตู้เสื้อผ้า', 'menu.cash': 'Cash Shop', 'menu.market': 'ตลาด', 'menu.map': 'แผนที่โลก', 'menu.guide': 'Wiki · ข้อมูลเกม',
  'menu.settings': 'ตั้งค่า', 'menu.monsters': 'สมุดมอนสเตอร์', 'menu.gm': 'GM Tools',
  'set.title': 'ตั้งค่า', 'set.lang': 'ภาษา', 'set.quality': 'คุณภาพกราฟิก', 'set.quality.hint': 'จำนวนหญ้า ใบไม้ เงา และความละเอียดหน้าจอ',
  'set.low': 'ต่ำ', 'set.medium': 'กลาง', 'set.high': 'สูง', 'set.shadows': 'เงาแบบเรียลไทม์', 'set.dmg': 'ตัวเลขดาเมจ', 'set.shake': 'กล้องสั่นเมื่อคริติคอล',
  'set.wind': 'แรงลม', 'set.windDir': 'ทิศลม', 'set.cam': 'ระยะกล้อง', 'set.ui': 'ขนาด UI', 'set.fps': 'แสดง FPS', 'set.music': 'เสียงเพลง', 'set.sfx': 'เสียงเอฟเฟกต์',
  'set.mute': 'ปิดเสียงทั้งหมด', 'set.controls': 'ปุ่มควบคุม',
  'first.title': 'ตั้งค่าเริ่มต้น', 'first.hint': 'ปรับได้ภายหลังที่ ตั้งค่า (O)', 'first.go': 'เริ่มเลย',
  'auth.login': 'เข้าสู่ระบบ', 'auth.register': 'สมัครด้วยโค้ดเชิญ', 'auth.user': 'ชื่อผู้ใช้', 'auth.pass': 'รหัสผ่าน', 'auth.invite': 'โค้ดเชิญ',
  'hud.auto': 'AUTO', 'hud.party': 'ปาร์ตี้', 'hud.level': 'เลเวล', 'common.close': 'ปิด', 'common.buy': 'ซื้อ', 'common.wear': 'สวม', 'common.takeOff': 'ถอด', 'common.invite': 'ชวน',
  'party.bonus': 'โบนัส EXP ปาร์ตี้', 'party.far': 'อยู่ไกลเกินระยะ', 'party.otherMap': 'อยู่คนละแมพ', 'party.nearby': 'ผู้เล่นบนแมพนี้',
  'boss.unyielding': 'ใจอสูรไม่ยอมแพ้ — ต้องมีผู้ร่วมรบอย่างน้อย 3 คน บอสจึงจะรับดาเมจเต็ม',
};
export type Key = keyof typeof TH;
const EN: Partial<Record<Key, string>> = {
  'menu.inv': 'Bag · Equipment', 'menu.char': 'Character', 'menu.skills': 'Skills', 'menu.quests': 'Quest Log', 'menu.codex': 'Monster Codex',
  'menu.party': 'Party', 'menu.wardrobe': 'Wardrobe', 'menu.cash': 'Cash Shop', 'menu.market': 'Market', 'menu.map': 'World Map', 'menu.guide': 'Wiki · Game Info',
  'menu.settings': 'Settings', 'menu.monsters': 'Bestiary', 'menu.gm': 'GM Tools',
  'set.title': 'Settings', 'set.lang': 'Language', 'set.quality': 'Graphics quality', 'set.quality.hint': 'Grass, foliage, shadows and render resolution',
  'set.low': 'Low', 'set.medium': 'Medium', 'set.high': 'High', 'set.shadows': 'Real-time shadows', 'set.dmg': 'Damage numbers', 'set.shake': 'Screen shake on crits',
  'set.wind': 'Wind strength', 'set.windDir': 'Wind direction', 'set.cam': 'Camera distance', 'set.ui': 'UI scale', 'set.fps': 'Show FPS', 'set.music': 'Music', 'set.sfx': 'Sound effects',
  'set.mute': 'Mute all', 'set.controls': 'Controls',
  'first.title': 'Quick setup', 'first.hint': 'You can change these later in Settings (O)', 'first.go': 'Start',
  'auth.login': 'Sign in', 'auth.register': 'Register with an invite code', 'auth.user': 'Username', 'auth.pass': 'Password', 'auth.invite': 'Invite code',
  'hud.party': 'Party', 'hud.level': 'Level', 'common.close': 'Close', 'common.buy': 'Buy', 'common.wear': 'Wear', 'common.takeOff': 'Take off', 'common.invite': 'Invite',
  'party.bonus': 'Party EXP bonus', 'party.far': 'Out of range', 'party.otherMap': 'On another map', 'party.nearby': 'Players on this map',
  'boss.unyielding': 'Unyielding — the boss takes full damage only while at least 3 players fight it',
};
const ZH: Partial<Record<Key, string>> = {
  'menu.inv': '背包 · 装备', 'menu.char': '角色信息', 'menu.skills': '技能', 'menu.quests': '任务日志', 'menu.codex': '怪物图鉴',
  'menu.party': '队伍', 'menu.wardrobe': '衣柜', 'menu.cash': '商城', 'menu.market': '市场', 'menu.map': '世界地图', 'menu.guide': '百科 · 游戏资料',
  'menu.settings': '设置', 'menu.monsters': '怪物列表', 'menu.gm': 'GM 工具',
  'set.title': '设置', 'set.lang': '语言', 'set.quality': '画面质量', 'set.quality.hint': '草地、植被、阴影与渲染分辨率',
  'set.low': '低', 'set.medium': '中', 'set.high': '高', 'set.shadows': '实时阴影', 'set.dmg': '伤害数字', 'set.shake': '暴击时镜头震动',
  'set.wind': '风力', 'set.windDir': '风向', 'set.cam': '镜头距离', 'set.ui': '界面大小', 'set.fps': '显示 FPS', 'set.music': '音乐', 'set.sfx': '音效',
  'set.mute': '全部静音', 'set.controls': '操作按键',
  'first.title': '快速设置', 'first.hint': '之后可在 设置 (O) 中修改', 'first.go': '开始',
  'auth.login': '登录', 'auth.register': '使用邀请码注册', 'auth.user': '用户名', 'auth.pass': '密码', 'auth.invite': '邀请码',
  'hud.party': '队伍', 'hud.level': '等级', 'common.close': '关闭', 'common.buy': '购买', 'common.wear': '穿戴', 'common.takeOff': '卸下', 'common.invite': '邀请',
  'party.bonus': '队伍经验加成', 'party.far': '超出范围', 'party.otherMap': '在其他地图', 'party.nearby': '本地图玩家',
  'boss.unyielding': '不屈 — 至少 3 名玩家共同作战时首领才承受全额伤害',
};
const DICT: Record<Lang, Partial<Record<Key, string>>> = { th: TH, en: EN, zh: ZH };
let current: Lang = 'th';
export const setLang = (l: Lang) => { current = LANGS.some(([k]) => k === l) ? l : 'th'; };
export const getLang = () => current;
export const tr = (k: Key, l: Lang = current) => DICT[l][k] ?? TH[k];
/** how complete a language is (UI chrome keys only) */
export const coverage = (l: Lang) => Object.keys(TH).filter(k => DICT[l][k as Key]).length / Object.keys(TH).length;
