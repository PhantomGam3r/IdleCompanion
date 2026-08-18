import { DUNGEON_RANK_REQS, TOME_BONUSES, TOME_UNLOCK_ORDER } from './alertCatalogs';
import { asIndexedNumbers, asNumber, asRecord, countIndexedKeys, toList } from './helpers';
import type { Character } from './types';

function lavaLog(value: number): number {
  return Math.log(Math.max(value, 1)) / 2.30259;
}

function dungeonRank(progress: number): number {
  let rankIndex = 0;
  for (let index = 0; index < DUNGEON_RANK_REQS.length; index += 1) {
    if (progress > (DUNGEON_RANK_REQS[index] ?? 0)) rankIndex = index;
  }
  return rankIndex + 1;
}

function pointsPercent(x1: number, x2: number, quantity: number): number {
  if (x2 === 0) {
    if (quantity < 0) return 0;
    return Math.pow((1.7 * quantity) / (quantity + x1), 0.7);
  }
  if (x2 === 1) return (2.4 * lavaLog(quantity)) / (2 * lavaLog(quantity) + x1);
  if (x2 === 2) return Math.min(1, quantity / x1);
  if (x2 === 3) {
    if (quantity > 5 * x1) return 0;
    return Math.pow((1.2 * (6 * x1 - quantity)) / (7 * x1 - quantity), 5);
  }
  if (x2 === 4) {
    const capped = Math.min(x1, quantity);
    return Math.pow((2 * capped) / (capped + x1), 0.7);
  }
  return 0;
}

function tomeUnlockIndex(bonusIndex: number): number {
  return TOME_UNLOCK_ORDER.indexOf(bonusIndex);
}

function tomeLevelReq(realIndex: number): number {
  return (
    40 * realIndex +
    (5 * Math.max(0, realIndex - 35) +
      (10 * Math.max(0, realIndex - 60) + (10 * Math.max(0, realIndex - 80) + 15 * Math.max(0, realIndex - 100)))) +
    350
  );
}

function sumLevels(value: unknown): number {
  return asIndexedNumbers(value).reduce((sum, level) => sum + Math.max(0, level), 0);
}

function completedAchievements(data: Record<string, unknown>): number {
  return asIndexedNumbers(data.AchieveReg).filter((value) => value === -1).length;
}

function uniqueQuests(data: Record<string, unknown>, characters: Character[]): number {
  const names = new Set<string>();
  for (const character of characters) {
    const quests = asRecord(data[`QuestComplete_${character.index}`]);
    for (const [name, value] of Object.entries(quests)) {
      if (name !== 'length' && asNumber(value) === 1) names.add(name);
    }
  }
  return names.size;
}

function talentMaxTotal(data: Record<string, unknown>, characters: Character[]): number {
  const best = new Map<number, number>();
  for (const character of characters) {
    asIndexedNumbers(data[`SkillLevelsMAX_${character.index}`]).forEach((level, index) => {
      best.set(index, Math.max(best.get(index) ?? 0, level));
    });
  }
  let total = 0;
  for (const level of best.values()) total += Math.max(0, level);
  return total;
}

function taskLevelsCompleted(data: Record<string, unknown>): number {
  const tasks = toList(data.Tasks);
  const levels = toList(tasks[1] ?? data.TaskZZ1);
  let total = 0;
  for (const world of levels) {
    asIndexedNumbers(world)
      .slice(0, 8)
      .forEach((level) => {
        total += Math.max(0, level);
      });
  }
  return total;
}

function meritLevel(data: Record<string, unknown>, world: number, index: number): number {
  const tasks = toList(data.Tasks);
  const merits = toList(tasks[2] ?? data.TaskZZ2);
  return asIndexedNumbers(merits[world])[index] ?? 0;
}

function sigilLevels(data: Record<string, unknown>): number {
  const row = asIndexedNumbers(toList(data.CauldronP2W)[4]);
  let total = 0;
  for (let index = 0; index + 1 < row.length; index += 2) {
    total += (row[index + 1] ?? -1) + 1;
  }
  return total;
}

function ownedCardLevels(data: Record<string, unknown>): number {
  let total = 0;
  for (const [name, amount] of Object.entries(asRecord(data.Cards0))) {
    if (name === 'length') continue;
    if (asNumber(amount) > 0) total += 1;
  }
  return total;
}

function trophyCount(data: Record<string, unknown>): number {
  return toList(data.Cards1).filter(
    (item) => typeof item === 'string' && item.startsWith('Trophy')
  ).length;
}

function nametagCount(data: Record<string, unknown>): number {
  return toList(data.Cards1).filter(
    (item) => typeof item === 'string' && item.includes('Nametag')
  ).length;
}

