import { asArray, asIndexedNumbers, asIndexedRows, asNumber, asRecord, countIndexedKeys, firstNumber, forIndexed, klaToKills, numberToLetter, tryToParse, toList } from './helpers';
import {
  ATOM_NAMES,
  ATOM_LEVEL_CAP,
  BRIBE_SETS,
  COMPANION_NAMES,
  CONSTRUCTION_BUILDINGS,
  CROP_DEPOT_SCIENCE_INDICES,
  CROP_DEPOT_SCIENTIST_INDEX,
  ISLAND_CODES,
  DEATH_NOTE_MAPS,
  DEATH_NOTE_SKULLS,
  FORGE_UPGRADES,
  POST_OFFICE_BOXES,
  PRAYER_NAMES,
  REAL_BUBBLES_PER_CAULDRON,
  REFINERY_SALTS,
  SALT_LICK_UPGRADES,
  STATUE_NAMES,
  STATUE_TYPES,
  UNPURCHASABLE_BRIBES,
  WORSHIP_TOTEMS
} from './catalogs';
import type {
  BribeStatus,
  BribeSummary,
  BubbleColor,
  Character,
  CharacterOps,
  DeathNoteSummary,
  ForgeSummary,
  NamedLevel,
  ParsedAccount,
  StampCategory,
  StampSummary,
  StatueSummary
} from './types';
import type { RawSaveBundle } from '../idleon/loadSave';
import { parseDashboardOps } from './dashboardOps';
import { parseCharacterOps } from './characterDashboard';

export const CLASS_NAMES = [
  'Unknown',
  'Beginner',
  'Journeyman',
  'Maestro',
  'Voidwalker',
  'Infinilyte',
  'Rage Basics',
  'Warrior',
  'Barbarian',
  'Squire',
  'Blood Berserker',
  'Nope',
  'Divine Knight',
  'Nope',
  'Death Bringer',
  'Filler',
  'Royal Guardian',
  'Filler',
  'Calm Basics',
  'Archer',
  'Bowman',
  'Hunter',
  'Siege Breaker',
  'Nope',
  'Nope',
  'Beast Master',
  'Filler',
  'Filler',
  'Filler',
  'Wind Walker',
  'Savvy Basics',
  'Mage',
  'Wizard',
  'Shaman',
  'Elemental Sorcerer',
  'Spiritual Monk',
  'Bubonic Conjuror',
  'Nope',
  'Filler',
  'Filler',
  'Arcane Cultist'
] as const;

export const SKILL_NAMES = [
  'Combat',
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
  'Spelunking'
] as const;

export const WORLD_SKILL_GATES: { world: number; skill: (typeof SKILL_NAMES)[number] }[] = [
  { world: 2, skill: 'Alchemy' },
  { world: 3, skill: 'Construction' },
  { world: 4, skill: 'Cooking' },
  { world: 5, skill: 'Sailing' },
  { world: 6, skill: 'Farming' },
  { world: 7, skill: 'Spelunking' }
];

const STAMP_CATEGORIES: StampCategory[] = ['combat', 'skills', 'misc'];
const BUBBLE_COLORS: BubbleColor[] = ['orange', 'green', 'purple', 'yellow'];

export function classNameFromId(classId: number): string {
  return CLASS_NAMES[classId] ?? `Unknown class ${classId}`;
}

function namesFromCog(data: Record<string, unknown>, count: number): string[] {
  const cog = asArray<string>(data.CogO);
  const fromCog = cog
    .filter((item) => typeof item === 'string' && item.startsWith('Player_'))
    .map((item) => item.slice('Player_'.length));
  if (fromCog.length) return fromCog;
  return Array.from({ length: count }, (_, i) => `Character${i + 1}`);
}

function parseCharacter(data: Record<string, unknown>, index: number, name: string): Character {
  const levels = asIndexedNumbers(data[`Lv0_${index}`]);
  const skills: Record<string, number> = {};
  SKILL_NAMES.forEach((skill, skillIndex) => {
    skills[skill] = levels[skillIndex] ?? 0;
  });
  const classId = asNumber(data[`CharacterClass_${index}`]);
  const statsArr = asIndexedNumbers(data[`PVStatList_${index}`]);
  const poLevels = asIndexedNumbers(data[`POu_${index}`]).map((level) => Math.round(level));
  const postOfficeBoxes = POST_OFFICE_BOXES.map((boxName, boxIndex) => ({
    name: boxName,
    level: poLevels[boxIndex] ?? 0
  }));
  return {
    index,
    name,
    classId,
    className: classNameFromId(classId),
    combatLevel: skills.Combat ?? 0,
    currentMap: asNumber(data[`CurrentMap_${index}`]),
    skills,
    stats: {
      str: statsArr[0] ?? 0,
      agi: statsArr[1] ?? 0,
      wis: statsArr[2] ?? 0,
      luk: statsArr[3] ?? 0
    },
    postOfficeInvested: poLevels.reduce((sum, level) => sum + level, 0),
    postOfficeBoxes
  };
}

