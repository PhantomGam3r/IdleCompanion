export const BRIBE_SETS: { world: string; names: string[] }[] = [
  { world: 'W1', names: ['Insider Trading', 'Tracking Chips', 'Mandatory Fire Sale', 'Sleeping On the Job', 'Artificial Demand', 'The Art of the Deal'] },
  { world: 'W2', names: ['Overstock Regulations', 'Double EXP Scheme', 'Tagged Indicators', 'Fossil Fuel Legislation', 'Five Aces in the Deck', 'Fake Teleport Tickets', 'The Art of the Steal'] },
  { world: 'W3', names: ['Counterfeit Telepassports', 'Weighted Marbles', 'Changing the Code', 'Taxidermied Cog Pouches', 'Guild VIP Fraud', 'Library Double Agent', 'The Art of the Fail'] },
  { world: 'W4', names: ['Photoshopped Dmg Range', 'Glitched Acc Formula', 'Firewalled Defence', 'Bottomless Bags', 'AFKeylogging', 'Guild GP Hack'] },
  { world: 'Trash Island', names: ['The Art of the Bail', 'Random Garbage', 'Godlier Creation', 'Fishermaster', 'Muscles on Muscles', 'Bottle Service', 'Star Scraper'] },
  { world: 'W6', names: ['The Art of the Grail', 'Artifact Pilfering', 'Forge Cap Smuggling', 'Gold from Lead', 'Nugget Fabrication', 'Divine PTS Miscounting', 'Loot Table Tampering', 'The Art of the Flail'] }
];

export const STATUE_NAMES = [
  'Power',
  'Speed',
  'Mining',
  'Feasty',
  'Health',
  'Kachow',
  'Lumberbob',
  'Thicc Skin',
  'Oceanman',
  'Ol Reliable',
  'Exp',
  'Anvil',
  'Cauldron',
  'Beholder',
  'Bullseye',
  'Box',
  'Twosoul',
  'Ehexpee',
  'Seesaw',
  'Pecunia',
  'Mutton',
  'Egg',
  'Battleaxe',
  'Spiral',
  'Boat',
  'Compost',
  'Stealth',
  'Essence',
  'Villager',
  'Dragon',
  'Spelunky',
  'Coral'
];

export const STATUE_TYPES = ['Normal', 'Gold', 'Onyx', 'Zenith'] as const;

export const FORGE_UPGRADES = [
  { name: 'New Forge Slot', max: 16 },
  { name: 'Ore Capacity Boost', max: 50 },
  { name: 'Forge Speed', max: 90 },
  { name: 'Forge EXP Gain', max: 85 },
  { name: 'Bar Bonanza', max: 75 },
  { name: 'Puff Puff Go', max: 60 }
];

export const POST_OFFICE_BOXES = [
  'Civil War Memory Box',
  'Locally Sourced Organs',
  'Magician Starterpack',
  'Box of Unwanted Stats',
  'Dwarven Supplies',
  'Blacksmith Box',
  'Taped Up Timber',
  'Carepack From Mum',
  'Sealed Fishheads',
  'Potion Package',
  'Bug Hunting Supplies',
  'Non Predatory Loot Box',
  'Deaths Storage Unit',
  'Utilitarian Capsule',
  'Lazzzy Lootcrate',
  'Science Spare Parts',
  'Trapping Lockbox',
  'Construction Container',
  'Crate of the Creator',
  'Chefs Essentials',
  'Myriad Crate',
  'Box of Gosh',
  'Gaming Lootcrate'
];

