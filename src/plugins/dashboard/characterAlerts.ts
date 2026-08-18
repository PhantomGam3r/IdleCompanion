import type { CharacterAlert, ParsedAccount } from '../../core/parse/types';

const ANVIL_POINTS_THRESHOLD = 1;
const POST_OFFICE_BOX_THRESHOLD = 1;

function alert(
  characterIndex: number,
  characterName: string,
  classId: number,
  id: string,
  title: string,
  icon: string,
  detail?: string
): CharacterAlert {
  return { characterIndex, characterName, classId, id, title, icon, detail };
}

function clean(value: string): string {
  return value.replace(/_/g, ' ');
}

function ringScore(item: { uq1: number; uq2: number }): number {
  return item.uq1 + item.uq2;
}

function acWandDamage(item: { weaponPower: number; uq1: number }): number {
  return Math.pow(1.04, item.weaponPower) * (1 + item.uq1 / 100);
}

export function collectCharacterAlerts(account: ParsedAccount): CharacterAlert[] {
  const alerts: CharacterAlert[] = [];
  const world = account.highestWorld;

  for (const character of account.characters) {
    const ops = account.characterOps[character.index] ?? account.characterOps.find((row) => row.index === character.index);
    if (!ops) continue;
    const name = character.name;
    const classId = character.classId;
    const push = (id: string, title: string, icon: string, detail?: string) => {
      alerts.push(alert(character.index, name, classId, `${character.index}-${id}`, title, icon, detail));
    };

    if (character.combatLevel >= 50 && ops.cardSetRaw === 'CardSet0') {
      push('card-set', `${name} has the Blunder Hills card set equipped, which is for combat below 50`, 'data/CardSet0');
    } else if (
      ops.afkKind === 'fighting' &&
      SKILLING_SETS.has(ops.cardSetRaw) &&
      !(classId === 14 && ops.wraithForm)
    ) {
      push('card-set', `${name} is fighting but has a skilling card set equipped`, `data/${ops.cardSetRaw || 'CardSet2'}`);
    } else if (ops.afkKind === 'skilling' && FIGHTING_SETS.has(ops.cardSetRaw)) {
      push('card-set', `${name} is skilling but has a fighting card set equipped`, `data/${ops.cardSetRaw || 'CardSet4'}`);
    }
    if (ops.passiveCards > 0) {
      push('passive-cards', `${name} has ${ops.passiveCards} passive card${ops.passiveCards === 1 ? '' : 's'} equipped`, 'data/CardsY0');
    }

    if (ops.anvilAvailablePoints >= ANVIL_POINTS_THRESHOLD) {
      push(
        'anvil-points',
        `${name} has ${ops.anvilAvailablePoints} unspent anvil points`,
        'data/ClassIcons43'
      );
    }
    const missingHammers = ops.anvilMaxHammers - ops.anvilHammersUsed;
    if (missingHammers > 0) {
      push('anvil-hammers', `${name} has ${missingHammers} unused anvil hammer${missingHammers === 1 ? '' : 's'}`, 'data/ClassIcons43');
    }
    for (const slot of ops.anvilOverdue) {
      const full = slot.minutesUntilCap <= 0;
      push(
        `anvil-overdue-${slot.rawName}`,
        full ? `${name}'s ${slot.name} is full` : `${name}'s ${slot.name} is ${Math.max(1, Math.round(slot.minutesUntilCap))} minutes from cap`,
        `data/${slot.rawName}`
      );
    }

    if (world >= 3) {
      if (ops.unendingEnergy && ops.afkHours > 10) {
        push('unending-energy', `${name} has Unending Energy equipped with more than 10 hours of AFK time`, 'data/Prayer2');
      }
      const fivePercent = (5 * ops.worshipMax) / 100;
      if (ops.worshipMax > 0 && ops.worshipCurrent >= ops.worshipMax - fivePercent) {
        push('worship-charge', `${name}'s worship charge is almost full`, 'data/ClassIcons50');
      }
      if (ops.trapCount < Math.min(ops.trapMax, 8)) {
        push('missing-traps', `${name} has unused trap slots`, 'data/TrapBoxSet1');
      }
      if (ops.trapsOverdue) {
        push('traps-overdue', `${name}'s traps are ready to collect`, 'data/TrapBoxSet1');
      }
    }

    if (!ops.sheepie && ops.equippedBubbles < ops.maxBubbles) {
      push('missing-bubbles', `${name} has unused bubble slots`, 'data/aBrewOptionA0');
    }
    if (ops.alchemyActivity === -1) {
      push('alchemy-idle', `${name} has no alchemy activity selected`, 'data/aStirringStick0');
    }

    if (world >= 2 && ops.emptyObols > 0) {
      push('missing-obols', `${name} has ${ops.emptyObols} empty obol slots`, 'etc/ObolEmpty1');
    }
    if (world >= 2 && ops.postOfficeUnspent > POST_OFFICE_BOX_THRESHOLD && ops.postOfficeUnmaxed) {
      push(
        'po-unspent',
        `${name} has unspent Post Office boxes`,
        'data/DeliveryBox',
        `${Math.round(ops.postOfficeUnspent)} leftover`
      );
    }

    const missingSigns = ops.starSignsMax - ops.starSignsEquipped;
    if (!ops.allStarSignsInfinite && missingSigns > 0) {
      push('star-signs', `${name} has ${missingSigns} unused star sign slot${missingSigns === 1 ? '' : 's'}`, 'data/StarSign1');
    }

    for (const skill of ops.crystalCountdown) {
      const ready = skill.max > 0 && Math.floor(skill.reduction) >= Math.floor(skill.max);
      push(
        `crystal-${skill.skill}`,
        ready
          ? `Crystal countdown for ${skill.skill} is maxed at ${Math.round(skill.reduction * 100) / 100}%`
          : `Crystal countdown for ${skill.skill} is ${Math.round(skill.reduction * 100) / 100}% (max ${Math.round(skill.max * 100) / 100}%)`,
        `data/${skill.icon}`
      );
    }

    for (const tool of ops.betterTools) {
      push(`tool-${tool.rawName}`, `${name} can equip a better ${tool.displayName}`, `data/${tool.rawName}`);
    }

    if (ops.isMeditating && ops.divinityLevel >= 80 && ops.divinityStyleName !== 'Mindful') {
      push('divinity-style', `${name} doesn't have Mindful style equipped`, 'data/Div_Style_7');
    } else if (!ops.isMeditating && ops.divinityLevel >= 40 && ops.divinityStyleName !== 'TranQi') {
      push('divinity-style', `${name} doesn't have TranQi style equipped`, 'data/Div_Style_5');
    }

    for (const talent of ops.readyTalents) {
      push(`talent-${talent.talentId}`, `${talent.name} is ready`, `data/UISkillIcon${talent.talentId}`);
    }
    if (ops.superTalentLeft > 0) {
      push('super-talents', `${name} has ${ops.superTalentLeft} super talent point${ops.superTalentLeft === 1 ? '' : 's'} left to spend`, 'data/ClassIcons61');
    }

    for (const item of ops.upgradeSlots) {
      push(
        `upgrade-${item.rawName}`,
        `${clean(item.displayName)} has ${item.slots} upgrade slot${item.slots === 1 ? '' : 's'} left`,
        `data/${item.rawName}`
      );
    }

    const isArcane = classId === 40;
    const isWind = classId === 28;
    if (isArcane && !ops.arcanistForm) {
      if (ops.weaponRaw.includes('EquipmentWandsArc')) {
        push('ac-weapon', `${name} is wearing an Arcanist weapon outside Arcanist Form`, `data/${ops.weaponRaw}`);
      }
      if (ops.ringARaw.includes('EquipmentRingsArc') || ops.ringBRaw.includes('EquipmentRingsArc')) {
        push('ac-rings', `${name} is wearing an Arcanist ring outside Arcanist Form`, 'data/EquipmentRingsArc');
      }
    }
    if (isWind && !ops.tempestForm) {
      if (ops.weaponRaw.includes('EquipmentBowsTempest')) {
        push('ww-weapon', `${name} is wearing a Tempest weapon outside Tempest Form`, `data/${ops.weaponRaw}`);
      }
      if (ops.ringARaw.includes('EquipmentRingsTempest') || ops.ringBRaw.includes('EquipmentRingsTempest')) {
        push('ww-rings', `${name} is wearing a Tempest ring outside Tempest Form`, 'data/EquipmentRingsTempest');
      }
    }
    if (isWind && ops.tempestForm) {
      const equipped = ops.inventory.find((item) => item.rawName === ops.weaponRaw);
      const better = ops.inventory.find((item) => {
        if (!item.rawName.includes('EquipmentBowsTempest')) return false;
        return item.uq1txt === (equipped?.uq1txt ?? '') && item.weaponPower > (equipped?.weaponPower ?? 0);
      });
      if (better) {
        push('better-weapon', `${name} has a stronger Tempest bow in inventory`, `data/${better.rawName}`);
      }
    }
    if (isArcane && ops.arcanistForm) {
      const equippedWp = acWandDamage({
        weaponPower: ops.inventory.find((item) => item.rawName === ops.weaponRaw)?.weaponPower ?? 0,
        uq1: ops.inventory.find((item) => item.rawName === ops.weaponRaw)?.uq1 ?? 0
      });
      const better = ops.inventory.find(
        (item) => item.rawName.includes('EquipmentWandsArc') && acWandDamage(item) > equippedWp
      );
      if (better) {
        push('better-weapon', `${name} has a stronger Arcanist wand in inventory`, `data/${better.rawName}`);
      }
    }
    const findBetterRing = (family: string, equippedNames: string[]) =>
      ops.inventory.find((invRing) => {
        if (!invRing.rawName.includes(family)) return false;
        return equippedNames.some((equippedName) => {
          if (equippedName !== invRing.rawName) return false;
          const equipped = ops.inventory.find((item) => item.rawName === equippedName);
          return ringScore(invRing) > ringScore(equipped ?? { uq1: 0, uq2: 0 });
        });
      });
    if (isArcane && ops.arcanistForm) {
      const betterRing = findBetterRing('EquipmentRingsArc', [ops.ringARaw, ops.ringBRaw]);
      if (betterRing) {
        push('better-ring', `${name} has a stronger Arcanist ring in inventory`, `data/${betterRing.rawName}`);
      }
    }
    if (isWind && ops.tempestForm) {
      const betterRing = findBetterRing('EquipmentRingsTempest', [ops.ringARaw, ops.ringBRaw]);
      if (betterRing) {
        push('better-ring', `${name} has a stronger Tempest ring in inventory`, `data/${betterRing.rawName}`);
      }
    }
  }

  return alerts;
}

const SKILLING_SETS = new Set(['CardSet2', 'CardSet3', 'CardSet5', 'CardSet7']);
const FIGHTING_SETS = new Set(['CardSet4', 'CardSet6', 'CardSet8', 'CardSet7', 'CardSet26']);

export function groupCharacterAlerts(
  alerts: CharacterAlert[]
): { characterIndex: number; characterName: string; classId: number; items: CharacterAlert[] }[] {
  const groups: { characterIndex: number; characterName: string; classId: number; items: CharacterAlert[] }[] = [];
  const byIndex = new Map<number, (typeof groups)[number]>();
  for (const item of alerts) {
    let group = byIndex.get(item.characterIndex);
    if (!group) {
      group = {
        characterIndex: item.characterIndex,
        characterName: item.characterName,
        classId: item.classId,
        items: []
      };
      byIndex.set(item.characterIndex, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
