import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const owlAdvice: AdvicePlugin = {
  id: 'owl',
  world: 'World 1',
  title: 'Owl nest',
  evaluate(account) {
    const items: AdviceItem[] = [];
    if (!account.owlDiscovered) {
      items.push({
        title: 'Owl nest not found',
        detail: 'The W1 owl nest sits above the starting town. Feathers and mega feathers are account-wide bonuses.',
        severity: 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.owlMegaFeathers} mega feathers`,
        detail: `Restarts: ${account.owlRestarts}. Keep collecting feathers; mega feathers are the lasting bonus.`,
        severity: account.owlMegaFeathers < 1 ? 'info' : 'good',
        current: String(account.owlMegaFeathers)
      });
    }
    return {
      id: 'owl',
      world: 'World 1',
      title: 'Owl nest',
      summary: account.owlDiscovered ? `${account.owlMegaFeathers} mega feathers` : 'Hidden',
      items
    };
  }
};
