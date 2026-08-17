import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../../core/idleon/loadSave';
import { parseSave } from '../../../core/parse/parseSave';
import { postOfficeAdvice } from './postOffice';

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
    expect(group?.items.some((item) => item.title.includes('unspent boxes'))).toBe(true);
  });
});
