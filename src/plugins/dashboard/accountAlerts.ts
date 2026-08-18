import { formatCount } from '../../core/parse/helpers';
import type { DashboardAlert, ParsedAccount } from '../../core/parse/types';

const MINI_BOSS_THRESHOLD = 2;
const LIBRARY_BOOK_THRESHOLD = 20;
const ISLAND_AFK_THRESHOLD = 1;
const SPICE_CLICK_CAP = 100;
const CRYSTAL_FLOOR = 4;
const BOSS_GEM_CAP = 600;
const EMPEROR_ATTEMPT_THRESHOLD = 20;
const SNEAKING_LOOT_MINUTES = 120;
const KANGAROO_SHINY_THRESHOLD = 100;
const HOLE_JAR_THRESHOLD = 120;
const STAMP_REDUCER_THRESHOLD = 90;
const RIBBON_EMPTY_THRESHOLD = 0;
const GAMING_HOURS_THRESHOLD = 1;
const STAMINA_CHAR_THRESHOLD = 1;
const OVERSTIM_THRESHOLD = 1;
const INSIGHT_THRESHOLD = 3;
const SHINY_LEVEL_THRESHOLD = 5;
const BREEDABILITY_LEVEL_THRESHOLD = 5;
const FAMILIAR_LEVEL_THRESHOLD = 10;
const FARM_OG_THRESHOLD = 0;

function cleanLabel(value: string): string {
  return value.replace(/[{}]/g, '').replace(/_/g, ' ');
}

function alert(
  world: string,
  id: string,
  title: string,
  icon: string,
  detail?: string
): DashboardAlert {
  return { world, id, title, icon, detail };
}

export const DASHBOARD_ALERT_WORLDS = [
  'General',
  'World 1',
  'World 2',
  'World 3',
  'World 4',
  'World 5',
  'World 6',
  'World 7'
] as const;

