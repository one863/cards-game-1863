import { GameState } from '../../../../types';
import { evaluateCardWeight } from '../scorers/cardScorer';
import { AI_CONFIG } from '../../aiConfig';
import { GAME_RULES } from '../../../../core/rules/settings';
import { ScoredAction } from './AttackAction';
import { getTruePower } from '../scorers/powerScorer';

export const evaluatePlayActions = (gameState: GameState): ScoredAction => {
    const ai = gameState.opponent;
    const player = gameState.player;
    const hand = ai.hand;
    const isFieldFull = ai.field.length >= GAME_RULES.FIELD_SIZE;

    if (hand.length === 0) return { type: 'PLAY', score: -1, details: { reason: "Main vide" } };
    if (isFieldFull) return { type: 'PLAY', score: -1, details: { reason: "Terrain plein" } };

    const aiFlippedCount = ai.field.filter(c => c.isFlipped).length;
    const aiActiveCount = ai.field.filter(c => !c.isFlipped).length;
    const playerActiveCount = player.field.filter(c => !c.isFlipped).length;
    
    const isMomentumDanger = aiFlippedCount >= AI_CONFIG.THRESHOLDS.MOMENTUM_DANGER_COUNT;
    const isEarlyGame = aiActiveCount < 3; 
    const isWinning = ai.score > player.score;
    const isStoppageTimeRisk = ai.deck.length === 0 && hand.length <= 2;

    // RÈGLE 5 : PATIENCE STRATÉGIQUE (Anti-Mur)
    // Si l'adversaire est bien défendu (3+ joueurs), on privilégie la construction
    const isOpponentEntrenched = playerActiveCount >= 3;

    // Trouver la meilleure carte à jouer
    let bestScore = -Infinity;
    let bestIdx = -1;
    let bestReason = "";

    hand.forEach((card, idx) => {
        const weight = evaluateCardWeight(card, gameState);
        
        let normalizedScore = 50 + (weight * 2); // Base 50

        // RÈGLE 4 : PRIORITÉ CONSTRUCTION
        if (isEarlyGame) {
            normalizedScore += 15;
            if (!bestReason) bestReason = "Déploiement initial";
        }

        // RÈGLE 5 : PATIENCE
        if (isOpponentEntrenched) {
            normalizedScore += 10;
            if (!bestReason) bestReason = "Patience stratégique (Bloc adverse)";
        }

        // PROTECTION MOMENTUM
        if (isMomentumDanger) {
            if (['GK', 'CB', 'LB', 'RB', 'CDM'].includes(card.pos)) {
                normalizedScore += 50; 
                bestReason = "Blocage Momentum (Urgence)";
            } else {
                normalizedScore -= 10; 
            }
        }

        // STABILISATION POST-PENALTY
        if (aiActiveCount === 0 && ['GK', 'CB', 'CDM'].includes(card.pos)) {
            normalizedScore += 20;
            bestReason = "Reconstruction défensive";
        }

        // GESTION FIN DE MATCH (ST)
        if (isWinning && isStoppageTimeRisk) {
             const isDefender = ['GK', 'CB', 'LB', 'RB', 'CDM'].includes(card.pos);
             if (!isDefender) {
                 normalizedScore -= 30; // On économise la main
             }
        }

        if (normalizedScore > bestScore) {
            bestScore = normalizedScore;
            bestIdx = idx;
            if (!bestReason) bestReason = isMomentumDanger ? "Renforcement défensif" : "Construction tactique";
        }
    });

    return { 
        type: 'PLAY', 
        score: bestScore, 
        details: { idx: bestIdx, reason: bestReason } 
    };
};
