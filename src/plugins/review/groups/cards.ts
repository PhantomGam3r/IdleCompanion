import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const cardsAdvice: AdvicePlugin = {
  id: 'cards',
  world: 'General',
  title: 'Cards',
  evaluate(account) {
    const items: AdviceItem[] = [];
    if (account.cardsFound < 20) {
      items.push({
        title: 'Card collection is thin',
        detail: 'Equip sets and farm missing cards. Card bonuses are account-wide and cheap compared to gear.',
        severity: 'warning',
        current: String(account.cardsFound)
      });
    } else {
      items.push({
        title: `${account.cardsFound} cards found`,
        detail: 'Keep starring cards you already drop. Sets beat random high-star singles.',
        severity: account.cardsFound < 80 ? 'info' : 'good',
        current: String(account.cardsFound)
      });
    }
    return {
      id: 'cards',
      world: 'General',
      title: 'Cards',
      summary: `${account.cardsFound} found`,
      items
    };
  }
};
