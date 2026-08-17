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
