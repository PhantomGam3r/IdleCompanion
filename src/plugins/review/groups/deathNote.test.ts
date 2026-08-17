import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../../core/idleon/loadSave';
import { parseSave } from '../../../core/parse/parseSave';
import { deathNoteAdvice } from './deathNote';

describe('death note advice', () => {
  it('warns when farmed worlds are still on copper-or-worse skulls', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [40, 0, 0, 0, 0, 0, 0, 0, 12],
          CurrentMap_0: 110,
          Tower: [1, 1, 1],
          KLA_0: [0, 20000, 40000, 90000]
        }
      })
    );
    expect(account.deathNote.mapsWithKills).toBe(3);
    const group = deathNoteAdvice.evaluate(account);
    expect(group?.world).toBe('World 3');
    expect(group?.items.some((item) => item.title.includes('Low skulls'))).toBe(true);
  });
});
