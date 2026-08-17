export type SkillLevels = Record<string, number>;

export type Character = {
  index: number;
  name: string;
  className: string;
  classId: number;
  combatLevel: number;
  currentMap: number;
  skills: SkillLevels;
  stats: { str: number; agi: number; wis: number; luk: number };
  postOfficeInvested: number;
  postOfficeBoxes: { name: string; level: number }[];
};

export type StampCategory = 'combat' | 'skills' | 'misc';

export type StampSummary = {
  category: StampCategory;
  index: number;
  level: number;
  maxLevel: number;
  delivered: boolean;
};

export type BubbleColor = 'orange' | 'green' | 'purple' | 'yellow';

export type BubbleSummary = {
  color: BubbleColor;
  index: number;
  level: number;
};

export type BribeStatus = -1 | 0 | 1;

export type BribeSummary = {
  set: string;
  name: string;
  status: BribeStatus;
};

export type StatueSummary = {
  index: number;
  name: string;
  level: number;
  type: string;
};

export type ForgeSummary = {
  name: string;
  purchased: number;
  max: number;
};

export type NamedLevel = {
  name: string;
  level: number;
  max?: number;
  extra?: string;
};

export type DeathNoteSummary = {
  mapsWithKills: number;
  goldSkulls: number;
  lavaSkulls: number;
  lowestSkull: string;
  lowestByWorld: { world: number; skull: string; maps: number }[];
};

export type ParsedAccount = {
  names: string[];
  characters: Character[];
  highestWorld: number;
  lastUpdatedMs: number | null;
  isStale: boolean;
  stamps: StampSummary[];
  stampLevels: number;
  stampsCollected: number;
  bubbles: BubbleSummary[];
  bubbleLevels: number;
  vials: number[];
  vialLevels: number;
  vialsUnlocked: number;
  bribes: BribeSummary[];
  bribesPurchased: number;
  statues: StatueSummary[];
  statueLevels: number;
  forge: ForgeSummary[];
  gemShopPurchases: number;
  cardsFound: number;
  achievements: number;
  postOfficeBoxesEarned: number;
  buildings: NamedLevel[];
  buildingsUnlocked: number;
  saltLick: NamedLevel[];
  prayers: NamedLevel[];
  prayersUnlocked: number;
  worshipTotems: NamedLevel[];
  worshipPeakWave: number;
  refinery: NamedLevel[];
  arcadeLevels: number;
  arcadeUpgrades: number;
  deathNote: DeathNoteSummary;
  mealsUnlocked: number;
  mealLevels: number;
  kitchensOwned: number;
  sigilsUnlocked: number;
  starSignsUnlocked: number;
  vaultLevels: number;
  vaultUpgrades: number;
  printerSamples: number;
  libraryBooks: number;
  atoms: NamedLevel[];
  atomsUnlocked: number;
  breedingPets: number;
  breedingArenaWave: number;
  breedingTerritory: number;
  labJewels: number;
  labChips: number;
  riftLevel: number;
  sailingIslands: number;
  sailingArtifacts: number;
  sailingArtifactTiers: number;
  sailingBoats: number;
  sailingCaptains: number;
  divinityGods: number;
  gamingBits: number;
  gamingSuperbits: number;
  slabItems: number;
  owlDiscovered: boolean;
  owlMegaFeathers: number;
  owlRestarts: number;
  islandsUnlocked: number;
  islandTrash: number;
  killroyFights: number;
  obolsOwned: number;
  equinoxDreams: number;
  equinoxBonusLevels: number;
  shrinesUnlocked: number;
  shrineLevels: number;
  farmCrops: number;
  farmPlots: number;
  farmMarketLevels: number;
  farmLandRanks: number;
  sneakingJadeUpgrades: number;
  sneakingNinjaLevels: number;
  sneakingPristineCharms: number;
  summonWins: number;
  summonUpgradeLevels: number;
  summonEndless: number;
  cavernsUnlocked: number;
  villagerLevels: number;
  cavernSchematics: number;
  coralUnlocked: number;
  guildName?: string;
  source: 'cloud' | 'json';
  raw: Record<string, unknown>;
};

export type AdviceSeverity = 'info' | 'warning' | 'good';

export type AdviceItem = {
  title: string;
  detail: string;
  severity: AdviceSeverity;
  current?: string;
  goal?: string;
};

export type AdviceGroup = {
  id: string;
  world: string;
  title: string;
  summary: string;
  items: AdviceItem[];
};
