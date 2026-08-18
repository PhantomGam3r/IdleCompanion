import {
  ARCADE_BALL_ACHIEVEMENTS,
  ARCADE_CLAIM_STAMP,
  ARCADE_EFFECTS,
  ARCADE_LIQUID_CAP_INDEX,
  ARCADE_PICKLE_VIAL_BONUS,
  ARCADE_PICKLE_VIAL_INDEX,
  ARCADE_RECHARGE_STAMP,
  BUTTON_PERM,
  BUTTON_TASKS,
  BUILD_COST_MULTIPLIER,
  DEFAULT_MEAL_MAX_LEVEL,
  DOUBLE_CLUSTER_INDEX,
  DOUBLE_CLUSTER_MAX,
  DOUBLE_CLUSTER_X1,
  DOUBLE_CLUSTER_X2,
  JEWEL_COGS_SUPERBIT_INDEX,
  LAB_CHIPS,
  LAB_JEWELS,
  LEGEND_CRYSTAL_TALENT_INDEX,
  LEGEND_CRYSTAL_TALENT_X2,
  LEGEND_COG_TALENT_INDEX,
  LEGEND_COG_TALENT_X2,
  LEGEND_MASTERCLASS_TALENT_INDEX,
  LEGEND_MASTERCLASS_TALENT_X2,
  LEGEND_TALENT_MAX,
  MAX_VIAL_LEVEL,
  MEAL_INFO,
  NAMETAGS,
  PET_RAW_NAMES,
  POPPY_UPGRADES,
  PREMIUM_HATS,
  REFINERY_POWER_CAPS,
  REFINERY_SALT_INFO,
  RESEARCH_OCCURRENCE_NAMES,
  SHIMMER_TRIALS,
  SHINY_BEACON_BONUSES,
  SHINY_BEACON_INDEX,
  SIGIL_INFO,
  STAMP_GOLD,
  STUDY_NAMES,
  SUSHI_NAMES,
  TOWER_BONUS_INC,
  TROPHIES,
  VIAL_COSTS,
  VIAL_INFO,
  VILLAGER_NAMES,
  type LabItemInfo,
  type NamedRaw,
  type StampGoldInfo
} from './alertCatalogs';
import { CONSTRUCTION_BUILDINGS } from './catalogs';
import { asIndexedNumbers, asNumber, asRecord, countIndexedKeys, firstNumber, numberToLetter, toList } from './helpers';
import { labWeekRotation } from './lavaRand';
import { taskMeritLevel, tomeNametagClaim } from './tomeNametag';
import type { Character } from './types';

export type NamedIcon = { name: string; rawName: string };
export type SaltAlert = { saltName: string; rawName: string };

export type DashboardExtras = {
  affordableStampCount: number;
  affordableStampPercent: number;
  vialsReady: NamedIcon[];
  mealsReady: NamedIcon[];
  missingHats: NamedIcon[];
  missingTrophies: NamedIcon[];
  missingNametags: NamedIcon[];
  buildingsReady: { name: string; index: number }[];
  refineryMissing: SaltAlert[];
  refineryRankUp: SaltAlert[];
  betterShopCaptains: number;
  kangarooShinyPct: number;
  kangarooFisherooReady: boolean;
  kangarooGreatestCatchReady: boolean;
  sigilsReady: { name: string; index: number }[];
  stampReducerPct: number;
  foodLustMaxed: boolean;
  holeSedimentReady: boolean;
  holeMotherlodeMaxed: boolean;
  holeHiveMaxed: boolean;
  holeEvertreeMaxed: boolean;
  holeTrenchMaxed: boolean;
  holeBraveryReady: boolean;
  holeJusticeReady: boolean;
  holeWisdomReady: boolean;
  holeBellReady: boolean;
  holeHarpReady: boolean;
  holeGrottoReady: boolean;
  holeJars: number;
  holeJarsFull: number;
  holeVillagersReady: { name: string; index: number }[];
  holeStudiesReady: { name: string; index: number }[];
  holeLayersBrokenToday: number;
  arcadeUnmaxed: { effect: string; level: number; index: number }[];
  printerFull: NamedIcon[];
  emptyRibbonSlots: number | null;
  cookingMasteryYellow: number;
  cookingMasteryPurple: number;
  gamingSprouts: number;
  gamingSproutsCapacity: number;
  gamingDrops: number;
  gamingShovelHours: number;
  gamingSquirrelHours: number;
  gamingShovelUnlocked: boolean;
  gamingSquirrelUnlocked: boolean;
  fullStaminaCharacters: number;
  overstimLevel: number;
  legendPointsLeft: number;
  legendPointsSpent: number;
  legendMaxSpendable: number;
  masterclassCheapAvailable: number;
  masterclassCheapUsed: number;
  masterclassCheapMax: number;
  doubleClusterReady: boolean;
  jeweledCogAvailable: number;
  jeweledCogCurrent: number;
  jeweledCogMax: number;
  jeweledCogsUnlocked: boolean;
  sushiKnowledgeReady: { name: string; index: number; level: number }[];
  insightObservations: { name: string; index: number; insightLevel: number }[];
  shinyPets: { name: string; rawName: string; shinyLevel: number }[];
  breedabilityPets: { name: string; rawName: string; breedingLevel: number }[];
  labChipsReady: NamedIcon[];
  labJewelsReady: NamedIcon[];
  vialAttemptItemsReady: boolean;
  buttonTaskReady: boolean;
  buttonTaskDescription: string;
  crystalGuarantee: number;
  arcadeBallsAtCap: boolean;
  liquidMaxes: number[];
  sailingChestsFull: boolean;
  shimmerTrial: string;
  tomeNametagsAvailable: number;
  tomeUnlocked: boolean;
};

const STAMP_SPEND_PERCENT = 25;
const KANGAROO_SHINY_THRESHOLD = 100;
const HOLE_SEDIMENT_THRESHOLD = 1000;
const HOLE_HARP_POWER = 100;
const HOLE_JAR_THRESHOLD = 120;
const STAMP_REDUCER_THRESHOLD = 90;
const GREEN_STACK = 1e7;
const SHINY_LEVEL_THRESHOLD = 5;
const BREEDABILITY_LEVEL_THRESHOLD = 5;
const WEIGHTED_MARBLES_BRIBE = 14;
const WEIGHTED_MARBLES_BONUS = 10;
const SKILL_MASTERY_RIFT = 15;
const CRYSTAL_ACHIEVEMENT = 285;
const SAILING_CHEST_GEM = 129;
const SAILING_CHEST_TASK_WORLD = 4;
const SAILING_CHEST_TASK_INDEX = 2;
const SAILING_CHEST_ACHIEVEMENTS = [287, 290];
const ARCADE_TASK_WORLD = 1;
const ARCADE_TASK_INDEX = 7;

function decayBonus(level: number, x1: number, x2: number): number {
  if (level <= 0 || x2 === 0) return 0;
  return Math.round(((x1 * level) / (level + x2) + Number.EPSILON) * 100) / 100;
}

function achievementCompleted(data: Record<string, unknown>, index: number): boolean {
  return asIndexedNumbers(data.AchieveReg)[index] === -1;
}

