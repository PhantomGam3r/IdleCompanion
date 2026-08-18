import {
  BUILD_COST_MULTIPLIER,
  DEFAULT_MEAL_MAX_LEVEL,
  MAX_VIAL_LEVEL,
  MEAL_INFO,
  NAMETAGS,
  POPPY_UPGRADES,
  PREMIUM_HATS,
  REFINERY_POWER_CAPS,
  REFINERY_SALT_INFO,
  SIGIL_INFO,
  STAMP_GOLD,
  STUDY_NAMES,
  TOWER_BONUS_INC,
  TROPHIES,
  VIAL_COSTS,
  VIAL_INFO,
  VILLAGER_NAMES,
  type NamedRaw,
  type StampGoldInfo
} from './alertCatalogs';
import { CONSTRUCTION_BUILDINGS } from './catalogs';
import { asIndexedNumbers, asNumber, toList } from './helpers';
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
};

const STAMP_SPEND_PERCENT = 25;
const KANGAROO_SHINY_THRESHOLD = 100;
const HOLE_SEDIMENT_THRESHOLD = 1000;
const HOLE_HARP_POWER = 100;
const HOLE_JAR_THRESHOLD = 120;
const STAMP_REDUCER_THRESHOLD = 90;
const GREEN_STACK = 1e7;

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

export function parseDashboardExtras(
  data: Record<string, unknown>,
  characters: Character[],
  option: (index: number) => number,
  liquids: number[]
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
  VIAL_INFO.forEach((vial, index) => {
    if (!vial) return;
    const level = vialLevels[index] ?? 0;
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
  const sigilsReady: { name: string; index: number }[] = [];
  SIGIL_INFO.forEach((sigil, index) => {
    const progress = sigilRow[index * 2] ?? 0;
    const unlocked = sigilRow[index * 2 + 1] ?? -1;
    if (unlocked < 0) return;
    if (progress >= sigil.boostCost) sigilsReady.push({ name: sigil.name, index });
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
    holeLayersBrokenToday: layersBroken
  };
}

export const KANGAROO_SHINY_ALERT = KANGAROO_SHINY_THRESHOLD;
export const HOLE_JAR_ALERT = HOLE_JAR_THRESHOLD;
export const STAMP_REDUCER_ALERT = STAMP_REDUCER_THRESHOLD;
