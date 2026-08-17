import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const sushiAdvice: AdvicePlugin = {
  id: 'sushi',
  world: 'World 7',
  title: 'Sushi station',
  evaluate(account) {
    const spelunking = skillPeak(account, 'Spelunking');
    if (spelunking === 0 && account.sushiSlots === 0 && account.sushiUnique === 0) {
      return notReachedGroup(
        'sushi',
        'World 7',
        'Sushi station',
        'World 7 sushi lives on the Sushi save array. Own slots (tier ≥ 0), then cook new types for rest-of-game bonuses.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.sushiSlots < 10) {
      items.push({
        title: `${account.sushiSlots} sushi slots owned`,
        detail: `${account.sushiUnique} unique types · ${account.sushiBucks} bucks · fuel ${Math.floor(account.sushiFuel)}. Buy more slots before stacking one recipe.`,
        severity: spelunking > 0 ? 'warning' : 'info',
        current: String(account.sushiSlots),
        goal: '10+'
      });
    } else {
      items.push({
        title: `${account.sushiSlots} sushi slots`,
        detail: `${account.sushiUnique} unique types · upgrade levels ${account.sushiUpgradeLevels} · sparks ${Math.floor(account.sushiSparks)}.`,
        severity: account.sushiUnique < 8 ? 'info' : 'good',
        current: String(account.sushiUnique)
      });
    }

    return {
      id: 'sushi',
      world: 'World 7',
      title: 'Sushi station',
      summary: `${account.sushiUnique} types`,
      items
    };
  }
};
