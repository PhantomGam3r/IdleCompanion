import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../../core/idleon/loadSave';
import { parseSave } from '../../../core/parse/parseSave';
import { bubblesAdvice } from './bubbles';

describe('bubbles advice', () => {
  it('ignores unreleased filler bubble slots', () => {
    const fillers = Array.from({ length: 35 }, (_, index) => (index >= 33 ? 1 : index === 0 ? 80 : 0));
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [40, 0, 0, 0, 0, 20],
          CurrentMap_0: 55,
          CauldronInfo: [fillers, fillers, fillers, fillers, []]
        }
      })
    );
    expect(account.bubbles.every((bubble) => bubble.index < 33)).toBe(true);
    expect(account.bubbles.filter((bubble) => bubble.level > 0 && bubble.level < 15)).toHaveLength(0);
    const group = bubblesAdvice.evaluate(account);
    expect(group?.items.some((item) => item.title.includes('under level 15'))).toBe(false);
  });
});
