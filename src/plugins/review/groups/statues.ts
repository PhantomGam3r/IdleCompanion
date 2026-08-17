import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const statuesAdvice: AdvicePlugin = {
  id: 'statues',
  world: 'World 1',
  title: 'Statues',
  evaluate(account) {
    const leveled = account.statues.filter((s) => s.level > 0);
    const goldPlus = account.statues.filter((s) => s.type !== 'Normal' && s.level > 0);
    const items: AdviceItem[] = [];

    if (leveled.length === 0) {
      items.push({
        title: 'No statues deposited',
        detail: 'Drop statue items on the W1 town statue man. Power, Health, and Exp statues are the first big spikes.',
        severity: 'warning'
      });
    } else {
      items.push({
        title: `${leveled.length} statues have levels`,
        detail: `Total statue levels: ${account.statueLevels}. ${goldPlus.length} are Gold/Onyx/Zenith.`,
        severity: account.statueLevels < 50 ? 'info' : 'good',
        current: String(account.statueLevels)
      });
    }

    const lagging = leveled.filter((s) => s.level > 0 && s.level < 20);
    if (lagging.length >= 6) {
      items.push({
        title: `${lagging.length} statues still under 20`,
        detail: 'Crystal grinding with a Divine Knight (or similar) stocks most statue types. Keep depositing instead of banking stacks.',
        severity: 'warning'
      });
    }

    return {
      id: 'statues',
      world: 'World 1',
      title: 'Statues',
      summary: `${account.statueLevels} levels`,
      items
    };
  }
};
