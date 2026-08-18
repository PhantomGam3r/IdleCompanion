import { DUNGEON_RANK_REQS, DUNGEON_TRAITS, KILLROY_ENEMY_LISTS, KILLROY_ENEMY_NAMES } from './alertCatalogs';
import { parseDashboardExtras } from './dashboardExtras';
import { asArray, asIndexedNumbers, asNumber, asRecord, forIndexed, numberToLetter, toList } from './helpers';
import { LavaRand, lavaListIndex, lavaRandom1000 } from './lavaRand';
import type { Character, DashboardOps } from './types';
import type { RawSaveBundle } from '../idleon/loadSave';

const SHOP_STOCK_SLOTS: Record<number, number[]> = {
  0: [3, 8, 13, 14, 17, 23],
  1: [2, 8, 9, 13],
  2: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 18, 19],
  3: [12],
  4: [0, 1, 2, 8, 9, 10, 19, 22],
  5: [2, 3, 4, 8, 9, 10, 11],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6, 7],
  8: [2, 3, 5, 6, 7]
};

const KEY_NPCS = [
  { name: 'Dog Bone', rawName: 'Key1', daysIndex: 16, keyIndex: 0 },
  { name: 'Djonnut', rawName: 'Key2', daysIndex: 31, keyIndex: 1 },
  { name: 'Bellows', rawName: 'Key3', daysIndex: 80, keyIndex: 2 }
];

const FAMILIAR_MAX_LEVEL = 25;
const MINEHEAD_EXOTIC_BONUS = 2;
const SUSHI_EXOTIC_BONUS = 3;
const KILLROY_CLASS_NAMES = ['Beginner', 'Warrior', 'Archer', 'Mage'];
const KILLROY_SKIP_ROOMS: Record<number, number[]> = { 1: [0], 21: [0, 1], 321: [0, 1, 2] };

function sushiUniqueCount(data: Record<string, unknown>): number {
  const track = toList(toList(data.Sushi)[5]);
  let unique = 0;
  for (let index = 0; index <= 58; index += 1) {
    const value = track[index];
    const tracked = value === undefined || value === null ? -1 : asNumber(value, -1);
    if (tracked < 0) break;
    unique = index + 1;
  }
  return unique;
}

const COLO_NPCS = [
  { name: 'Typhoon', rawName: 'TixEZ0', daysIndex: 15 },
  { name: 'Centurion', rawName: 'TixEZ1', daysIndex: 35 },
  { name: 'Lonely Hunter', rawName: 'TixEZ2', daysIndex: 56 }
];

function optList(data: Record<string, unknown>): unknown[] {
  return toList(data.OptLacc);
}

function optValue(list: unknown[], rec: Record<string, unknown>, index: number): unknown {
  if (index < list.length && list[index] !== undefined) return list[index];
  return rec[String(index)];
}

function miniBossKills(id: 'mini3b' | 'mini4b' | 'mini5a' | 'mini6a', daysSince: number): number {
  const wait = daysSince < 3 ? 3 : daysSince;
  if (id === 'mini3b') return Math.min(10, Math.floor(Math.pow(wait - 3, 0.55)));
  return Math.min(id === 'mini4b' ? 8 : 6, Math.floor(Math.pow(wait - 3, 0.5)));
}

function klaSlotDefined(data: Record<string, unknown>, characters: Character[], index: number): boolean {
  for (const character of characters) {
    const kla = toList(data[`KLA_${character.index}`]);
    if (index >= kla.length) continue;
    const value = kla[index];
    if (value === undefined || value === null) continue;
    if (Number.isFinite(asNumber(value, Number.NaN))) return true;
  }
  return false;
}

function killroyListForRoom(
  random: number,
  room: number,
  unlockedLava: boolean,
  unlockedSpirit: boolean
): string[] {
  if (random < 300 || room === 0) return KILLROY_ENEMY_LISTS[room] ?? [];
  if (random < 400 && unlockedLava) return KILLROY_ENEMY_LISTS[4] ?? [];
  if (random < 500 && unlockedSpirit) return KILLROY_ENEMY_LISTS[5] ?? [];
  return KILLROY_ENEMY_LISTS[1 + room] ?? [];
}

