import { describe, expect, it } from 'vitest';
import { fromImportedJson } from '../../core/idleon/loadSave';
import { parseSave } from '../../core/parse/parseSave';
import { collectCharacterAlerts } from './characterAlerts';
import { collectDashboardTimers, formatTimerRemaining } from './dashboardTimers';

function accountFrom(data: Record<string, unknown>, charNames = ['A'], serverVars?: Record<string, unknown>) {
  return parseSave(fromImportedJson({ charNames, data, serverVars }));
}

describe('collectCharacterAlerts', () => {
  it('flags unused hammers, unspent anvil points, and empty obols', () => {
    const account = accountFrom({
      CharacterClass_0: 8,
      CurrentMap_0: 80,
      Lv0_0: [40, 20, 10, 10, 10, 20, 10, 10, 10, 10],
      AnvilPAstats_0: [4, 0, 0, 0, 2, 4],
      AnvilPAselect_0: [0],
      AnvilPA_0: [[10, 0, 0, 0]],
      ObolEqO0_0: ['ObolBronze0', 'Blank', 'Blank'],
      CauldronJobs1: [0],
      CauldronBubbles: [[]],
      TimeAway: { GlobalTime: Date.now() / 1000 }
    });
    const ids = collectCharacterAlerts(account).map((item) => item.id);
    expect(ids).toContain('0-anvil-points');
    expect(ids).toContain('0-anvil-hammers');
    expect(ids).toContain('0-missing-obols');
  });

  it('flags overdue traps, missing bubbles, idle alchemy, and unending energy', () => {
    const nowSec = Date.now() / 1000;
    const account = accountFrom({
      CharacterClass_0: 8,
      CurrentMap_0: 120,
      Lv0_0: [60, 0, 0, 0, 0, 20, 0, 20, 40, 20],
      CauldronJobs1: [-1],
      CauldronBubbles: [['a0']],
      OptLacc: Object.assign([], { 89: 0 }),
      PldTraps_0: [[1, 0, 400, 0, 0, 0, 200]],
      EquipOrder_0: [[], ['Blank', 'Blank', 'Blank', 'Blank', 'TrapBoxSet4']],
      Prayers_0: [2],
      PTimeAway_0: nowSec - 12 * 3600,
      PlayerStuff_0: [500, 0, 0],
      TimeAway: { GlobalTime: nowSec }
    });
    const ids = collectCharacterAlerts(account).map((item) => item.id);
    expect(ids).toContain('0-traps-overdue');
    expect(ids).toContain('0-missing-bubbles');
    expect(ids).toContain('0-alchemy-idle');
    expect(ids).toContain('0-unending-energy');
  });

  it('flags leftover post office boxes and unused star signs', () => {
    const account = accountFrom({
      CharacterClass_0: 1,
      CurrentMap_0: 60,
      Lv0_0: [30, 0, 0, 0, 0, 10],
      POu_0: [1],
      CYDeliveryBoxComplete: 40,
      PVtStarSign_0: '1,_,_',
      StarSg: { The_Buff_Guy: 1, Chronus_Cosmos: 1 },
      TimeAway: { GlobalTime: 1_700_000_000 }
    });
    const ids = collectCharacterAlerts(account).map((item) => item.id);
    expect(ids).toContain('0-po-unspent');
    expect(ids).toContain('0-star-signs');
  });

  it('flags a fighting character with a skilling card set and a better pickaxe', () => {
    const account = accountFrom({
      CharacterClass_0: 8,
      CurrentMap_0: 20,
      Lv0_0: [25, 10],
      AFKtarget_0: 'Crystal0',
      CSetEq_0: { CardSet2: 50 },
      EquipOrder_0: [[], ['EquipmentTools1']],
      TimeAway: { GlobalTime: 1_700_000_000 }
    });
    const ids = collectCharacterAlerts(account).map((item) => item.id);
    expect(ids).toContain('0-card-set');
    expect(ids).toContain('0-tool-EquipmentTools2');
  });

  it('flags ready cooldown talents, upgrade slots, and super talent points', () => {
    const nowSec = Date.now() / 1000;
    const spelunk = Array.from({ length: 45 }, () => [-1, -1, -1]);
    const account = accountFrom({
      CharacterClass_0: 3,
      CurrentMap_0: 20,
      Lv0_0: Object.assign([], { 0: 520 }),
      AtkCD_0: { 32: 0, 130: 0 },
      PTimeAway_0: nowSec - 3600,
      EMm0_0: [{ Upgrade_Slots_Left: 2, Type: 'HELMET' }],
      EquipOrder_0: [['EquipmentHats5']],
      PlayerStuff_0: [0, 0, 0],
      Spelunk: spelunk,
      TimeAway: { GlobalTime: nowSec }
    });
    const ids = collectCharacterAlerts(account).map((item) => item.id);
    expect(ids).toContain('0-talent-32');
    expect(ids).toContain('0-upgrade-EquipmentHats5');
    expect(ids).toContain('0-super-talents');
  });

  it('flags TranQi when a high-divinity character is not meditating', () => {
    const account = accountFrom({
      CharacterClass_0: 8,
      CurrentMap_0: 220,
      Lv0_0: Object.assign([], { 0: 80, 14: 45 }),
      AFKtarget_0: 'Mining',
      Divinity: Object.assign([], { 0: 2, 12: 0, 25: 4 }),
      TimeAway: { GlobalTime: 1_700_000_000 }
    });
    const ids = collectCharacterAlerts(account).map((item) => item.id);
    expect(ids).toContain('0-divinity-style');
  });
});

describe('collectDashboardTimers', () => {
  it('includes daily, weekly, printer, and vote-week timers', () => {
    const nowSec = 1_700_000_000;
    const account = accountFrom({
      CharacterClass_0: 8,
      CurrentMap_0: 120,
      Lv0_0: [40, 0, 0, 0, 0, 0, 0, 0, 20],
      TimeAway: { GlobalTime: nowSec, ShopRestock: 3600, Printer: nowSec - 100 },
      OptLacc: Object.assign([], { 39: 3, 55: 22, 96: 10, 98: 10 })
    });
    const ids = collectDashboardTimers(account).map((item) => item.id);
    expect(ids).toContain('daily');
    expect(ids).toContain('weekly');
    expect(ids).toContain('printer');
    expect(ids).toContain('vote-bonus');
    expect(ids).toContain('meritocracy');
    expect(ids).toContain('library');
  });

  it('includes dungeon happy hour and sailing trade timers', () => {
    const nowSec = Date.now() / 1000;
    const account = accountFrom(
      {
        CharacterClass_0: 8,
        CurrentMap_0: 220,
        Lv0_0: Object.assign([], { 0: 80, 13: 10 }),
        TimeAway: { GlobalTime: nowSec, ShopRestock: 100 },
        Sailing: [[-1], [], [2, 1]]
      },
      ['A'],
      { HappyHours: [1000, 2000, 80000], RandEvntHr: 4 }
    );
    const ids = collectDashboardTimers(account).map((item) => item.id);
    expect(ids).toContain('happy-hour');
    expect(ids).toContain('sailing-trades');
  });

  it('formats remaining time as Ready, hours, or days', () => {
    expect(formatTimerRemaining(Date.now() - 1000)).toBe('Ready');
    expect(formatTimerRemaining(null)).toBe('Waiting');
    expect(formatTimerRemaining(Date.now() + 2 * 3600_000 + 5 * 60_000)).toMatch(/2h/);
  });
});
