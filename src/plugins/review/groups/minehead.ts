import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const mineheadAdvice: AdvicePlugin = {
  id: 'minehead',
  world: 'World 7',
  title: 'Minehead',
  evaluate(account) {
    const spelunking = skillPeak(account, 'Spelunking');
    if (spelunking === 0 && account.mineheadOpponents === 0 && account.mineheadUpgrades === 0) {
      return notReachedGroup(
        'minehead',
        'World 7',
        'Minehead',
        'World 7 minehead is a daily combat minigame. Beating opponents buys permanent upgrades.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.mineheadOpponents === 0) {
      items.push({
        title: 'Minehead not started',
        detail: 'Spend daily tries. Opponent bonuses and Glimbo trades are account-wide.',
        severity: spelunking > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.mineheadOpponents} opponents beaten`,
        detail: `Minehead upgrade levels: ${account.mineheadUpgrades}. Use leftover tries before they reset.`,
        severity: account.mineheadOpponents < 5 ? 'info' : 'good',
        current: String(account.mineheadOpponents)
      });
    }

    return {
      id: 'minehead',
      world: 'World 7',
      title: 'Minehead',
      summary: `${account.mineheadOpponents} opponents`,
      items
    };
  }
};
