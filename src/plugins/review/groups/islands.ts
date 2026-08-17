import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const islandsAdvice: AdvicePlugin = {
  id: 'islands',
  world: 'World 2',
  title: 'Islands',
  evaluate(account) {
    const items: AdviceItem[] = [];
    if (account.islandsUnlocked === 0) {
      items.push({
        title: 'No islands unlocked',
        detail: 'Talk to the W2 island NPC. Trash, Crystal, and Shimmer islands are cheap daily value.',
        severity: account.highestWorld >= 2 ? 'warning' : 'info',
        current: '0',
        goal: '6'
      });
    } else {
      items.push({
        title: `${account.islandsUnlocked} / 6 islands`,
        detail: `Trash shop currency: ${Math.floor(account.islandTrash)}. Unlock the rest when the island NPC offers them.`,
        severity: account.islandsUnlocked < 6 ? 'info' : 'good',
        current: String(account.islandsUnlocked),
        goal: '6'
      });
    }
    return {
      id: 'islands',
      world: 'World 2',
      title: 'Islands',
      summary: `${account.islandsUnlocked} unlocked`,
      items
    };
  }
};
