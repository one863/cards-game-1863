import { GAME_RULES } from '../core/rules/settings';
import { generateTeam } from '../core/engine/playerGenerator';
import { Player } from '../types';

/**
 * Génère un deck valide
 * @param {any} _db - OBSOLÈTE : La base de données statique (on ignore)
 */
export const generateOpponentDeck = (_db: any = []): Player[] => {
  const avgStrength = Math.floor(Math.random() * 25) + 60;
  const team = generateTeam(avgStrength);
  return team.slice(0, GAME_RULES.DECK_SIZE);
};
