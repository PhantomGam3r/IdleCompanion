import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const cogsAdvice: AdvicePlugin = {
  id: 'cogs',
  world: 'World 3',
  title: 'Cog board',
  evaluate(account) {
    const construction = skillPeak(account, 'Construction');
    if (construction === 0 && account.cogsPlaced === 0) {
      return notReachedGroup(
        'cogs',
        'World 3',
        'Cog board',
        'Construction cogs sit on the 8×12 board. Fill slots, then plant flags so buildings keep constructing AFK.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.cogsPlaced < 24) {
      items.push({
        title: `${account.cogsPlaced} cogs on the board`,
        detail: 'Empty slots waste build rate. Craft nooby cogs and park characters on the board.',
        severity: construction > 0 ? 'warning' : 'info',
        current: String(account.cogsPlaced),
        goal: '96'
      });
    } else {
      items.push({
        title: `${account.cogsPlaced} cogs placed`,
        detail: `${account.flagsComplete} flags finished. Keep a player cog adjacent to the buildings you care about.`,
        severity: account.cogsPlaced < 72 ? 'info' : 'good',
        current: String(account.cogsPlaced)
      });
    }

    return {
      id: 'cogs',
      world: 'World 3',
      title: 'Cog board',
      summary: `${account.cogsPlaced} cogs`,
      items
    };
  }
};
