import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../../core/idleon/loadSave';
import { DEATH_NOTE_MAPS } from '../../../core/parse/catalogs';
import { parseSave } from '../../../core/parse/parseSave';
import { deathNoteAdvice } from './deathNote';

function klaFromKills(entries: Record<number, number>, extra: Record<number, number> = {}) {
  const kla: number[][] = [];
  for (const [mapId, kills] of Object.entries(entries)) {
    const map = DEATH_NOTE_MAPS.find((row) => row.mapId === Number(mapId));
    kla[Number(mapId)] = [(map?.portalReq ?? 0) - kills];
  }
  for (const [mapId, remaining] of Object.entries(extra)) {
    kla[Number(mapId)] = [remaining];
  }
  return kla;
}

function fillWorld(world: number, kills: number): Record<number, number> {
  return Object.fromEntries(DEATH_NOTE_MAPS.filter((row) => row.world === world).map((row) => [row.mapId, kills]));
}

describe('death note advice', () => {
  it('warns only for regular maps still below Copper', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [40, 0, 0, 0, 0, 0, 0, 0, 12],
          CurrentMap_0: 110,
          Tower: [1, 1, 1],
          KLA_0: klaFromKills({
            1: 20_000,
            2: 40_000,
            14: 90_000
          })
        }
      })
    );
    expect(account.deathNote.mapsWithKills).toBe(3);
    expect(account.deathNote.lowestByWorld.map((row) => row.world)).toEqual([1]);
    const group = deathNoteAdvice.evaluate(account);
    const warning = group?.items.find((item) => item.title.includes('Low skulls'));
    expect(warning?.title).toBe('Low skulls in W1');
    expect(warning?.detail).toContain('Regular Death Note maps only');
  });

  it('ignores junk KLA slots and Copper-complete worlds', () => {
    const account = parseSave(
      fromImportedJson({
        charNames: ['Testor'],
        data: {
          CharacterClass_0: 1,
          Lv0_0: [40, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
          CurrentMap_0: 310,
          Tower: [1, 1, 1],
          KLA_0: klaFromKills(
            {
              ...fillWorld(1, 2_000_000_000),
              ...fillWorld(2, 2_000_000_000),
              ...fillWorld(3, 2_000_000_000),
              ...fillWorld(4, 2_000_000_000),
              ...fillWorld(5, 2_000_000_000),
              ...fillWorld(6, 2_000_000_000)
            },
            { 49: 80, 99: 80, 149: 80, 199: 80, 249: 80, 299: 80, 349: 80 }
          )
        }
      })
    );
    expect(account.deathNote.lowestByWorld.map((row) => `W${row.world} ${row.skull}`)).toEqual([
      'W1 Eclipse Skull',
      'W2 Eclipse Skull',
      'W3 Eclipse Skull',
      'W4 Eclipse Skull',
      'W5 Eclipse Skull',
      'W6 Eclipse Skull'
    ]);
    const group = deathNoteAdvice.evaluate(account);
    expect(group?.items.some((item) => item.title.includes('Low skulls'))).toBe(false);
  });
});
