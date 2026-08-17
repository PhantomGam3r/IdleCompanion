import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const equinoxAdvice: AdvicePlugin = {
  id: 'equinox',
  world: 'World 3',
  title: 'Equinox',
  evaluate(account) {
    const construction = skillPeak(account, 'Construction');
    if (account.equinoxDreams === 0 && construction === 0) {
      return notReachedGroup(
        'equinox',
        'World 3',
        'Equinox',
        'The W3 equinox valley unlocks dream fights. Clearing dreams opens account bonuses.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.equinoxDreams === 0) {
      items.push({
        title: 'No equinox dreams cleared',
        detail: 'Walk into Equinox Valley and clear Dream 1. New dreams unlock more bonus rows.',
        severity: construction > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.equinoxDreams} dreams cleared`,
        detail: `Bonus levels: ${account.equinoxBonusLevels}. Spend remaining upgrades when a dream unlocks a new row.`,
        severity: account.equinoxDreams < 5 ? 'info' : 'good',
        current: String(account.equinoxDreams)
      });
    }

    return {
      id: 'equinox',
      world: 'World 3',
      title: 'Equinox',
      summary: `${account.equinoxDreams} dreams`,
      items
    };
  }
};