export function collectAccountAlerts(account: ParsedAccount): DashboardAlert[] {
  const { ops } = account;
  const alerts: DashboardAlert[] = [];
  const world = account.highestWorld;

  if (ops.emptyFamilyObols > 0) {
    alerts.push(
      alert('General', 'family-obols', `You have ${ops.emptyFamilyObols} empty family obol slots`, 'etc/ObolEmpty1')
    );
  }
  const gemBossesLeft = Math.max(0, (BOSS_GEM_CAP - ops.bossGemKillsUsed) / 4);
  if (gemBossesLeft > 0) {
    alerts.push(
      alert(
        'General',
        'gems-from-bosses',
        `You can kill ${Math.floor(gemBossesLeft)} more bosses for gems`,
        'data/PremiumGem'
      )
    );
  }
  if (ops.companionClaimReady) {
    alerts.push(alert('General', 'free-companion', 'You can claim a free companion', 'afk_targets/Dog'));
  }
  if (ops.tournamentShopDay >= 1 && ops.petMartClaimDay < ops.tournamentShopDay) {
    alerts.push(
      alert('General', 'pet-mart', 'You have unclaimed free gems from the Pet Mart', 'data/PremiumGem')
    );
  }
  if (
    account.companionsOwned > 0 &&
    ops.tournamentDay >= 1 &&
    ops.tournamentRegisteredThrough <= ops.tournamentDay
  ) {
    alerts.push(
      alert(
        'General',
        'tournament',
        'You have not registered for the current Pet Tournament',
        'data/TournyRank0'
      )
    );
  }
  const crystalsLeft = Math.max(0, CRYSTAL_FLOOR - ops.crystalKillsToday);
  if (crystalsLeft > 0) {
    alerts.push(
      alert(
        'General',
        'daily-crystals',
        `You have ${crystalsLeft} daily guaranteed crystal kill${crystalsLeft === 1 ? '' : 's'} remaining`,
        'afk_targets/Crystal_Carrot'
      )
    );
  }
  const extraChars = extraCharacterSlots(account);
  if (extraChars > 0) {
    alerts.push(
      alert(
        'General',
        'new-characters',
        `You can create ${extraChars} new character${extraChars === 1 ? '' : 's'}`,
        'etc/CharFam0'
      )
    );
  }
  if (!ops.randomEventDoneToday && world >= 1) {
    alerts.push(alert('General', 'random-event', "You haven't done a random event today", 'etc/Mega_Grumblo'));
  }
  for (const boss of ops.miniBosses) {
    if (boss.unlocked && boss.current >= MINI_BOSS_THRESHOLD) {
      alerts.push(
        alert(
          'General',
          `miniboss-${boss.rawName}`,
          `You can kill ${boss.current} ${boss.name}s`,
          `etc/${boss.rawName}`
        )
      );
    }
  }
  for (const worldIndex of ops.unfinishedDailyTasks) {
    alerts.push(
      alert(
        'General',
        `task-${worldIndex}`,
        `Daily task in world ${worldIndex + 1} not done yet`,
        `etc/Merit_${worldIndex}`
      )
    );
  }
  for (const key of ops.keyDays) {
    if (key.days >= 3 && key.ready > 0) {
      alerts.push(
        alert('General', `key-${key.rawName}`, `${key.ready} of ${key.name} keys are ready`, `data/${key.rawName}`)
      );
    }
  }
  for (const ticket of ops.coloTickets) {
    if (ticket.days >= 3 && ticket.ready > 0 && world > COLO_WORLD[ticket.rawName]) {
      alerts.push(
        alert(
          'General',
          `tix-${ticket.rawName}`,
          `${ticket.ready} of ${ticket.name} tickets are ready`,
          `data/${ticket.rawName}`
        )
      );
    }
  }
  if (ops.dungeonTraitsUnpicked > 0) {
    alerts.push(
      alert('General', 'dungeon-traits', "You haven't selected a dungeon trait", 'data/DungTraitB0')
    );
  }
  if (ops.shopItemsLeft > 0) {
    alerts.push(
      alert(
        'General',
        'shops',
        `${ops.shopItemsLeft} shop item${ops.shopItemsLeft === 1 ? '' : 's'} still in stock`,
        'data/ShopEZ0'
      )
    );
  }
  if (ops.guildDailyLeft > 0) {
    alerts.push(
      alert(
        'General',
        'guild-daily',
        `You have ${ops.guildDailyLeft} uncompleted daily guild tasks`,
        'etc/GP'
      )
    );
  }
  if (ops.guildWeeklyLeft > 0) {
    alerts.push(
      alert(
        'General',
        'guild-weekly',
        `You have ${ops.guildWeeklyLeft} uncompleted weekly guild tasks`,
        'etc/GP'
      )
    );
  }

  if (world >= 1 && ops.gildedStamps > 0) {
    alerts.push(
      alert(
        'World 1',
        'gilded-stamps',
        `You have ${ops.gildedStamps} available gilded stamps`,
        'data/GildedStamp'
      )
    );
  }
  if (world >= 1 && ops.affordableStampCount > 0) {
    alerts.push(
      alert(
        'World 1',
        'affordable-stamps',
        `You can afford to max ${ops.affordableStampCount} stamp${ops.affordableStampCount === 1 ? '' : 's'} (${ops.affordableStampPercent}% of coins)`,
        'data/StampA34'
      )
    );
  }
  if (ops.owlRestartCostReady) {
    alerts.push(alert('World 1', 'owl-restart', 'Feather restart can be upgraded', 'etc/Owl_4'));
  }
  if (ops.owlMegaRestartCostReady) {
    alerts.push(alert('World 1', 'owl-mega', 'Mega feather restart can be upgraded', 'etc/Owl_8'));
  }
  if (world >= 1 && ops.forgeEmptySlots > 0) {
    alerts.push(alert('World 1', 'forge-empty', 'You have empty forge slots', 'data/ForgeA'));
  }

  if (world >= 2) {
    if (ops.islandAfkDays >= ISLAND_AFK_THRESHOLD) {
      alerts.push(
        alert(
          'World 2',
          'islands-afk',
          `You haven't claimed your islands' content in ${ops.islandAfkDays} days`,
          'data/Island1'
        )
      );
    }
    if (!ops.shimmerClaimed && account.islandsUnlocked > 0) {
      alerts.push(
        alert(
          'World 2',
          'shimmer',
          "You haven't claimed your shimmer's trial reward this week",
          'etc/Shimmer_Currency'
        )
      );
    }
    if (ops.islandTrash >= garbageUpgradeCost(ops.garbageUpgradeLevel) && ops.islandTrash > 0) {
      alerts.push(
        alert(
          'World 2',
          'garbage',
          "You have enough garbage to buy a 'Garbage Gain' upgrade in trash island",
          'etc/Trash_Currency'
        )
      );
    }
    if (ops.bargainMultiplier === 0) {
      alerts.push(
        alert('World 2', 'bargain-tag', "You haven't used bargain tag even once today", 'data/aShopItems10')
      );
    }
    if (ops.alchemyGemMultiplier === 0) {
      alerts.push(
        alert('World 2', 'alch-gems', "You haven't bought alchemy gems even once today", 'data/PremiumGem')
      );
    }
    if (ops.alternateParticles > 0) {
      alerts.push(
        alert(
          'World 2',
          'particles',
          `You have ${ops.alternateParticles} alternate particles upgrades available`,
          'etc/Particle'
        )
      );
    }
    if (!ops.weeklyBossDone) {
      alerts.push(
        alert('World 2', 'weekly-boss', "You haven't done a weekly (W2) boss fight this week", 'data/Trophie')
      );
    }
    const killroyCap = ops.killroyThirdRoom ? 321 : 21;
    if (ops.killroyWeekProgress === 0 || (ops.killroyWeekProgress < killroyCap && world >= 4)) {
      alerts.push(alert('World 2', 'killroy', "You haven't done a killroy this week", 'etc/Killroy'));
    }
    if (ops.killroyUnder100.length > 0) {
      const names = ops.killroyUnder100.map((monster) => cleanLabel(monster.name)).join(', ');
      alerts.push(
        alert(
          'World 2',
          'killroy-under-100',
          `Killroy includes a monster with less than 100 kills (${names})`,
          'etc/KillroyPrime'
        )
      );
    }
    if (ops.killroySkulls > 0) {
      alerts.push(
        alert(
          'World 2',
          'killroy-skulls',
          `You have ${ops.killroySkulls} unspent killroy skull${ops.killroySkulls === 1 ? '' : 's'}`,
          'etc/Killroy_Skull'
        )
      );
    }
    if (ops.arcadeAfkSec >= 12 * 3600) {
      alerts.push(alert('World 2', 'arcade-balls', 'Max ball capacity has been reached', 'data/PachiBall0'));
    }
    for (const upgrade of ops.arcadeUnmaxed) {
      alerts.push(
        alert(
          'World 2',
          `arcade-rot-${upgrade.index}`,
          `Arcade rotation upgrade "${cleanLabel(upgrade.effect)}" is not maxed (Lv ${upgrade.level})`,
          `data/PachiShopICON${upgrade.index}`
        )
      );
    }
    ops.liquids.forEach((current, index) => {
      if (current >= 200) {
        alerts.push(
          alert('World 2', `liquid-${index}`, `${ordinal(index + 1)} liquid is full`, `data/Liquid${index + 1}_x1`)
        );
      }
    });
    for (const shipment of ops.poShipments) {
      if (!shipment.completedAnOrder) {
        alerts.push(
          alert(
            'World 2',
            `po-${shipment.index}`,
            `You haven't completed an order for shipment #${shipment.index + 1} today`,
            'data/UIlilbox'
          )
        );
      }
    }
    if (ops.vialAttempts > 0) {
      alerts.push(alert('World 2', 'vial-attempts', 'You have available vial attempts', 'data/aVials1'));
    }
    for (const vial of ops.vialsReady) {
      alerts.push(
        alert(
          'World 2',
          `vial-${vial.rawName}`,
          `You have enough materials to upgrade ${cleanLabel(vial.name)} vial`,
          `data/${vial.rawName}`
        )
      );
    }
    for (const sigil of ops.sigilsReady) {
      alerts.push(
        alert(
          'World 2',
          `sigil-${sigil.index}`,
          `${cleanLabel(sigil.name)} is already unlocked`,
          `data/aSiga${sigil.index}`
        )
      );
    }
    if (ops.option(267) > 0 && ops.kangarooShinyPct > KANGAROO_SHINY_THRESHOLD) {
      alerts.push(
        alert(
          'World 2',
          'kangaroo-shiny',
          `You have reached your shiny % threshold of ${KANGAROO_SHINY_THRESHOLD}% (${Math.round(ops.kangarooShinyPct)}%)`,
          'etc/KShiny'
        )
      );
    }
    if (ops.kangarooFisherooReady) {
      alerts.push(alert('World 2', 'fisheroo-reset', 'Fisheroo Reset can be upgraded', 'etc/KUpga_6'));
    }
    if (ops.kangarooGreatestCatchReady) {
      alerts.push(alert('World 2', 'greatest-catch', 'Greatest Catch can be upgraded', 'etc/KUpga_11'));
    }
  }

  if (world >= 3) {
    for (const item of ops.printerFull) {
      alerts.push(
        alert(
          'World 3',
          `printer-${item.rawName}`,
          `Printing is at maximum (storage) capacity for ${cleanLabel(item.name)}`,
          `data/${item.rawName}`
        )
      );
    }
    if (ops.libraryBooks >= LIBRARY_BOOK_THRESHOLD) {
      alerts.push(
        alert('World 3', 'library', `Library has ${ops.libraryBooks} books ready`, 'data/Libz')
      );
    }
    if (ops.flagsReady > 0) {
      alerts.push(
        alert(
          'World 3',
          'flags',
          `There are ${ops.flagsReady} flags finished on the construction board`,
          'data/CogFLflag'
        )
      );
    }
    if (ops.equinoxCharge >= ops.equinoxChargeRequired && ops.equinoxChargeRequired > 0) {
      alerts.push(alert('World 3', 'equinox-bar', 'Your Equinox bar is full', 'data/Quest78'));
    }
    if (ops.equinoxChallengesReady > 0) {
      alerts.push(
        alert(
          'World 3',
          'equinox-challenges',
          `You have ${ops.equinoxChallengesReady} challenges to validate`,
          'data/Quest78'
        )
      );
    }
    if (ops.trapsOverdue > 0) {
      alerts.push(
        alert('World 3', 'traps', `${ops.trapsOverdue} traps are overdue`, 'data/TrapBoxSet1')
      );
    }
    if (ops.foodLustMaxed) {
      alerts.push(alert('World 3', 'food-lust', 'Food Lust is maxed', 'etc/Dream_Upgrade_10'));
    }
    if (ops.stampReducerPct >= STAMP_REDUCER_THRESHOLD) {
      alerts.push(
        alert(
          'World 3',
          'stamp-reducer',
          `Stamp reducer has reached your threshold (${STAMP_REDUCER_THRESHOLD}%)`,
          'data/Atom0'
        )
      );
    }
    for (const salt of ops.refineryMissing) {
      alerts.push(
        alert(
          'World 3',
          `refinery-mats-${salt.rawName}`,
          `${cleanLabel(salt.saltName)} is missing refinery materials`,
          `data/${salt.rawName}`
        )
      );
    }
    for (const salt of ops.refineryRankUp) {
      alerts.push(
        alert(
          'World 3',
          `refinery-rank-${salt.rawName}`,
          `${cleanLabel(salt.saltName)} is ready to rank up`,
          `data/${salt.rawName}`
        )
      );
    }
    for (const building of ops.buildingsReady) {
      alerts.push(
        alert(
          'World 3',
          `building-${building.index}`,
          `${building.name} is ready to be built`,
          `data/ConTower${building.index}`
        )
      );
    }
    for (const hat of ops.missingHats) {
      alerts.push(
        alert(
          'World 3',
          `hat-${hat.rawName}`,
          `${cleanLabel(hat.name)} is missing from hat rack`,
          `data/${hat.rawName}`
        )
      );
    }
  }

  if (world >= 4) {
    const spicesLeft = SPICE_CLICK_CAP - ops.spiceClaims;
    if (spicesLeft > 0 && account.kitchensOwned > 0) {
      alerts.push(
        alert('World 4', 'spices', `You have ${spicesLeft} spice clicks left`, 'data/CookingSpice0')
      );
    }
    const eggsFilled = ops.breedingEggs.filter((level) => level > 0).length;
    if (ops.breedingEggs.length >= 15 && eggsFilled === 15) {
      alerts.push(alert('World 4', 'eggs', 'Eggs are at full capacity', 'data/PetEgg1'));
    }
    for (const pet of ops.shinyPets) {
      const reached =
        pet.shinyLevel === 20 ? 'level 20 (max)' : `the shiny threshold (${SHINY_LEVEL_THRESHOLD})`;
      alerts.push(
        alert(
          'World 4',
          `shiny-${pet.rawName}`,
          `${cleanLabel(pet.name)} has reached ${reached}`,
          `afk_targets/${pet.rawName}`
        )
      );
    }
    for (const pet of ops.breedabilityPets) {
      alerts.push(
        alert(
          'World 4',
          `breed-${pet.rawName}`,
          `${cleanLabel(pet.name)} has surpassed the breedability level threshold (${BREEDABILITY_LEVEL_THRESHOLD})`,
          `afk_targets/${pet.rawName}`
        )
      );
    }
    for (const chip of ops.labChipsReady) {
      alerts.push(
        alert(
          'World 4',
          `lab-chip-${chip.rawName}`,
          `You can claim ${cleanLabel(chip.name)} in chip repository`,
          `data/${chip.rawName}`
        )
      );
    }
    for (const jewel of ops.labJewelsReady) {
      alerts.push(
        alert(
          'World 4',
          `lab-jewel-${jewel.rawName}`,
          `You can claim ${cleanLabel(jewel.name)} in jewel repository`,
          `data/${jewel.rawName}`
        )
      );
    }
    for (const meal of ops.mealsReady) {
      alerts.push(
        alert(
          'World 4',
          `meal-${meal.rawName}`,
          `${cleanLabel(meal.name)} is ready to be leveled up`,
          `data/${meal.rawName}`
        )
      );
    }
    if (ops.emptyRibbonSlots !== null && ops.emptyRibbonSlots <= RIBBON_EMPTY_THRESHOLD) {
      alerts.push(
        alert(
          'World 4',
          'ribbons',
          `You have reached your threshold of ${ops.emptyRibbonSlots} empty ribbon slots`,
          'data/Ribbon0'
        )
      );
    }
    if (ops.cookingMasteryPurple > 0) {
      alerts.push(
        alert(
          'World 4',
          'cook-mastery-purple',
          `You have ${ops.cookingMasteryPurple} unspent purple Cooking Mastery point${ops.cookingMasteryPurple === 1 ? '' : 's'}`,
          'etc/CookingMastery'
        )
      );
    }
    if (ops.cookingMasteryYellow > 0) {
      alerts.push(
        alert(
          'World 4',
          'cook-mastery-yellow',
          `You have ${ops.cookingMasteryYellow} unspent yellow Cooking Mastery point${ops.cookingMasteryYellow === 1 ? '' : 's'}`,
          'etc/CookingMastery'
        )
      );
    }
  }

  if (world >= 5) {
    if (ops.gamingSproutsCapacity > 0 && ops.gamingSprouts >= ops.gamingSproutsCapacity) {
      alerts.push(
        alert(
          'World 5',
          'gaming-sprouts',
          `Max sprouts capacity has reached (${ops.gamingSprouts})`,
          'etc/Sprouts'
        )
      );
    }
    if (ops.gamingSproutsCapacity > 0 && ops.gamingDrops >= ops.gamingSproutsCapacity) {
      alerts.push(
        alert(
          'World 5',
          'gaming-drops',
          `Sprinkler drops has reached it's capacity (${ops.gamingDrops})`,
          'data/GamingItem0b'
        )
      );
    }
    if (ops.gamingSquirrelUnlocked && ops.gamingSquirrelHours >= GAMING_HOURS_THRESHOLD) {
      alerts.push(
        alert(
          'World 5',
          'gaming-squirrel',
          `${ops.gamingSquirrelHours} hours has passed since you've clicked the squirrel`,
          'data/GamingItem2'
        )
      );
    }
    if (ops.gamingShovelUnlocked && ops.gamingShovelHours >= GAMING_HOURS_THRESHOLD) {
      alerts.push(
        alert(
          'World 5',
          'gaming-shovel',
          `${ops.gamingShovelHours} hours has passed since you've clicked the shovel`,
          'data/GamingItem1'
        )
      );
    }
    if (account.sailingBoats > 0 && ops.option(124) >= 259200) {
      alerts.push(
        alert('World 5', 'sailing-chests', "You've reached the maximum capacity of chests", 'npcs/Chesty')
      );
    }
    if (ops.betterShopCaptains > 0) {
      alerts.push(
        alert(
          'World 5',
          'sailing-captains',
          `${ops.betterShopCaptains} shop captain${ops.betterShopCaptains === 1 ? ' is' : 's are'} better than your current crew`,
          'etc/Captain_0'
        )
      );
    }
    if (ops.holeSedimentReady) {
      alerts.push(
        alert('World 5', 'hole-buckets', 'One of your sediments has reached the threshold', 'data/HoleWellBucket0')
      );
    }
    if (ops.holeMotherlodeMaxed) {
      alerts.push(
        alert('World 5', 'hole-motherlode', 'You can break a layer in the motherlode cavern', 'data/Motherlode_x1')
      );
    }
    if (ops.holeHiveMaxed) {
      alerts.push(alert('World 5', 'hole-hive', 'You can break a layer in the hive cavern', 'etc/TheHive'));
    }
    if (ops.holeEvertreeMaxed) {
      alerts.push(
        alert('World 5', 'hole-evertree', 'You can break a layer in the evertree cavern', 'data/MotherlodeTREE_x1')
      );
    }
    if (ops.holeTrenchMaxed) {
      alerts.push(
        alert(
          'World 5',
          'hole-trench',
          'You can break a layer in the bottomless trench cavern',
          'data/MotherlodeFISH_x1'
        )
      );
    }
    if (ops.holeBraveryReady) {
      alerts.push(
        alert('World 5', 'hole-bravery', 'You can hear a story in the bravery cavern', 'etc/Bravery_Statue')
      );
    }
    if (ops.holeJusticeReady) {
      alerts.push(
        alert('World 5', 'hole-justice', 'You can hear a story in the justice cavern', 'data/Justice_Monument_x1')
      );
    }
    if (ops.holeWisdomReady) {
      alerts.push(
        alert('World 5', 'hole-wisdom', 'You can play a memory game in the wisdom cavern', 'data/Wisdom_Monument_x1')
      );
    }
    if (ops.holeBellReady) {
      alerts.push(alert('World 5', 'hole-bell', 'One of your cavern bells is ready', 'etc/TheBell'));
    }
    if (ops.holeHarpReady) {
      alerts.push(alert('World 5', 'hole-harp', 'Harp power has reached the threshold', 'etc/TheHarp'));
    }
    if (ops.holeGrottoReady) {
      alerts.push(alert('World 5', 'hole-grotto', 'You can kill the monarch', 'etc/Grotto'));
    }
    if (ops.holeJars >= HOLE_JAR_THRESHOLD) {
      alerts.push(
        alert('World 5', 'hole-jars', `You can break ${ops.holeJars} jars in the jars cavern`, 'etc/Jar_0')
      );
    }
    if (ops.holeJarsFull > 0) {
      alerts.push(
        alert(
          'World 5',
          'hole-jars-full',
          `${ops.holeJarsFull} jar slot${ops.holeJarsFull === 1 ? ' is' : 's are'} full and ready to open`,
          'etc/Jar_4'
        )
      );
    }
    for (const villager of ops.holeVillagersReady) {
      alerts.push(
        alert(
          'World 5',
          `villager-${villager.index}`,
          `${villager.name} is ready to level up`,
          `etc/Villager_${villager.index}`
        )
      );
    }
    for (const study of ops.holeStudiesReady) {
      alerts.push(
        alert(
          'World 5',
          `study-${study.index}`,
          `${study.name} study is ready to level up`,
          'etc/Study_Rate'
        )
      );
    }
  }

  if (world >= 6) {
    if (ops.sneakingLastLootedSec / 60 >= SNEAKING_LOOT_MINUTES && account.sneakingJadeUpgrades > 0) {
      alerts.push(
        alert(
          'World 6',
          'sneaking-loot',
          `You haven't looted rewards from sneaking for ${Math.floor(ops.sneakingLastLootedSec / 60)} minutes`,
          'data/NjUpgI14'
        )
      );
    }
    const pristineLeft = Math.max(0, 120 - ops.sneakingCharmRolls);
    if (pristineLeft > 0 && account.sneakingJadeUpgrades > 0) {
      alerts.push(
        alert(
          'World 6',
          'pristine-rolls',
          `${pristineLeft} pristine charm rolls remaining (${ops.sneakingCharmRolls}/120 used)`,
          'data/NjTrP0'
        )
      );
    }
    const symbolLeft = Math.max(0, 75 - ops.sneakingCharmRolls);
    if (symbolLeft > 0 && account.sneakingJadeUpgrades > 0) {
      alerts.push(
        alert(
          'World 6',
          'symbol-rolls',
          `${symbolLeft} symbol rolls remaining (${ops.sneakingCharmRolls}/75 used)`,
          'data/NjTrP0'
        )
      );
    }
    if (ops.summonAttempts > 0) {
      alerts.push(
        alert(
          'World 6',
          'summon-attempts',
          `You have ${ops.summonAttempts} summoning battle attempts`,
          'data/Heart'
        )
      );
    }
    if (ops.summonFamiliarLevel < ops.summonFamiliarMax && ops.summonFamiliarLevel < FAMILIAR_LEVEL_THRESHOLD) {
      alerts.push(
        alert(
          'World 6',
          'summon-familiar',
          `Summoning familiar bonus isn't maxed (${ops.summonFamiliarLevel}/${ops.summonFamiliarMax})`,
          'data/SumUpgIc2'
        )
      );
    }
    if (ops.farmEmptyPlots > 0) {
      alerts.push(
        alert(
          'World 6',
          'farm-empty',
          `You have ${ops.farmEmptyPlots} seeds available to be planted`,
          'data/FarmPlant1'
        )
      );
    }
    if (ops.farmOgPlots > 0) {
      const ogMulti = Math.min(1e9, Math.max(1, Math.pow(2, FARM_OG_THRESHOLD)));
      alerts.push(
        alert(
          'World 6',
          'farm-og',
          `${ops.farmOgPlots} plots reached the threshold of ${FARM_OG_THRESHOLD} OGs (x${ogMulti})`,
          'data/ClassIcons57'
        )
      );
    }
    if (ops.farmCropsOnPlots > 0) {
      alerts.push(
        alert(
          'World 6',
          'farm-crops',
          `You have ${formatCount(ops.farmCropsOnPlots)} crops ready to be collected`,
          'data/FarmPlant6'
        )
      );
    }
    if (ops.exoticUnlocked && ops.exoticPurchased < ops.exoticMaxPurchases) {
      const available = ops.exoticMaxPurchases - ops.exoticPurchased;
      alerts.push(
        alert(
          'World 6',
          'exotic-purchases',
          `You have ${available} exotic purchase${available === 1 ? '' : 's'} available (${ops.exoticPurchased}/${ops.exoticMaxPurchases})`,
          'data/FarmStT3'
        )
      );
    }
    if (account.magicBeanTrade >= 100) {
      alerts.push(
        alert(
          'World 6',
          'bean-trade',
          `Your bean trade has reached ${formatCount(Math.floor(account.magicBeanTrade))}`,
          'data/Quest80_x1'
        )
      );
    }
    if (ops.emperorAttempts >= EMPEROR_ATTEMPT_THRESHOLD) {
      alerts.push(
        alert(
          'World 6',
          'emperor',
          `You have reached ${ops.emperorAttempts} emperor attempts`,
          'data/Boss6'
        )
      );
    }
  }

  if (world >= 7) {
    if (ops.pageReadsToday < 5) {
      const left = 5 - ops.pageReadsToday;
      alerts.push(
        alert(
          'World 7',
          'page-reads',
          `You have ${left} page read${left === 1 ? '' : 's'} available (${ops.pageReadsToday}/5)`,
          'data/Spelunking0'
        )
      );
    }
    if (ops.fullStaminaCharacters >= STAMINA_CHAR_THRESHOLD) {
      alerts.push(
        alert(
          'World 7',
          'full-stamina',
          `${ops.fullStaminaCharacters} character${ops.fullStaminaCharacters === 1 ? '' : 's'} ${ops.fullStaminaCharacters === 1 ? 'has' : 'have'} full stamina`,
          'data/CaveShopUpg4'
        )
      );
    }
    if (ops.overstimLevel >= OVERSTIM_THRESHOLD) {
      alerts.push(
        alert(
          'World 7',
          'overstim',
          `Overstim level has reached ${ops.overstimLevel} (threshold: ${OVERSTIM_THRESHOLD})`,
          'data/CaveShopUpg6'
        )
      );
    }
    if (ops.legendPointsLeft > 0 && ops.legendPointsSpent < ops.legendMaxSpendable) {
      alerts.push(
        alert(
          'World 7',
          'legend-points',
          `You have ${ops.legendPointsLeft} unspent legend talent point${ops.legendPointsLeft === 1 ? '' : 's'}`,
          'data/LegendTalentIcon0'
        )
      );
    }
    if (ops.masterclassCheapAvailable > 0) {
      alerts.push(
        alert(
          'World 7',
          'masterclass-cheap',
          `You have ${ops.masterclassCheapAvailable} cheaper masterclass upgrade${ops.masterclassCheapAvailable === 1 ? '' : 's'} available (${ops.masterclassCheapUsed}/${ops.masterclassCheapMax})`,
          'data/LegendTalentIcon12'
        )
      );
    }
    if (ops.doubleClusterReady) {
      alerts.push(alert('World 7', 'double-cluster', 'You can afford Double Clusters upgrade', 'etc/Cluster'));
    }
    if (ops.jeweledCogsUnlocked && ops.jeweledCogAvailable > 0) {
      alerts.push(
        alert(
          'World 7',
          'jeweled-cogs',
          `You have ${ops.jeweledCogAvailable} jeweled cog pull${ops.jeweledCogAvailable === 1 ? '' : 's'} left (${ops.jeweledCogCurrent}/${ops.jeweledCogMax})`,
          'data/CogCry0'
        )
      );
    }
    if (ops.mineheadTriesLeft > 0) {
      alerts.push(
        alert(
          'World 7',
          'minehead',
          `You have ${ops.mineheadTriesLeft} minehead attempt${ops.mineheadTriesLeft === 1 ? '' : 's'} left`,
          'data/MineHead0'
        )
      );
    }
    if (ops.researchRollsLeft > 0) {
      alerts.push(
        alert(
          'World 7',
          'research-rolls',
          `You have ${ops.researchRollsLeft} observation roll${ops.researchRollsLeft === 1 ? '' : 's'} left`,
          'data/ResObsClip'
        )
      );
    }
    if (ops.insightObservations.length > 0) {
      alerts.push(
        alert(
          'World 7',
          'research-insight',
          `${ops.insightObservations.length} observation${ops.insightObservations.length === 1 ? '' : 's'} at insight Lv. ${INSIGHT_THRESHOLD}+`,
          'data/ResMagni1',
          ops.insightObservations
            .map((obs) => `${cleanLabel(obs.name)} - Lv. ${obs.insightLevel}`)
            .join(', ')
        )
      );
    }
    if (ops.sushiFuelCapEstimate > 0 && ops.sushiFuel >= ops.sushiFuelCapEstimate) {
      alerts.push(
        alert('World 7', 'sushi-fuel', 'Sushi Station fuel is full — cook some sushi!', 'data/Sushi6')
      );
    }
    const shakerNames = [
      { name: 'Salt', icon: 'data/SushiUpg17', uses: ops.sushiShakers[0] },
      { name: 'Pepper', icon: 'data/SushiUpg18', uses: ops.sushiShakers[1] },
      { name: 'Saffron', icon: 'data/SushiUpg19', uses: ops.sushiShakers[2] }
    ];
    for (const shaker of shakerNames) {
      if (shaker.uses > 0) {
        alerts.push(
          alert(
            'World 7',
            `shaker-${shaker.name}`,
            `${shaker.name} Shaker: ${shaker.uses} use${shaker.uses === 1 ? '' : 's'} available`,
            shaker.icon
          )
        );
      }
    }
    for (const sushi of ops.sushiKnowledgeReady) {
      alerts.push(
        alert(
          'World 7',
          `sushi-kn-${sushi.index}`,
          `${cleanLabel(sushi.name)} is ready for knowledge level-up (Lv.${sushi.level})`,
          `data/Sushi${sushi.index}`
        )
      );
    }
    if (ops.buttonSkips > 0 && !ops.buttonTaskReady) {
      alerts.push(
        alert(
          'World 7',
          'button-skips',
          `${ops.buttonSkips} insta-skip${ops.buttonSkips === 1 ? '' : 's'} available - current task can be skipped`,
          'etc/ButtonG',
          ops.buttonTaskDescription || undefined
        )
      );
    }
    if (ops.buttonTaskReady) {
      alerts.push(
        alert(
          'World 7',
          'button-task',
          'Button task ready - no insta-skip needed',
          'etc/ButtonG',
          ops.buttonTaskDescription || undefined
        )
      );
    }
    for (const trophy of ops.missingTrophies) {
      alerts.push(
        alert(
          'World 7',
          `trophy-${trophy.rawName}`,
          `${cleanLabel(trophy.name)} is missing from gallery`,
          `data/${trophy.rawName}`
        )
      );
    }
    for (const nametag of ops.missingNametags) {
      alerts.push(
        alert(
          'World 7',
          `nametag-${nametag.rawName}`,
          `${cleanLabel(nametag.name)} is missing from gallery`,
          `data/${nametag.rawName}`
        )
      );
    }
  }

  return alerts;
}

