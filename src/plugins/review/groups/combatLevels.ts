import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const combatLevelsAdvice: AdvicePlugin = {
  id: 'combat-levels',
  world: 'General',
  title: 'Combat levels',
  evaluate(account) {
    const levels = account.characters.map((c) => c.combatLevel);
    const highest = Math.max(...levels, 0);
    const lowest = Math.min(...levels, highest);
    const items: AdviceItem[] = [];

    if (highest < 50) {
      items.push({
        title: 'Push the first character',
        detail: 'Get one character through W1 bosses so the rest of the account can follow with maps and portal kills.',
        severity: 'warning',
        current: String(highest),
        goal: '50'
      });
    }

    if (account.characters.length >= 3 && highest - lowest > 80) {
      items.push({
        title: 'Family levels are split',
        detail: `${account.characters.find((c) => c.combatLevel === highest)?.name} is far ahead of ${
          account.characters.find((c) => c.combatLevel === lowest)?.name
        }. Catch-up characters still help stamps, bubbles, and crystals.`,
        severity: 'info',
        current: `${lowest}–${highest}`
      });
    } else {
      items.push({
        title: `Highest combat ${highest}`,
        detail: 'Family combat spread looks reasonable.',
        severity: 'good',
        current: String(highest)
      });
    }

    return {
      id: 'combat-levels',
      world: 'General',
      title: 'Combat levels',
      summary: `${lowest}–${highest}`,
      items
    };
  }
};
