import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const obolsAdvice: AdvicePlugin = {
  id: 'obols',
  world: 'World 2',
  title: 'Obols',
  evaluate(account) {
    const items: AdviceItem[] = [];
    if (account.obolsOwned === 0) {
      items.push({
        title: 'No obols equipped',
        detail: 'Family and character obol boards start in W2. Drop-rate and card-drop circles are the usual first fills.',
        severity: account.highestWorld >= 2 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.obolsOwned} obols owned`,
        detail: 'Fill family slots before chasing rare shapes. Trash dupes into the obol altar.',
        severity: account.obolsOwned < 12 ? 'info' : 'good',
        current: String(account.obolsOwned)
      });
    }
    return {
      id: 'obols',
      world: 'World 2',
      title: 'Obols',
      summary: `${account.obolsOwned} owned`,
      items
    };
  }
};