function skillMasteryRank(level: number): number {
  if (level < 150) return 0;
  if (level < 200) return 1;
  if (level < 300) return 2;
  if (level < 400) return 3;
  if (level < 500) return 4;
  if (level < 750) return 5;
  if (level < 1000) return 6;
  return 7;
}

function visitStrings(value: unknown, visit: (item: string) => void): void {
  if (typeof value === 'string') {
    visit(value);
    return;
  }
  const list = toList(value);
  for (const item of list) visitStrings(item, visit);
}

function addNamedAmounts(target: Map<string, number>, names: unknown, quantities: unknown): void {
  const nameList = toList(names);
  const qtyList = asIndexedNumbers(quantities);
  nameList.forEach((name, index) => {
    if (typeof name !== 'string' || !name || name === 'Blank') return;
    target.set(name, (target.get(name) ?? 0) + (qtyList[index] ?? 0));
  });
}

function collectAmounts(data: Record<string, unknown>, characterCount: number): Map<string, number> {
  const amounts = new Map<string, number>();
  addNamedAmounts(amounts, data.ChestOrder, data.ChestQuantity);
  for (let index = 0; index < characterCount; index += 1) {
    addNamedAmounts(amounts, data[`InvOrder_${index}`], data[`InvQuantity_${index}`]);
  }
  const refinery = toList(data.Refinery);
  addNamedAmounts(amounts, refinery[1], refinery[2]);
  return amounts;
}

function collectOwnedNames(
  data: Record<string, unknown>,
  characterCount: number,
  amounts: Map<string, number>
): Set<string> {
  const owned = new Set<string>(amounts.keys());
  for (let index = 0; index < characterCount; index += 1) {
    visitStrings(data[`EquipOrder_${index}`], (item) => {
      if (item && item !== 'Blank') owned.add(item);
    });
  }
  return owned;
}

function stampGoldCost(level: number, stamp: StampGoldInfo): number {
  const reqLevel = stamp.req || 1;
  const ratio = level / (level + 5 * reqLevel);
  const powBase = Math.max(1.05, stamp.pow - ratio * 0.25);
  const exponent = level * (10 / reqLevel);
  return Math.floor(stamp.base * Math.pow(powBase, exponent));
}

function goldCostToMax(level: number, maxLevel: number, stamp: StampGoldInfo): number {
  let total = 0;
  for (let current = level; current < maxLevel; current += 1) {
    total += stampGoldCost(current, stamp);
  }
  return total;
}

function mealLevelCost(level: number): number {
  return (
    Math.pow(10, 22 * Math.floor((level + 1e3) / 1111)) *
    (10 + (level + Math.pow(level, 2))) *
    Math.pow(1.2 + 0.05 * level, level) *
    Math.pow(1 + 0.4 * Math.floor((level + 1e3) / 1111), level)
  );
}

function liquidIndex(rawName: string): number {
  const match = /Liquid(\d+)/.exec(rawName);
  return match ? Number(match[1]) - 1 : 0;
}

function missingFrom(
  catalog: NamedRaw[],
  owned: Set<string>,
  used: Set<string>
): NamedIcon[] {
  return catalog
    .filter((item) => owned.has(item.rawName) && !used.has(item.rawName))
    .map((item) => ({ name: item.name, rawName: item.rawName }));
}

function usedHatNames(spelunk: unknown[]): Set<string> {
  const used = new Set<string>();
  visitStrings(spelunk[46], (item) => {
    if (item && item !== 'Blank' && item !== '0') used.add(item);
  });
  return used;
}

function usedGalleryNames(rawSlots: unknown, prefix: string): Set<string> {
  const used = new Set<string>();
  const slots = asIndexedNumbers(rawSlots);
  for (const value of slots) {
    if (value >= 1) used.add(`${prefix}${value}`);
  }
  visitStrings(rawSlots, (item) => {
    if (item.startsWith(prefix) || item.startsWith('EquipmentNametag')) used.add(item);
  });
  return used;
}

function getBuildCost(level: number, index: number): number {
  if (index === 0) {
    return 2 * Math.pow(level + 1, 2) * Math.pow(1.3, level + 1);
  }
  const multiplier = Number(BUILD_COST_MULTIPLIER[index] ?? 0);
  const bonusInc = TOWER_BONUS_INC[index] ?? 1;
  return multiplier * Math.pow(bonusInc, level);
}

function powerCap(rank: number): number {
  const index = Math.min(rank, Math.max(0, REFINERY_POWER_CAPS.length - 2));
  return Math.max(Number(REFINERY_POWER_CAPS[index] ?? 25), 25);
}

function powerPerCycle(rank: number): number {
  return Math.floor(Math.min(25e4, Math.pow(rank, 1.3)));
}

function villagerExpReq(level: number, index: number): number {
  if (level === 1 && index === 0) return 5;
  if (index === 0) {
    return (
      10 *
      (-1.5 +
        (10 + 7 * Math.pow(level, 2.1)) *
          Math.pow(2.1, level) *
          (1 + 0.75 * Math.max(0, level - 4)) *
          Math.pow(
            3.4,
            Math.min(1, Math.max(0, Math.floor((1e5 + 248.3) / 100247.3))) * Math.max(0, level - 12)
          ))
    );
  }
  if (index === 1) return 30 * (10 + 6 * Math.pow(level, 1.8)) * Math.pow(1.57, level);
  if (index === 2) return 50 * (10 + 5 * Math.pow(level, 1.7)) * Math.pow(1.4, level);
  if (index === 3) return 120 * (30 + 10 * Math.pow(level, 2)) * Math.pow(2, level);
  if (index === 4) return 500 * (10 + 5 * Math.pow(level, 1.3)) * Math.pow(1.13, level);
  return 10 * Math.pow(10, 20);
}

function studyReq(level: number, index: number): number {
  return 4e3 * Math.pow(1.25, level) * Math.pow(1.5, Math.floor(index / 5));
}

function layerReq(layer: number, extra = 1): number {
  return extra * 200 * Math.pow(2.2, 1 + layer);
}

function poppyReady(
  option: (index: number) => number,
  upgradeIndex: number,
  fish: number,
  progress: number
): boolean {
  const upgrade = POPPY_UPGRADES[upgradeIndex];
  if (!upgrade) return false;
  if (!(progress > upgrade.x3 || upgradeIndex === 0)) return false;
  const level = option(268 + upgradeIndex);
  const cost = upgrade.x1 * Math.pow(upgrade.x2, level);
  return fish >= cost;
}

function titleCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function atomColliderThreshold(option: number): number {
  if (option === 0) return 15e6;
  if (option === 1) return 25e6;
  if (option === 2) return 1e8;
  if (option === 3) return 25e7;
  return 105e7;
}

function arcadeRotation(serverVars: Record<string, unknown> | null): number[] {
  if (!serverVars) return [];
  const raw = serverVars.ArcadeBonuses ?? serverVars.arcadeBonuses;
  return asIndexedNumbers(raw).filter((index) => Number.isFinite(index));
}