function onyxStatues(data: Record<string, unknown>, characters: Character[]): number {
  const onyx = new Set<number>();
  for (const character of characters) {
    toList(data[`StatueLevels_${character.index}`]).forEach((row, index) => {
      if ((asIndexedNumbers(row)[1] ?? 0) >= 1) onyx.add(index);
    });
  }
  return onyx.size;
}

function kitchenLevels(data: Record<string, unknown>): number {
  return toList(data.Cooking).reduce((sum: number, row) => sum + sumLevels(row), 0);
}

function mealLevels(data: Record<string, unknown>): number {
  return sumLevels(toList(data.Meals)[0]);
}

function towerWaves(data: Record<string, unknown>): number {
  return asIndexedNumbers(toList(data.TotemInfo)[0]).reduce((sum, wave) => sum + Math.max(0, wave), 0);
}

function towerLevels(data: Record<string, unknown>): number {
  return sumLevels(data.Tower);
}

function refineryLevels(data: Record<string, unknown>): number {
  return toList(data.Refinery)
    .slice(3, 9)
    .reduce((sum: number, row) => sum + (asIndexedNumbers(row)[1] ?? 0), 0);
}

function artifactCount(data: Record<string, unknown>): number {
  return asIndexedNumbers(toList(data.Sailing)[3]).filter((value) => value > 0).length;
}

function lootPileGold(data: Record<string, unknown>): number {
  return asIndexedNumbers(toList(data.Sailing)[1])[0] ?? 0;
}

export function tomeQuantities(
  data: Record<string, unknown>,
  characters: Character[],
  option: (index: number) => number
): number[] {
  const accountLevel = characters.reduce((sum, character) => sum + character.combatLevel, 0);
  const skillTotal = characters.reduce((sum, character) => {
    return (
      sum +
      Object.entries(character.skills).reduce(
        (inner: number, [name, level]) => inner + (name === 'Combat' ? 0 : level),
        0
      )
    );
  }, 0);
  const stampLevels = toList(data.StampLv ?? data.StampLevel).reduce(
    (sum: number, row) => sum + sumLevels(row),
    0
  );
  const statueBest: number[] = [];
  for (const character of characters) {
    toList(data[`StatueLevels_${character.index}`]).forEach((row, index) => {
      statueBest[index] = Math.max(statueBest[index] ?? 0, asIndexedNumbers(row)[0] ?? 0);
    });
  }
  const statueLevels = statueBest.reduce((sum, level) => sum + level, 0);
  const holes = toList(data.Holes);
  const extra = asIndexedNumbers(holes[11]);
  const spelunk = toList(data.Spelunk);
  const summon = toList(data.Summon);
  const ninja = toList(data.Ninja);
  const farmRanks = asIndexedNumbers(toList(data.FarmRank)[0]);
  const arcade = asIndexedNumbers(data.ArcadeUpg);
  const crystalSpawn = option(202);
  const quantities = [
    stampLevels,
    statueLevels,
    ownedCardLevels(data),
    talentMaxTotal(data, characters),
    uniqueQuests(data, characters),
    accountLevel,
    taskLevelsCompleted(data),
    completedAchievements(data),
    option(198),
    option(208),
    trophyCount(data),
    skillTotal,
    option(201),
    asIndexedNumbers(toList(toList(data.Tasks)[0] ?? data.TaskZZ0)[0])[2] ?? 0,
    option(172),
    0,
    crystalSpawn > 0 ? 1 / crystalSpawn : 0,
    dungeonRank(option(71)),
    option(200),
    asIndexedNumbers(data.StarSign).filter((value) => value > 0).length,
    option(203),
    toList(data.ObolEqO1).filter((item) => typeof item === 'string' && item && item !== 'Blank').length,
    toList(data.CauldronInfo)
      .slice(0, 4)
      .reduce((sum: number, row) => sum + sumLevels(row), 0),
    sumLevels(toList(data.CauldronInfo)[4]),
    sigilLevels(data),
    option(199),
    asNumber(data.CYDeliveryBoxComplete) + asNumber(data.CYDeliveryBoxStreak) + asNumber(data.CYDeliveryBoxMisc),
    option(204),
    option(205),
    option(206),
    1000 - option(207),
    option(211),
    option(212),
    option(213),
    option(214),
    option(215),
    option(209),
    towerWaves(data),
    0,
    Object.entries(asRecord(data.WeeklyBoss)).filter(
      ([key, value]) => /^d_\d+$/.test(key) && asNumber(value) === -1
    ).length,
    refineryLevels(data),
    sumLevels(data.Atoms),
    towerLevels(data),
    0,
    option(224),
    asNumber(toList(data.Rift)[0]),
    0,
    1000 - option(220),
    kitchenLevels(data),
    0,
    mealLevels(data),
    0,
    0,
    0,
    option(217),
    onyxStatues(data, characters),
    1000 - option(218),
    0,
    Math.min(10, asIndexedNumbers(data.Divinity)[25] ?? 0),
    asNumber(toList(data.Gaming)[7]),
    artifactCount(data),
    lootPileGold(data),
    0,
    Math.max(asNumber(toList(data.Gaming)[8]), option(210)),
    asNumber(toList(data.Gaming)[9]),
    toList(data.Cards1).filter((item) => typeof item === 'string' && item && item !== 'Blank').length,
    asNumber(toList(data.Gaming)[0]),
    Math.pow(2, option(219)),
    countIndexedKeys(data.FarmCrop),
    0,
    sumLevels(summon[1]),
    sumLevels(summon[0]),
    asIndexedNumbers(ninja[103]).filter((level) => level > 0).length,
    asNumber(toList(summon[0])[2]),
    typeof toList(ninja[102])[9] === 'string'
      ? new Set(String(toList(ninja[102])[9]).replace(/[^A-Za-z]/g, '').split('')).size
      : 0,
    0,
    sumLevels(data.PrayOwned),
    farmRanks.reduce((sum, level) => sum + Math.max(0, level), 0),
    option(221),
    option(222),
    arcade.reduce((sum, level) => sum + Math.max(0, level), 0),
    Math.min(1500, asIndexedNumbers(data.UpgVault)[57] ?? 0),
    extra[73] ?? 0,
    extra.slice(0, 10).reduce((sum, value) => sum + Math.max(0, value), 0),
    sumLevels(holes[1]),
    option(262),
    option(279),
    extra[73] ?? 0,
    extra[74] ?? 0,
    extra[75] ?? 0,
    option(356),
    extra[8] ?? 0,
    extra.slice(0, 8).reduce((sum, value) => sum + Math.max(0, value), 0),
    extra[25] ?? extra[24] ?? 0,
    Math.round(Math.min(12, option(353)) + 1),
    Math.round(option(369)),
    0,
    sumLevels(spelunk[3]),
    Math.max(0, ...asIndexedNumbers(spelunk[4])),
    sumLevels(ninja[103]),
    option(445),
    option(446),
    Math.max(0, ...asIndexedNumbers(spelunk[5])),
    sumLevels(spelunk[1]),
    asIndexedNumbers(spelunk[2]).filter((value) => value > 0).length,
    characters.reduce((max, character) => Math.max(max, character.skills.Spelunking ?? 0), 0),
    option(443),
    nametagCount(data),
    0,
    0,
    0,
    0,
    0,
    option(498),
    sumLevels(toList(data.Research)[0]),
    0,
    asIndexedNumbers(toList(data.Sushi)[5]).filter((value) => asNumber(value, -1) >= 0).length,
    option(594)
  ];
  return quantities as number[];
}