function parseStamps(data: Record<string, unknown>): StampSummary[] {
  const levels = asIndexedRows(data.StampLv ?? data.StampLevel);
  const maxLevels = asIndexedRows(data.StampLvM ?? data.StampLevelMAX);
  const stamps: StampSummary[] = [];
  STAMP_CATEGORIES.forEach((category, categoryIndex) => {
    const row = levels[categoryIndex] ?? [];
    const maxRow = maxLevels[categoryIndex] ?? [];
    const len = Math.max(row.length, maxRow.length);
    for (let index = 0; index < len; index += 1) {
      const level = row[index] ?? 0;
      const maxLevel = maxRow[index] ?? 0;
      stamps.push({
        category,
        index,
        level,
        maxLevel,
        delivered: level > 0 || maxLevel > 0
      });
    }
  });
  return stamps;
}

function parseBubbles(data: Record<string, unknown>): ParsedAccount['bubbles'] {
  const cauldron = asArray<unknown>(data.CauldronInfo);
  const fromRows = asIndexedRows(data.CauldronInfo);
  const rows = cauldron.length ? cauldron : fromRows;
  const bubbles: ParsedAccount['bubbles'] = [];
  BUBBLE_COLORS.forEach((color, colorIndex) => {
    const row = asIndexedNumbers(rows[colorIndex]);
    row.forEach((level, index) => {
      if (index >= REAL_BUBBLES_PER_CAULDRON) return;
      bubbles.push({ color, index, level });
    });
  });
  return bubbles;
}

function parseVials(data: Record<string, unknown>): number[] {
  const cauldron = asArray<unknown>(data.CauldronInfo);
  return asIndexedNumbers(cauldron[4] ?? asIndexedRows(data.CauldronInfo)[4]);
}

function parseBribes(data: Record<string, unknown>): BribeSummary[] {
  const raw = asIndexedNumbers(data.BribeStatus);
  const bribes: BribeSummary[] = [];
  let index = 0;
  for (const set of BRIBE_SETS) {
    for (const name of set.names) {
      const value = raw[index] ?? -1;
      const purchased = value >= 1;
      const status: BribeStatus = purchased ? 1 : UNPURCHASABLE_BRIBES.has(name) || value !== 0 ? -1 : 0;
      bribes.push({ set: set.world, name, status });
      index += 1;
    }
  }
  return bribes;
}

function parseStatues(data: Record<string, unknown>, characterCount: number): StatueSummary[] {
  const levels = Array.from({ length: STATUE_NAMES.length }, () => 0);
  const types = Array.from({ length: STATUE_NAMES.length }, () => 0);
  for (let charIndex = 0; charIndex < characterCount; charIndex += 1) {
    const rows = asArray<unknown>(data[`StatueLevels_${charIndex}`]);
    rows.forEach((row, statueIndex) => {
      const pair = asIndexedNumbers(row);
      const level = pair[0] ?? 0;
      const type = pair[1] ?? 0;
      if (level > (levels[statueIndex] ?? 0)) levels[statueIndex] = level;
      if (type > (types[statueIndex] ?? 0)) types[statueIndex] = type;
    });
  }
  return STATUE_NAMES.map((name, index) => ({
    index,
    name,
    level: levels[index] ?? 0,
    type: STATUE_TYPES[types[index] ?? 0] ?? 'Normal'
  }));
}

function parseForge(data: Record<string, unknown>): ForgeSummary[] {
  const levels = asIndexedNumbers(data.ForgeLV);
  return FORGE_UPGRADES.map((upgrade, index) => ({
    name: upgrade.name,
    purchased: levels[index] ?? 0,
    max: upgrade.max
  }));
}

function namedLevels(names: string[], raw: unknown, maxByIndex?: number[]): NamedLevel[] {
  const levels = asIndexedNumbers(raw);
  return names.map((name, index) => ({
    name,
    level: levels[index] ?? 0,
    max: maxByIndex?.[index]
  }));
}

