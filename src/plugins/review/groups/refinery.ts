import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const refineryAdvice: AdvicePlugin = {
  id: 'refinery',
  world: 'World 3',
  title: 'Refinery',
  evaluate(account) {
    const construction = skillPeak(account, 'Construction');
    const ranks = account.refinery.reduce((sum, salt) => sum + salt.level, 0);
    if (construction === 0 && ranks === 0) {
      return notReachedGroup(
        'refinery',
        'World 3',
        'Refinery',
        'The salt refinery sits in W3 town. Keep the first salts cycling; later Salt Lick and construction spend them.'
      );
    }

    const items: AdviceItem[] = [];
    const running = account.refinery.filter((salt) => salt.extra === 'running');
    if (ranks === 0) {
      items.push({
        title: 'Refinery not ranked',
        detail: 'Start Redox salts. Rank-ups permanently speed every cycle.',
        severity: 'warning',
        current: '0'
      });
    } else {
      items.push({
        title: `Salt ranks ${ranks}`,
        detail: account.refinery
          .filter((salt) => salt.level > 0)
          .map((salt) => `${salt.name} r${salt.level}`)
          .join(' · '),
        severity: ranks < 6 ? 'info' : 'good',
        current: String(ranks)
      });
    }

    if (ranks > 0 && running.length === 0) {
      items.push({
        title: 'No salts are cycling',
        detail: 'Turn the refinery back on. Idle salts are wasted construction fuel.',
        severity: 'warning'
      });
    }

    return {
      id: 'refinery',
      world: 'World 3',
      title: 'Refinery',
      summary: `Ranks ${ranks}`,
      items
    };
  }
};
