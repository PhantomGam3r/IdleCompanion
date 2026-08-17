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
import { postOfficeAdvice } from './groups/postOffice';
import { arcadeAdvice } from './groups/arcade';
import { sigilsAdvice } from './groups/sigils';
import { buildingsAdvice } from './groups/buildings';
import { deathNoteAdvice } from './groups/deathNote';
import { prayersAdvice } from './groups/prayers';
import { worshipTotemsAdvice } from './groups/worshipTotems';
import { saltLickAdvice } from './groups/saltLick';
import { refineryAdvice } from './groups/refinery';
import { mealsAdvice } from './groups/meals';
import {
  constructionAdvice,
  cookingAdvice,
  farmingAdvice,
  sailingAdvice,
  spelunkingAdvice,
  trappingAdvice,
  worshipAdvice
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
  registerAdvice(postOfficeAdvice);
  registerAdvice(arcadeAdvice);
  registerAdvice(sigilsAdvice);
  registerAdvice(constructionAdvice);
  registerAdvice(trappingAdvice);
  registerAdvice(worshipAdvice);
  registerAdvice(buildingsAdvice);
  registerAdvice(deathNoteAdvice);
  registerAdvice(prayersAdvice);
  registerAdvice(worshipTotemsAdvice);
  registerAdvice(saltLickAdvice);
  registerAdvice(refineryAdvice);
  registerAdvice(cookingAdvice);
  registerAdvice(mealsAdvice);
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