function parseBuildings(data: Record<string, unknown>): NamedLevel[] {
  const levels = asIndexedNumbers(data.Tower);
  return CONSTRUCTION_BUILDINGS.map((building, index) => ({
    name: building.name,
    level: levels[index] ?? 0,
    max: building.max,
    extra: building.type
  }));
}

function parseRefinery(data: Record<string, unknown>): NamedLevel[] {
  const rows = asIndexedRows(data.Refinery);
  return REFINERY_SALTS.map((salt) => {
    const row = rows[salt.index] ?? asIndexedNumbers(asArray(data.Refinery)[salt.index]);
    return {
      name: salt.name,
      level: row[1] ?? 0,
      extra: (row[3] ?? 0) > 0 ? 'running' : 'idle'
    };
  });
}

function parseWorship(data: Record<string, unknown>): NamedLevel[] {
  const totemInfo = asArray<unknown>(data.TotemInfo);
  const waves = asIndexedNumbers(totemInfo[0] ?? asIndexedRows(data.TotemInfo)[0]);
  return WORSHIP_TOTEMS.map((name, index) => ({
    name,
    level: waves[index] ?? 0,
    max: 300
  }));
}

function skullFromKills(kills: number): (typeof DEATH_NOTE_SKULLS)[number] {
  let skull = DEATH_NOTE_SKULLS[0];
  for (const entry of DEATH_NOTE_SKULLS) {
    if (kills >= entry.kills) skull = entry;
  }
  return skull ?? DEATH_NOTE_SKULLS[0];
}

function parseDeathNote(data: Record<string, unknown>, characterCount: number): DeathNoteSummary {
  const klaByCharacter = Array.from({ length: characterCount }, (_, charIndex) => toList(data[`KLA_${charIndex}`]));
  const byWorld = new Map<number, { skullRank: number; maps: number; started: boolean }>();
  const farmedKills: number[] = [];

  for (const { world, mapId, portalReq } of DEATH_NOTE_MAPS) {
    let kills = 0;
    for (const kla of klaByCharacter) {
      kills += klaToKills(firstNumber(kla[mapId]), portalReq);
    }
    if (kills > 0) farmedKills.push(kills);
    const skull = skullFromKills(kills);
    const rank = DEATH_NOTE_SKULLS.findIndex((entry) => entry.name === skull.name);
    const current = byWorld.get(world) ?? { skullRank: DEATH_NOTE_SKULLS.length, maps: 0, started: false };
    current.maps += 1;
    current.skullRank = Math.min(current.skullRank, rank);
    if (kills > 0) current.started = true;
    byWorld.set(world, current);
  }

  const lowestByWorld = [...byWorld.entries()]
    .filter(([, info]) => info.started)
    .sort((a, b) => a[0] - b[0])
    .map(([world, info]) => ({
      world,
      skull: DEATH_NOTE_SKULLS[info.skullRank]?.name ?? 'None',
      maps: info.maps
    }));
  const farmedRanks = farmedKills.map((kills) =>
    DEATH_NOTE_SKULLS.findIndex((entry) => entry.name === skullFromKills(kills).name)
  );
  const lowestRank = farmedRanks.length ? Math.min(...farmedRanks) : 0;
  return {
    mapsWithKills: farmedKills.length,
    goldSkulls: farmedKills.filter((kills) => kills >= 500_000).length,
    lavaSkulls: farmedKills.filter((kills) => kills >= 100_000_000).length,
    lowestSkull: DEATH_NOTE_SKULLS[lowestRank]?.name ?? 'None',
    lowestByWorld
  };
}

function parseMeals(data: Record<string, unknown>): number[] {
  const meals = asArray<unknown>(data.Meals);
  return asIndexedNumbers(meals[0] ?? asIndexedRows(data.Meals)[0]);
}

function parseKitchens(data: Record<string, unknown>): number {
  return asIndexedRows(data.Cooking).filter((table) => (table[0] ?? 0) === 2).length;
}

function parseSigils(data: Record<string, unknown>): number {
  const p2w = asArray<unknown>(data.CauldronP2W);
  const row = asIndexedNumbers(p2w[4] ?? asIndexedRows(data.CauldronP2W)[4]);
  let unlocked = 0;
  for (let index = 0; index + 1 < row.length; index += 2) {
    const hours = row[index] ?? 0;
    const stored = row[index + 1] ?? -1;
    if (hours > 0 || stored > 0) unlocked += 1;
  }
  return unlocked;
}

