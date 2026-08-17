import { SKILL_NAMES } from '../../core/parse/parseSave';
import { ATOM_NAMES } from '../../core/parse/catalogs';

const CDN = 'https://idleontoolbox.com';

/** Build a full PNG URL from an Idleon Toolbox asset path (with or without folder prefix). */
export function gameIconUrl(path: string): string {
  const normalized =
    path.startsWith('data/') || path.startsWith('etc/') || path.startsWith('afk_targets/')
      ? path
      : `data/${path}`;
  return `${CDN}/${normalized}.png`;
}

/** AutoReview group id → Idleon Toolbox icon path. */
export const ADVICE_GROUP_ICONS: Record<string, string> = {
  pinchy: 'etc/TasksStar',
  general: 'data/ClassIcons1',
  'combat-levels': 'data/ClassIcons41',
  stamps: 'data/StampA34',
  forge: 'data/ForgeD',
  bribes: 'data/BribeW',
  alchemy: 'data/aStirringStick0',
  bubbles: 'data/aBrewOptionA0',
  vials: 'data/aVials1',
  sigils: 'data/LabBonus12',
  arcade: 'data/PachiBall1',
  islands: 'data/Island1',
  killroy: 'etc/Killroy_Skull',
  'gem-shop': 'data/PremiumGem',
  buildings: 'data/ConTower7',
  printer: 'data/ConTower0',
  refinery: 'data/TaskSc6',
  atoms: 'data/ConTower8',
  'death-note': 'data/ConTower2',
  'worship-totems': 'data/ClassIcons50',
  prayers: 'data/PrayerSel',
  'salt-lick': 'data/ConTower3',
  cards: 'data/2CardsA0',
  statues: 'data/EquipmentStatues29',
  achievements: 'data/TaskAchBorder1',
  meals: 'data/ClassIcons51',
  'breeding-pets': 'data/ClassIcons52',
  lab: 'data/ClassIcons53',
  rift: 'data/Mface75',
  tome: 'etc/Tome_0',
  'sailing-loot': 'data/ClassIcons54',
  'divinity-gods': 'data/ClassIcons55',
  'gaming-bits': 'data/ClassIcons56',
  slab: 'etc/Slab',
  vault: 'data/VaultBut',
  'star-signs': 'data/StarTitle1',
  'farming-crops': 'data/ClassIcons57',
  'sneaking-jade': 'data/ClassIcons58',
  'summoning-wins': 'data/ClassIcons59',
  caverns: 'data/Quest90',
  'coral-reef': 'data/ReefA1',
  obols: 'data/Island1',
  shrines: 'data/ClassIcons49',
  owl: 'etc/Owl',
  equinox: 'data/Quest78',
  cogs: 'data/ClassIcons49',
  grimoire: 'data/GrimoireUpg18',
  compass: 'data/UISkillIcon421',
  tesseract: 'data/StatusArc0',
  research: 'data/ClassIcons61',
  minehead: 'data/MineHead0',
  'legend-talents': 'etc/Whallamus',
  companions: 'data/TournyRank2',
  sushi: 'data/Sushi6',
  button: 'etc/ButtonG',
  'crop-depot': 'data/FarmCrop0',
  emperor: 'data/Boss6',
  'armor-sets': 'etc/Armor_Set_Smithy',
  'post-office': 'data/DeliveryBox'
};

export const WORLD_ICONS: Record<string, string> = {
  Pinchy: 'etc/TasksStar',
  General: 'data/ClassIcons1',
  'World 1': 'data/BadgeG2',
  'World 2': 'data/BadgeD2',
  'World 3': 'data/BadgeI2',
  'World 4': 'data/Ladle',
  'World 5': 'data/GemP24',
  'World 6': 'etc/sneaking-temp',
  'World 7': 'etc/Spelunking'
};

export function adviceGroupIcon(groupId: string): string | undefined {
  return ADVICE_GROUP_ICONS[groupId];
}

/** Skill name → ClassIcons asset (Combat = 41, Mining = 42, …). */
export function skillIconPath(skill: string): string {
  const index = SKILL_NAMES.indexOf(skill as (typeof SKILL_NAMES)[number]);
  if (index < 0) return 'data/ClassIconsNA2';
  return `data/ClassIcons${index + 41}`;
}

export function atomIconPath(atomName: string): string {
  const index = ATOM_NAMES.indexOf(atomName);
  if (index < 0) return 'data/ConTower8';
  return `data/Atom${index}`;
}
