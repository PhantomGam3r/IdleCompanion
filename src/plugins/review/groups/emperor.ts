import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup } from './worldSkill';

export const emperorAdvice: AdvicePlugin = {
  id: 'emperor',
  world: 'World 6',
  title: 'Emperor',
  evaluate(account) {
    if (account.highestWorld < 6 && account.emperorShowdown === 0) {
      return notReachedGroup(
        'emperor',
        'World 6',
        'Emperor',
        'Emperor showdowns live in OptLacc 369 after you open the W6 boss portal. Each clear adds a rotating account bonus.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.emperorShowdown === 0) {
      items.push({
        title: 'No Emperor showdowns yet',
        detail: 'Kill enough W6 minichiefs to open Samurai, then Emperor. Tickets refill daily.',
        severity: account.highestWorld >= 6 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `Showdown ${account.emperorShowdown}`,
        detail: 'Bonuses cycle every 48 clears. Keep spending daily visits; unused tickets cap out.',
        severity: account.emperorShowdown < 12 ? 'info' : 'good',
        current: String(account.emperorShowdown)
      });
    }

    return {
      id: 'emperor',
      world: 'World 6',
      title: 'Emperor',
      summary: account.emperorShowdown === 0 ? 'Locked' : `Showdown ${account.emperorShowdown}`,
      items
    };
  }
};
