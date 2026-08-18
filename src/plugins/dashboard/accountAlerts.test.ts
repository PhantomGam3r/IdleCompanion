import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../core/idleon/loadSave';
import { parseSave } from '../../core/parse/parseSave';
import { collectAccountAlerts } from './accountAlerts';

function accountFrom(
  data: Record<string, unknown>,
  charNames = ['A'],
  serverVars?: Record<string, unknown>
) {
  return parseSave(fromImportedJson({ charNames, data, serverVars }));
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

  it('flags unmaxed arcade rotation upgrades from server vars', () => {
    const arcade = Array.from({ length: 5 }, () => 100);
    arcade[0] = 40;
    const account = accountFrom(
      {
        CharacterClass_0: 1,
        CurrentMap_0: 60,
        Lv0_0: [40, 0, 0, 0, 0, 20],
        ArcadeUpg: arcade
      },
      ['A'],
      { ArcadeBonuses: [0, 1] }
    );
    const ids = collectAccountAlerts(account).map((item) => item.id);
    expect(ids).toContain('arcade-rot-0');
    expect(ids).not.toContain('arcade-rot-1');
  });

  it('flags printer samples at the atom collider storage cap', () => {
    const print: unknown[] = Array.from({ length: 19 }, () => 0);
    print[15] = 'Copper';
    print[16] = 16e6;
    const account = accountFrom({
      CharacterClass_0: 1,
      CurrentMap_0: 100,
      Lv0_0: [40, 0, 0, 0, 0, 20, 0, 0, 10],
      Print: print,
      OptLacc: Object.assign([], { 133: 0 })
    });
    expect(collectAccountAlerts(account).some((item) => item.id === 'printer-Copper')).toBe(true);
  });

  it('flags a full ribbon shelf, cooking mastery points, and gaming clicks', () => {
    const lastClick = Math.floor(Date.now() / 1000) - 2 * 3600;
    const sprouts = Array.from({ length: 28 }, () => [0, 0, 0, 0]);
    for (let slot = 0; slot < 8; slot += 1) sprouts[slot] = [0, 1, 0, 0];
    sprouts[26] = [1, lastClick, 0, 0];
    sprouts[27] = [1, lastClick, 0, 0];
    const gaming = Array.from({ length: 15 }, () => 0);
    gaming[3] = 5;
    const account = accountFrom({
      CharacterClass_0: 1,
      CurrentMap_0: 210,
      Lv0_0: [80, 0, 0, 0, 0, 20, 0, 0, 20, 0, 15],
      Ribbon: Array.from({ length: 28 }, () => 2),
      CookMaster: [[0, 0], [4, 0], [0, 0, 0, 0, 0, 0]],
      Gaming: gaming,
      GamingSprout: sprouts
    });
    const ids = collectAccountAlerts(account).map((item) => item.id);
    expect(ids).toContain('ribbons');
    expect(ids).toContain('cook-mastery-yellow');
    expect(ids).toContain('cook-mastery-purple');
    expect(ids).toContain('gaming-sprouts');
    expect(ids).toContain('gaming-shovel');
    expect(ids).toContain('gaming-squirrel');
  });

  it('flags world 7 stamina, legend, sushi knowledge, and insight alerts', () => {
    const levels = Array.from({ length: 20 }, () => 0);
    levels[0] = 600;
    levels[19] = 1;
    const legend = Array.from({ length: 50 }, () => 0);
    legend[23] = 1;
    const account = accountFrom({
      CharacterClass_0: 1,
      CurrentMap_0: 310,
      Lv0_0: levels,
      Spelunk: Object.assign([], {
        3: [20],
        4: [0, 2],
        18: legend,
        45: Object.assign([], { 3: 0 })
      }),
      Gaming: Object.assign([], { 12: 'H' }),
      Sushi: Object.assign([], {
        5: [0],
        6: [10],
        7: [0]
      }),
      Research: Object.assign([], {
        2: [1],
        4: [4],
        5: [0, 0, 0, 1]
      }),
      OptLacc: Object.assign([], { 414: 0, 480: 0, 486: 20 })
    });
    const ids = collectAccountAlerts(account).map((item) => item.id);
    expect(ids).toContain('full-stamina');
    expect(ids).toContain('overstim');
    expect(ids).toContain('legend-points');
    expect(ids).toContain('masterclass-cheap');
    expect(ids).toContain('jeweled-cogs');
    expect(ids).toContain('double-cluster');
    expect(ids).toContain('sushi-kn-0');
    expect(ids).toContain('research-insight');
  });

  it('flags fence shinies, breedability, and ChipRepo lab claims', () => {
    const account = accountFrom(
      {
        CharacterClass_0: 1,
        CurrentMap_0: 150,
        Lv0_0: [50, 0, 0, 0, 0, 20, 0, 0, 20, 0, 15],
        Pets: [
          ['mushG', 5],
          ['frogG', 4]
        ],
        Breeding: Object.assign([], {
          2: [0, 0, 1, 0, 0],
          13: Object.assign([], { 1: 1e15 }),
          22: Object.assign([], { 0: 100 })
        }),
        Lab: Object.assign([], {
          13: [-1, -1, -1],
          14: [0]
        }),
        ChestOrder: ['Copper'],
        ChestQuantity: [30_000],
        Meals: [[1], [], [101], [101]]
      },
      ['A'],
      { ChipRepo: [0, -1, -1] }
    );
    const ids = collectAccountAlerts(account).map((item) => item.id);
    expect(ids).toContain('shiny-mushG');
    expect(ids).toContain('breed-frogG');
    expect(ids).toContain('lab-chip-ConsoleChip0');
    expect(ids).not.toContain('lab-jewel-ConsoleJwl0');
  });

  it('skips lab ChipRepo claims that are already claimed or missing materials', () => {
    const account = accountFrom(
      {
        CharacterClass_0: 1,
        CurrentMap_0: 150,
        Lv0_0: [50, 0, 0, 0, 0, 20, 0, 0, 20, 0, 15],
        Lab: Object.assign([], {
          13: [0, -1, -1],
          14: [0]
        }),
        ChestOrder: ['Copper'],
        ChestQuantity: [30_000],
        Meals: [[1], [], [101], [101]]
      },
      ['A'],
      { ChipRepo: [0, -1, -1] }
    );
    const ids = collectAccountAlerts(account).map((item) => item.id);
    expect(ids).not.toContain('lab-chip-ConsoleChip0');
  });

  it('flags a ready button task instead of insta-skips', () => {
    const account = accountFrom({
      CharacterClass_0: 1,
      CurrentMap_0: 310,
      Lv0_0: Array.from({ length: 20 }, (_, index) => (index === 0 ? 50 : 0)),
      Cards1: Array.from({ length: 500 }, (_, index) => `Item${index}`),
      OptLacc: Object.assign([], { 594: 0, 595: 3 })
    });
    const ids = collectAccountAlerts(account).map((item) => item.id);
    expect(ids).toContain('button-task');
    expect(ids).not.toContain('button-skips');
  });

  it('flags button insta-skips only when the current task is not ready', () => {
    const account = accountFrom({
      CharacterClass_0: 1,
      CurrentMap_0: 310,
      Lv0_0: Array.from({ length: 20 }, (_, index) => (index === 0 ? 50 : 0)),
      OptLacc: Object.assign([], { 594: 0, 595: 2 })
    });
    const alert = collectAccountAlerts(account).find((item) => item.id === 'button-skips');
    expect(alert).toBeTruthy();
    expect(alert?.title).toMatch(/can be skipped/);
    expect(collectAccountAlerts(account).some((item) => item.id === 'button-task')).toBe(false);
  });

  it('flags summoning familiar, farm OG plots, and exotic market purchases', () => {
    const skills = Array.from({ length: 17 }, () => 0);
    skills[0] = 50;
    skills[16] = 1;
    const account = accountFrom({
      CharacterClass_0: 1,
      CurrentMap_0: 250,
      Lv0_0: skills,
      Summon: [[0, 0, 4]],
      FarmPlot: [
        [0, 0, 0, 0, 8, 2],
        [-1, 0, 0, 0, 0, 0]
      ],
      Spelunk: Object.assign([], { 0: [0, 0, 0, 1] }),
      OptLacc: Object.assign([], { 416: 1 })
    });
    const alerts = collectAccountAlerts(account);
    const ids = alerts.map((item) => item.id);
    expect(ids).toContain('summon-familiar');
    expect(ids).toContain('farm-og');
    expect(ids).toContain('farm-empty');
    expect(ids).toContain('exotic-purchases');
    expect(alerts.find((item) => item.id === 'farm-og')?.title).toMatch(/threshold of 0 OGs/);
    expect(alerts.find((item) => item.id === 'exotic-purchases')?.title).toMatch(/3 exotic purchases available \(1\/4\)/);
  });

  it('skips maxed familiars and exotic purchases before lore boss 3', () => {
    const skills = Array.from({ length: 17 }, () => 0);
    skills[0] = 50;
    skills[16] = 1;
    const account = accountFrom({
      CharacterClass_0: 1,
      CurrentMap_0: 250,
      Lv0_0: skills,
      Summon: [[0, 0, 10]],
      Spelunk: Object.assign([], { 0: [0, 0, 0, 0] }),
      OptLacc: Object.assign([], { 416: 0 })
    });
    const ids = collectAccountAlerts(account).map((item) => item.id);
    expect(ids).not.toContain('summon-familiar');
    expect(ids).not.toContain('exotic-purchases');
  });
});
