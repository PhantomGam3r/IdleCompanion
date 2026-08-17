import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const vaultAdvice: AdvicePlugin = {
  id: 'vault',
  world: 'World 1',
  title: 'Upgrade Vault',
  evaluate(account) {
    const items: AdviceItem[] = [];
    if (account.vaultUpgrades === 0) {
      items.push({
        title: 'Upgrade Vault unused',
        detail: 'The W1 vault spends extra materials on permanent bonuses. Early damage, drop rate, and AFK rows are cheap.',
        severity: 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.vaultUpgrades} vault upgrades`,
        detail: `Total levels: ${account.vaultLevels}. Keep dumping spare resources; later pages unlock as you spend.`,
        severity: account.vaultLevels < 40 ? 'info' : 'good',
        current: String(account.vaultLevels)
      });
    }
    return {
      id: 'vault',
      world: 'World 1',
      title: 'Upgrade Vault',
      summary: `${account.vaultLevels} levels`,
      items
    };
  }
};
