import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../../core/idleon/loadSave';
import { parseSave } from '../../../core/parse/parseSave';
import { cogsAdvice } from './cogs';

describe('cog board advice', () => {
  it('flags a sparse construction board', () => {
    const board = Array.from({ length: 96 }, (_, index) =>
      index === 0 ? 'Player_Testor' : index < 8 ? 'Cog1A0' : 'Blank'
    );
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [40, 0, 0, 0, 0, 0, 0, 0, 25],
          CurrentMap_0: 110,
          CogO: board,
          FlagU: [-11, -11, 40, 0]
        }
      })
    );
    expect(account.cogsPlaced).toBe(8);
    expect(account.flagsComplete).toBe(2);
    const group = cogsAdvice.evaluate(account);
    expect(group?.items.some((item) => item.title.includes('8 cogs on the board'))).toBe(true);
  });
});
