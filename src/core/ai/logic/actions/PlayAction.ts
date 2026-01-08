import { GameState } from '@/types';
import { evaluateCardWeight } from '../scorers/cardScorer';
import { AI_CONFIG } from '@/core/ai/aiConfig';
import { GAME_RULES } from '@/core/rules/settings';
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
    const playerSTCount = player.field.filter(c => !c.isFlipped && c.pos === 'ST').length;
    const aiCBCount = ai.field.filter(c => !c.isFlipped && c.pos === 'CB').length;
    
    // À 2 cartes retournées, l'action 'JOUER' un bloqueur (CB/GK) est obligatoire.
    const isMomentumDanger = aiFlippedCount >= 2; 
    const isEarlyGame = aiActiveCount < 3; 
    const isWinning = ai.score > player.score;
    const isStoppageTimeRisk = ai.deck.length === 0 && hand.length <= 2;

    const isOpponentEntrenched = playerActiveCount >= 3;

    // Trouver la meilleure carte à jouer
    let bestScore = -Infinity;
    let bestIdx = -1;
    let bestReason = "";

    hand.forEach((card, idx) => {
        const weight = evaluateCardWeight(card, gameState);
        
        let normalizedScore = 50 + (weight * 2); // Base 50

        // PRIORITÉ CB SI ST ADVERSE PRÉSENT
        if (playerSTCount > 0 && aiCBCount === 0) {
            if (card.pos === 'CB') {
                normalizedScore += 60;
                bestReason = "Réponse défensive (ST adverse détecté)";
            }
        }

        // SURVIE MOMENTUM (Urgence : Obligatoire à 2 flips)
        if (isMomentumDanger) {
            if (['GK', 'CB'].includes(card.pos)) {
                normalizedScore += 150; // Score massif pour forcer le choix
                bestReason = "SURVIE : Bloqueur obligatoire (CB/GK)";
            } else if (['LB', 'RB', 'CDM'].includes(card.pos)) {
                normalizedScore += 50;
            } else {
                normalizedScore -= 50; 
            }
        }

        // RÈGLE 4 : PRIORITÉ CONSTRUCTION
        if (isEarlyGame && !isMomentumDanger) {
            normalizedScore += 15;
            if (!bestReason) bestReason = "Déploiement initial";
        }

        // PROTECTION DES MOTEURS EN MAIN (On les joue pour les bonus)
        if (card.effects?.includes('MOTEUR')) {
            normalizedScore += 30;
        }

        // GESTION FIN DE MATCH (ST)
        if (isWinning && isStoppageTimeRisk && !isMomentumDanger) {
             const isDefender = ['GK', 'CB', 'LB', 'RB', 'CDM'].includes(card.pos);
             if (!isDefender) {
                 normalizedScore -= 30; // On économise la main
             }
        }

        if (normalizedScore > bestScore) {
            bestScore = normalizedScore;
            bestIdx = idx;
            if (!bestReason) {
                 bestReason = isMomentumDanger ? "Renforcement défensif" : "Construction tactique";
            }
        }
    });

    return { 
        type: 'PLAY', 
        score: bestScore, 
        details: { idx: bestIdx, reason: bestReason } 
    };
};
