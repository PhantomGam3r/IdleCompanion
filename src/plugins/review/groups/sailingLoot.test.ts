import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../../core/idleon/loadSave';
import { parseSave } from '../../../core/parse/parseSave';
import { sailingLootAdvice } from './sailingLoot';

describe('sailing loot advice', () => {
  it('flags boats that have no captains', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20],
          CurrentMap_0: 210,
          Sailing: [[-1], [], [0, 3], [1]]
        }
      })
    );
    expect(account.sailingBoats).toBe(4);
    expect(account.sailingCaptains).toBe(1);
    const group = sailingLootAdvice.evaluate(account);
    expect(group?.items.some((item) => item.title.includes('More boats than captains'))).toBe(true);
  });
});
