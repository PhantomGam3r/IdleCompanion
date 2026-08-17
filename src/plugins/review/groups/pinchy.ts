import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { getAdvicePlugins } from '../../../core/plugins/registry';
import { adviceGroupIcon } from '../../../ui/icons/gameIcons';

export const pinchyAdvice: AdvicePlugin = {
  id: 'pinchy',
  world: 'Pinchy',
  title: 'Do this first',
  evaluate(account) {
    const items: AdviceItem[] = getAdvicePlugins()
      .filter((plugin) => plugin.id !== 'pinchy')
      .flatMap((plugin) =>
        (plugin.evaluate(account)?.items ?? [])
          .filter((item) => item.severity === 'warning')
          .map((item) => ({
            ...item,
            icon: item.icon ?? adviceGroupIcon(plugin.id)
          }))
      )
      .slice(0, 8);

    if (items.length === 0) {
      items.push({
        title: 'No urgent holes',
        detail: 'Nothing in the current review set is flagged as blocking. Skim the world tabs for notes.',
        severity: 'good'
      });
    }

    return {
      id: 'pinchy',
      world: 'Pinchy',
      title: 'Do this first',
      summary: `${items.filter((item) => item.severity === 'warning').length} priority items`,
      items
    };
  }
};
