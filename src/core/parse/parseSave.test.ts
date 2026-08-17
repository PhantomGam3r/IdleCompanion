import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../idleon/loadSave';
import { classNameFromId, parseSave } from './parseSave';

const fixture = {
  charNames: ['Testor'],
  data: {
    TimeAway: { GlobalTime: 1_700_000_000 },
    CharacterClass_0: 8,
    CurrentMap_0: 12,
    PVStatList_0: [20, 10, 5, 3],
    Lv0_0: [42, 30, 12, 18, 8, 15, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    StampLv: [
      [10, 8, 0],
      [5, 0],
      [1]
    ],
    StampLvM: [
      [20, 8, 0],
      [15, 0],
      [1]
    ],
    CauldronInfo: [[12, 8, 0], [4], [1, 0], [20], { 0: 3, 1: 0, 2: 6 }],
    BribeStatus: [1, 1, 0, -1, 1, 1],
    StatueLevels_0: [[12, 1], [4, 0], [0, 0]],
    Cards0: { Card1: 12, Card2: 0, MushCard: 3 },
    AchieveReg: [1, 0, 1, 1],
    GemItemsPurchased: [0, 2, 0, 1],
    ForgeLV: [3, 10, 5, 0, 2, 1],
    POu_0: [20, 0, 0, 5],
    CYDeliveryBoxComplete: 80,
    CYDeliveryBoxStreak: 10,
    CYDeliveryBoxMisc: 10,
    Tower: [4, 10, 1, 0, 2],
    SaltLick: [3, 1, 0],
    PrayOwned: [4, 0, 0, 0, 2],
    TotemInfo: [[12, 0, 3]],
    Refinery: [[], [], [], [0, 5, 0, 1], [0, 2, 0, 0]],
    ArcadeUpg: [4, 0, 2],
    KLA_0: [0, 25000, 120000, 0, 600000],
    Meals: [[0, 11, 4, 0]],
    Cooking: [[2], [2], [0]],
    CauldronP2W: [[], [], [], [], [12, 2, 0, 0, 3, 1]],
    StarSg: { The_Buff_Guy: 1, Flexo_Bendo: '1', Locked: 0 },
    UpgVault: [3, 0, 5],
    Print: [0, 0, 0, 0, 0, 'Copper', 10, 'Iron', 4, 'Blank', 0],
    Atoms: [1, 0, 2],
    OptLacc: Object.assign([], {
      55: 22,
      85: 4,
      89: 12,
      112: 20,
      161: 50,
      162: 10,
      169: '_dcabe',
      196: 1,
      197: 1,
      221: 80,
      258: 2,
      262: 5,
      265: 1,
      319: 4,
      369: 12,
      379: ',W1_SET,W2_SET',
      380: 1,
      381: 40,
      594: 18,
      595: 2
    }),
    Breeding: [[], [3, 2, 1]],
    Lab: Array.from({ length: 16 }, (_, index) => (index === 14 ? [1, 0, 1] : index === 15 ? [2, 0] : [])),
    Rift: [7],
    Sailing: [[-1, -1, 0], [], [2, 1], [1, 2, 0, 1]],
    Divinity: Array.from({ length: 26 }, (_, index) => (index === 25 ? 4 : 0)),
    Gaming: [1500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 'AB1'],
    Cards1: ['Copper', 'Iron', 'Blank'],
    ObolEqO1: ['ObolBronze0', 'Blank', 'ObolSilver0'],
    WeeklyBoss: { d_0: -1, d_1: -1, d_2: 0 },
    Dream: [0, 3, 2],
    Shrine: [
      [0, 0, 0, 5, 10, 0],
      [0, 0, 0, 0, 0, 0],
      [1, 0, 0, 3, 2, 0]
    ],
    FarmUpg: Object.assign([0, 12, 3, 1], { 20: 2, 21: 1 }),
    FarmCrop: { 0: 10, 1: 0, 4: 3 },
    FarmRank: [[2, 1, 0], 0, [1]],
    Ninja: Object.assign([], {
      102: [0, 500, 0, 0, 0, 0, 0, 0, 0, 'abwxyz'],
      103: [3, 2, 1],
      107: [1, 0, 1]
    }),
    Summon: [[2, 0, 4], ['Pet1', 'Pet2'], [10, 0, 5]],
    Holes: Object.assign([], { 1: [5, 2, 1], 7: [1, 1, 0], 13: [1, 1, 1, 0] }),
    Spelunk: Object.assign([], { 12: [1, 1, 0], 13: [2, 1, 0], 18: [2, 0, 1] }),
    CogO: Array.from({ length: 96 }, (_, index) =>
      index === 0 ? 'Player_Testor' : index < 12 ? 'Cog1A0' : 'Blank'
    ),
    FlagU: [-11, -11, 50],
    Grimoire: [3, 0, 2, 1],
    Compass: [[2, 0, 4], [1, 0, 1], [], ['mushG', 'frogG']],
    Arcane: [1, 0, 3],
    Research: Object.assign([], {
      0: [1, 0, 2],
      2: [1, 1, 0],
      7: [0, 0, 0, 0, 8],
      8: [2, 0, 1]
    }),
    companion: { l: ['0,1', '1,0', '4,1'] },
    Sushi: Object.assign([], {
      0: [0, 1, 2, -1],
      2: [3, 0, 2],
      4: [40, 0, 8, 250],
      5: [1, 0, 2, -1]
    })
  }
};

describe('parseSave', () => {
  it('reads character name, class, combat level, stamps, and bubbles', () => {
    const bundle = fromImportedJson(fixture);
    const account = parseSave(bundle);
    expect(account.names).toEqual(['Testor']);
    expect(account.characters).toHaveLength(1);
    expect(account.characters[0]?.className).toBe(classNameFromId(8));
    expect(account.characters[0]?.className).toBe('Barbarian');
    expect(account.characters[0]?.combatLevel).toBe(42);
    expect(account.characters[0]?.skills.Alchemy).toBe(15);
    expect(account.highestWorld).toBe(2);
    expect(account.stampsCollected).toBe(4);
    expect(account.stampLevels).toBe(24);
    expect(account.bubbleLevels).toBe(45);
    expect(account.vialsUnlocked).toBe(2);
    expect(account.vialLevels).toBe(9);
    expect(account.bribesPurchased).toBe(4);
    expect(account.statues[0]?.level).toBe(12);
    expect(account.statues[0]?.type).toBe('Gold');
    expect(account.cardsFound).toBe(2);
    expect(account.achievements).toBe(3);
    expect(account.gemShopPurchases).toBe(2);
    expect(account.forge[0]?.purchased).toBe(3);
    expect(account.postOfficeBoxesEarned).toBe(100);
    expect(account.characters[0]?.postOfficeInvested).toBe(25);
    expect(account.buildingsUnlocked).toBe(4);
    expect(account.buildings.find((row) => row.name === 'Death Note')?.level).toBe(1);
    expect(account.saltLick[0]?.level).toBe(3);
    expect(account.prayersUnlocked).toBe(2);
    expect(account.worshipPeakWave).toBe(12);
    expect(account.refinery[0]?.level).toBe(5);
    expect(account.arcadeUpgrades).toBe(2);
    expect(account.deathNote.mapsWithKills).toBe(3);
    expect(account.deathNote.goldSkulls).toBe(1);
    expect(account.mealsUnlocked).toBe(2);
    expect(account.kitchensOwned).toBe(2);
    expect(account.sigilsUnlocked).toBe(2);
    expect(account.starSignsUnlocked).toBe(2);
    expect(account.vaultLevels).toBe(8);
    expect(account.printerSamples).toBe(2);
    expect(account.libraryBooks).toBe(22);
    expect(account.atomsUnlocked).toBe(2);
    expect(account.breedingPets).toBe(6);
    expect(account.breedingArenaWave).toBe(12);
    expect(account.labJewels).toBe(2);
    expect(account.riftLevel).toBe(7);
    expect(account.sailingIslands).toBe(2);
    expect(account.sailingArtifacts).toBe(3);
    expect(account.sailingBoats).toBe(2);
    expect(account.divinityGods).toBe(4);
    expect(account.gamingSuperbits).toBe(3);
    expect(account.slabItems).toBe(2);
    expect(account.owlDiscovered).toBe(true);
    expect(account.owlMegaFeathers).toBe(5);
    expect(account.islandsUnlocked).toBe(6);
    expect(account.killroyFights).toBe(20);
    expect(account.obolsOwned).toBe(2);
    expect(account.equinoxDreams).toBe(2);
    expect(account.equinoxBonusLevels).toBe(5);
    expect(account.shrinesUnlocked).toBe(2);
    expect(account.farmCrops).toBe(3);
    expect(account.farmPlots).toBe(4);
    expect(account.sneakingJadeUpgrades).toBe(6);
    expect(account.summonWins).toBe(2);
    expect(account.summonEndless).toBe(4);
    expect(account.cavernsUnlocked).toBe(5);
    expect(account.coralUnlocked).toBe(2);
    expect(account.cogsPlaced).toBe(12);
    expect(account.flagsComplete).toBe(2);
    expect(account.grimoireLevels).toBe(6);
    expect(account.compassLevels).toBe(6);
    expect(account.compassAbominations).toBe(2);
    expect(account.tesseractLevels).toBe(4);
    expect(account.farmExoticLevels).toBe(3);
    expect(account.researchCells).toBe(2);
    expect(account.mineheadOpponents).toBe(8);
    expect(account.legendTalents).toBe(2);
    expect(account.companionsOwned).toBe(3);
    expect(account.companionNames).toEqual(['King Doot', 'Rift Slug', 'Sheepie']);
    expect(account.tomeBluePages).toBe(true);
    expect(account.tomeRedPages).toBe(true);
    expect(account.tomeTrackedScore).toBeGreaterThan(0);
    expect(account.sushiSlots).toBe(3);
    expect(account.sushiUnique).toBe(3);
    expect(account.sushiBucks).toBe(250);
    expect(account.buttonPresses).toBe(18);
    expect(account.buttonInstaSkips).toBe(2);
    expect(account.cropDepotScientist).toBe(true);
    expect(account.cropDepotScience).toBeGreaterThanOrEqual(1);
    expect(account.magicBeanTrade).toBe(80);
    expect(account.emperorShowdown).toBe(12);
    expect(account.armorSetsUnlocked).toBe(2);
    expect(account.source).toBe('json');
  });

  it('reads stamp and bubble maps stored as objects', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Obj'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: { 0: 10, length: 1 },
          StampLv: { 0: { 0: 7, 1: 2, length: 2 }, 1: { 0: 1, length: 1 }, 2: { length: 0 } },
          CauldronInfo: [{ 0: 9, 1: 4, length: 2 }, { 0: 1, length: 1 }, {}, {}, { 0: 2, 3: 5 }]
        }
      })
    );
    expect(account.characters[0]?.combatLevel).toBe(10);
    expect(account.stampLevels).toBe(10);
    expect(account.bubbleLevels).toBe(14);
    expect(account.vialLevels).toBe(7);
  });

  it('rounds post office box totals off float save values', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [20],
          CYDeliveryBoxComplete: 17804.600000000006,
          CYDeliveryBoxStreak: 0,
          CYDeliveryBoxMisc: 0
        }
      })
    );
    expect(account.postOfficeBoxesEarned).toBe(17805);
  });
});
