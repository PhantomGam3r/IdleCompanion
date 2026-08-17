import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const slabAdvice: AdvicePlugin = {
  id: 'slab',
  world: 'World 5',
  title: 'Slab',
  evaluate(account) {
    if (account.slabItems === 0 && account.highestWorld < 5) {
      return notReachedGroup(
        'slab',
        'World 5',
        'Slab',
        'The W5 slab registers unique items you have found. More entries raise drop rate.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.slabItems === 0) {
      items.push({
        title: 'Slab is empty',
        detail: 'Register items at the W5 slab. Unique cards, materials, and equips all count.',
        severity: skillPeak(account, 'Sailing') > 0 ? 'warning' : 'info'
      });
    } else {
      items.push({
        title: `${account.slabItems} slab items`,
        detail: 'Check storage and inventories for unregistered uniques whenever you pass W5 town.',
        severity: account.slabItems < 200 ? 'info' : 'good',
        current: String(account.slabItems)
      });
    }

    return {
      id: 'slab',
      world: 'World 5',
      title: 'Slab',
      summary: `${account.slabItems} items`,
      items
    };
  }
};
