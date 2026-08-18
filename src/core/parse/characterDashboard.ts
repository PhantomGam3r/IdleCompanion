import { asIndexedNumbers, asNumber, asRecord, forIndexed, toList } from './helpers';
import { SKILL_NAMES } from './parseSave';
import type {
  AnvilOverdueSlot,
  Character,
  CharacterOps,
  CrystalCountdownSkill,
  ItemStat,
  ParsedAccount,
  ReadyTalent,
  ToolUpgrade,
  UpgradeSlotItem
} from './types';

const HAMMER_HAMMER_CODE = '_4';
const CALL_ME_ASH_BUBBLE = { color: 'green' as const, index: 2 };
const ARENA_THIRD_BUBBLE_WAVE = 170;
const POST_OFFICE_BOX_MAX = 400;
const ANVIL_OVERDUE_MINUTES = 30;
const CRYSTAL_COUNTDOWN_TALENT = 42;
const UNENDING_ENERGY_PRAYER = 2;
const MAESTRO_IDS = new Set([3, 4, 5]);
const DIV_STYLE_NAMES = ['Stable', 'Horsefly', 'Frog', 'Slug', 'Bee', 'TranQi', 'Snail', 'Mindful'];
const SKILLING_AFK = new Set([
  'Mining',
  'Smithing',
  'Chopping',
  'Fishing',
  'Alchemy',
  'Catching',
  'Trapping',
  'Construction',
  'Worship',
  'Cooking',
  'Breeding',
  'Laboratory',
  'Sailing',
  'Divinity',
  'Gaming',
  'Farming',
  'Sneaking',
  'Summoning',
  'Spelunking',
  'Nothing',
  'Paying_Respect'
]);
const NOTHING_AFK = new Set(['', '_', 'Nothing', 'Paying_Respect', 'Paying Respect']);
const COOLDOWN_TALENTS: Record<number, string> = {
  32: 'Printer Go Brrr',
  130: 'Refinery Throttle',
  490: 'Cranium Cooking',
  25: "It's Your Birthday!",
  45: 'Void Trial Rerun',
  370: 'Arena Spirit',
  145: 'Taste Test'
};
const TOOL_TIERS: { rawName: string; displayName: string; lv: number }[][] = [
  [
    { rawName: 'EquipmentTools1', displayName: 'Copper Pickaxe', lv: 1 },
    { rawName: 'EquipmentTools2', displayName: 'Iron Pickaxe', lv: 10 },
    { rawName: 'EquipmentTools3', displayName: 'Gold Pickaxe', lv: 20 },
    { rawName: 'EquipmentTools5', displayName: 'Platinum Pickaxe', lv: 30 },
    { rawName: 'EquipmentTools6', displayName: 'Dementia Pickaxe', lv: 40 },
    { rawName: 'EquipmentTools7', displayName: 'Void Pickaxe', lv: 50 },
    { rawName: 'EquipmentTools8', displayName: 'Lustre Pickaxe', lv: 70 },
    { rawName: 'EquipmentTools9', displayName: 'Starfire Pickaxe', lv: 90 },
    { rawName: 'EquipmentTools11', displayName: 'Dreadlo Pickaxe', lv: 110 },
    { rawName: 'EquipmentTools12', displayName: 'Godshard Pickaxe', lv: 120 },
    { rawName: 'EquipmentTools14', displayName: 'Marbiglass Pickaxe', lv: 130 }
  ],
  [
    { rawName: 'EquipmentToolsHatchet1', displayName: 'Copper Chopper', lv: 1 },
    { rawName: 'EquipmentToolsHatchet2', displayName: 'Iron Hatchet', lv: 10 },
    { rawName: 'EquipmentToolsHatchet4', displayName: 'Golden Axe', lv: 20 },
    { rawName: 'EquipmentToolsHatchet5', displayName: 'Plat Hatchet', lv: 30 },
    { rawName: 'EquipmentToolsHatchet6', displayName: 'Dementia Dicer', lv: 40 },
    { rawName: 'EquipmentToolsHatchet7', displayName: 'Void Imperium Axe', lv: 50 },
    { rawName: 'EquipmentToolsHatchet8', displayName: 'Lustre Logger', lv: 70 },
    { rawName: 'EquipmentToolsHatchet9', displayName: 'Starfire Hatchet', lv: 90 },
    { rawName: 'EquipmentToolsHatchet10', displayName: 'Dreadlo Hatchet', lv: 110 },
    { rawName: 'EquipmentToolsHatchet12', displayName: 'Godshard Hatchet', lv: 120 }
  ],
  [
    { rawName: 'FishingRod2', displayName: 'Copper Fish Rod', lv: 1 },
    { rawName: 'FishingRod3', displayName: 'Iron Fishing Rod', lv: 10 },
    { rawName: 'FishingRod4', displayName: 'Gold Fishing Rod', lv: 20 },
    { rawName: 'FishingRod5', displayName: 'Plat Fishing Rod', lv: 30 },
    { rawName: 'FishingRod6', displayName: 'Dementia Rod for Fishing', lv: 40 },
    { rawName: 'FishingRod7', displayName: 'Void Imperium Rod', lv: 50 },
    { rawName: 'FishingRod8', displayName: 'Lustre Rod', lv: 70 },
    { rawName: 'FishingRod9', displayName: 'Starfire Rod', lv: 90 },
    { rawName: 'FishingRod10', displayName: 'Dreadlo Rod', lv: 110 },
    { rawName: 'FishingRod11', displayName: 'Godshard Rod', lv: 120 }
  ],
  [
    { rawName: 'CatchingNet2', displayName: 'Copper Netted Net', lv: 1 },
    { rawName: 'CatchingNet3', displayName: 'Reinforced Net', lv: 10 },
    { rawName: 'CatchingNet4', displayName: 'Golden Net', lv: 20 },
    { rawName: 'CatchingNet5', displayName: 'Platinet', lv: 30 },
    { rawName: 'CatchingNet6', displayName: 'Dementia Net', lv: 40 },
    { rawName: 'CatchingNet7', displayName: 'Void Imperium Net', lv: 50 },
    { rawName: 'CatchingNet8', displayName: 'Lustre Netting', lv: 70 },
    { rawName: 'CatchingNet9', displayName: 'Starfire Trim Netting', lv: 90 },
    { rawName: 'CatchingNet10', displayName: 'Dreadlo Matted Netting', lv: 110 },
    { rawName: 'CatchingNet11', displayName: 'Godshard Net', lv: 120 }
  ],
  [
    { rawName: 'TrapBoxSet1', displayName: 'Cardboard Traps', lv: 1 },
    { rawName: 'TrapBoxSet2', displayName: 'Silkskin Traps', lv: 10 },
    { rawName: 'TrapBoxSet3', displayName: 'Wooden Traps', lv: 20 },
    { rawName: 'TrapBoxSet4', displayName: 'Natural Traps', lv: 30 },
    { rawName: 'TrapBoxSet5', displayName: 'Steel Traps', lv: 40 },
    { rawName: 'TrapBoxSet6', displayName: 'Royal Traps', lv: 50 },
    { rawName: 'TrapBoxSet7', displayName: 'Egalitarian Traps', lv: 70 },
    { rawName: 'TrapBoxSet8', displayName: 'Forbidden Traps', lv: 90 },
    { rawName: 'TrapBoxSet9', displayName: 'Containment of the Zrgyuls', lv: 110 },
    { rawName: 'TrapBoxSet10', displayName: 'Traps of the Gods', lv: 120 }
  ],
  [
    { rawName: 'WorshipSkull1', displayName: 'Wax Skull', lv: 1 },
    { rawName: 'WorshipSkull2', displayName: 'Ceramic Skull', lv: 10 },
    { rawName: 'WorshipSkull3', displayName: 'Horned Skull', lv: 25 },
    { rawName: 'WorshipSkull4', displayName: 'Prickle Skull', lv: 35 },
    { rawName: 'WorshipSkull5', displayName: 'Manifested Skull', lv: 40 },
    { rawName: 'WorshipSkull6', displayName: 'Glauss Skull', lv: 55 },
    { rawName: 'WorshipSkull7', displayName: 'Luciferian Skull', lv: 70 },
    { rawName: 'WorshipSkull9', displayName: 'Dreadnaught Skull', lv: 90 },
    { rawName: 'WorshipSkull10', displayName: 'Cultist Skull', lv: 110 },
    { rawName: 'WorshipSkull11', displayName: 'Crystal Skull of Esquire Vnoze', lv: 120 }
  ],
  [
    { rawName: 'DNAgun1', displayName: 'DNA Splicer', lv: 1 },
    { rawName: 'DNAgun2', displayName: 'DNA Splicer', lv: 40 },
    { rawName: 'DNAgun3', displayName: 'DNA Splicer', lv: 80 }
  ]
];

