import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../core/idleon/loadSave';
import { parseSave } from '../../core/parse/parseSave';
import { collectAccountAlerts } from './accountAlerts';

function accountFrom(data: Record<string, unknown>, charNames = ['A']) {
  return parseSave(fromImportedJson({ charNames, data }));
}

describe('collectAccountAlerts', () => {
  it('flags Idleon Toolbox general dailies from OptLacc', () => {
    const account = accountFrom({
      CharacterClass_0: 1,
      CurrentMap_0: 120,
      Lv0_0: [80, 0, 0, 0, 0, 20, 0, 0, 40],
      OptLacc: Object.assign([], {
        55: 22,
        101: 0,
        105: 12,
        113: 0,
        137: 0,
        154: 3,
        190: 0,
        195: 0
      })
    });
    const ids = collectAccountAlerts(account).map((item) => item.id);
    expect(ids).toContain('gilded-stamps');
    expect(ids).toContain('killroy-skulls');
    expect(ids).toContain('random-event');
    expect(ids).toContain('daily-crystals');
    expect(ids).toContain('gems-from-bosses');
    expect(ids).toContain('library');
  });

  it('flags extra character slots at 5 characters and 300 combat', () => {
    const names = ['A', 'B', 'C', 'D', 'E'];
    const data: Record<string, unknown> = {};
    names.forEach((_name, index) => {
      data[`CharacterClass_${index}`] = 1;
      data[`Lv0_${index}`] = [60];
    });
    const account = accountFrom(data, names);
    expect(collectAccountAlerts(account).some((item) => item.id === 'new-characters')).toBe(true);
  });

  it('flags uncompleted post office shipments and empty forge slots', () => {
    const account = accountFrom({
      CharacterClass_0: 1,
      Lv0_0: [20, 0, 0, 0, 0, 15],
      ForgeLV: [2],
      ForgeItemOrder: ['Blank', 'Blank', 'Blank', 'Copper', 'Blank', 'Blank', 'Blank', 'Blank', 'Blank'],
      PostOfficeInfo1: [
        [10, 0, 0],
        [4, 1, 2]
      ],
      PostOfficeInfo2: [
        [0, 0, 0],
        [0, 0, 1]
      ]
    });
    const ids = collectAccountAlerts(account).map((item) => item.id);
    expect(ids).toContain('po-0');
    expect(ids).not.toContain('po-1');
    expect(ids).toContain('forge-empty');
  });

  it('does not flag completed random events or claimed gilded stamps', () => {
    const account = accountFrom({
      CharacterClass_0: 1,
      Lv0_0: [20],
      OptLacc: Object.assign([], { 137: 1, 154: 0, 101: 8, 195: 600 })
    });
    const ids = collectAccountAlerts(account).map((item) => item.id);
    expect(ids).not.toContain('random-event');
    expect(ids).not.toContain('gilded-stamps');
    expect(ids).not.toContain('daily-crystals');
    expect(ids).not.toContain('gems-from-bosses');
  });

  it('flags affordable stamp levels within 25% of bank coins', () => {
    const account = accountFrom({
      CharacterClass_0: 1,
      Lv0_0: [20],
      MoneyBANK: 1_000_000,
      StampLv: [[1], [], []],
      StampLvM: [[3], [], []]
    });
    const alert = collectAccountAlerts(account).find((item) => item.id === 'affordable-stamps');
    expect(alert).toBeTruthy();
    expect(alert?.title).toMatch(/1 stamp/);
  });

  it('flags vials that can be upgraded from storage and liquid', () => {
    const account = accountFrom({
      CharacterClass_0: 1,
      CurrentMap_0: 60,
      Lv0_0: [40, 0, 0, 0, 0, 20],
      CauldronInfo: Object.assign([], {
        4: [1],
        6: [20, 20, 20],
        10: [1, 1]
      }),
      ChestOrder: ['Copper'],
      ChestQuantity: [20_000_000]
    });
    expect(collectAccountAlerts(account).some((item) => item.id === 'vial-Copper')).toBe(true);
  });

  it('flags meals ready to level and hats missing from the rack', () => {
    const account = accountFrom({
      CharacterClass_0: 1,
      CurrentMap_0: 120,
      Lv0_0: [50, 0, 0, 0, 0, 20, 0, 0, 20, 0, 15],
      Meals: [
        [1, 0],
        [],
        [1e12, 0]
      ],
      ChestOrder: ['EquipmentHatsBeg1'],
      ChestQuantity: [1],
      Spelunk: Object.assign([], { 46: [] })
    });
    const ids = collectAccountAlerts(account).map((item) => item.id);
    expect(ids).toContain('meal-CookingMB0');
    expect(ids).toContain('hat-EquipmentHatsBeg1');
  });

  it('flags construction buildings ready and motherlode layers', () => {
    const account = accountFrom({
      CharacterClass_0: 1,
      CurrentMap_0: 210,
      Lv0_0: [80, 0, 0, 0, 0, 20, 0, 0, 40, 0, 0, 0, 0, 10],
      Tower: Object.assign([], { 0: 1, 66: 1000 }),
      Holes: Object.assign([], {
        11: Object.assign([], { 0: 10_000, 1: 0 })
      }),
      OptLacc: Object.assign([], { 318: 0 })
    });
    const ids = collectAccountAlerts(account).map((item) => item.id);
    expect(ids).toContain('building-0');
    expect(ids).toContain('hole-motherlode');
  });
});
