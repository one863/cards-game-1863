import { GameState, Player } from '../../../../types';
import { calculateTotalPowerBonus } from '../../../engine/effectSystem';

/**
 * Calcule la puissance réelle d'une carte avec tous ses bonus.
 */
export const getTruePower = (gameState: GameState, card: Player, side: 'attacker' | 'defender', field: Player[]) => {
    const ownerSide = field === gameState.player.field ? 'player' : 'opponent';
    return card.vaep + calculateTotalPowerBonus(gameState, card, ownerSide, side).bonus;
};
