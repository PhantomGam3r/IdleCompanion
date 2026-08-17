import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../../core/idleon/loadSave';
import { parseSave } from '../../../core/parse/parseSave';
import { islandsAdvice } from './islands';
import { farmingCropsAdvice } from './farmingCrops';

describe('islands advice', () => {
  it('counts island codes from OptLacc 169', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [20],
          CurrentMap_0: 55,
          OptLacc: Object.assign([], { 169: '_dc' })
        }
      })
    );
    expect(account.islandsUnlocked).toBe(3);
    const group = islandsAdvice.evaluate(account);
    expect(group?.items.some((item) => item.title.includes('3 / 6 islands'))).toBe(true);
  });
});

describe('farming advice', () => {
  it('flags too few land plots', () => {
    const levels = Array.from({ length: 17 }, (_, index) => (index === 16 ? 12 : 0));
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: levels,
          CurrentMap_0: 260,
          FarmUpg: [0, 0, 1],
          FarmCrop: { 0: 4, 1: 2 }
        }
      })
    );
    expect(account.farmPlots).toBe(2);
    expect(account.farmCrops).toBe(2);
    const group = farmingCropsAdvice.evaluate(account);
    expect(group?.items.some((item) => item.title.includes('Buy more land plots'))).toBe(true);
  });
});
