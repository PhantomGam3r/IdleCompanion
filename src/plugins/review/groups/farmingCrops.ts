import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const farmingCropsAdvice: AdvicePlugin = {
  id: 'farming-crops',
  world: 'World 6',
  title: 'Farming',
  evaluate(account) {
    const farming = skillPeak(account, 'Farming');
    if (farming === 0 && account.farmCrops === 0) {
      return notReachedGroup(
        'farming-crops',
        'World 6',
        'Farming',
        'Unlock W6 crop plots. New crop types and land ranks beat another market dump on one seed.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.farmCrops < 8) {
      items.push({
        title: `${account.farmCrops} crop types found`,
        detail: `${account.farmPlots} plots, ${account.farmLandRanks} ranked. Plant new seeds before stacking one crop.`,
        severity: farming > 0 ? 'warning' : 'info',
        current: String(account.farmCrops),
        goal: '20+'
      });
    } else {
      items.push({
        title: `${account.farmCrops} crop types`,
        detail: `${account.farmPlots} plots · market levels ${account.farmMarketLevels} · ${account.farmLandRanks} ranked · exotic ${account.farmExoticLevels}.`,
        severity: 'good',
        current: String(account.farmCrops)
      });
    }

    if (farming > 0 && account.farmPlots < 4) {
      items.push({
        title: 'Buy more land plots',
        detail: 'The day-market Land Plots upgrade is the farming throughput gate.',
        severity: 'warning',
        current: String(account.farmPlots),
        goal: '6+'
      });
    }

    return {
      id: 'farming-crops',
      world: 'World 6',
      title: 'Farming',
      summary: `${account.farmCrops} crops`,
      items
    };
  }
};