function thisWeekKillroyMonsters(
  data: Record<string, unknown>,
  characters: Character[],
  option: (index: number) => number,
  globalTimeSec: number,
  killroySwap: number
): { name: string; rawName: string }[] {
  const rooms = option(227) === 1 ? 3 : 2;
  const timeAway = asRecord(data.TimeAway);
  const shopRestock = asNumber(timeAway.ShopRestock);
  const baseSeed = Math.floor((globalTimeSec + Math.round(shopRestock + 86400 * option(39))) / 604800);
  const unlockedLava = klaSlotDefined(data, characters, 200);
  const unlockedSpirit = (asIndexedNumbers(toList(data.Summon)[3])[2] ?? 0) >= 4;
  const monsters: { name: string; rawName: string }[] = [];
  for (let room = 0; room < rooms; room += 1) {
    const seed = Math.round(baseSeed + (50 * room + killroySwap));
    const random = lavaRandom1000(seed);
    const list = killroyListForRoom(random, room, unlockedLava, unlockedSpirit);
    const rawName = list[lavaListIndex(random, list.length)];
    if (!rawName) continue;
    monsters.push({ name: KILLROY_ENEMY_NAMES[rawName] ?? rawName, rawName });
  }
  return monsters;
}

function killroyWeekSeed(data: Record<string, unknown>, option: (index: number) => number, globalTimeSec: number): number {
  const timeAway = asRecord(data.TimeAway);
  const shopRestock = asNumber(timeAway.ShopRestock);
  return Math.floor((globalTimeSec + Math.round(shopRestock + 86400 * option(39))) / 604800);
}

function thisWeekKillroyClasses(
  data: Record<string, unknown>,
  option: (index: number) => number,
  globalTimeSec: number,
  killroySwap: number
): string[] {
  const rooms = option(227) === 1 ? 3 : 2;
  const baseSeed = killroyWeekSeed(data, option, globalTimeSec);
  const skip = KILLROY_SKIP_ROOMS[option(113)] ?? [];
  const classes: string[] = [];
  for (let room = 0; room < rooms; room += 1) {
    if (skip.includes(room)) continue;
    const seed = Math.round(baseSeed + (50 * room + killroySwap));
    const random = 3 * new LavaRand(seed).rand();
    const classIndex = Math.max(0, Math.min(3, Math.ceil(random - Math.floor(room / 2))));
    classes.push(KILLROY_CLASS_NAMES[classIndex] ?? 'Beginner');
  }
  return classes;
}

function dungeonRankFromProgress(progress: number): number {
  let rankIndex = 0;
  for (let index = 0; index < DUNGEON_RANK_REQS.length; index += 1) {
    if (progress > (DUNGEON_RANK_REQS[index] ?? 0)) rankIndex = index;
  }
  return rankIndex + 1;
}

function unpickedDungeonTraits(data: Record<string, unknown>, progress: number): string[] {
  const rank = dungeonRankFromProgress(progress);
  const active = new Set(
    toList(toList(data.DungUpg)[2])
      .map((value) => asNumber(value, Number.NaN))
      .filter((value) => Number.isFinite(value))
  );
  const sections: string[] = [];
  let bonusIndex = 0;
  for (const trait of DUNGEON_TRAITS) {
    const start = bonusIndex;
    bonusIndex += trait.bonusCount;
    if (rank <= trait.levelReq) continue;
    let noneActive = true;
    for (let index = start; index < start + trait.bonusCount; index += 1) {
      if (active.has(index)) {
        noneActive = false;
        break;
      }
    }
    if (noneActive) sections.push(trait.section);
  }
  return sections;
}

