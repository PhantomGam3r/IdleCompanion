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
    CauldronInfo: [[12, 8, 0], [4], [1, 0], [20]]
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
    expect(account.source).toBe('json');
  });
});