function option(data: Record<string, unknown>, index: number): number {
  const list = toList(data.OptLacc);
  const rec = asRecord(data.OptLacc);
  if (index < list.length && list[index] !== undefined) return asNumber(list[index]);
  return asNumber(rec[String(index)]);
}

function stringList(value: unknown): string[] {
  const out: string[] = [];
  forIndexed(value, (_index, item) => {
    if (typeof item === 'string') out.push(item);
    else if (item != null) out.push(String(item));
  });
  return out;
}

function nestedList(value: unknown, section: number): string[] {
  const rows = toList(value);
  return stringList(rows[section]);
}

function itemStat(rawName: string, details: unknown): ItemStat {
  const rec = asRecord(details);
  return {
    rawName,
    weaponPower: asNumber(rec.Weapon_Power ?? rec.WeaponPower),
    uq1: asNumber(rec.UQ1val),
    uq2: asNumber(rec.UQ2val),
    uq1txt: String(rec.UQ1txt ?? ''),
    upgradeSlots: asNumber(rec.Upgrade_Slots_Left ?? rec.UpgradeSlotsLeft),
    type: String(rec.Type ?? ''),
    premium: asNumber(rec.Premiumified) > 0 || String(rec.Type ?? '') === 'PREMIUM_HELMET'
  };
}

