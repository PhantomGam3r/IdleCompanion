import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const summoningWinsAdvice: AdvicePlugin = {
  id: 'summoning-wins',
  world: 'World 6',
  title: 'Summoning',
  evaluate(account) {
    const summoning = skillPeak(account, 'Summoning');
    if (summoning === 0 && account.summonWins === 0) {
      return notReachedGroup(
        'summoning-wins',
        'World 6',
        'Summoning',
        'Unlock the W6 battle arena. Winner bonuses are account-wide; clear the next color when you can afford units.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.summonWins === 0) {
      items.push({
        title: 'No summoning battles won',
        detail: 'Start with white battles. Essence upgrades and winner bonuses stack forever.',
        severity: summoning > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.summonWins} battles won`,
        detail: `Upgrade levels: ${account.summonUpgradeLevels}. Endless: ${account.summonEndless}.`,
        severity: account.summonWins < 10 ? 'info' : 'good',
        current: String(account.summonWins)
      });
    }

    return {
      id: 'summoning-wins',
      world: 'World 6',
      title: 'Summoning',
      summary: `${account.summonWins} wins`,
      items
    };
  }
};
