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

  it('does not flag The Art of the Flail as buyable', () => {
    const status = Array.from({ length: 41 }, () => 1);
    status[40] = 0;
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [20],
          BribeStatus: status
        }
      })
    );
    expect(account.bribes.find((bribe) => bribe.name === 'The Art of the Flail')?.status).toBe(-1);
    const group = bribesAdvice.evaluate(account);
    expect(group?.items.some((item) => item.title.includes('available but unbought'))).toBe(false);
    expect(group?.items.some((item) => item.detail.includes('The Art of the Flail'))).toBe(false);
  });
});