function parsePostOfficeBoxes(data: Record<string, unknown>): number {
  return Math.round(
    asNumber(data.CYDeliveryBoxComplete) +
      asNumber(data.CYDeliveryBoxStreak) +
      asNumber(data.CYDeliveryBoxMisc)
  );
}

function optRaw(data: Record<string, unknown>, index: number): unknown {
  const list = toList(data.OptLacc);
  if (index < list.length && list[index] !== undefined) return list[index];
  return asRecord(data.OptLacc)[String(index)];
}

function optNumber(data: Record<string, unknown>, index: number): number {
  return asNumber(optRaw(data, index));
}

function optTruthy(data: Record<string, unknown>, index: number): boolean {
  const value = optRaw(data, index);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value !== '' && value !== '0';
  return asNumber(value) > 0;
}

function parsePrinterSamples(data: Record<string, unknown>): number {
  const samples = toList(data.Print).slice(5);
  let count = 0;
  for (let index = 0; index < samples.length; index += 2) {
    const name = samples[index];
    if (typeof name === 'string' && name && name !== 'Blank') count += 1;
  }
  return count;
}

function parseLab(data: Record<string, unknown>): { jewels: number; chips: number } {
  const lab = toList(data.Lab);
  return {
    jewels: asIndexedNumbers(lab[14]).filter((value) => value > 0).length,
    chips: asIndexedNumbers(lab[15]).filter((value) => value > 0).length
  };
}

function parseBreedingPets(data: Record<string, unknown>): number {
  const breeding = toList(data.Breeding);
  return asIndexedNumbers(breeding[1]).reduce((sum, value) => sum + Math.max(0, value), 0);
}

function parseSailing(data: Record<string, unknown>): {
  islands: number;
  artifacts: number;
  artifactTiers: number;
  boats: number;
  captains: number;
} {
  const sailing = toList(data.Sailing);
  const islands = asIndexedNumbers(sailing[0]);
  const fleet = asIndexedNumbers(sailing[2]);
  const artifacts = asIndexedNumbers(sailing[3]);
  return {
    islands: islands.filter((value) => value === -1).length,
    artifacts: artifacts.filter((value) => value > 0).length,
    artifactTiers: artifacts.reduce((sum, value) => sum + Math.max(0, value), 0),
    captains: 1 + (fleet[0] ?? 0),
    boats: 1 + (fleet[1] ?? 0)
  };
}

function parseDivinityGods(data: Record<string, unknown>): number {
  return Math.min(10, asIndexedNumbers(data.Divinity)[25] ?? 0);
}

function parseGaming(data: Record<string, unknown>): { bits: number; superbits: number } {
  const gaming = toList(data.Gaming);
  const bits = firstNumber(gaming[0]);
  const superbits = typeof gaming[12] === 'string' ? gaming[12].replace(/[^A-Za-z0-9]/g, '').length : asNumber(gaming[12]);
  return { bits, superbits };
}

function parseSlab(data: Record<string, unknown>): number {
  return toList(data.Cards1).filter((item) => typeof item === 'string' && item && item !== 'Blank').length;
}

function parseIslands(data: Record<string, unknown>): number {
  const codes = String(optRaw(data, 169) ?? '');
  if (!codes || codes === '0') return 0;
  return ISLAND_CODES.filter((island) => codes.includes(island.code)).length;
}

const IGNORED_OBOLS = new Set(['', 'Blank', 'Locked', 'ObolLocked', 'LockedObol', 'None']);

function parseObols(data: Record<string, unknown>): number {
  const names: string[] = [];
  const visit = (value: unknown) => {
    if (typeof value === 'string') {
      if (!IGNORED_OBOLS.has(value)) names.push(value);
      return;
    }
    const parsed = tryToParse(value);
    if (Array.isArray(parsed)) {
      parsed.forEach(visit);
      return;
    }
    if (parsed && typeof parsed === 'object') {
      Object.values(parsed as Record<string, unknown>).forEach(visit);
    }
  };
  visit(data.ObolEqO1);
  visit(data.ObolEqO2);
  visit(data.ObolInvOr);
  for (let slot = 0; slot < 10; slot += 1) visit(data[`ObolEqO0_${slot}`]);
  return names.length;
}

function parseEquinoxDreams(data: Record<string, unknown>): number {
  const weekly = asRecord(data.WeeklyBoss);
  return Object.entries(weekly).filter(
    ([key, value]) => /^d_\d+$/.test(key) && asNumber(value) === -1
  ).length;
}

