import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const shrinesAdvice: AdvicePlugin = {
  id: 'shrines',
  world: 'World 3',
  title: 'Shrines',
  evaluate(account) {
    const construction = skillPeak(account, 'Construction');
    if (account.shrinesUnlocked === 0 && construction === 0) {
      return notReachedGroup(
        'shrines',
        'World 3',
        'Shrines',
        'Construction shrines are portable map bonuses. Build one, then park it on a map you farm.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.shrinesUnlocked === 0) {
      items.push({
        title: 'No shrines built',
        detail: 'Shrines sit on the construction board after the early utilities. EXP and drop-rate shrines are the usual first placements.',
        severity: construction > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.shrinesUnlocked} shrines active`,
        detail: `Total shrine levels: ${account.shrineLevels}. Hours spent on a map rank them up.`,
        severity: account.shrinesUnlocked < 3 ? 'info' : 'good',
        current: String(account.shrineLevels)
      });
    }

    return {
      id: 'shrines',
      world: 'World 3',
      title: 'Shrines',
      summary: `${account.shrinesUnlocked} shrines`,
      items
    };
  }
};
