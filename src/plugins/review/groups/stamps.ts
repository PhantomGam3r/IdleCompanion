import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const stampsAdvice: AdvicePlugin = {
  id: 'stamps',
  world: 'World 1',
  title: 'Stamps',
  evaluate(account) {
    const delivered = account.stamps.filter((s) => s.delivered);
    const behind = delivered.filter((s) => s.maxLevel > s.level);
    const empty = account.stamps.filter((s) => !s.delivered);
    const avgLevel =
      delivered.length === 0
        ? 0
        : Math.round(delivered.reduce((sum, s) => sum + s.level, 0) / delivered.length);

    const items: AdviceItem[] = [];
    if (delivered.length === 0) {
      items.push({
        title: 'No stamps found',
        detail: 'Buy stamps from the W1 town stamp pad and level them. Combat and skill stamps are among the strongest early bonuses.',
        severity: 'warning' as const,
        current: '0',
        goal: 'Start the stamp pad'
      });
    } else {
      items.push({
        title: `${account.stampsCollected} stamps collected`,
        detail: `Total stamp levels: ${account.stampLevels}. Average collected stamp level is ${avgLevel}.`,
        severity: avgLevel < 40 ? 'warning' : 'good',
        current: String(account.stampLevels)
      });
    }

    if (behind.length > 0) {
      items.push({
        title: `${behind.length} stamps below unlocked max`,
        detail: 'These stamps already have carry capacity but are not leveled to it. Spend coins (and gilded stamps if you have them) to catch up.',
        severity: 'warning' as const,
        current: String(behind.length)
      });
    }

    if (empty.length > 10) {
      items.push({
        title: `${empty.length} stamps still unpurchased`,
        detail: 'Missing stamps are usually a bigger DPS/skill hole than another level on an already-high stamp. Sweep the stamp vendor when you pass town.',
        severity: 'info' as const
      });
    }

    return {
      id: 'stamps',
      world: 'World 1',
      title: 'Stamps',
      summary: `${account.stampsCollected} collected · ${account.stampLevels} levels`,
      items
    };
  }
};
