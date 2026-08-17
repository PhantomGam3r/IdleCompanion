import { registerAdvice, registerPlugin } from '../../core/plugins/registry';
import { ReviewPage } from './ReviewPage';
import { pinchyAdvice } from './groups/pinchy';
import { generalAdvice } from './groups/general';
import { combatLevelsAdvice } from './groups/combatLevels';
import { cardsAdvice } from './groups/cards';
import { gemShopAdvice } from './groups/gemShop';
import { achievementsAdvice } from './groups/achievements';
import { stampsAdvice } from './groups/stamps';
import { bribesAdvice } from './groups/bribes';
import { statuesAdvice } from './groups/statues';
import { forgeAdvice } from './groups/forge';
import { alchemyAdvice } from './groups/alchemy';
import { bubblesAdvice } from './groups/bubbles';
import { vialsAdvice } from './groups/vials';
import {
  constructionAdvice,
  cookingAdvice,
  farmingAdvice,
  sailingAdvice,
  spelunkingAdvice
} from './groups/laterWorlds';

export function reviewPlugin() {
  registerAdvice(generalAdvice);
  registerAdvice(combatLevelsAdvice);
  registerAdvice(cardsAdvice);
  registerAdvice(gemShopAdvice);
  registerAdvice(achievementsAdvice);
  registerAdvice(stampsAdvice);
  registerAdvice(bribesAdvice);
  registerAdvice(statuesAdvice);
  registerAdvice(forgeAdvice);
  registerAdvice(alchemyAdvice);
  registerAdvice(bubblesAdvice);
  registerAdvice(vialsAdvice);
  registerAdvice(constructionAdvice);
  registerAdvice(cookingAdvice);
  registerAdvice(sailingAdvice);
  registerAdvice(farmingAdvice);
  registerAdvice(spelunkingAdvice);
  registerAdvice(pinchyAdvice);
  registerPlugin({
    id: 'review',
    title: 'AutoReview',
    requiresAccount: true,
    nav: { label: 'AutoReview', path: '/review' },
    routes: [{ path: '/review', element: ReviewPage }]
  });
}
