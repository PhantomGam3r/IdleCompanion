import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const mealsAdvice: AdvicePlugin = {
  id: 'meals',
  world: 'World 4',
  title: 'Meals',
  evaluate(account) {
    const cooking = skillPeak(account, 'Cooking');
    if (cooking === 0 && account.mealsUnlocked === 0) {
      return notReachedGroup(
        'meals',
        'World 4',
        'Meals',
        'World 4 cooking kitchens bake meals. Unlock plates, then level a wide set before dumping one meal.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.kitchensOwned < 2 && cooking > 0) {
      items.push({
        title: `${account.kitchensOwned} kitchens owned`,
        detail: 'Buy more kitchen tables in W4 town. Extra kitchens cook in parallel.',
        severity: 'warning',
        current: String(account.kitchensOwned),
        goal: '4+'
      });
    }

    if (account.mealsUnlocked === 0) {
      items.push({
        title: 'No meals unlocked',
        detail: 'Cook the first recipes on the meal table. New meals usually beat another level on an already-open plate.',
        severity: cooking > 0 ? 'warning' : 'info'
      });
    } else {
      items.push({
        title: `${account.mealsUnlocked} meals unlocked`,
        detail: `Total meal levels: ${account.mealLevels}. Spread to 11 on many plates before you chase a single 30.`,
        severity: account.mealsUnlocked < 10 ? 'info' : 'good',
        current: String(account.mealLevels)
      });
    }

    return {
      id: 'meals',
      world: 'World 4',
      title: 'Meals',
      summary: `${account.mealsUnlocked} meals · ${account.kitchensOwned} kitchens`,
      items
    };
  }
};
