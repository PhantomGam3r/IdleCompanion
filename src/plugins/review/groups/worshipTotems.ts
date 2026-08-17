import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const worshipTotemsAdvice: AdvicePlugin = {
  id: 'worship-totems',
  world: 'World 3',
  title: 'Worship totems',
  evaluate(account) {
    const worship = skillPeak(account, 'Worship');
    if (worship === 0 && account.worshipPeakWave === 0) {
      return notReachedGroup(
        'worship-totems',
        'World 3',
        'Worship totems',
        'Charge a wizard on Goblin Gorefest in W1, then spend souls on prayers and towers.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.worshipPeakWave === 0) {
      items.push({
        title: 'No totem waves recorded',
        detail: 'Start Goblin Gorefest. Wave count is account-wide and gates later totems.',
        severity: 'warning',
        current: '0'
      });
    } else {
      const best = [...account.worshipTotems].sort((a, b) => b.level - a.level)[0];
      items.push({
        title: `Peak wave ${account.worshipPeakWave}`,
        detail: `Best totem: ${best?.name ?? 'unknown'} at wave ${best?.level ?? 0}. Push each world’s totem when you reach it.`,
        severity: account.worshipPeakWave < 30 ? 'info' : 'good',
        current: String(account.worshipPeakWave)
      });
    }

    const untouched = account.worshipTotems.filter((totem) => totem.level === 0);
    if (account.worshipPeakWave > 0 && untouched.length >= 4 && account.highestWorld >= 3) {
      items.push({
        title: `${untouched.length} totems still at wave 0`,
        detail: `Next up: ${untouched
          .slice(0, 3)
          .map((totem) => totem.name)
          .join(', ')}.`,
        severity: 'info'
      });
    }

    return {
      id: 'worship-totems',
      world: 'World 3',
      title: 'Worship totems',
      summary: `Wave ${account.worshipPeakWave}`,
      items
    };
  }
};
