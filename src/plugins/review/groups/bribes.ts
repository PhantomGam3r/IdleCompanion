import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const bribesAdvice: AdvicePlugin = {
  id: 'bribes',
  world: 'World 1',
  title: 'Bribes',
  evaluate(account) {
    const available = account.bribes.filter((b) => b.status === 0);
    const purchased = account.bribes.filter((b) => b.status === 1);
    const items: AdviceItem[] = [];

    if (purchased.length === 0 && available.length === 0) {
      items.push({
        title: 'Bribe vendor not started',
        detail: 'Talk to the W1 town bribe guy. Cheap early bribes (carry cap, extra damage) are permanent.',
        severity: account.highestWorld >= 1 ? 'warning' : 'info'
      });
    } else if (available.length > 0) {
      const sample = available.slice(0, 5).map((b) => `${b.set}: ${b.name}`);
      items.push({
        title: `${available.length} bribes available but unbought`,
        detail: `Buy these when you pass town. Next up: ${sample.join('; ')}.`,
        severity: 'warning',
        current: String(purchased.length),
        goal: String(purchased.length + available.length)
      });
    } else {
      items.push({
        title: `${purchased.length} bribes purchased`,
        detail: 'Everything currently unlocked is bought. Later worlds add more sets.',
        severity: 'good',
        current: String(purchased.length)
      });
    }

    return {
      id: 'bribes',
      world: 'World 1',
      title: 'Bribes',
      summary: `${purchased.length} bought · ${available.length} available`,
      items
    };
  }
};
