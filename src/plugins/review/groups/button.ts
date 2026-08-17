import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const buttonAdvice: AdvicePlugin = {
  id: 'button',
  world: 'World 7',
  title: 'The Button',
  evaluate(account) {
    const spelunking = skillPeak(account, 'Spelunking');
    if (spelunking === 0 && account.buttonPresses === 0) {
      return notReachedGroup(
        'button',
        'World 7',
        'The Button',
        'World 7 The Button stores total presses in OptLacc 594 and leftover insta-skips in 595.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.buttonPresses < 15) {
      items.push({
        title: `${account.buttonPresses} button presses`,
        detail: `${account.buttonInstaSkips} insta-skips left. Every 5 presses fills a bonus category — keep clearing the current task.`,
        severity: spelunking > 0 ? 'warning' : 'info',
        current: String(account.buttonPresses),
        goal: '45+'
      });
    } else {
      items.push({
        title: `${account.buttonPresses} button presses`,
        detail: `${account.buttonInstaSkips} insta-skips remaining this week. Rotate tasks so no one bonus category starves.`,
        severity: 'good',
        current: String(account.buttonPresses)
      });
    }

    return {
      id: 'button',
      world: 'World 7',
      title: 'The Button',
      summary: `${account.buttonPresses} presses`,
      items
    };
  }
};