function parseShrines(data: Record<string, unknown>): { unlocked: number; levels: number } {
  const rows = toList(data.Shrine).map((row) => asIndexedNumbers(row));
  const levels = rows.map((row) => row[3] ?? 0);
  return {
    unlocked: levels.filter((level) => level > 0).length,
    levels: levels.reduce((sum, level) => sum + Math.max(0, level), 0)
  };
}

function parseFarming(data: Record<string, unknown>): {
  crops: number;
  plots: number;
  marketLevels: number;
  landRanks: number;
  exoticLevels: number;
} {
  const upgrades = asIndexedNumbers(data.FarmUpg);
  const crops = countIndexedKeys(data.FarmCrop);
  const started = upgrades.length > 0 || crops > 0;
  const market = upgrades.slice(2, 20);
  const exotic = upgrades.slice(20);
  const ranks = asIndexedNumbers(toList(data.FarmRank)[0]);
  return {
    crops,
    plots: started ? 1 + (upgrades[2] ?? 0) : 0,
    marketLevels: market.reduce((sum, level) => sum + Math.max(0, level), 0),
    landRanks: ranks.filter((level) => level > 0).length,
    exoticLevels: exotic.reduce((sum, level) => sum + Math.max(0, level), 0)
  };
}

function parseSneaking(data: Record<string, unknown>): {
  jadeUpgrades: number;
  ninjaLevels: number;
  charms: number;
  cropDepotScientist: boolean;
  cropDepotScience: number;
} {
  const ninja = toList(data.Ninja);
  const extra = toList(ninja[102]);
  const unlocks = extra[9];
  const letters = typeof unlocks === 'string' ? unlocks.replace(/[^A-Za-z]/g, '') : '';
  const jadeUpgrades = new Set(letters.split('').filter(Boolean)).size;
  return {
    jadeUpgrades,
    ninjaLevels: asIndexedNumbers(ninja[103]).reduce((sum, level) => sum + Math.max(0, level), 0),
    charms: asIndexedNumbers(ninja[107]).filter((value) => value > 0).length,
    cropDepotScientist: letters.includes(numberToLetter(CROP_DEPOT_SCIENTIST_INDEX)),
    cropDepotScience: CROP_DEPOT_SCIENCE_INDICES.filter((index) =>
      letters.includes(numberToLetter(index))
    ).length
  };
}

function companionName(id: number): string {
  return COMPANION_NAMES[id] ?? `Companion ${id}`;
}

function collectCompanionIds(source: unknown, ids: Set<number>): boolean {
  if (source == null) return false;
  const rec = asRecord(source);
  const list = rec.l !== undefined ? rec.l : source;
  let found = false;
  forIndexed(list, (_index, item) => {
    if (typeof item === 'number' && Number.isFinite(item)) {
      ids.add(item);
      found = true;
      return;
    }
    if (typeof item === 'string' && item && item !== 'Blank') {
      const id = Number(item.split(',')[0]);
      if (Number.isFinite(id)) {
        ids.add(id);
        found = true;
      }
    }
  });
  return found || rec.l !== undefined || rec.e !== undefined;
}

function parseCompanions(
  bundle: RawSaveBundle,
  data: Record<string, unknown>
): { present: boolean; owned: number; names: string[] } {
  const ids = new Set<number>();
  const present =
    collectCompanionIds(bundle.companion, ids) ||
    collectCompanionIds(data.companion, ids) ||
    collectCompanionIds(data.companions, ids);
  const names = [...ids]
    .sort((a, b) => a - b)
    .map((id) => companionName(id));
  return { present, owned: ids.size, names };
}

function parseSushi(data: Record<string, unknown>): {
  slots: number;
  unique: number;
  upgradeLevels: number;
  fuel: number;
  sparks: number;
  bucks: number;
} {
  const sushi = toList(data.Sushi);
  let slots = 0;
  forIndexed(sushi[0], (_index, item) => {
    if (asNumber(item, -1) >= 0) slots += 1;
  });
  const uniqueTrack = toList(sushi[5]);
  let unique = 0;
  for (let index = 0; index <= 58; index += 1) {
    const value = uniqueTrack[index];
    const tracked = value === undefined || value === null ? -1 : asNumber(value, -1);
    if (tracked >= 0) unique = index + 1;
    else break;
  }
  const misc = asIndexedNumbers(sushi[4]);
  return {
    slots,
    unique,
    upgradeLevels: sumLevels(sushi[2]),
    fuel: misc[0] ?? 0,
    sparks: misc[2] ?? 0,
    bucks: misc[3] ?? 0
  };
}

