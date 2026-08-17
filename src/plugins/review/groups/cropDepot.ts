import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const cropDepotAdvice: AdvicePlugin = {
  id: 'crop-depot',
  world: 'World 6',
  title: 'Crop depot',
  evaluate(account) {
    const farming = skillPeak(account, 'Farming');
    if (farming === 0 && account.farmCrops === 0) {
      return notReachedGroup(
        'crop-depot',
        'World 6',
        'Crop depot',
        'Crop depot bonuses scale with unique FarmCrop keys once Jade Emporium Crop Depot Scientist is bought. There is no separate depot save array.'
      );
    }

    const items: AdviceItem[] = [];
    if (!account.cropDepotScientist) {
      items.push({
        title: 'Crop Depot Scientist locked',
        detail: `Jade letter w (emporium index 22) is missing. You have ${account.farmCrops} crop types; the scientist turns those into account bonuses.`,
        severity: account.sneakingJadeUpgrades > 0 ? 'warning' : 'info',
        current: '0',
        goal: '1'
      });
    } else if (account.farmCrops < 20) {
      items.push({
        title: `${account.farmCrops} crops feeding the depot`,
        detail: `${account.cropDepotScience} science pens bought · magic-bean trade ${Math.floor(account.magicBeanTrade)}. Find new crop types; depot bonuses scale with discovery, not a hidden array.`,
        severity: farming > 0 ? 'warning' : 'info',
        current: String(account.farmCrops),
        goal: '40+'
      });
    } else {
      items.push({
        title: `${account.farmCrops} crop types in the depot`,
        detail: `${account.cropDepotScience} science bonuses · bean trade ${Math.floor(account.magicBeanTrade)}. Keep planting new seeds before stacking one crop.`,
        severity: 'good',
        current: String(account.farmCrops)
      });
    }

    return {
      id: 'crop-depot',
      world: 'World 6',
      title: 'Crop depot',
      summary: account.cropDepotScientist ? `${account.farmCrops} crops` : 'Scientist locked',
      items
    };
  }
};
