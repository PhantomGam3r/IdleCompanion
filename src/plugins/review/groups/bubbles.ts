import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

const COLOR_LABEL: Record<string, string> = {
  orange: 'Power',
  green: 'Quicc',
  purple: 'High-IQ',
  yellow: 'Kazam'
};

export const bubblesAdvice: AdvicePlugin = {
  id: 'bubbles',
  world: 'World 2',
  title: 'Bubbles',
  evaluate(account) {
    const leveled = account.bubbles.filter((b) => b.level > 0);
    const items: AdviceItem[] = [];

    if (leveled.length === 0) {
      items.push({
        title: 'No bubble levels yet',
        detail: 'Drop reagents into the W2 cauldrons. Early Power and Kazam bubbles (damage, exp, drop rate) pay for themselves quickly.',
        severity: 'warning' as const
      });
    } else {
      const top = [...leveled].sort((a, b) => b.level - a.level).slice(0, 3);
      items.push({
        title: `${leveled.length} bubbles leveled`,
        detail: `Highest: ${top
          .map((b) => `${COLOR_LABEL[b.color] ?? b.color} #${b.index + 1} (Lv ${b.level})`)
          .join(', ')}.`,
        severity: account.bubbleLevels < 200 ? 'info' : 'good',
        current: String(account.bubbleLevels)
      });
    }

    const low = leveled.filter((b) => b.level > 0 && b.level < 15);
    if (low.length >= 8) {
      items.push({
        title: 'Many bubbles still under level 15',
        detail: 'Cheap early levels are efficient. Raise a wide set of bubbles to 15–30 before stacking one dump bubble.',
        severity: 'warning' as const,
        current: String(low.length)
      });
    }

    const perColor = ['orange', 'green', 'purple', 'yellow'].map((color) => ({
      color,
      total: account.bubbles.filter((b) => b.color === color).reduce((sum, b) => sum + b.level, 0)
    }));
    const max = Math.max(...perColor.map((c) => c.total), 1);
    const neglected = perColor.filter((c) => c.total > 0 && c.total * 4 < max);
    if (neglected.length) {
      items.push({
        title: `Underleveled cauldron: ${neglected.map((c) => COLOR_LABEL[c.color]).join(', ')}`,
        detail: 'Keep the four cauldrons within shouting distance of each other so you do not starve one color of bonuses.',
        severity: 'info' as const
      });
    }

    return {
      id: 'bubbles',
      world: 'World 2',
      title: 'Bubbles',
      summary: `${account.bubbleLevels} total levels`,
      items
    };
  }
};