const COLO_WORLD: Record<string, number> = {
  TixEZ0: 0,
  TixEZ1: 1,
  TixEZ2: 2
};

function extraCharacterSlots(account: ParsedAccount): number {
  const count = account.characters.length;
  const totalLevels = account.characters.reduce((sum, character) => sum + character.combatLevel, 0);
  const gates = [
    { chars: 5, levels: 300 },
    { chars: 6, levels: 500 },
    { chars: 7, levels: 750 },
    { chars: 8, levels: 1100 },
    { chars: 9, levels: 1500 },
    { chars: 10, levels: 5000 }
  ];
  return gates.filter((gate) => count === gate.chars && totalLevels >= gate.levels).length;
}

function garbageUpgradeCost(level: number): number {
  return 7 * Math.pow(1.4, level);
}

function ordinal(value: number): string {
  const rem10 = value % 10;
  const rem100 = value % 100;
  if (rem10 === 1 && rem100 !== 11) return `${value}st`;
  if (rem10 === 2 && rem100 !== 12) return `${value}nd`;
  if (rem10 === 3 && rem100 !== 13) return `${value}rd`;
  return `${value}th`;
}

export function groupAlertsByWorld(alerts: DashboardAlert[]): { world: string; items: DashboardAlert[] }[] {
  return DASHBOARD_ALERT_WORLDS.map((world) => ({
    world,
    items: alerts.filter((item) => item.world === world)
  })).filter((group) => group.items.length > 0);
}