function mapStats(names: string[], mapValue: unknown): ItemStat[] {
  const map = asRecord(mapValue);
  const rows = toList(mapValue);
  return names.map((rawName, index) => {
    const details = rows[index] ?? map[String(index)] ?? {};
    return itemStat(rawName, details);
  });
}

function afkKind(target: string): CharacterOps['afkKind'] {
  if (NOTHING_AFK.has(target)) return 'nothing';
  if (SKILLING_AFK.has(target)) return 'skilling';
  return 'fighting';
}

function afkTimeMs(raw: number): number {
  if (raw > 1e12) return raw;
  if (raw > 1e9) return raw * 1000;
  return 0;
}

function agilitySpeedBonus(agility: number): number {
  let base = (Math.pow(agility + 1, 0.37) - 1) / 40;
  if (agility > 1000) base = ((agility - 1000) / (agility + 2500)) * 0.5 + 0.297;
  return base * 2 + 1;
}

function skillExpReq(skillIndex: number, level: number): number {
  const t = level;
  if (skillIndex === 0) {
    return (15 + Math.pow(t, 1.9) + 11 * t) * Math.pow(1.208 - Math.min(0.164, (0.215 * t) / (t + 100)), t) - 15;
  }
  if (skillIndex === 2) {
    return (15 + Math.pow(t, 2) + 13 * t) * Math.pow(1.225 - Math.min(0.114, (0.135 * t) / (t + 50)), t) - 26;
  }
  if (skillIndex === 8) {
    if (t < 71) {
      return ((10 + Math.pow(t, 2.81) + 4 * t) * Math.pow(1.117 - (0.135 * t) / (t + 5), t) - 6) * (1 + Math.pow(t, 1.72) / 300);
    }
    return (((10 + Math.pow(t, 2.81) + 4 * t) * Math.pow(1.003, t) - 6) / 2.35) * (1 + Math.pow(t, 1.72) / 300);
  }
  if (skillIndex === 9) {
    return (15 + Math.pow(t, 1.3) + 6 * t) * Math.pow(1.17 - Math.min(0.07, (0.135 * t) / (t + 50)), t) - 26;
  }
  return (15 + Math.pow(t, 2) + 15 * t) * Math.pow(1.225 - Math.min(0.18, (0.135 * t) / (t + 50)), t) - 30;
}