export function tomeTotalPoints(
  data: Record<string, unknown>,
  characters: Character[],
  option: (index: number) => number
): number {
  const accountLevel = characters.reduce((sum, character) => sum + character.combatLevel, 0);
  const quantities = tomeQuantities(data, characters, option);
  let total = 0;
  TOME_BONUSES.forEach((bonus, index) => {
    const realIndex = tomeUnlockIndex(index);
    if (realIndex < 0) return;
    if (accountLevel <= tomeLevelReq(realIndex)) return;
    const percent = pointsPercent(bonus.x1, bonus.x2, quantities[index] ?? 0);
    total += Math.ceil(percent * bonus.x3);
  });
  return total;
}

export function tomeNametagClaim(
  data: Record<string, unknown>,
  characters: Character[],
  option: (index: number) => number,
  serverVars: Record<string, unknown> | null
): { tomeUnlocked: boolean; available: number } {
  const tomeUnlocked = asNumber(serverVars?.TomeOn) === 1;
  if (!tomeUnlocked) return { tomeUnlocked, available: 0 };
  const tops = asIndexedNumbers(serverVars?.TomePct);
  const totalPoints = tomeTotalPoints(data, characters, option);
  let top = -1;
  for (let index = 0; index < 7; index += 1) {
    if (totalPoints > (tops[index] ?? Number.POSITIVE_INFINITY)) top = index;
  }
  if (top === -1) {
    for (let index = 0; index < 5; index += 1) {
      if (totalPoints >= (tops[index + 7] ?? Number.POSITIVE_INFINITY)) {
        top = index + 7;
        break;
      }
    }
  }
  const claimed = option(447);
  const monthStamp = option(448);
  const currentMonth = Math.floor(asNumber(asRecord(data.TimeAway).GlobalTime) / 2628e3);
  const effectiveClaimed = currentMonth !== monthStamp ? 0 : claimed;
  const rewardTier = top >= 0 && top <= 6 ? Math.min(top, 6) : -1;
  const available = rewardTier >= 0 ? Math.max(0, rewardTier + 1 - effectiveClaimed) : 0;
  return { tomeUnlocked, available };
}

export function taskMeritLevel(data: Record<string, unknown>, world: number, index: number): number {
  return meritLevel(data, world, index);
}
