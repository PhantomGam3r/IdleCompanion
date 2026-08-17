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
import { starSignsAdvice } from './groups/starSigns';
import { vaultAdvice } from './groups/vault';
import { owlAdvice } from './groups/owl';
import { alchemyAdvice } from './groups/alchemy';
import { bubblesAdvice } from './groups/bubbles';
import { vialsAdvice } from './groups/vials';
import { postOfficeAdvice } from './groups/postOffice';
import { arcadeAdvice } from './groups/arcade';
import { sigilsAdvice } from './groups/sigils';
import { islandsAdvice } from './groups/islands';
import { killroyAdvice } from './groups/killroy';
import { obolsAdvice } from './groups/obols';
import { buildingsAdvice } from './groups/buildings';
import { shrinesAdvice } from './groups/shrines';
import { equinoxAdvice } from './groups/equinox';
import { deathNoteAdvice } from './groups/deathNote';
import { prayersAdvice } from './groups/prayers';
import { worshipTotemsAdvice } from './groups/worshipTotems';
import { saltLickAdvice } from './groups/saltLick';
import { refineryAdvice } from './groups/refinery';
import { printerAdvice } from './groups/printer';
import { atomsAdvice } from './groups/atoms';
import { mealsAdvice } from './groups/meals';
import { riftAdvice } from './groups/rift';
import { breedingPetsAdvice } from './groups/breeding';
import { labAdvice } from './groups/lab';
import { sailingLootAdvice } from './groups/sailingLoot';
import { divinityGodsAdvice } from './groups/divinityGods';
import { gamingAdviceGroup } from './groups/gamingBits';
import { slabAdvice } from './groups/slab';
import { cavernsAdvice } from './groups/caverns';
import { farmingCropsAdvice } from './groups/farmingCrops';
import { sneakingJadeAdvice } from './groups/sneakingJade';
import { summoningWinsAdvice } from './groups/summoningWins';
import { coralReefAdvice } from './groups/coralReef';
import {
  breedingAdvice,
  constructionAdvice,
  cookingAdvice,
  divinityAdvice,
  farmingAdvice,
  gamingAdvice,
  laboratoryAdvice,
  sailingAdvice,
  sneakingAdvice,
  spelunkingAdvice,
  summoningAdvice,
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
  registerAdvice(starSignsAdvice);
  registerAdvice(vaultAdvice);
  registerAdvice(owlAdvice);
  registerAdvice(alchemyAdvice);
  registerAdvice(bubblesAdvice);
  registerAdvice(vialsAdvice);
  registerAdvice(postOfficeAdvice);
  registerAdvice(arcadeAdvice);
  registerAdvice(sigilsAdvice);
  registerAdvice(islandsAdvice);
  registerAdvice(killroyAdvice);
  registerAdvice(obolsAdvice);
  registerAdvice(constructionAdvice);
  registerAdvice(trappingAdvice);
  registerAdvice(worshipAdvice);
  registerAdvice(buildingsAdvice);
  registerAdvice(shrinesAdvice);
  registerAdvice(equinoxAdvice);
  registerAdvice(deathNoteAdvice);
  registerAdvice(prayersAdvice);
  registerAdvice(worshipTotemsAdvice);
  registerAdvice(saltLickAdvice);
  registerAdvice(refineryAdvice);
  registerAdvice(printerAdvice);
  registerAdvice(atomsAdvice);
  registerAdvice(cookingAdvice);
  registerAdvice(mealsAdvice);
  registerAdvice(breedingAdvice);
  registerAdvice(breedingPetsAdvice);
  registerAdvice(laboratoryAdvice);
  registerAdvice(labAdvice);
  registerAdvice(riftAdvice);
  registerAdvice(sailingAdvice);
  registerAdvice(sailingLootAdvice);
  registerAdvice(divinityAdvice);
  registerAdvice(divinityGodsAdvice);
  registerAdvice(gamingAdvice);
  registerAdvice(gamingAdviceGroup);
  registerAdvice(slabAdvice);
  registerAdvice(cavernsAdvice);
  registerAdvice(farmingAdvice);
  registerAdvice(farmingCropsAdvice);
  registerAdvice(sneakingAdvice);
  registerAdvice(sneakingJadeAdvice);
  registerAdvice(summoningAdvice);
  registerAdvice(summoningWinsAdvice);
  registerAdvice(spelunkingAdvice);
  registerAdvice(coralReefAdvice);
  registerAdvice(pinchyAdvice);
  registerPlugin({
    id: 'review',
    title: 'AutoReview',
    requiresAccount: true,
    nav: { label: 'AutoReview', path: '/review' },
    routes: [{ path: '/review', element: ReviewPage }]
  });
}