function crystalCountdownMax(level: number): number {
  if (level <= 0) return 0;
  return (19 * level) / (level + 50);
}

function lastMatchingTool(list: { rawName: string; displayName: string; lv: number }[], skillLv: number): ToolUpgrade | null {
  let best: ToolUpgrade | null = null;
  for (const tool of list) {
    if (skillLv >= tool.lv) best = { rawName: tool.rawName, displayName: tool.displayName };
  }
  return best;
}

function displayItem(rawName: string): string {
  return rawName.replace(/^Equipment/, '').replace(/_/g, ' ');
}

function formActive(buffs: unknown[], talentId: number): boolean {
  return buffs.some((row) => asIndexedNumbers(row)[0] === talentId);
}

function trapSetMax(toolName: string, plusOne: boolean): number {
  const match = /TrapBoxSet(\d+)/.exec(toolName);
  const set = match ? Number(match[1]) : 0;
  return Math.min(8, Math.max(0, set) + (plusOne ? 1 : 0));
}

function skullSpeed(toolName: string): number {
  const match = /WorshipSkull(\d+)/.exec(toolName);
  return match ? Number(match[1]) : 0;
}

function worshipChargeRate(worshipLevel: number, skull: number): number {
  if (skull < 3) {
    return (
      6 /
      Math.max(
        5.7 + Math.pow(4 - skull, 2.2) - (0.9 * Math.pow(worshipLevel, 0.5)) / (Math.pow(worshipLevel, 0.5) + 250) + (0.6 * worshipLevel) / (worshipLevel + 40),
        0.57
      )
    );
  }
  return (
    6 /
    Math.max(
      5.7 -
        (0.2 * Math.pow(skull, 1.3) +
          (0.9 * Math.pow(worshipLevel, 0.5)) / (Math.pow(worshipLevel, 0.5) + 250) +
          (0.6 * worshipLevel) / (worshipLevel + 40)),
      0.57
    )
  );
}

export function parseCharacterOps(data: Record<string, unknown>, account: ParsedAccount): CharacterOps[] {
  const timeAway = asRecord(data.TimeAway);
  const globalTimeSec = asNumber(timeAway.GlobalTime);
  const lastUpdatedMs = account.lastUpdatedMs ?? (globalTimeSec > 0 ? globalTimeSec * 1000 : Date.now());
  const now = Date.now();
  const arenaWave = option(data, 89);
  const maxBubbles = arenaWave >= ARENA_THIRD_BUBBLE_WAVE ? 3 : 2;
  const sheepie = account.companionNames.includes('Sheepie');
  const ashLevel =
    account.bubbles.find((bubble) => bubble.color === CALL_ME_ASH_BUBBLE.color && bubble.index === CALL_ME_ASH_BUBBLE.index)
      ?.level ?? 0;
  const starSg = asRecord(data.StarSg);
  const starEntries = Object.entries(starSg).filter(
    ([name, value]) => !name.includes('Filler') && !name.includes('Unknown') && !name.includes('Locked') && asNumber(value) > 0
  );
  const allStarSignsInfinite =
    starEntries.length > 0 && starEntries.every(([, value]) => asNumber(value) >= 2);
  let maxStarSigns = 1;
  for (const [name] of starEntries) {
    if (name.includes('Chronus')) maxStarSigns = Math.max(maxStarSigns, 2);
    if (name.includes('Hydron')) maxStarSigns = Math.max(maxStarSigns, 3);
  }
  const cauldronBubbles = toList(data.CauldronBubbles);
  const alchemyJobs = asIndexedNumbers(data.CauldronJobs1);
  const divinity = asIndexedNumbers(data.Divinity);
  const spelunk = toList(data.Spelunk);

  return account.characters.map((character) =>
    parseOne(
      data,
      account,
      character,
      {
        now,
        lastUpdatedMs,
        globalTimeSec,
        maxBubbles,
        sheepie,
        ashLevel: ashLevel > 0,
        allStarSignsInfinite,
        maxStarSigns,
        cauldronBubbles,
        alchemyJobs,
        divinity,
        spelunk
      }
    )
  );
}

