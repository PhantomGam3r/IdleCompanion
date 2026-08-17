import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const legendTalentsAdvice: AdvicePlugin = {
  id: 'legend-talents',
  world: 'World 7',
  title: 'Legend talents',
  evaluate(account) {
    const spelunking = skillPeak(account, 'Spelunking');
    if (spelunking === 0 && account.legendTalents === 0) {
      return notReachedGroup(
        'legend-talents',
        'World 7',
        'Legend talents',
        'World 7 legend talents are account-wide. Unlock them from the spelunking skill tree.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.legendTalents === 0) {
      items.push({
        title: 'No legend talents unlocked',
        detail: 'Raise spelunking and spend talent points on the legend page. Early rows help every skill.',
        severity: spelunking > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.legendTalents} legend talents`,
        detail: 'Spread points into new rows before dumping one talent. Bonuses apply to the whole roster.',
        severity: account.legendTalents < 6 ? 'info' : 'good',
        current: String(account.legendTalents)
      });
    }

    return {
      id: 'legend-talents',
      world: 'World 7',
      title: 'Legend talents',
      summary: `${account.legendTalents} talents`,
      items
    };
  }
};