function printerProduction(data: Record<string, unknown>, characterCount: number): Map<string, number> {
  const printData = toList(data.Print ?? data.Printer).slice(5);
  const extra = toList(data.PrinterXtra);
  const totals = new Map<string, number>();
  for (let charIndex = 0; charIndex < characterCount; charIndex += 1) {
    let samples: unknown[] = printData.slice(charIndex * 14, charIndex * 14 + 14);
    if (extra.length > 0) {
      samples.splice(-4, 0, extra.slice(charIndex * 10, charIndex * 10 + 10));
      samples = samples.flat();
    }
    for (let sampleIndex = 0; sampleIndex + 1 < samples.length; sampleIndex += 2) {
      if (sampleIndex < samples.length - 4) continue;
      const item = samples[sampleIndex];
      if (typeof item !== 'string' || !item || item === 'Blank') continue;
      totals.set(item, (totals.get(item) ?? 0) + asNumber(samples[sampleIndex + 1]));
    }
  }
  return totals;
}

function hoursSinceUnix(lastClick: number, nowSec: number): number {
  if (lastClick < 1e6) return 0;
  return Math.max(0, Math.floor((nowSec - lastClick) / 3600));
}

function sushiKnowledgeReq(level: number): number {
  return (3 + (level + Math.pow(level, 1.5))) * Math.pow(1.5, Math.max(0, level - 2));
}

function observationLensTypes(raw: unknown, observationIndex: number): number[] {
  const list = toList(raw);
  const types: number[] = [];
  if (list.length > 0 && Array.isArray(list[0])) {
    for (const row of list) {
      const nums = asIndexedNumbers(row);
      if (nums[2] === observationIndex) types.push(nums[3] ?? -1);
    }
    return types;
  }
  const nums = asIndexedNumbers(raw);
  for (let slot = 0; slot * 4 + 3 < nums.length; slot += 1) {
    if (nums[slot * 4 + 2] === observationIndex) types.push(nums[slot * 4 + 3] ?? -1);
  }
  return types;
}

function shinyLevelFromProgress(progress: number): number {
  if (progress === 0) return 0;
  let level = 0;
  for (let index = 0; index < 19; index += 1) {
    const goal = Math.floor((1 + Math.pow(index + 1, 1.6)) * Math.pow(1.7, index + 1));
    if (progress > goal) level = index + 2;
  }
  return level === 0 ? 1 : level;
}

function breedabilityLevel(progress: number, unlocked: boolean): number {
  if (!unlocked) return 1;
  const second = 1 + Math.log(Math.max(1, Math.pow(progress + 1, 0.725)));
  return Math.min(9, Math.floor(Math.pow(second - 1, 0.8)) + 1);
}

function buttonRequirement(
  scaling: 'linear' | 'step' | 'exponent',
  base: number,
  factor: number,
  presses: number
): number {
  if (scaling === 'linear') return Math.ceil(base + presses * factor);
  if (scaling === 'step') return Math.ceil(base + presses / factor);
  if (scaling === 'exponent') return base * Math.pow(factor, presses);
  return base;
}

function highestSkill(characters: Character[], skill: string): number {
  return characters.reduce((max, character) => Math.max(max, character.skills[skill] ?? 0), 0);
}

function highestStatueLevel(data: Record<string, unknown>, characterCount: number, statueIndex: number): number {
  let best = 0;
  for (let index = 0; index < characterCount; index += 1) {
    const rows = toList(data[`StatueLevels_${index}`]);
    best = Math.max(best, asIndexedNumbers(rows[statueIndex])[0] ?? 0);
  }
  return best;
}

function labReqsMet(item: LabItemInfo, amounts: Map<string, number>): boolean {
  return item.req.every((req) => {
    const owned = amounts.get(req.rawName) ?? amounts.get(req.name ?? '') ?? 0;
    return owned > req.amount;
  });
}

function remapLabRotationIndex(index: number, jadeBling: boolean): number {
  if ((index >= 21 && index <= 23) || (index >= 18 && index <= 20 && !jadeBling)) {
    return Math.max(1, index - 10);
  }
  return index;
}

function chipRepoSlot(raw: unknown, slot: number): number | undefined {
  const list = toList(raw);
  if (slot < list.length && list[slot] !== undefined && list[slot] !== null) {
    const value = asNumber(list[slot], Number.NaN);
    return Number.isFinite(value) ? value : undefined;
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const rec = raw as Record<string, unknown>;
    if (!(String(slot) in rec)) return undefined;
    const value = asNumber(rec[String(slot)], Number.NaN);
    return Number.isFinite(value) ? value : undefined;
  }
  return undefined;
}

function jadeUpgradeUnlocked(data: Record<string, unknown>, upgradeIndex: number): boolean {
  const extra = toList(toList(data.Ninja)[102]);
  const letters = typeof extra[9] === 'string' ? extra[9] : '';
  return letters.includes(numberToLetter(upgradeIndex));
}

function jadeBlingUnlocked(data: Record<string, unknown>): boolean {
  return jadeUpgradeUnlocked(data, 37);
}

function formatButtonTask(description: string, requirement: number): string {
  const formatted = !Number.isFinite(requirement)
    ? '∞'
    : requirement >= 1e15
      ? requirement.toExponential(2)
      : Math.floor(requirement).toLocaleString('en-US');
  return description.replace(/_/g, ' ').split('{').join(formatted).trim();
}

function buttonTaskProgress(
  taskIndex: number,
  data: Record<string, unknown>,
  option: (index: number) => number,
  characters: Character[],
  rawMoney: number,
  stampLevels: number[][],
  mealLevels: number[]
): number {
  const characterCount = Math.max(characters.length, 1);
  switch (taskIndex) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 15:
    case 16:
    case 21:
    case 26:
    case 29:
    case 38:
    case 41:
    case 46:
    case 47:
    case 49:
    case 50:
    case 56:
      return 0;
    case 4:
      return option(330);
    case 5:
      return option(358);
    case 6:
      return option(390);
    case 7:
      return option(391);
    case 8:
      return highestStatueLevel(data, characterCount, 29);
    case 9:
      return highestStatueLevel(data, characterCount, 2);
    case 10:
      return highestStatueLevel(data, characterCount, 6);
    case 11:
      return highestStatueLevel(data, characterCount, 8);
    case 12:
      return highestStatueLevel(data, characterCount, 9);
    case 13:
      return highestStatueLevel(data, characterCount, 15);
    case 14:
      return highestStatueLevel(data, characterCount, 16);
    case 17:
      return stampLevels[2]?.[2] ?? 0;
    case 18:
      return asIndexedNumbers(toList(data.CauldronInfo)[0])[0] ?? 0;
    case 19:
      return asIndexedNumbers(toList(data.CauldronInfo)[1])[0] ?? 0;
    case 20:
      return asIndexedNumbers(toList(data.CauldronInfo)[2])[0] ?? 0;
    case 22:
      return printerProduction(data, characterCount).get('Copper') ?? 0;
    case 23:
      return option(253);
    case 24:
      return asIndexedNumbers(toList(data.TotemInfo)[0]).reduce((sum, waves) => sum + waves, 0);
    case 25: {
      const stored = toList(toList(data.PetsStored)[0]);
      return asNumber(stored[2]);
    }
    case 27:
      return asIndexedNumbers(data.Ribbon)[92] ?? 0;
    case 28:
      return mealLevels[56] ?? 0;
    case 30:
      return highestSkill(characters, 'Laboratory');
    case 31:
      return highestSkill(characters, 'Sneaking');
    case 32:
      return highestSkill(characters, 'Spelunking');
    case 33:
      return highestSkill(characters, 'Mining');
    case 34:
      return highestSkill(characters, 'Chopping');
    case 35:
      return highestSkill(characters, 'Divinity');
    case 36:
      return asNumber(toList(data.Divinity)[24]);
    case 37:
      return asNumber(toList(toList(data.Sailing)[1])[0]);
    case 39:
      return firstNumber(toList(data.Gaming)[0]);
    case 40:
      return asNumber(toList(toList(data.GamingSprout)[28])[1]);
    case 42:
      return toList(data.Cards1).filter((item) => typeof item === 'string' && item && item !== 'Blank').length;
    case 43:
      return asIndexedNumbers(toList(data.Summon)[2])[0] ?? 0;
    case 44:
      return toList(toList(data.Summon)[1]).filter((id) => typeof id === 'string' && id && id !== 'Blank').length;
    case 45:
      return option(221);
    case 48:
      return countIndexedKeys(data.FarmCrop);
    case 51:
      return asIndexedNumbers(toList(data.Spelunk)[1])[4] ?? 0;
    case 52:
      return rawMoney;
    case 53:
      return option(369) + 1;
    case 54:
      return asIndexedNumbers(toList(data.Sushi)[4])[3] ?? 0;
    case 55:
      return option(267);
    default:
      return taskIndex >= 57 ? 1 : 0;
  }
}