export const CONSTRUCTION_BUILDINGS: { name: string; max: number; type: 'Utility' | 'Tower' | 'Shrine' }[] = [
  { name: '3D Printer', max: 10, type: 'Utility' },
  { name: 'Talent Book Library', max: 101, type: 'Utility' },
  { name: 'Death Note', max: 51, type: 'Utility' },
  { name: 'Salt Lick', max: 10, type: 'Utility' },
  { name: 'Chest Space', max: 25, type: 'Utility' },
  { name: 'Cost Cruncher', max: 60, type: 'Utility' },
  { name: 'Trapper Drone', max: 15, type: 'Utility' },
  { name: 'Automation Arm', max: 5, type: 'Utility' },
  { name: 'Atom Collider', max: 200, type: 'Utility' },
  { name: 'Pulse Mage', max: 50, type: 'Tower' },
  { name: 'Fireball Lobber', max: 50, type: 'Tower' },
  { name: 'Boulder Roller', max: 50, type: 'Tower' },
  { name: 'Frozone Malone', max: 50, type: 'Tower' },
  { name: 'Stormcaller', max: 50, type: 'Tower' },
  { name: 'Party Starter', max: 50, type: 'Tower' },
  { name: 'Kraken Cosplayer', max: 50, type: 'Tower' },
  { name: 'Poisonic Elder', max: 50, type: 'Tower' },
  { name: 'Voidinator', max: 50, type: 'Tower' },
  { name: 'Woodular Shrine', max: 100, type: 'Shrine' },
  { name: 'Isaccian Shrine', max: 100, type: 'Shrine' },
  { name: 'Crystal Shrine', max: 100, type: 'Shrine' },
  { name: 'Pantheon Shrine', max: 100, type: 'Shrine' },
  { name: 'Clover Shrine', max: 100, type: 'Shrine' },
  { name: 'Summereading Shrine', max: 100, type: 'Shrine' },
  { name: 'Crescent Shrine', max: 100, type: 'Shrine' },
  { name: 'Undead Shrine', max: 100, type: 'Shrine' },
  { name: 'Primordial Shrine', max: 100, type: 'Shrine' }
];

export const SALT_LICK_UPGRADES = [
  'Printer Sample Size',
  'Obol Storage',
  'Refinery Speed',
  'EXP',
  'Max Book',
  'Alchemy Liquids',
  'TD Points',
  'Movespeed',
  'Multikill',
  'Damage',
  'Cooking Mastery'
];

export const PRAYER_NAMES = [
  'Big Brain Time',
  'Skilled Dimwit',
  'Unending Energy',
  'Shiny Snitch',
  'Zerg Rushogen',
  'Tachion of the Titans',
  'Balance of Precision',
  'Midas Minded',
  'Jawbreaker',
  'The Royal Sampler',
  'Antifun Spirit',
  'Circular Criticals',
  'Ruck Sack',
  'Fibers of Absence',
  'Vacuous Tissue',
  'Beefy For Real',
  'Balance of Pain',
  'Balance of Proficiency',
  'Glitterbug'
];

export const WORSHIP_TOTEMS = [
  'Goblin Gorefest',
  'Wakawaka War',
  'Acorn Assault',
  'Frosty Firefight',
  'Clash of Cans',
  'Citric Conflict',
  'Breezy Battle'
];

export const REFINERY_SALTS: { name: string; index: number }[] = [
  { name: 'Redox', index: 3 },
  { name: 'Explosive', index: 4 },
  { name: 'Spontaneity', index: 5 },
  { name: 'Dioxide', index: 6 },
  { name: 'Purple', index: 7 },
  { name: 'Nullo', index: 8 }
];

export const DEATH_NOTE_SKULLS = [
  { name: 'None', kills: 0 },
  { name: 'Normal Skull', kills: 25_000 },
  { name: 'Copper Skull', kills: 100_000 },
  { name: 'Iron Skull', kills: 250_000 },
  { name: 'Gold Skull', kills: 500_000 },
  { name: 'Platinum Skull', kills: 1_000_000 },
  { name: 'Dementia Skull', kills: 5_000_000 },
  { name: 'Lava Skull', kills: 100_000_000 },
  { name: 'Eclipse Skull', kills: 1_000_000_000 }
];

export const ATOM_NAMES = [
  'Hydrogen',
  'Helium',
  'Lithium',
  'Beryllium',
  'Boron',
  'Carbon',
  'Nitrogen',
  'Oxygen',
  'Fluoride',
  'Neon',
  'Sodium',
  'Magnesium',
  'Aluminium'
];
