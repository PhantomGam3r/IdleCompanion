import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../../core/idleon/loadSave';
import { parseSave } from '../../../core/parse/parseSave';
import { postOfficeAdvice } from './postOffice';

function characterSlot(index: number, poLevels: number[]) {
  return {
    [`CharacterClass_${index}`]: 1,
    [`Lv0_${index}`]: [20, 0, 0, 0, 0, 10],
    [`CurrentMap_${index}`]: 60,
    [`POu_${index}`]: poLevels
  };
}

describe('post office advice', () => {
  it('flags characters with a pile of unspent boxes', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [20, 0, 0, 0, 0, 10],
          CurrentMap_0: 60,
          CYDeliveryBoxComplete: 80,
          POu_0: [5]
        }
      })
    );
    const group = postOfficeAdvice.evaluate(account);
    expect(group?.world).toBe('World 2');
    expect(group?.items.some((item) => item.title.includes('unspent Post Office boxes'))).toBe(true);
  });

  it('lists leftover boxes as rounded counts instead of float junk', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['phantom_Zoe', 'Phantommagezoe', 'phantomagezoe', 'PhantomGam4r', 'AltFive', 'AltSix'],
        data: {
          ...characterSlot(0, [0]),
          ...characterSlot(1, [0]),
          ...characterSlot(2, [15100]),
          ...characterSlot(3, [0]),
          ...characterSlot(4, [0]),
          ...characterSlot(5, [0]),
          CYDeliveryBoxComplete: 17804.600000000006
        }
      })
    );

    expect(account.postOfficeBoxesEarned).toBe(17805);
    const group = postOfficeAdvice.evaluate(account);
    const item = group?.items.find((row) => row.title.includes('unspent Post Office boxes'));
    expect(item?.title).toBe('6 characters have unspent Post Office boxes');
    expect(item?.current).toBe('17,805');
    expect(item?.detail).toContain('phantom_Zoe 17,805');
    expect(item?.detail).toContain('phantomagezoe 2,705');
    expect(item?.detail).not.toMatch(/has \d/);
    expect(`${item?.title} ${item?.detail} ${item?.current}`).not.toContain('600000000006');
    expect(`${item?.title} ${item?.detail} ${item?.current}`).not.toMatch(/\.\d{2,}/);
  });
});