function parseOne(
  data: Record<string, unknown>,
  account: ParsedAccount,
  character: Character,
  ctx: {
    now: number;
    lastUpdatedMs: number;
    globalTimeSec: number;
    maxBubbles: number;
    sheepie: boolean;
    ashLevel: boolean;
    allStarSignsInfinite: boolean;
    maxStarSigns: number;
    cauldronBubbles: unknown[];
    alchemyJobs: number[];
    divinity: number[];
    spelunk: unknown[];
  }
): CharacterOps {
  const index = character.index;
  const afkTarget = String(data[`AFKtarget_${index}`] ?? '');
  const playerAway = asNumber(data[`PTimeAway_${index}`]);
  const afkMs = afkTimeMs(playerAway);
  const afkHours = afkMs > 0 ? Math.max(0, (ctx.lastUpdatedMs - afkMs) / 3_600_000) : 0;
  const prayers = asIndexedNumbers(data[`Prayers_${index}`]);
  const unendingEnergy = prayers.includes(UNENDING_ENERGY_PRAYER);
  const equippedBubbleCodes = stringList(ctx.cauldronBubbles[index]).filter((code) => code && code !== 'Blank' && !/^_?$/.test(code) && code.length > 1);
  const hasHammer = equippedBubbleCodes.some((code) => code === HAMMER_HAMMER_CODE || code.startsWith(HAMMER_HAMMER_CODE));
  const anvilStats = asIndexedNumbers(data[`AnvilPAstats_${index}`]);
  const availablePoints = anvilStats[0] ?? 0;
  const speedPoints = anvilStats[4] ?? 0;
  const capPoints = anvilStats[5] ?? 0;
  const selected = asIndexedNumbers(data[`AnvilPAselect_${index}`]);
  const hammersUsed = selected.filter((slot) => slot >= 0).length;
  const anvilMaxHammers = hasHammer ? 3 : 2;
  const carry = asRecord(data[`MaxCarryCap_${index}`]);
  const bagCap = Math.max(20, asNumber(carry.bCraft, 50));
  const capacity = Math.round(Math.min(2e9, bagCap * (2 + 0.1 * capPoints)));
  const anvilSpeed = 3600 * (1 + (2 * speedPoints) / 100) * agilitySpeedBonus(character.stats.agi);
  const production = toList(data[`AnvilPA_${index}`]);
  const anvilOverdue: AnvilOverdueSlot[] = [];
  const hammerCounts = new Map<number, number>();
  for (const slot of selected) {
    if (slot < 0) continue;
    hammerCounts.set(slot, (hammerCounts.get(slot) ?? 0) + 1);
  }
  for (const [slot, hammers] of hammerCounts) {
    const row = asIndexedNumbers(production[slot]);
    const currentAmount = row[0] ?? 0;
    const currentProgress = row[2] ?? 0;
    const requiredAmount = 1;
    const productionRate = (anvilSpeed / 3600 / requiredAmount) * hammers;
    if (productionRate <= 0) continue;
    const timePassed = Math.max(0, (ctx.now - (afkMs || ctx.lastUpdatedMs)) / 1000);
    const futureProduction = Math.min(
      Math.round(currentAmount + ((currentProgress + timePassed * anvilSpeed / 3600) / requiredAmount) * hammers),
      capacity
    );
    const secondsLeft = (capacity - futureProduction) / productionRate;
    const minutesUntilCap = secondsLeft / 60;
    if (minutesUntilCap <= ANVIL_OVERDUE_MINUTES) {
      anvilOverdue.push({
        name: `Anvil slot ${slot + 1}`,
        rawName: `CraftMat${slot}`,
        minutesUntilCap
      });
    }
  }

  const tools = nestedList(data[`EquipOrder_${index}`], 1);
  const armor = nestedList(data[`EquipOrder_${index}`], 0);
  const trapTool = tools[4] ?? 'Blank';
  const traps = toList(data[`PldTraps_${index}`]);
  let trapCount = 0;
  let trapsOverdue = false;
  let closestTrapLeftMs: number | null = null;
  for (const trap of traps) {
    const row = asIndexedNumbers(trap);
    const critterId = row[0] ?? asNumber(toList(trap)[0], -1);
    if (critterId < 0) continue;
    trapCount += 1;
    const elapsed = row[2] ?? 0;
    const duration = row[6] ?? 0;
    const leftMs = (duration - elapsed) * 1000;
    if (duration > 0 && elapsed >= duration) trapsOverdue = true;
    if (duration > 0 && (closestTrapLeftMs == null || leftMs < closestTrapLeftMs)) closestTrapLeftMs = leftMs;
  }
  const trapMax =
    trapTool && trapTool !== 'Blank' ? trapSetMax(trapTool, ctx.ashLevel) : Math.min(8, Math.max(trapCount, 1));

  const skull = skullSpeed(tools[5] ?? '');
  const worshipLevel = character.skills.Worship ?? 0;
  const chargeRate = worshipChargeRate(worshipLevel, skull);
  const playerStuff = asIndexedNumbers(data[`PlayerStuff_${index}`]);
  const savedCharge = playerStuff[0] ?? 0;
  const maxCharge = Math.floor(Math.max(50, worshipLevel + Math.round(skull) * 10));
  const hoursAfk = Math.max(0, (ctx.now - (afkMs || ctx.lastUpdatedMs)) / 3_600_000);
  const worshipCurrent = Math.min(maxCharge, savedCharge + chargeRate * hoursAfk);

  const obols = stringList(data[`ObolEqO0_${index}`]);
  const emptyObols = obols.filter((item) => !item || item === 'Blank' || item === 'Locked' || item === 'ObolLocked').length;

  const unspent = Math.max(0, Math.round(account.postOfficeBoxesEarned) - Math.round(character.postOfficeInvested));
  const postOfficeUnmaxed = character.postOfficeBoxes.some((box) => box.level < POST_OFFICE_BOX_MAX);

  const starRaw = String(data[`PVtStarSign_${index}`] ?? '');
  const starSignsEquipped = starRaw.split(',').filter((part) => part && part !== '_').length;

  const cardSet = asRecord(data[`CSetEq_${index}`]);
  const cardSetRaw = Object.keys(cardSet).find((key) => key.startsWith('CardSet')) ?? '';
  const equippedCards = stringList(data[`CardEquip_${index}`]);
  const passiveCards = equippedCards.filter((name) => /CardsY/i.test(name) || /Passive/i.test(name)).length;

  const expReq = asIndexedNumbers(data[`ExpReq0_${index}`]);
  const levels = asIndexedNumbers(data[`Lv0_${index}`]);
  const talentLevels = asIndexedNumbers(data[`SL_${index}`] ?? data[`SkillLevels_${index}`]);
  const crystalMax = MAESTRO_IDS.has(character.classId) ? crystalCountdownMax(talentLevels[CRYSTAL_COUNTDOWN_TALENT] ?? 0) : 0;
  const crystalCountdown: CrystalCountdownSkill[] = [];
  if (MAESTRO_IDS.has(character.classId)) {
    for (let skillIndex = 1; skillIndex <= 9; skillIndex += 1) {
      const skill = SKILL_NAMES[skillIndex];
      const level = levels[skillIndex] ?? 0;
      if (!skill || level <= 0) continue;
      const original = skillExpReq(skillIndex, level);
      const current = expReq[skillIndex] ?? original;
      const reduction = original > 0 ? (1 - current / original) * 100 : 0;
      crystalCountdown.push({
        skill,
        icon: `ClassIcons${skillIndex + 41}`,
        reduction: Math.max(0, reduction),
        max: crystalMax
      });
    }
  }

  const toolSkills = [
    character.skills.Mining ?? 0,
    character.skills.Chopping ?? 0,
    character.skills.Fishing ?? 0,
    character.skills.Catching ?? 0,
    character.skills.Trapping ?? 0,
    character.skills.Worship ?? 0,
    character.combatLevel
  ];
  const betterTools: ToolUpgrade[] = [];
  tools.slice(0, 7).forEach((tool, toolIndex) => {
    const list = TOOL_TIERS[toolIndex];
    if (!list) return;
    const best = lastMatchingTool(list, toolSkills[toolIndex] ?? 0);
    if (best && best.rawName !== tool && tool !== undefined) betterTools.push(best);
  });

  const styleIndex = ctx.divinity[index] ?? 0;
  const linkedDeity = ctx.divinity[12 + index] ?? -1;
  const isMeditating =
    afkTarget === 'Divinity' ||
    (afkTarget === 'Laboratory' && (linkedDeity === 4 || account.companionNames.includes('King Doot')));

  const cooldowns = asRecord(data[`AtkCD_${index}`]);
  const timePassedSec = Math.max(0, (ctx.now - (afkMs || ctx.lastUpdatedMs)) / 1000);
  const readyTalents: ReadyTalent[] = [];
  for (const [idText, name] of Object.entries(COOLDOWN_TALENTS)) {
    const talentCd = asNumber(cooldowns[idText]);
    const actual = talentCd - timePassedSec;
    if (actual < 0) readyTalents.push({ talentId: Number(idText), name });
  }

  const preset = playerStuff[1] ?? 0;
  const superPoints = Math.min(20, Math.max(0, Math.floor((character.combatLevel - 400) / 100)));
  const superRow = asIndexedNumbers(ctx.spelunk[20 + index + 12 * preset]);
  let spent = 0;
  for (let slot = 0; slot < 20; slot += 1) {
    if ((superRow[slot] ?? -1) !== -1) spent += 1;
  }
  const superTalentLeft = Math.max(0, superPoints - spent);

  const armorMap = data[`EMm0_${index}`];
  const armorStats = mapStats(armor, armorMap);
  const toolStats = mapStats(tools, data[`EMm1_${index}`]);
  const upgradeSlots: UpgradeSlotItem[] = [...armorStats, ...toolStats]
    .filter(
      (item) =>
        item.upgradeSlots > 0 &&
        item.rawName &&
        item.rawName !== 'Blank' &&
        item.type !== 'PREMIUM_HELMET' &&
        item.type !== 'CHAT_RING' &&
        !item.premium
    )
    .map((item) => ({ rawName: item.rawName, displayName: displayItem(item.rawName), slots: item.upgradeSlots }));

  const buffs = toList(data[`BuffsActive_${index}`]);
  const invNames = stringList(data[`InvOrder_${index}`]).filter((name) => name && name !== 'Blank' && name !== 'LockedInvSpace');
  const inventory = mapStats(invNames, data[`IMm_${index}`]);

  return {
    index,
    afkTarget,
    afkKind: afkKind(afkTarget),
    afkHours,
    anvilAvailablePoints: availablePoints,
    anvilHammersUsed: hammersUsed,
    anvilMaxHammers,
    anvilOverdue,
    worshipCurrent,
    worshipMax: maxCharge,
    unendingEnergy,
    trapCount,
    trapMax,
    trapsOverdue,
    closestTrapLeftMs,
    equippedBubbles: equippedBubbleCodes.length,
    maxBubbles: ctx.maxBubbles,
    sheepie: ctx.sheepie,
    alchemyActivity: ctx.alchemyJobs[index] ?? 0,
    emptyObols,
    postOfficeUnspent: unspent,
    postOfficeUnmaxed,
    starSignsEquipped,
    starSignsMax: ctx.maxStarSigns,
    allStarSignsInfinite: ctx.allStarSignsInfinite,
    cardSetRaw,
    passiveCards,
    crystalCountdown,
    betterTools,
    divinityStyleName: DIV_STYLE_NAMES[styleIndex] ?? `Style ${styleIndex}`,
    divinityStyleIndex: styleIndex,
    isMeditating,
    divinityLevel: character.skills.Divinity ?? 0,
    readyTalents,
    superTalentLeft,
    upgradeSlots,
    arcanistForm: formActive(buffs, 585),
    tempestForm: formActive(buffs, 420),
    wraithForm: formActive(buffs, 195),
    weaponRaw: armor[1] ?? 'Blank',
    ringARaw: armor[5] ?? 'Blank',
    ringBRaw: armor[7] ?? 'Blank',
    inventory
  };
}