export function parseDashboardOps(
  data: Record<string, unknown>,
  bundle: RawSaveBundle,
  characters: Character[],
  world: number
): DashboardOps {
  const options = optList(data);
  const optionRec = asRecord(data.OptLacc);
  const optionRaw = (index: number) => optValue(options, optionRec, index);
  const option = (index: number) => asNumber(optionRaw(index));

  const timeAway = asRecord(data.TimeAway);
  const globalTimeSec = asNumber(timeAway.GlobalTime);

  const cauldron = toList(data.CauldronInfo);
  const multiplier = asIndexedNumbers(cauldron[10]);
  const liquids = asIndexedNumbers(cauldron[6]);
  const p2w = toList(data.CauldronP2W);
  const vialAttempts = asIndexedNumbers(p2w[5])[0] ?? asNumber(p2w[5]);

  const dream = asIndexedNumbers(data.Dream);
  const equinoxUpgrades = dream.slice(2);
  const totalUpgrade = equinoxUpgrades.reduce((sum, level) => sum + Math.max(0, level), 0);
  const equinoxChargeRequired = Math.round((120 + 40 * totalUpgrade) * Math.pow(1.02, totalUpgrade));
  const weekly = asRecord(data.WeeklyBoss);
  let equinoxChallengesReady = 0;
  for (const [key, value] of Object.entries(weekly)) {
    if (!/^d_\d+$/.test(key)) continue;
    const current = asNumber(value);
    if (current > 0) equinoxChallengesReady += 1;
  }

  const keyDays = KEY_NPCS.map((npc) => {
    const days = option(npc.daysIndex);
    const ready = Math.min(Math.max(0, days), 3);
    return { name: npc.name, rawName: npc.rawName, days, ready };
  });
  const coloTickets = COLO_NPCS.map((npc) => {
    const days = option(npc.daysIndex);
    const ready = Math.min(Math.max(0, days), 3);
    return { name: npc.name, rawName: npc.rawName, days, ready };
  });

  const miniBosses = [
    {
      name: 'Dilapidated Slush',
      rawName: 'mini3b',
      current: miniBossKills('mini3b', option(96)),
      unlocked: world >= 4
    },
    {
      name: 'Mutated Mush',
      rawName: 'mini4b',
      current: miniBossKills('mini4b', option(98)),
      unlocked: world >= 3
    },
    {
      name: 'Domeo Magmus',
      rawName: 'mini5a',
      current: miniBossKills('mini5a', option(225)),
      unlocked: world >= 5
    },
    {
      name: 'Demented Spiritlord',
      rawName: 'mini6a',
      current: miniBossKills('mini6a', option(226)),
      unlocked: world >= 6
    }
  ];

  const poRows = toList(data.PostOfficeInfo1);
  const poOrders = toList(data.PostOfficeInfo2);
  const poShipments = poRows.slice(0, 6).map((rowValue, index) => {
    const row = asIndexedNumbers(rowValue);
    const order = asIndexedNumbers(poOrders[index]);
    return {
      index,
      streak: row[1] ?? 0,
      shield: row[2] ?? 0,
      completedAnOrder: asNumber(order[2]) > 0
    };
  });

  const forgeSlots = 1 + (asIndexedNumbers(data.ForgeLV)[0] ?? 0);
  const forgeOrder = toList(data.ForgeItemOrder);
  let forgeEmptySlots = 0;
  for (let slot = 0; slot < forgeSlots; slot += 1) {
    const ore = forgeOrder[slot * 3];
    if (ore == null || ore === 'Blank' || ore === '') forgeEmptySlots += 1;
  }

  let trapsOverdue = 0;
  for (const character of characters) {
    const traps = toList(data[`PldTraps_${character.index}`]);
    for (const trap of traps) {
      const row = asIndexedNumbers(trap);
      const critterId = row[0] ?? asNumber(asArray(trap)[0], -1);
      if (critterId < 0) continue;
      const elapsed = row[2] ?? 0;
      const duration = row[6] ?? 0;
      if (duration > 0 && elapsed >= duration) trapsOverdue += 1;
    }
  }

  const tasksRaw = toList(data.Tasks);
  const taskLevels = toList(tasksRaw[1] ?? data.TaskZZ1);
  const unfinishedDailyTasks: number[] = [];
  for (let worldIndex = 0; worldIndex < 4; worldIndex += 1) {
    const levels = asIndexedNumbers(taskLevels[worldIndex]);
    if ((levels[8] ?? 0) === 0 && world > worldIndex) unfinishedDailyTasks.push(worldIndex);
  }

  let shopItemsLeft = 0;
  const shops = toList(data.ShopStock);
  for (const [shopIndexText, slots] of Object.entries(SHOP_STOCK_SLOTS)) {
    const shopIndex = Number(shopIndexText);
    if (shopIndex >= 2 && world < shopIndex) continue;
    const stock = asIndexedNumbers(shops[shopIndex]);
    for (const slot of slots) {
      if ((stock[slot] ?? 0) > 0) shopItemsLeft += 1;
    }
  }

  const familyObols = toList(data.ObolEqO1);
  let emptyFamilyObols = 0;
  let familySlots = 0;
  forIndexed(familyObols, (_index, item) => {
    familySlots += 1;
    if (item == null || item === '' || item === 'Blank' || item === 'Locked' || item === 'ObolLocked') {
      emptyFamilyObols += 1;
    }
  });
  if (familySlots === 0) emptyFamilyObols = 0;

  const companion = asRecord(bundle.companion ?? data.companion);
  const lastFreeClaim = asNumber(companion.t);
  const companionClaimReady =
    lastFreeClaim > 0 && globalTimeSec * 1000 - lastFreeClaim >= 594e6;

  const dungeonTraitsUnpicked = unpickedDungeonTraits(data, option(71));

  const guild = asRecord(data.Guild);
  const guildTasks = toList(guild.guildTasks ?? guild.tasks);
  let guildDailyLeft = 0;
  let guildWeeklyLeft = 0;
  if (guildTasks.length > 0) {
    guildDailyLeft = guildTasks.slice(0, 5).filter((task) => {
      const rec = asRecord(task);
      return asNumber(rec.progress) < asNumber(rec.requirement, 1);
    }).length;
    guildWeeklyLeft = guildTasks.slice(5, 10).filter((task) => {
      const rec = asRecord(task);
      return asNumber(rec.progress) < asNumber(rec.requirement, 1);
    }).length;
  }

  const flags = asIndexedNumbers(data.FlagU ?? data.FlagUnlock);
  const placed = toList(data.FlagP ?? data.FlagsPlaced).map((value) => asNumber(value));
  let flagsReady = 0;
  flags.forEach((value, index) => {
    const isPlaced = placed.includes(index) || placed.length === 0;
    if (isPlaced && value === -11) flagsReady += 1;
  });

  const breeding = toList(data.Breeding);
  const breedingEggs = asIndexedNumbers(breeding[0]).slice(0, 15);

  const farmPlots = toList(data.FarmPlot);
  let farmEmptyPlots = 0;
  let farmOgPlots = 0;
  let farmCropsOnPlots = 0;
  for (const plot of farmPlots) {
    const row = asIndexedNumbers(plot);
    const seedType = row[0] ?? -1;
    if (seedType < 0) {
      farmEmptyPlots += 1;
      continue;
    }
    farmCropsOnPlots += row[4] ?? 0;
    if ((row[5] ?? 0) > 0) farmOgPlots += 1;
  }

  const ninja = toList(data.Ninja);
  const sneakingExtra = toList(ninja[102]);
  const sneakingLastLootedSec = asNumber(sneakingExtra[2]);
  const sneakingCharmRolls = asNumber(toList(ninja[111])[0] ?? sneakingExtra[8]);

  const summon = toList(data.Summon);
  const summonAttempts = asIndexedNumbers(summon[3])[0] ?? 0;
  const summonFamiliarLevel = asIndexedNumbers(summon[0])[2] ?? 0;

  const sushi = toList(data.Sushi);
  const sushiMisc = asIndexedNumbers(sushi[4]);
  const sushiFuel = sushiMisc[0] ?? 0;
  const sushiShakers: [number, number, number] = [sushiMisc[5] ?? 0, sushiMisc[6] ?? 0, sushiMisc[7] ?? 0];

  const research = toList(data.Research);
  const researchRollsLeft = asIndexedNumbers(research[7])[2] ?? 0;
  const mineheadTriesLeft = asIndexedNumbers(research[7])[8] ?? asNumber(toList(data.MineHead)[8]);

  const eventShop = String(optionRaw(311) ?? '');
  const mineheadOpponentsBeat = asIndexedNumbers(research[7])[4] ?? 0;
  const exoticPurchased = option(416);
  const exoticMaxPurchases = Math.round(
    4 +
      (mineheadOpponentsBeat > 8 ? MINEHEAD_EXOTIC_BONUS : 0) +
      8 * (eventShop.includes(numberToLetter(43)) ? 1 : 0) +
      (sushiUniqueCount(data) > 33 ? SUSHI_EXOTIC_BONUS : 0) +
      3 * (asNumber(weekly['d_66']) === -1 ? 1 : 0)
  );
  const exoticUnlocked = (asIndexedNumbers(toList(data.Spelunk)[0])[3] ?? 0) > 0;

  const owlFeathers = option(254);
  const owlNext = option(255);
  const owlRestartCostReady = option(253) > 0 && owlFeathers > 0 && (owlNext === 0 || option(259) > 0);
  const extras = parseDashboardExtras(data, characters, option, liquids, bundle.serverVars);
  const krBest = asRecord(data.KRbest);
  const killroySwap = asNumber(bundle.serverVars?.KillroySwap);
  const killroyUnder100 = thisWeekKillroyMonsters(
    data,
    characters,
    option,
    globalTimeSec,
    killroySwap
  ).filter((monster) => asNumber(krBest[monster.rawName]) < 100);
  const killroyClasses = thisWeekKillroyClasses(data, option, globalTimeSec, killroySwap);

  return {
    option,
    optionRaw,
    globalTimeSec,
    gildedStamps: option(154),
    randomEventDoneToday: option(137) > 0,
    bossGemKillsUsed: option(195),
    crystalKillsToday: option(101),
    tournamentDay: option(496),
    tournamentRegisteredThrough: option(511),
    petMartClaimDay: option(516),
    tournamentShopDay: asNumber(
      asRecord(data.Tournament).S ?? asRecord(asRecord(data.tournament).global).S
    ),
    killroyWeekProgress: option(113),
    killroyThirdRoom: option(227) === 1,
    killroySkulls: option(105),
    killroyUnder100,
    killroyClasses,
    weeklyBossDone: option(190) > 0,
    alternateParticles: option(135),
    islandAfkDays: option(160),
    shimmerClaimed: option(182) > 0,
    islandTrash: option(161),
    garbageUpgradeLevel: option(163),
    bargainMultiplier: multiplier[0] ?? 0,
    alchemyGemMultiplier: multiplier[1] ?? 0,
    liquids,
    vialAttempts,
    libraryBooks: option(55),
    flagsReady,
    equinoxCharge: dream[0] ?? 0,
    equinoxChargeRequired,
    equinoxChallengesReady,
    spiceClaims: option(100),
    breedingEggs,
    summonAttempts,
    summonFamiliarLevel,
    summonFamiliarMax: FAMILIAR_MAX_LEVEL,
    sneakingLastLootedSec,
    sneakingCharmRolls,
    farmEmptyPlots,
    farmOgPlots,
    farmCropsOnPlots,
    exoticPurchased,
    exoticMaxPurchases,
    exoticUnlocked,
    emperorAttempts: option(369),
    pageReadsToday: option(410),
    mineheadTriesLeft,
    researchRollsLeft,
    sushiFuel,
    sushiFuelCapEstimate: 200,
    sushiShakers,
    buttonSkips: option(595),
    jeweledCogPulls: option(414),
    keyDays,
    coloTickets,
    miniBosses,
    poShipments,
    forgeEmptySlots,
    trapsOverdue,
    arcadeAfkSec: Math.max(0, globalTimeSec - asNumber(timeAway.Arcade)),
    unfinishedDailyTasks,
    shopItemsLeft,
    emptyFamilyObols,
    companionClaimReady,
    dungeonTraitsUnpicked,
    guildDailyLeft,
    guildWeeklyLeft,
    owlFeathers,
    owlRestartCostReady,
    owlMegaRestartCostReady: option(253) > 0 && owlNext === 0 && owlFeathers > 0,
    ...extras
  };
}

