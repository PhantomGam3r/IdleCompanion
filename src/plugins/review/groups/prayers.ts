import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const prayersAdvice: AdvicePlugin = {
  id: 'prayers',
  world: 'World 3',
  title: 'Prayers',
  evaluate(account) {
    const worship = skillPeak(account, 'Worship');
    if (worship === 0 && account.prayersUnlocked === 0) {
      return notReachedGroup(
        'prayers',
        'World 3',
        'Prayers',
        'Worship souls buy prayers. Skilled Dimwit, Midas Minded, and The Royal Sampler are the usual first unlocks.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.prayersUnlocked === 0) {
      items.push({
        title: 'No prayers leveled',
        detail: 'Run totems, then spend souls on the prayer altar. Sampler helps the printer; Dimwit helps skills.',
        severity: worship > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      const named = account.prayers.filter((prayer) => prayer.level > 0).slice(0, 4);
      items.push({
        title: `${account.prayersUnlocked} prayers unlocked`,
        detail: `Leveled: ${named.map((prayer) => `${prayer.name} ${prayer.level}`).join(', ')}.`,
        severity: account.prayersUnlocked < 5 ? 'info' : 'good',
        current: String(account.prayersUnlocked)
      });
    }

    const sampler = account.prayers.find((prayer) => prayer.name === 'The Royal Sampler');
    if (account.prayersUnlocked > 0 && (sampler?.level ?? 0) === 0 && worship >= 20) {
      items.push({
        title: 'Unlock The Royal Sampler',
        detail: 'Printer sample rate is one of the best account-wide bonuses. Equip it only on the sample character.',
        severity: 'warning',
        goal: '1'
      });
    }

    return {
      id: 'prayers',
      world: 'World 3',
      title: 'Prayers',
      summary: `${account.prayersUnlocked} unlocked`,
      items
    };
  }
};
