import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../../core/idleon/loadSave';
import { parseSave } from '../../../core/parse/parseSave';
import { stampsAdvice } from './stamps';

describe('stamps advice', () => {
  it('flags stamps that are below their unlocked max level', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          StampLv: [[10, 2], [], []],
          StampLvM: [[20, 2], [], []]
        }
      })
    );
    const group = stampsAdvice.evaluate(account);
    expect(group?.id).toBe('stamps');
    expect(group?.world).toBe('World 1');
    expect(group?.items.some((item) => item.title.includes('below unlocked max'))).toBe(true);
  });
});