function parseArmorSets(data: Record<string, unknown>): { unlocked: boolean; sets: number; days: number } {
  const raw = String(optRaw(data, 379) ?? '');
  const sets = raw
    .split(',')
    .slice(1)
    .map((name) => name.trim())
    .filter((name) => name && name !== '0');
  return {
    unlocked: optTruthy(data, 380) || sets.length > 0,
    sets: sets.length,
    days: optNumber(data, 381)
  };
}

function parseSummoning(data: Record<string, unknown>): { wins: number; upgrades: number } {
  const summon = toList(data.Summon);
  const wins = toList(summon[1]).filter((id) => typeof id === 'string' && id && id !== 'Blank').length;
  return {
    wins,
    upgrades: asIndexedNumbers(summon[0]).reduce((sum, level) => sum + Math.max(0, level), 0)
  };
}

function parseCaverns(data: Record<string, unknown>): {
  unlocked: number;
  villagers: number;
  schematics: number;
} {
  const holes = toList(data.Holes);
  const villagers = asIndexedNumbers(holes[1]);
  return {
    unlocked: villagers[0] ?? 0,
    villagers: villagers.reduce((sum, level) => sum + Math.max(0, level), 0),
    schematics: asIndexedNumbers(holes[13]).filter((value) => value > 0).length
  };
}

function parseCoral(data: Record<string, unknown>): number {
  return asIndexedNumbers(toList(data.Spelunk)[12]).filter((value) => value > 0).length;
}

const COG_BOARD_SIZE = 96;

function parseCogs(data: Record<string, unknown>): { placed: number; flags: number } {
  const order = toList(data.CogO ?? data.CogOrder).slice(0, COG_BOARD_SIZE);
  const placed = order.filter((name) => typeof name === 'string' && name && name !== 'Blank').length;
  const flags = asIndexedNumbers(data.FlagU ?? data.FlagUnlock).filter((value) => value === -11).length;
  return { placed, flags };
}

function sumLevels(value: unknown): number {
  return asIndexedNumbers(value).reduce((sum, level) => sum + Math.max(0, level), 0);
}

function parseCompass(data: Record<string, unknown>): {
  levels: number;
  abominations: number;
  medallions: number;
} {
  const compass = toList(data.Compass);
  return {
    levels: sumLevels(compass[0]),
    abominations: asIndexedNumbers(compass[1]).filter((value) => value > 0).length,
    medallions: toList(compass[3]).filter((id) => typeof id === 'string' && id && id !== 'Blank').length
  };
}

function parseResearch(data: Record<string, unknown>): {
  cells: number;
  occurrences: number;
  mineheadOpponents: number;
  mineheadUpgrades: number;
} {
  const research = toList(data.Research);
  return {
    cells: asIndexedNumbers(research[0]).filter((value) => value > 0).length,
    occurrences: asIndexedNumbers(research[2]).filter((value) => value > 0).length,
    mineheadOpponents: asIndexedNumbers(research[7])[4] ?? 0,
    mineheadUpgrades: sumLevels(research[8])
  };
}

function parseLegendTalents(data: Record<string, unknown>): number {
  return asIndexedNumbers(toList(data.Spelunk)[18]).filter((value) => value > 0).length;
}

function countPositive(record: Record<string, unknown>): number {
  return Object.entries(record).filter(([key, value]) => key !== 'length' && asNumber(value) > 0).length;
}

function highestWorld(characters: Character[]): number {
  let world = 1;
  for (const character of characters) {
    for (const gate of WORLD_SKILL_GATES) {
      if ((character.skills[gate.skill] ?? 0) > 0) {
        world = Math.max(world, gate.world);
      }
    }
    if (character.currentMap >= 50) world = Math.max(world, 2);
    if (character.currentMap >= 100) world = Math.max(world, 3);
    if (character.currentMap >= 150) world = Math.max(world, 4);
    if (character.currentMap >= 200) world = Math.max(world, 5);
    if (character.currentMap >= 250) world = Math.max(world, 6);
    if (character.currentMap >= 300) world = Math.max(world, 7);
  }
  return world;
}

function lastUpdatedMs(data: Record<string, unknown>): number | null {
  const timeAway = asRecord(data.TimeAway);
  const global = asNumber(timeAway.GlobalTime, 0);
  if (!global) return null;
  return global < 1e12 ? global * 1000 : global;
}

