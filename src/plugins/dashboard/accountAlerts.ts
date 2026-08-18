import { formatCount } from '../../core/parse/helpers';
import type { DashboardAlert, ParsedAccount } from '../../core/parse/types';

const MINI_BOSS_THRESHOLD = 2;
const LIBRARY_BOOK_THRESHOLD = 20;
const ISLAND_AFK_THRESHOLD = 1;
const SPICE_CLICK_CAP = 100;
const CRYSTAL_FLOOR = 4;
const BOSS_GEM_CAP = 600;

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
  }

  if (world >= 3) {
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
  }

  if (world >= 5 && account.sailingBoats > 0 && ops.option(124) >= 259200) {
    alerts.push(
      alert('World 5', 'sailing-chests', "You've reached the maximum capacity of chests", 'npcs/Chesty')
    );
  }

  if (world >= 6) {
    if (ops.sneakingLastLootedSec / 60 >= 60 && account.sneakingJadeUpgrades > 0) {
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
    if (ops.farmHighOgPlots > 0) {
      alerts.push(
        alert(
          'World 6',
          'farm-og',
          `${ops.farmHighOgPlots} plots reached 4+ OGs`,
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
    if (ops.emperorAttempts >= 8) {
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
    if (ops.buttonSkips > 0) {
      alerts.push(
        alert(
          'World 7',
          'button-skips',
          `${ops.buttonSkips} insta-skip${ops.buttonSkips === 1 ? '' : 's'} available`,
          'etc/ButtonG'
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
