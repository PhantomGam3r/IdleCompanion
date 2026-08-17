import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const gamingAdviceGroup: AdvicePlugin = {
  id: 'gaming-bits',
  world: 'World 5',
  title: 'Gaming',
  evaluate(account) {
    const gaming = skillPeak(account, 'Gaming');
    if (gaming === 0 && account.gamingBits === 0) {
      return notReachedGroup(
        'gaming-bits',
        'World 5',
        'Gaming',
        'Unlock the W5 arcade cabinet. Bits and superbits buy account bonuses while sprouts grow AFK.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.gamingBits === 0 && account.gamingSuperbits === 0) {
      items.push({
        title: 'Gaming not producing bits',
        detail: 'Plant sprouts and upgrade fertilizer. Superbits are the real payoff.',
        severity: gaming > 0 ? 'warning' : 'info'
      });
    } else {
      items.push({
        title: 'Gaming is running',
        detail: `Bits on hand: ${Math.floor(account.gamingBits)}. Superbit codes logged: ${account.gamingSuperbits}.`,
        severity: account.gamingSuperbits < 3 ? 'info' : 'good',
        current: String(account.gamingSuperbits)
      });
    }

    return {
      id: 'gaming-bits',
      world: 'World 5',
      title: 'Gaming',
      summary: `${account.gamingSuperbits} superbits`,
      items
    };
  }
};
