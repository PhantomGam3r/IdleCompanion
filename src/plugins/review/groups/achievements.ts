import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const achievementsAdvice: AdvicePlugin = {
  id: 'achievements',
  world: 'General',
  title: 'Achievements',
  evaluate(account) {
    const items: AdviceItem[] = [];
    if (account.achievements < 30) {
      items.push({
        title: 'Achievement bonuses are low',
        detail: 'Steam/in-game achievements give account-wide stats. Sweep easy ones (kills, skills, maps) when you pass town.',
        severity: 'info',
        current: String(account.achievements)
      });
    } else {
      items.push({
        title: `${account.achievements} achievements`,
        detail: 'Keep an eye on unclaimed Steam/in-game achievements for free multipliers.',
        severity: 'good',
        current: String(account.achievements)
      });
    }
    return {
      id: 'achievements',
      world: 'General',
      title: 'Achievements',
      summary: String(account.achievements),
      items
    };
  }
};
