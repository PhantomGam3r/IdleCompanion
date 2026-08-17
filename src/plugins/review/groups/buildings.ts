import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

const EARLY_UTILITIES = ['3D Printer', 'Death Note', 'Salt Lick', 'Talent Book Library', 'Atom Collider'];

export const buildingsAdvice: AdvicePlugin = {
  id: 'buildings',
  world: 'World 3',
  title: 'Buildings',
  evaluate(account) {
    const construction = skillPeak(account, 'Construction');
    if (construction === 0 && account.buildingsUnlocked === 0) {
      return notReachedGroup(
        'buildings',
        'World 3',
        'Buildings',
        'World 3 construction unlocks the board. Printer, Death Note, and Salt Lick should be first builds.'
      );
    }

    const items: AdviceItem[] = [];
    const missing = EARLY_UTILITIES.filter(
      (name) => (account.buildings.find((building) => building.name === name)?.level ?? 0) === 0
    );
    if (missing.length > 0) {
      items.push({
        title: `Unlock ${missing.join(', ')}`,
        detail: 'These utilities are account-wide. A level-1 Death Note or Printer beats another wizard tower.',
        severity: 'warning',
        current: String(account.buildingsUnlocked),
        goal: String(EARLY_UTILITIES.length)
      });
    } else {
      items.push({
        title: `${account.buildingsUnlocked} buildings unlocked`,
        detail: 'Core utilities are up. Keep trimmed slots on Printer, Library, and towers you actually use.',
        severity: 'good',
        current: String(account.buildingsUnlocked)
      });
    }

    const printer = account.buildings.find((building) => building.name === '3D Printer');
    if (printer && printer.level > 0 && printer.level < 10) {
      items.push({
        title: 'Raise the 3D Printer',
        detail: 'Printer slots are one of the strongest idle gains in the game. Push this toward 10.',
        severity: 'info',
        current: String(printer.level),
        goal: '10'
      });
    }

    return {
      id: 'buildings',
      world: 'World 3',
      title: 'Buildings',
      summary: `${account.buildingsUnlocked} unlocked`,
      items
    };
  }
};
