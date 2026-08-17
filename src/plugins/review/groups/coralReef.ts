import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const coralReefAdvice: AdvicePlugin = {
  id: 'coral-reef',
  world: 'World 7',
  title: 'Coral reef',
  evaluate(account) {
    const spelunking = skillPeak(account, 'Spelunking');
    if (spelunking === 0 && account.coralUnlocked === 0) {
      return notReachedGroup(
        'coral-reef',
        'World 7',
        'Coral reef',
        'World 7 spelunking unlocks the coral reef. New corals are account bonuses on top of legend talents.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.coralUnlocked === 0) {
      items.push({
        title: 'No reef corals unlocked',
        detail: 'Clear early cavern layers and spend town corals on the reef board.',
        severity: spelunking > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.coralUnlocked} reef corals`,
        detail: 'Keep unlocking new corals before dumping levels into one color.',
        severity: account.coralUnlocked < 4 ? 'info' : 'good',
        current: String(account.coralUnlocked)
      });
    }

    return {
      id: 'coral-reef',
      world: 'World 7',
      title: 'Coral reef',
      summary: `${account.coralUnlocked} corals`,
      items
    };
  }
};
