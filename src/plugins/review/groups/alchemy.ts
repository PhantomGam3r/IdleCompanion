import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const alchemyAdvice: AdvicePlugin = {
  id: 'alchemy',
  world: 'World 2',
  title: 'Alchemy',
  evaluate(account) {
    const alchemyPeak = Math.max(...account.characters.map((c) => c.skills.Alchemy ?? 0), 0);
    if (account.highestWorld < 2 && alchemyPeak === 0) {
      return {
        id: 'alchemy',
        world: 'World 2',
        title: 'Alchemy',
        summary: 'Locked',
        items: [
          {
            title: 'World 2 not detected',
            detail: 'Reach Yum Yum Desert to unlock Alchemy. Bubbles and vials are a huge account-wide multiplier.',
            severity: 'info'
          }
        ]
      };
    }

    const items: AdviceItem[] = [];
    if (alchemyPeak < 30) {
      items.push({
        title: 'Level Alchemy on a dedicated character',
        detail: 'Keep at least one mage/shaman parked on Alchemy. Liquid generation and bubble levels scale with the skill.',
        severity: 'warning' as const,
        current: String(alchemyPeak),
        goal: '30+'
      });
    } else {
      items.push({
        title: `Alchemy skill ${alchemyPeak}`,
        detail: 'A character is training Alchemy. Keep liquids flowing so bubbles do not stall.',
        severity: 'good' as const,
        current: String(alchemyPeak)
      });
    }

    const unlockedBubbles = account.bubbles.filter((b) => b.level > 0).length;
    if (unlockedBubbles < 12) {
      items.push({
        title: 'Unlock more cauldron bubbles',
        detail: `Only ${unlockedBubbles} bubbles have any levels. Spread levels across new bubbles instead of dumping everything into the first few.`,
        severity: 'warning' as const,
        current: String(unlockedBubbles)
      });
    }

    return {
      id: 'alchemy',
      world: 'World 2',
      title: 'Alchemy',
      summary: `Skill ${alchemyPeak} · ${unlockedBubbles} bubbles`,
      items
    };
  }
};
