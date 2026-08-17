import { asArray, asNumber, asRecord, tryToParse } from './helpers';
import type { BubbleColor, Character, ParsedAccount, StampCategory, StampSummary } from './types';
import type { RawSaveBundle } from '../idleon/loadSave';

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
  const levels = asArray<unknown>(data[`Lv0_${index}`]).map((v) => asNumber(v));
  const skills: Record<string, number> = {};
  SKILL_NAMES.forEach((skill, skillIndex) => {
    skills[skill] = levels[skillIndex] ?? 0;
  });
  const classId = asNumber(data[`CharacterClass_${index}`]);
  const statsArr = asArray<unknown>(data[`PVStatList_${index}`]).map((v) => asNumber(v));
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
    }
  };
}

function parseStamps(data: Record<string, unknown>): StampSummary[] {
  const levels = asArray<unknown>(data.StampLv ?? data.StampLevel).map((row) => asArray<unknown>(row).map((v) => asNumber(v)));
  const maxLevels = asArray<unknown>(data.StampLvM ?? data.StampLevelMAX).map((row) =>
    asArray<unknown>(row).map((v) => asNumber(v))
  );
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
  const bubbles: ParsedAccount['bubbles'] = [];
  BUBBLE_COLORS.forEach((color, colorIndex) => {
    const row = asArray<unknown>(cauldron[colorIndex]).map((v) => asNumber(v));
    row.forEach((level, index) => {
      bubbles.push({ color, index, level });
    });
  });
  return bubbles;
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
  const updated = lastUpdatedMs(data);
  const isStale = updated != null ? Date.now() - updated >= 24 * 60 * 60 * 1000 : false;

  return {
    names: characters.map((c) => c.name),
    characters,
    highestWorld: highestWorld(characters),
    lastUpdatedMs: updated,
    isStale,
    stamps,
    stampLevels: stamps.reduce((sum, stamp) => sum + stamp.level, 0),
    stampsCollected: stamps.filter((stamp) => stamp.level > 0).length,
    bubbles,
    bubbleLevels: bubbles.reduce((sum, bubble) => sum + bubble.level, 0),
    source: bundle.source,
    raw: data
  };
}
