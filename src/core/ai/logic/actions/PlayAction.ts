import { GameState } from '@/types';
import { evaluateCardWeight } from '../scorers/cardScorer';
import { AI_CONFIG } from '@/core/ai/aiConfig';
import { GAME_RULES } from '@/core/rules/settings';
import { ScoredAction } from './AttackAction';

export const evaluatePlayActions = (gameState: GameState): ScoredAction => {
    const ai = gameState.opponent;
    const player = gameState.player;
    const hand = ai.hand;
    const isFieldFull = ai.field.length >= GAME_RULES.FIELD_SIZE;

    if (hand.length === 0) return { type: 'PLAY', score: -1, details: { reason: "Main vide" } };
    if (isFieldFull) return { type: 'PLAY', score: -1, details: { reason: "Terrain plein" } };

    const aiFlippedCount = ai.field.filter(c => c.isFlipped).length;
    const playerFlippedCount = player.field.filter(c => c.isFlipped).length;
    
    // RÉACTIVITÉ DÉFENSIVE : Urgence si l'adversaire approche du Momentum
    const isUrgentDefense = playerFlippedCount >= 2; 
    const isMomentumDanger = aiFlippedCount >= 2; 

    let bestScore = -Infinity;
    let bestIdx = -1;
    let bestReason = "";

    hand.forEach((card, idx) => {
        const weight = evaluateCardWeight(card, gameState);
        let normalizedScore = 50 + (weight * 2);

        // 1. PRIORITÉ SURVIE (MOMENTUM IA)
        if (isMomentumDanger) {
            if (['GK', 'CB'].includes(card.pos)) {
                normalizedScore += 150;
                bestReason = "URGENCE : Bloqueur requis (Auto-Survie)";
            }
        }

        // 2. RÉACTIVITÉ DÉFENSIVE (MOMENTUM ADVERSE)
        // Si l'adversaire a 2 flips, l'IA doit poser ses meilleurs défenseurs
        if (isUrgentDefense) {
            if (['GK', 'CB', 'LB', 'RB', 'CDM'].includes(card.pos)) {
                normalizedScore += 100;
                bestReason = "DÉFENSE PRÉVENTIVE : Stop Momentum adverse";
            }
        }

        if (card.effects?.includes('MOTEUR')) normalizedScore += 30;

        if (normalizedScore > bestScore) {
            bestScore = normalizedScore;
            bestIdx = idx;
            if (!bestReason) bestReason = "Renforcement tactique";
        }
    });

    return { 
        type: 'PLAY', 
        score: bestScore, 
        details: { idx: bestIdx, reason: bestReason } 
    };
};
