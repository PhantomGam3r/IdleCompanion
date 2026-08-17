import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../../core/idleon/loadSave';
import { parseSave } from '../../../core/parse/parseSave';
import { atomsAdvice } from './atoms';

describe('atom collider advice', () => {
  it('lists only atoms that are still below max level', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [40, 0, 0, 0, 0, 0, 0, 0, 50],
          CurrentMap_0: 110,
          Tower: [1, 1, 1, 1, 1, 1, 1, 1, 1],
          Atoms: [70, 16, 70, 70, 20]
        }
      })
    );
    expect(account.atoms[0]?.max).toBe(70);
    const group = atomsAdvice.evaluate(account);
    const item = group?.items.find((row) => row.title.includes('atoms unlocked'));
    expect(item?.detail).toContain('Helium 16/70');
    expect(item?.detail).toContain('Boron 20/70');
    expect(item?.detail).not.toContain('Hydrogen');
    expect(item?.detail).not.toContain('Lithium');
    expect(item?.current).toBe('5');
  });
});
