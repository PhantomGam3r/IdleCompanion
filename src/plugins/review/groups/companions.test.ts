import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../../core/idleon/loadSave';
import { parseSave } from '../../../core/parse/parseSave';
import { companionsAdvice } from './companions';
import { sushiAdvice } from './sushi';
import { buttonAdvice } from './button';
import { cropDepotAdvice } from './cropDepot';

function spelunkLevels(): number[] {
  return Array.from({ length: 20 }, (_, index) => (index === 0 ? 40 : index === 19 ? 12 : 0));
}

describe('companion / sushi / button / depot advice', () => {
  it('reads companion.l ids and flags missing notable pets', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        companion: { l: ['4,1', '7,0'] },
        data: {
          CharacterClass_0: 1,
          Lv0_0: [20]
        }
      })
    );
    expect(account.companionDataPresent).toBe(true);
    expect(account.companionsOwned).toBe(2);
    expect(account.companionNames).toEqual(['Sheepie', 'Slime']);
    const group = companionsAdvice.evaluate(account);
    expect(group?.items.some((item) => item.detail.includes('King Doot'))).toBe(true);
  });

  it('counts sushi slots and unique types from Sushi[]', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: spelunkLevels(),
          CurrentMap_0: 310,
          Sushi: Object.assign([], {
            0: [0, 0, 1, -1],
            2: [1, 0],
            4: [12, 0, 3, 40],
            5: [0, 1, -1]
          })
        }
      })
    );
    expect(account.sushiSlots).toBe(3);
    expect(account.sushiUnique).toBe(2);
    const group = sushiAdvice.evaluate(account);
    expect(group?.items.some((item) => item.title.includes('3 sushi slots owned'))).toBe(true);
  });

  it('reads button presses from OptLacc 594', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: spelunkLevels(),
          CurrentMap_0: 310,
          OptLacc: Object.assign([], { 594: 4, 595: 1 })
        }
      })
    );
    expect(account.buttonPresses).toBe(4);
    const group = buttonAdvice.evaluate(account);
    expect(group?.items.some((item) => item.title.includes('4 button presses'))).toBe(true);
  });

  it('flags a missing Crop Depot Scientist jade upgrade', () => {
    const levels = Array.from({ length: 17 }, (_, index) => (index === 16 ? 20 : 0));
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: levels,
          CurrentMap_0: 260,
          FarmCrop: { 0: 4, 1: 2, 2: 1 },
          Ninja: Object.assign([], { 102: [0, 0, 0, 0, 0, 0, 0, 0, 0, 'ab'] })
        }
      })
    );
    expect(account.cropDepotScientist).toBe(false);
    expect(account.farmCrops).toBe(3);
    const group = cropDepotAdvice.evaluate(account);
    expect(group?.items.some((item) => item.title.includes('Crop Depot Scientist locked'))).toBe(true);
  });
});