export function parseSave(bundle: RawSaveBundle): ParsedAccount {
  const data = Object.fromEntries(
    Object.entries(bundle.data).map(([key, value]) => [key, tryToParse(value)])
  );

  const slotIndexes = Object.keys(data)
    .filter((key) => /^Lv0_\d+$/.test(key))
    .map((key) => Number(key.slice('Lv0_'.length)))
    .sort((a, b) => a - b);

  const count = Math.max(slotIndexes.length, bundle.charNames.length);
  const names =
    bundle.charNames.length >= count ? bundle.charNames : namesFromCog(data, count);

  const characters = Array.from({ length: count }, (_, index) =>
    parseCharacter(data, index, names[index] || `Character${index + 1}`)
  ).filter((character) => character.combatLevel > 0 || character.classId > 0 || Boolean(names[character.index]));

  const stamps = parseStamps(data);
  const bubbles = parseBubbles(data);
  const vials = parseVials(data);
  const bribes = parseBribes(data);
  const statues = parseStatues(data, Math.max(count, characters.length));
  const forge = parseForge(data);
  const gemShop = asIndexedNumbers(data.GemItemsPurchased);
  const cards = asRecord(data.Cards0);
  const achievements = asIndexedNumbers(data.AchieveReg);
  const buildings = parseBuildings(data);
  const saltLick = namedLevels(SALT_LICK_UPGRADES, data.SaltLick);
  const prayers = namedLevels(PRAYER_NAMES, data.PrayOwned);
  const worshipTotems = parseWorship(data);
  const refinery = parseRefinery(data);
  const arcade = asIndexedNumbers(data.ArcadeUpg);
  const meals = parseMeals(data);
  const deathNote = parseDeathNote(data, Math.max(count, characters.length));
  const lab = parseLab(data);
  const sailing = parseSailing(data);
  const gaming = parseGaming(data);
  const atoms = namedLevels(
    ATOM_NAMES,
    data.Atoms,
    ATOM_NAMES.map(() => ATOM_LEVEL_CAP)
  );
  const shrines = parseShrines(data);
  const farming = parseFarming(data);
  const sneaking = parseSneaking(data);
  const summoning = parseSummoning(data);
  const caverns = parseCaverns(data);
  const cogs = parseCogs(data);
  const compass = parseCompass(data);
  const research = parseResearch(data);
  const companions = parseCompanions(bundle, data);
  const sushi = parseSushi(data);
  const armor = parseArmorSets(data);
  const updated = lastUpdatedMs(data);
  const isStale = updated != null ? Date.now() - updated >= 24 * 60 * 60 * 1000 : false;
  const world = highestWorld(characters);
  const ops = parseDashboardOps(data, bundle, characters, world);

  const account: ParsedAccount = {
    names: characters.map((c) => c.name),
    characters,
    highestWorld: world,
    lastUpdatedMs: updated,
    isStale,
    stamps,
    stampLevels: stamps.reduce((sum, stamp) => sum + stamp.level, 0),
    stampsCollected: stamps.filter((stamp) => stamp.level > 0).length,
    bubbles,
    bubbleLevels: bubbles.reduce((sum, bubble) => sum + bubble.level, 0),
    vials,
    vialLevels: vials.reduce((sum, level) => sum + level, 0),
    vialsUnlocked: vials.filter((level) => level > 0).length,
    bribes,
    bribesPurchased: bribes.filter((bribe) => bribe.status === 1).length,
    statues,
    statueLevels: statues.reduce((sum, statue) => sum + statue.level, 0),
    forge,
    gemShopPurchases: gemShop.filter((owned) => owned > 0).length,
    cardsFound: countPositive(cards),
    achievements: achievements.filter((value) => value > 0).length,
    postOfficeBoxesEarned: parsePostOfficeBoxes(data),
    buildings,
    buildingsUnlocked: buildings.filter((building) => building.level > 0).length,
    saltLick,
    prayers,
    prayersUnlocked: prayers.filter((prayer) => prayer.level > 0).length,
    worshipTotems,
    worshipPeakWave: Math.max(...worshipTotems.map((totem) => totem.level), 0),
    refinery,
    arcadeLevels: arcade.reduce((sum, level) => sum + Math.max(0, level), 0),
    arcadeUpgrades: arcade.filter((level) => level > 0).length,
    deathNote,
    mealsUnlocked: meals.filter((level) => level > 0).length,
    mealLevels: meals.reduce((sum, level) => sum + level, 0),
    kitchensOwned: parseKitchens(data),
    sigilsUnlocked: parseSigils(data),
    starSignsUnlocked: countPositive(asRecord(data.StarSg)),
    vaultLevels: asIndexedNumbers(data.UpgVault).reduce((sum, level) => sum + Math.max(0, level), 0),
    vaultUpgrades: asIndexedNumbers(data.UpgVault).filter((level) => level > 0).length,
    printerSamples: parsePrinterSamples(data),
    libraryBooks: optNumber(data, 55),
    atoms,
    atomsUnlocked: atoms.filter((atom) => atom.level > 0).length,
    breedingPets: parseBreedingPets(data),
    breedingArenaWave: optNumber(data, 89),
    breedingTerritory: optNumber(data, 85),
    labJewels: lab.jewels,
    labChips: lab.chips,
    riftLevel: firstNumber(data.Rift),
    sailingIslands: sailing.islands,
    sailingArtifacts: sailing.artifacts,
    sailingArtifactTiers: sailing.artifactTiers,
    sailingBoats: sailing.boats,
    sailingCaptains: sailing.captains,
    divinityGods: parseDivinityGods(data),
    gamingBits: gaming.bits,
    gamingSuperbits: gaming.superbits,
    slabItems: parseSlab(data),
    owlDiscovered: optTruthy(data, 265),
    owlMegaFeathers: optNumber(data, 262),
    owlRestarts: optNumber(data, 258),
    islandsUnlocked: parseIslands(data),
    islandTrash: optNumber(data, 161),
    killroyFights: optNumber(data, 112),
    obolsOwned: parseObols(data),
    equinoxDreams: parseEquinoxDreams(data),
    equinoxBonusLevels: asIndexedNumbers(data.Dream).reduce((sum, level) => sum + Math.max(0, level), 0),
    shrinesUnlocked: shrines.unlocked,
    shrineLevels: shrines.levels,
    farmCrops: farming.crops,
    farmPlots: farming.plots,
    farmMarketLevels: farming.marketLevels,
    farmLandRanks: farming.landRanks,
    farmExoticLevels: farming.exoticLevels,
    sneakingJadeUpgrades: sneaking.jadeUpgrades,
    sneakingNinjaLevels: sneaking.ninjaLevels,
    sneakingPristineCharms: sneaking.charms,
    summonWins: summoning.wins,
    summonUpgradeLevels: summoning.upgrades,
    summonEndless: optNumber(data, 319),
    cavernsUnlocked: caverns.unlocked,
    villagerLevels: caverns.villagers,
    cavernSchematics: caverns.schematics,
    coralUnlocked: parseCoral(data),
    cogsPlaced: cogs.placed,
    flagsComplete: cogs.flags,
    grimoireLevels: sumLevels(data.Grimoire),
    compassLevels: compass.levels,
    compassAbominations: compass.abominations,
    compassMedallions: compass.medallions,
    tesseractLevels: sumLevels(data.Arcane),
    researchCells: research.cells,
    researchOccurrences: research.occurrences,
    mineheadOpponents: research.mineheadOpponents,
    mineheadUpgrades: research.mineheadUpgrades,
    legendTalents: parseLegendTalents(data),
    companionDataPresent: companions.present,
    companionsOwned: companions.owned,
    companionNames: companions.names,
    tomeBluePages: optTruthy(data, 196),
    tomeRedPages: optTruthy(data, 197),
    tomeTrackedScore:
      stamps.filter((stamp) => stamp.level > 0).length +
      statues.filter((statue) => statue.level > 0).length +
      countPositive(cards) +
      achievements.filter((value) => value > 0).length +
      parsePostOfficeBoxes(data) +
      bubbles.filter((bubble) => bubble.level > 0).length +
      vials.filter((level) => level > 0).length +
      parseSlab(data) +
      farming.crops +
      sailing.artifacts +
      arcade.filter((level) => level > 0).length,
    sushiSlots: sushi.slots,
    sushiUnique: sushi.unique,
    sushiUpgradeLevels: sushi.upgradeLevels,
    sushiFuel: sushi.fuel,
    sushiSparks: sushi.sparks,
    sushiBucks: sushi.bucks,
    buttonPresses: optNumber(data, 594),
    buttonInstaSkips: optNumber(data, 595),
    cropDepotScientist: sneaking.cropDepotScientist,
    cropDepotScience: sneaking.cropDepotScience,
    magicBeanTrade: optNumber(data, 221),
    emperorShowdown: optNumber(data, 369),
    armorSmithyUnlocked: armor.unlocked,
    armorSetsUnlocked: armor.sets,
    armorSmithyDays: armor.days,
    ops,
    characterOps: [] as CharacterOps[],
    source: bundle.source,
    raw: data
  };
  account.characterOps = parseCharacterOps(data, account);
  return account;
}
