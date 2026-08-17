import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const gemShopAdvice: AdvicePlugin = {
  id: 'gem-shop',
  world: 'General',
  title: 'Gem shop',
  evaluate(account) {
    const items: AdviceItem[] = [];
    if (account.gemShopPurchases === 0) {
      items.push({
        title: 'No gem shop purchases parsed',
        detail: 'If this is a fresh account, ignore this. Otherwise the save may be missing GemItemsPurchased.',
        severity: 'info'
      });
    } else if (account.gemShopPurchases < 8) {
      items.push({
        title: 'Gem shop is barely started',
        detail: 'Best early buys are inventory/storage, daily minigame plays, and extra talent slots — not cosmetics.',
        severity: 'info',
        current: String(account.gemShopPurchases)
      });
    } else {
      items.push({
        title: `${account.gemShopPurchases} gem shop rows owned`,
        detail: 'You have gem shop progress. Prefer storage, carry capacity, and daily resources over one-off cosmetics.',
        severity: 'good',
        current: String(account.gemShopPurchases)
      });
    }
    return {
      id: 'gem-shop',
      world: 'General',
      title: 'Gem shop',
      summary: `${account.gemShopPurchases} purchases`,
      items
    };
  }
};