export function parseDashboardExtras(
  data: Record<string, unknown>,
  characters: Character[],
  option: (index: number) => number,
  liquids: number[],
  serverVars: Record<string, unknown> | null = null
): DashboardExtras {
  const characterCount = Math.max(characters.length, 1);
  const amounts = collectAmounts(data, characterCount);
  const owned = collectOwnedNames(data, characterCount, amounts);

  let rawMoney = asNumber(data.MoneyBANK);
  for (let index = 0; index < characterCount; index += 1) {
    rawMoney += asNumber(data[`Money_${index}`]);
  }

  const stampLevels = toList(data.StampLv ?? data.StampLevel).map((row) => asIndexedNumbers(row));
  const stampMax = toList(data.StampLvM ?? data.StampLevelMAX).map((row) => asIndexedNumbers(row));
  const budget = rawMoney * (STAMP_SPEND_PERCENT / 100);
  const stampCandidates: { cost: number }[] = [];
  if (budget > 0) {
    STAMP_GOLD.forEach((row, category) => {
      row.forEach((stamp, index) => {
        if (!stamp) return;
        const level = stampLevels[category]?.[index] ?? 0;
        const maxLevel = stampMax[category]?.[index] ?? 0;
        if (level <= 0 || level >= maxLevel) return;
        const cost = goldCostToMax(level, maxLevel, stamp);
        if (cost > 0 && cost <= budget) stampCandidates.push({ cost });
      });
    });
    stampCandidates.sort((a, b) => a.cost - b.cost);
  }
  let stampTotal = 0;
  let affordableStampCount = 0;
  for (const candidate of stampCandidates) {
    if (stampTotal + candidate.cost > budget) break;
    stampTotal += candidate.cost;
    affordableStampCount += 1;
  }

  const vialLevels = asIndexedNumbers(toList(data.CauldronInfo)[4]);
  const vialsReady: NamedIcon[] = [];
  let vialAttemptItemsReady = false;
  VIAL_INFO.forEach((vial, index) => {
    if (!vial) return;
    const level = vialLevels[index] ?? 0;
    if (level === 0 && (amounts.get(vial.mainItem) ?? 0) > 0) vialAttemptItemsReady = true;
    if (level <= 0 || level >= MAX_VIAL_LEVEL) return;
    const cost = VIAL_COSTS[level] ?? Number.POSITIVE_INFINITY;
    const stored = (amounts.get(vial.mainItem) ?? 0) - GREEN_STACK;
    const liquid = liquids[liquidIndex(vial.liquid)] ?? 0;
    if (stored > cost && liquid > 3 * level) {
      vialsReady.push({ name: vial.name, rawName: vial.mainItem });
    }
  });

  const mealsRaw = toList(data.Meals);
  const mealLevels = asIndexedNumbers(mealsRaw[0]);
  const mealAmounts = asIndexedNumbers(mealsRaw[2]);
  MEAL_INFO.forEach((meal, index) => {
    const qty = mealAmounts[index] ?? 0;
    amounts.set(meal.name, qty);
    amounts.set(meal.rawName, qty);
    amounts.set(`CookingM${index}`, qty);
  });
  asIndexedNumbers(mealsRaw[3]).forEach((qty, index) => {
    amounts.set(`CookingSpice${index}`, qty);
  });
  const mealsReady: NamedIcon[] = [];
  MEAL_INFO.forEach((meal, index) => {
    const level = mealLevels[index] ?? 0;
    if (level >= DEFAULT_MEAL_MAX_LEVEL) return;
    const amount = mealAmounts[index] ?? 0;
    const cost = mealLevelCost(level);
    if (amount >= cost) mealsReady.push({ name: meal.name, rawName: meal.rawName });
  });

  const spelunk = toList(data.Spelunk);
  const missingHats = missingFrom(PREMIUM_HATS, owned, usedHatNames(spelunk));
  const missingTrophies = missingFrom(TROPHIES, owned, usedGalleryNames(spelunk[16], 'Trophy'));
  const missingNametags = missingFrom(NAMETAGS, owned, usedGalleryNames(spelunk[17], 'EquipmentNametag'));

  const tower = asIndexedNumbers(data.Tower);
  const towersLength = CONSTRUCTION_BUILDINGS.length;
  const buildingsReady: { name: string; index: number }[] = [];
  CONSTRUCTION_BUILDINGS.forEach((building, index) => {
    const level = tower[index] ?? 0;
    if (level >= building.max) return;
    const progress = tower[index + 12 + towersLength * 2] ?? 0;
    const cost = getBuildCost(level, index);
    if (progress >= cost && cost > 0) buildingsReady.push({ name: building.name, index });
  });

  const refineryRows = toList(data.Refinery);
  const refineryMissing: SaltAlert[] = [];
  const refineryRankUp: SaltAlert[] = [];
  REFINERY_SALT_INFO.slice(0, 6).forEach((salt, saltIndex) => {
    const row = asIndexedNumbers(refineryRows[3 + saltIndex]);
    const refined = row[0] ?? 0;
    const rank = row[1] ?? 0;
    if (rank <= 0) return;
    const missing = salt.cost.filter((item) => {
      const need = Math.floor(Math.pow(rank, 1.5)) * item.quantity;
      return (amounts.get(item.rawName) ?? 0) < need;
    });
    if (missing.length > 0) {
      refineryMissing.push({ saltName: salt.saltName, rawName: salt.rawName });
    }
    const cap = powerCap(rank);
    const cycle = powerPerCycle(rank) - 1;
    if (refined >= cap - cycle) {
      refineryRankUp.push({ saltName: salt.saltName, rawName: salt.rawName });
    }
  });

  const captainsRaw = toList(data.Captains);
  const sailing = toList(data.Sailing);
  const captainsUnlocked = 1 + (asIndexedNumbers(sailing[2])[0] ?? 0);
  const ownedCaptains = captainsRaw.slice(0, captainsUnlocked).map((row) => asIndexedNumbers(row));
  const shopCaptains = captainsRaw.slice(30, 34).map((row) => asIndexedNumbers(row));
  const allSlotsEnder = ownedCaptains.length > 0 && ownedCaptains.every((row) => (row[0] ?? -1) === 6);
  let betterShopCaptains = 0;
  for (const shop of shopCaptains) {
    const captainType = shop[0] ?? -1;
    const firstBonusIndex = shop[1] ?? 0;
    const secondBonusIndex = shop[2] ?? 0;
    const firstBonusValue = shop[5] ?? 0;
    const secondBonusValue = shop[6] ?? 0;
    const matches = ownedCaptains.filter((ownedCap) => {
      const oFirst = ownedCap[1] ?? 0;
      const oSecond = ownedCap[2] ?? 0;
      const oFirstVal = ownedCap[5] ?? 0;
      const oSecondVal = ownedCap[6] ?? 0;
      const areEqual = oFirst === firstBonusIndex && oSecond === secondBonusIndex;
      const areSwapped = oSecond === firstBonusIndex && oFirst === secondBonusIndex;
      if (areEqual || areSwapped) {
        if (firstBonusIndex === secondBonusIndex) {
          return firstBonusValue + secondBonusValue > oFirstVal + oSecondVal;
        }
        const both =
          firstBonusValue > oFirstVal && secondBonusValue > oSecondVal;
        const swappedBoth =
          firstBonusValue > oSecondVal && secondBonusValue > oFirstVal;
        return both || swappedBoth;
      }
      const atLeastOne = oFirst === firstBonusIndex || oFirst === secondBonusIndex;
      if (atLeastOne && oFirst === oSecond) {
        if (firstBonusIndex === oFirst) return firstBonusValue > oFirstVal + oSecondVal;
        if (secondBonusIndex === oFirst) return secondBonusValue > oFirstVal + oSecondVal;
      }
      return false;
    });
    if ((matches.length > 0 && captainType !== -1) || (captainType === 6 && (!allSlotsEnder || matches.length > 0))) {
      betterShopCaptains += 1;
    }
  }

  const kangarooFish = option(267);
  const shinyReq = 7200 / (1 + (4 * option(276)) / 100);
  const kangarooShinyPct = shinyReq > 0 ? 100 * Math.max(0, option(289) / shinyReq) : 0;
  const kangarooProgress = option(280);

  const p2w = toList(data.CauldronP2W);
  const sigilRow = asIndexedNumbers(p2w[4]);
  const alchemyJobs = asIndexedNumbers(data.CauldronJobs1);
  const ionizedSigils = jadeUpgradeUnlocked(data, 31);
  const etherealSigils = (asIndexedNumbers(toList(data.Spelunk)[0])[6] ?? 0) > 0;
  const eclecticSigils = (asIndexedNumbers(toList(data.Research)[0])[128] ?? 0) > 0;
  const sigilsReady: { name: string; index: number }[] = [];
  SIGIL_INFO.forEach((sigil, index) => {
    const progress = sigilRow[index * 2] ?? 0;
    const unlocked = sigilRow[index * 2 + 1] ?? -1;
    if (unlocked < 0) return;
    const assigned = alchemyJobs.some(
      (activity, characterIndex) =>
        characterIndex < characterCount && activity >= 100 && Math.floor(activity - 100) === index
    );
    if (!assigned) return;
    const cost =
      eclecticSigils && sigil.eclecticCost
        ? sigil.eclecticCost
        : etherealSigils && sigil.etherealCost
          ? sigil.etherealCost
          : ionizedSigils && sigil.jadeCost
            ? sigil.jadeCost
            : sigil.boostCost;
    if (progress >= cost) sigilsReady.push({ name: sigil.name, index });
  });

  const atoms = asIndexedNumbers(data.Atoms);
  const stampReducerPct = Math.min(90, (atoms[0] ?? 0) * option(134));
  const dream = asIndexedNumbers(data.Dream);
  const foodLustLevel = dream[11] ?? 0;
  const foodLustMaxed = foodLustLevel > 0 && option(193) >= foodLustLevel;

  const holes = toList(data.Holes);
  const wellSediment = asIndexedNumbers(holes[9]);
  const extra = asIndexedNumbers(holes[11]);
  const expandWhenFull = extra[10] ?? 0;
  const holeSedimentReady =
    expandWhenFull === 0 && wellSediment.some((current, index) => index > 0 && current >= 0 && current >= HOLE_SEDIMENT_THRESHOLD);
  const layersBroken = option(318);
  const canBreakLayer = layersBroken < 5;
  const holeMotherlodeMaxed = canBreakLayer && extra[0] >= layerReq(extra[1] ?? 0);
  const holeHiveMaxed = canBreakLayer && extra[2] >= layerReq(extra[3] ?? 0);
  const holeEvertreeMaxed = canBreakLayer && extra[4] >= layerReq(extra[5] ?? 0);
  const holeTrenchMaxed = canBreakLayer && extra[6] >= layerReq(extra[7] ?? 0, 100);
  const holeBraveryReady = (extra[11] ?? 0) / 72e3 >= 1;
  const holeJusticeReady = (extra[12] ?? 0) / 72e3 >= 1;
  const holeWisdomReady = (extra[13] ?? 0) / 72e3 >= 1;

  const bellRelated = asIndexedNumbers(holes[18]);
  const bellReqs = [
    (5 + 3 * (bellRelated[1] ?? 0)) * Math.pow(1.05, bellRelated[1] ?? 0),
    (10 + (10 * (bellRelated[3] ?? 0) + Math.pow(bellRelated[3] ?? 0, 2.5))) * Math.pow(1.75, bellRelated[3] ?? 0),
    100 * Math.pow(3, bellRelated[5] ?? 0),
    25
  ];
  const holeBellReady = [0, 2, 4, 6].some((slot, index) => (bellRelated[slot] ?? 0) >= (bellReqs[index] ?? Number.POSITIVE_INFINITY));
  const holeHarpReady = (extra[22] ?? 0) >= HOLE_HARP_POWER;
  const grottoReq = 5e3 * Math.pow(3.4, extra[26] ?? 0);
  const holeGrottoReady = (extra[27] ?? 0) >= grottoReq;

  const jars = toList(data.Jars);
  const holeJars = jars.length;
  const jarProgress = asIndexedNumbers(holes[25]);
  let holeJarsFull = 0;
  for (let slot = 0; slot < 12; slot += 1) {
    const jarType = jarProgress[slot] ?? -1;
    const progress = jarProgress[slot + 3] ?? 0;
    const req = jarType >= 0 ? 1e3 + 2e3 * jarType : 0;
    if (req > 0 && progress >= req) holeJarsFull += 1;
  }

  const villagerLevels = asIndexedNumbers(holes[1]);
  const villagerExp = asIndexedNumbers(holes[2]);
  const holeVillagersReady: { name: string; index: number }[] = [];
  VILLAGER_NAMES.forEach((name, index) => {
    const level = villagerLevels[index] ?? 0;
    const exp = villagerExp[index] ?? 0;
    if (level <= 0 && exp <= 0) return;
    if (exp >= villagerExpReq(level, index)) holeVillagersReady.push({ name, index });
  });

  const studyStuff = asIndexedNumbers(holes[26]);
  const studyProgress = asIndexedNumbers(holes[27]);
  const holeStudiesReady: { name: string; index: number }[] = [];
  STUDY_NAMES.forEach((name, index) => {
    if (name === 'BRUH') return;
    const progress = studyProgress[index] ?? 0;
    const req = studyReq(studyStuff[index] ?? 0, index);
    if (progress >= req) holeStudiesReady.push({ name: titleCase(name), index });
  });

  const arcadeLevels = asIndexedNumbers(data.ArcadeUpg);
  const arcadeUnmaxed = arcadeRotation(serverVars)
    .filter((index) => index >= 0 && index < ARCADE_EFFECTS.length && (arcadeLevels[index] ?? 0) < 100)
    .map((index) => ({
      effect: ARCADE_EFFECTS[index] ?? `Upgrade ${index}`,
      level: arcadeLevels[index] ?? 0,
      index
    }));

  const atomThreshold = atomColliderThreshold(option(133));
  const printerFull: NamedIcon[] = [];
  printerProduction(data, characterCount).forEach((printed, rawName) => {
    const stored = amounts.get(rawName) ?? 0;
    const atomable = stored >= atomThreshold - atomThreshold * 0.01;
    const overflowPrint = printed >= atomThreshold && !atomable;
    const overflowStorage = printed > atomThreshold - stored && !atomable;
    if (atomable || overflowPrint || overflowStorage) {
      printerFull.push({ name: rawName, rawName });
    }
  });

  const ribbonRaw = data.Ribbon;
  let emptyRibbonSlots: number | null = null;
  if (ribbonRaw !== undefined && ribbonRaw !== null) {
    const ribbons = asIndexedNumbers(ribbonRaw).slice(0, 28);
    if (ribbons.length > 0 || toList(ribbonRaw).length > 0) {
      let empty = 0;
      for (let slot = 0; slot < 28; slot += 1) {
        if (!(ribbons[slot] ?? 0)) empty += 1;
      }
      emptyRibbonSlots = empty;
    }
  }

  let cookingMasteryYellow = 0;
  let cookingMasteryPurple = 0;
  const cookMaster = toList(data.CookMaster);
  if (cookMaster[1] !== undefined && cookMaster[1] !== null) {
    const masteryLevel = asIndexedNumbers(cookMaster[1])[0] ?? 0;
    const categorySpent = asIndexedNumbers(cookMaster[2]).reduce((sum, value) => sum + value, 0);
    const nodeSpent = asIndexedNumbers(cookMaster[0]).reduce((sum, value) => sum + value, 0);
    const basePoints = masteryLevel + 1;
    cookingMasteryPurple = Math.max(0, basePoints - categorySpent);
    cookingMasteryYellow = Math.max(0, basePoints - nodeSpent);
  }

  const gaming = toList(data.Gaming);
  const gamingSprout = toList(data.GamingSprout);
  const gamingUnlocked = data.Gaming != null && data.GamingSprout != null;
  const gemShop = asIndexedNumbers(data.GemItemsPurchased);
  const sproutsCapacity = gamingUnlocked
    ? Math.round(Math.min(24, 3 + asNumber(gaming[3]) + (gemShop[133] ?? 0)))
    : 0;
  let gamingSprouts = 0;
  for (let slot = 0; slot < 25; slot += 1) {
    if ((asIndexedNumbers(gamingSprout[slot])[1] ?? 0) > 0) gamingSprouts += 1;
  }
  const sprinkler = asIndexedNumbers(gamingSprout[25]);
  const gamingDrops = Math.floor(Math.pow((sprinkler[1] ?? 0) * (1 + (sprinkler[0] ?? 0) / 100) / 3600, 0.75));
  const shovel = asIndexedNumbers(gamingSprout[26]);
  const squirrelRow = asIndexedNumbers(gamingSprout[27]);
  const nowSec = Date.now() / 1000;
  const gamingShovelUnlocked = gamingUnlocked && (shovel[0] ?? 0) > 0;
  const gamingSquirrelUnlocked = gamingUnlocked && (squirrelRow[0] ?? 0) > 0;
  const gamingShovelHours = gamingShovelUnlocked ? hoursSinceUnix(shovel[1] ?? 0, nowSec) : 0;
  const gamingSquirrelHours = gamingSquirrelUnlocked ? hoursSinceUnix(squirrelRow[1] ?? 0, nowSec) : 0;

  const staminaCurrent = asIndexedNumbers(spelunk[3]);
  let fullStaminaCharacters = 0;
  characters.forEach((character, index) => {
    const maxStamina = 14 + (character.skills.Spelunking ?? 0);
    if ((staminaCurrent[index] ?? 0) >= maxStamina) fullStaminaCharacters += 1;
  });
  const overstimLevel = asIndexedNumbers(spelunk[4])[1] ?? 0;

  const legendLevels = asIndexedNumbers(spelunk[18]);
  const legendPointsOwned = characters.reduce(
    (sum, character) => sum + Math.max(0, Math.floor((character.combatLevel - 400) / 100)),
    0
  );
  const legendPointsSpent = legendLevels.slice(0, 50).reduce((sum, level) => sum + (level ?? 0), 0);
  const legendMaxSpendable = LEGEND_TALENT_MAX.reduce((sum, max) => sum + max, 0);
  const legendPointsLeft = Math.round(legendPointsOwned - legendPointsSpent);
  const masterclassCheapMax = LEGEND_MASTERCLASS_TALENT_X2 * (legendLevels[LEGEND_MASTERCLASS_TALENT_INDEX] ?? 0);
  const masterclassCheapUsed = option(480);
  const masterclassCheapAvailable = masterclassCheapMax - masterclassCheapUsed;

  const clusterLevel = asIndexedNumbers(spelunk[45])[DOUBLE_CLUSTER_INDEX] ?? 0;
  const clusterCost = DOUBLE_CLUSTER_X1 * Math.pow(DOUBLE_CLUSTER_X2, clusterLevel);
  const doubleClusterReady = clusterLevel < DOUBLE_CLUSTER_MAX && option(486) >= clusterCost;

  const superbits = typeof gaming[12] === 'string' ? gaming[12] : String(gaming[12] ?? '');
  const jeweledCogsUnlocked = superbits.includes(numberToLetter(JEWEL_COGS_SUPERBIT_INDEX));
  const jeweledCogCurrent = option(414);
  const jeweledCogMax = Math.round(1 + LEGEND_COG_TALENT_X2 * (legendLevels[LEGEND_COG_TALENT_INDEX] ?? 0));
  const jeweledCogAvailable = jeweledCogMax - jeweledCogCurrent;

  const sushi = toList(data.Sushi);
  const sushiTrack = toList(sushi[5]);
  const sushiXp = asIndexedNumbers(sushi[6]);
  const sushiKnowledgeLevels = asIndexedNumbers(sushi[7]);
  const sushiKnowledgeReady: { name: string; index: number; level: number }[] = [];
  SUSHI_NAMES.forEach((name, index) => {
    const tracked = sushiTrack[index];
    const discovered = tracked === undefined || tracked === null ? -1 : asNumber(tracked, -1);
    if (discovered < 0) return;
    const level = sushiKnowledgeLevels[index] ?? 0;
    if ((sushiXp[index] ?? 0) >= sushiKnowledgeReq(level)) {
      sushiKnowledgeReady.push({ name, index, level });
    }
  });

  const research = toList(data.Research);
  const foundState = asIndexedNumbers(research[2]);
  const insightLevels = asIndexedNumbers(research[4]);
  const insightObservations: { name: string; index: number; insightLevel: number }[] = [];
  RESEARCH_OCCURRENCE_NAMES.forEach((name, index) => {
    if (name === 'Name') return;
    if ((foundState[index] ?? 0) < 1) return;
    if (!observationLensTypes(research[5], index).includes(1)) return;
    const insightLevel = insightLevels[index] ?? 0;
    if (insightLevel >= 3) insightObservations.push({ name, index, insightLevel });
  });

  const shinyPets: { name: string; rawName: string; shinyLevel: number }[] = [];
  const breedabilityPets: { name: string; rawName: string; breedingLevel: number }[] = [];
  const breeding = toList(data.Breeding);
  const petUpgrades = asIndexedNumbers(breeding[2]);
  const fenceSlots = Math.max(0, Math.round(5 + (petUpgrades[4] ?? 0) + 2 * (gemShop[125] ?? 0)));
  const fenceShiny = new Set<string>();
  const fenceBreed = new Set<string>();
  for (const pet of toList(data.Pets).slice(0, fenceSlots)) {
    const row = Array.isArray(pet) ? pet : toList(pet);
    const name = String(row[0] ?? '');
    const type = asNumber(row[1]);
    if (!name) continue;
    if (type === 5) fenceShiny.add(name);
    if (type === 4) fenceBreed.add(name);
  }
  const breedabilityUnlocked = (petUpgrades[2] ?? 0) > 0;
  PET_RAW_NAMES.forEach((worldPets, worldIndex) => {
    const shinyRow = asIndexedNumbers(breeding[22 + worldIndex]);
    const breedRow = asIndexedNumbers(breeding[13 + worldIndex]);
    worldPets.forEach((rawName, petIndex) => {
      if (fenceShiny.has(rawName)) {
        const shinyLevel = shinyLevelFromProgress(shinyRow[petIndex] ?? 0);
        if (shinyLevel >= SHINY_LEVEL_THRESHOLD) {
          shinyPets.push({ name: rawName, rawName, shinyLevel });
        }
      }
      if (breedabilityUnlocked && fenceBreed.has(rawName)) {
        const breedingLevel = breedabilityLevel(breedRow[petIndex] ?? 0, breedabilityUnlocked);
        if (breedingLevel >= BREEDABILITY_LEVEL_THRESHOLD) {
          breedabilityPets.push({ name: rawName, rawName, breedingLevel });
        }
      }
    });
  });

  const labChipsReady: NamedIcon[] = [];
  const labJewelsReady: NamedIcon[] = [];
  const weekSeed = Math.floor(asNumber(asRecord(data.TimeAway).GlobalTime) / 604800);
  const rotation = labWeekRotation(weekSeed, LAB_CHIPS.length, LAB_JEWELS.length);
  const jadeBling = jadeBlingUnlocked(data);
  for (let slot = 0; slot < 3; slot += 1) {
    const repo = chipRepoSlot(serverVars?.ChipRepo, slot);
    if (repo !== undefined && repo >= 0) rotation[slot] = repo;
    rotation[slot] = remapLabRotationIndex(rotation[slot], jadeBling);
  }
  const lab = toList(data.Lab);
  const claimed = asIndexedNumbers(lab[13]);
  const jewelAcquired = asIndexedNumbers(lab[14]);
  for (let slot = 0; slot < 2; slot += 1) {
    const chipIndex = rotation[slot] ?? -1;
    const chip = LAB_CHIPS[chipIndex];
    if (!chip) continue;
    if (claimed.length > slot && chipIndex === claimed[slot]) continue;
    if (!labReqsMet(chip, amounts)) continue;
    labChipsReady.push({ name: chip.name, rawName: chip.rawName });
  }
  const jewelIndex = rotation[2] ?? -1;
  const jewel = LAB_JEWELS[jewelIndex];
  if (
    jewel &&
    !(claimed.length > 2 && jewelIndex === claimed[2]) &&
    jewelAcquired[jewelIndex] !== 1 &&
    labReqsMet(jewel, amounts)
  ) {
    labJewelsReady.push({ name: jewel.name, rawName: jewel.rawName });
  }

  let buttonTaskReady = false;
  let buttonTaskDescription = '';
  if (BUTTON_PERM.length > 0 && BUTTON_TASKS.length > 0) {
    const presses = Math.floor(option(594));
    const perm = BUTTON_PERM[presses % BUTTON_PERM.length] ?? 0;
    const taskIndex = perm % BUTTON_TASKS.length;
    const task = BUTTON_TASKS[taskIndex];
    if (task) {
      const requirement = buttonRequirement(task.scaling, task.base, task.factor, presses);
      const progress = buttonTaskProgress(
        taskIndex,
        data,
        option,
        characters,
        rawMoney,
        stampLevels,
        mealLevels
      );
      buttonTaskReady = progress >= requirement;
      buttonTaskDescription = formatButtonTask(task.description, requirement);
    }
  }

  const claimStampLevel = stampLevels[ARCADE_CLAIM_STAMP.category]?.[ARCADE_CLAIM_STAMP.index] ?? 0;
  const rechargeStampLevel = stampLevels[ARCADE_RECHARGE_STAMP.category]?.[ARCADE_RECHARGE_STAMP.index] ?? 0;
  const claimStamp = Math.min(
    ARCADE_CLAIM_STAMP.cap,
    decayBonus(claimStampLevel, ARCADE_CLAIM_STAMP.x1, ARCADE_CLAIM_STAMP.x2)
  );
  const rechargeStamp = Math.min(
    ARCADE_RECHARGE_STAMP.cap,
    decayBonus(rechargeStampLevel, ARCADE_RECHARGE_STAMP.x1, ARCADE_RECHARGE_STAMP.x2)
  );
  let ballBonus = 0;
  for (const [achievementIndex, bonus] of ARCADE_BALL_ACHIEVEMENTS) {
    if (achievementCompleted(data, achievementIndex)) ballBonus += bonus;
  }
  const pickleLevel = asIndexedNumbers(toList(data.CauldronInfo)[4])[ARCADE_PICKLE_VIAL_INDEX] ?? 0;
  const bribeRaw = asIndexedNumbers(data.BribeStatus);
  const marbleBonus = (bribeRaw[WEIGHTED_MARBLES_BRIBE] ?? 0) >= 1 ? WEIGHTED_MARBLES_BONUS : 0;
  const arcadeTaskBonus = 5 * taskMeritLevel(data, ARCADE_TASK_WORLD, ARCADE_TASK_INDEX);
  const secPerBall = 4000 / (1 + (ballBonus + ARCADE_PICKLE_VIAL_BONUS * pickleLevel + marbleBonus + arcadeTaskBonus + rechargeStamp) / 100);
  const maxClaimTime = Math.ceil(3600 * (48 + claimStamp));
  const maxBalls = Math.floor(maxClaimTime / Math.max(1800, secPerBall));
  const timeAway = asRecord(data.TimeAway);
  const arcadeAfkSec = Math.max(0, asNumber(timeAway.GlobalTime) - asNumber(timeAway.Arcade));
  const ballsToClaim = Math.floor(Math.min(arcadeAfkSec, maxClaimTime) / Math.max(secPerBall, 1800));
  const arcadeBallsAtCap = maxBalls > 0 && ballsToClaim >= maxBalls - (5 * maxBalls) / 100;

  const shinyUnlocked = sigilRow[SHINY_BEACON_INDEX * 2 + 1] ?? -1;
  const shinyBonus = shinyUnlocked >= 0 && shinyUnlocked < SHINY_BEACON_BONUSES.length ? (SHINY_BEACON_BONUSES[shinyUnlocked] ?? 0) : 0;
  const crystalLegendLevels = asIndexedNumbers(toList(data.Spelunk)[18]);
  const legendCrystal = (crystalLegendLevels[LEGEND_CRYSTAL_TALENT_INDEX] ?? 0) * LEGEND_CRYSTAL_TALENT_X2;
  const crystalTask = taskMeritLevel(data, 3, 0);
  const crystalAchievement = achievementCompleted(data, CRYSTAL_ACHIEVEMENT) ? 1 : 0;
  const crystalGuarantee = Math.max(
    0,
    Math.ceil((1 + legendCrystal / 100) * (shinyBonus + (crystalTask + 4 * crystalAchievement)))
  );

  const riftLevel = firstNumber(data.Rift);
  const alchemyLevel = characters.reduce((max, character) => Math.max(max, character.skills.Alchemy ?? 0), 0);
  const p2wLiquids = asIndexedNumbers(p2w[1]);
  const liquidMastery =
    riftLevel >= SKILL_MASTERY_RIFT && skillMasteryRank(alchemyLevel) > 4 ? 1 : 0;
  const bleachBought = asIndexedNumbers(data.GemItemsPurchased)[106] ?? 0;
  const arcadeLiquid = Math.ceil(
    decayBonus(arcadeLevels[ARCADE_LIQUID_CAP_INDEX] ?? 0, 25, 100)
  );
  const liquidMaxes = [0, 1, 2, 3].map((index) => {
    const capacity = p2wLiquids[index * 2 + 1] ?? 0;
    let bleach = 0;
    if (bleachBought > index) bleach = 0.5;
    if (option(123) > index) bleach = bleach === 0 ? 1 : 2;
    const secondMath = bleach + (5 * liquidMastery) / 100;
    const thirdMath = 10 + capacity + arcadeLiquid;
    return Math.max(1, Math.ceil((1 + secondMath) * thirdMath));
  });

  const gemChests = asIndexedNumbers(data.GemItemsPurchased)[SAILING_CHEST_GEM] ?? 0;
  const taskChests = taskMeritLevel(data, SAILING_CHEST_TASK_WORLD, SAILING_CHEST_TASK_INDEX);
  const achievementChests = SAILING_CHEST_ACHIEVEMENTS.reduce(
    (sum, index) => sum + (achievementCompleted(data, index) ? 1 : 0),
    0
  );
  const maxChests = Math.min(Math.round(5 + gemChests + taskChests + achievementChests), 34);
  const currentChests = toList(data.SailChests).length;
  const sailingChestsFull = maxChests > 0 && currentChests >= maxChests;

  const shimmerTrial = SHIMMER_TRIALS[option(183)] ?? '';
  const nametagClaim = tomeNametagClaim(data, characters, option, serverVars);

  return {
    affordableStampCount,
    affordableStampPercent: rawMoney > 0 ? Math.ceil((stampTotal / rawMoney) * 100) : 0,
    vialsReady,
    mealsReady,
    missingHats,
    missingTrophies,
    missingNametags,
    buildingsReady,
    refineryMissing,
    refineryRankUp,
    betterShopCaptains,
    kangarooShinyPct,
    kangarooFisherooReady: kangarooFish > 0 && poppyReady(option, 6, kangarooFish, kangarooProgress),
    kangarooGreatestCatchReady: kangarooFish > 0 && poppyReady(option, 11, kangarooFish, kangarooProgress),
    sigilsReady,
    stampReducerPct,
    foodLustMaxed,
    holeSedimentReady,
    holeMotherlodeMaxed,
    holeHiveMaxed,
    holeEvertreeMaxed,
    holeTrenchMaxed,
    holeBraveryReady,
    holeJusticeReady,
    holeWisdomReady,
    holeBellReady,
    holeHarpReady,
    holeGrottoReady,
    holeJars,
    holeJarsFull,
    holeVillagersReady,
    holeStudiesReady,
    holeLayersBrokenToday: layersBroken,
    arcadeUnmaxed,
    printerFull,
    emptyRibbonSlots,
    cookingMasteryYellow,
    cookingMasteryPurple,
    gamingSprouts,
    gamingSproutsCapacity: sproutsCapacity,
    gamingDrops,
    gamingShovelHours,
    gamingSquirrelHours,
    gamingShovelUnlocked,
    gamingSquirrelUnlocked,
    fullStaminaCharacters,
    overstimLevel,
    legendPointsLeft,
    legendPointsSpent,
    legendMaxSpendable,
    masterclassCheapAvailable,
    masterclassCheapUsed,
    masterclassCheapMax,
    doubleClusterReady,
    jeweledCogAvailable,
    jeweledCogCurrent,
    jeweledCogMax,
    jeweledCogsUnlocked,
    sushiKnowledgeReady,
    insightObservations,
    shinyPets,
    breedabilityPets,
    labChipsReady,
    labJewelsReady,
    vialAttemptItemsReady,
    buttonTaskReady,
    buttonTaskDescription,
    crystalGuarantee,
    arcadeBallsAtCap,
    liquidMaxes,
    sailingChestsFull,
    shimmerTrial,
    tomeNametagsAvailable: nametagClaim.available,
    tomeUnlocked: nametagClaim.tomeUnlocked
  };
}

export const KANGAROO_SHINY_ALERT = KANGAROO_SHINY_THRESHOLD;
export const HOLE_JAR_ALERT = HOLE_JAR_THRESHOLD;
export const STAMP_REDUCER_ALERT = STAMP_REDUCER_THRESHOLD;
