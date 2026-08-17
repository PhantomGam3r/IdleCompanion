import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const killroyAdvice: AdvicePlugin = {
  id: 'killroy',
  world: 'World 2',
  title: 'Killroy',
  evaluate(account) {
    const items: AdviceItem[] = [];
    if (account.killroyFights === 0) {
      items.push({
        title: 'Killroy unused',
        detail: 'The W2 colosseum skull fights unlock talent points and later skull-shop multipliers.',
        severity: 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.killroyFights} Killroy fights`,
        detail: 'Skull shop upgrades (artifact, crop, jade) stay relevant into W6. Spend leftover skulls when you pass town.',
        severity: account.killroyFights < 16 ? 'info' : 'good',
        current: String(account.killroyFights)
      });
    }
    return {
      id: 'killroy',
      world: 'World 2',
      title: 'Killroy',
      summary: `${account.killroyFights} fights`,
      items
    };
  }
};
