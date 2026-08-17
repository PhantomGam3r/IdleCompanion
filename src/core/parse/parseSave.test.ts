import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../idleon/loadSave';
import { classNameFromId, parseSave } from './parseSave';

const fixture = {
  charNames: ['Testor'],
  data: {
    OptLacc: [],
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
    CauldronP2W: [[], [], [], [], [12, 2, 0, 0, 3, 1]]
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
});
