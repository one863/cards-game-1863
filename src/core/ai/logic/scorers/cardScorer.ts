import { GameState, Player } from '@/types';
import { AI_CONFIG } from '@/core/ai/aiConfig';

/**
 * Évalue le poids tactique d'une carte en main ou sur le terrain.
 */
export const evaluateCardWeight = (card: Player, gameState: GameState): number => {
    let weight = card.vaep;
    const aiField = gameState.opponent.field;
    const playerField = gameState.player.field;

    const aiActiveCount = aiField.filter(c => !c.isFlipped).length;
    const aiFlippedCount = aiField.filter(c => c.isFlipped).length;
    
    // Menaces adverses
    const playerHasBigThreat = playerField.some(p => !p.isFlipped && p.vaep > AI_CONFIG.THRESHOLDS.HIGH_VAEP_STAR && !p.hasActed);
    const hasStrikerThreat = playerField.some(p => !p.isFlipped && p.pos === 'ST');

    // 1. OPTIMISATION GARDIEN (GK)
    if (card.pos === 'GK') {
        const isEmergency = aiActiveCount <= 1 || hasStrikerThreat || playerHasBigThreat || aiFlippedCount >= AI_CONFIG.THRESHOLDS.MOMENTUM_DANGER_COUNT;
        if (isEmergency) {
            weight += AI_CONFIG.WEIGHTS.GK_EMERGENCY_BONUS;
        } else {
            weight += AI_CONFIG.WEIGHTS.GK_HOLD_PENALTY;
        }
    }

    // 2. RÉPONSE AUX ATTAQUES (CONTRE-JEU)
    if (aiFlippedCount > 0 && ['CB', 'LB', 'RB', 'CDM'].includes(card.pos)) {
        weight += AI_CONFIG.WEIGHTS.DEFENDER_MOMENTUM_BONUS;
    }

    // 3. COHÉRENCE TACTIQUE (SYNERGIES)
    const hasCM = aiField.some(c => c.pos === 'CM' && !c.isFlipped);
    const isMidfielder = ['CDM', 'CAM', 'LM', 'RM'].includes(card.pos);
    if (card.pos === 'CM' && aiField.some(c => isMidfielder && !c.isFlipped)) weight += AI_CONFIG.WEIGHTS.SYNERGY_BONUS;
    if (isMidfielder && hasCM) weight += AI_CONFIG.WEIGHTS.SYNERGY_BONUS;

    // 4. RÉPONSE AUX STARS
    if (playerHasBigThreat && card.vaep >= AI_CONFIG.THRESHOLDS.HIGH_VAEP_STAR) weight += AI_CONFIG.WEIGHTS.STAR_RESPONSE_BONUS;

    // 5. ÉTAT PHYSIQUE
    if (card.isFlipped) weight += AI_CONFIG.WEIGHTS.FLIPPED_PENALTY;

    return weight;
};
