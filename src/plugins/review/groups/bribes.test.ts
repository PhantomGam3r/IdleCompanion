import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../../core/idleon/loadSave';
import { parseSave } from '../../../core/parse/parseSave';
import { bribesAdvice } from './bribes';

describe('bribes advice', () => {
  it('flags bribes that are unlocked but not purchased', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [20],
          BribeStatus: [1, 0, 0, -1, 1, 1]
        }
      })
    );
    const group = bribesAdvice.evaluate(account);
    expect(group?.world).toBe('World 1');
    expect(group?.items.some((item) => item.title.includes('available but unbought'))).toBe(true);
  });
});
