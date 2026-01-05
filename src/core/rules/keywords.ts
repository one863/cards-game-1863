// src/core/rules/keywords.ts
import { Player } from '../../types';

/**
 * Calcule le bonus passif lié au poste du joueur
 */
export const getPositionBonus = (player: Player, side: 'attacker' | 'defender', field: Player[]) => {
  let bonus = 0;
  const pos = player.pos;

  if (side === 'attacker') {
    if (pos === 'ST') bonus += 2;
    if (['LW', 'RW', 'LM', 'RM'].includes(pos)) bonus += 1;
    if (['LB', 'RB'].includes(pos)) bonus += 1;
  } else {
    if (pos === 'GK') bonus += 2;
    if (['CB', 'CDM'].includes(pos)) bonus += 1;
    if (['LB', 'RB'].includes(pos)) bonus += 1;
    
    // Bonus MOTEUR (CM) : +1 DEF à tous les alliés visibles
    if (field.some(p => p.instanceId !== player.instanceId && p.pos === 'CM' && !p.isFlipped)) {
        bonus += 1;
    }
  }

  return bonus;
};

/**
 * Calcule le bonus de puissance et retourne la liste des mots-clés actifs pour les logs
 */
export const getKeywordPowerDetails = (player: Player, side: 'attacker' | 'defender', field: Player[]) => {
  let bonus = getPositionBonus(player, side, field);
  const activeKeywords: string[] = [];
  
  // Poste bonus description
  if (side === 'attacker') {
      if (player.pos === 'ST') activeKeywords.push("ST (+2 ATT)");
      else if (['LW', 'RW', 'LM', 'RM'].includes(player.pos)) activeKeywords.push(`${player.pos} (+1 ATT)`);
      else if (['LB', 'RB'].includes(player.pos)) activeKeywords.push(`${player.pos} (+1 ATT)`);
  } else {
      if (player.pos === 'GK') activeKeywords.push("GK (+2 DEF)");
      else if (['CB', 'CDM'].includes(player.pos)) activeKeywords.push(`${player.pos} (+1 DEF)`);
      else if (['LB', 'RB'].includes(player.pos)) activeKeywords.push(`${player.pos} (+1 DEF)`);
      
      if (field.some(p => p.instanceId !== player.instanceId && p.pos === 'CM' && !p.isFlipped)) {
          activeKeywords.push("MOTEUR CM (+1 DEF)");
      }
  }

  return { bonus, list: activeKeywords.length > 0 ? activeKeywords.join(", ") : null };
};

export const getKeywordPowerBonus = (player: Player, side: 'attacker' | 'defender', field: Player[]) => {
    return getKeywordPowerDetails(player, side, field).bonus;
};

export const checkSpecialGoal = (attCard: Player, defCard: Player, defField: Player[]) => {
  return null; 
};

export const getDefenseBonuses = (defCard: Player) => {
  return {
    extraRecovery: false 
  };
};
