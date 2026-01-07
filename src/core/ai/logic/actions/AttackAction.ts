import { GameState, Player } from '../../../../types';
import { getTruePower } from '../scorers/powerScorer';
import { AI_CONFIG } from '../../aiConfig';

export interface ScoredAction {
    type: 'ATTACK' | 'PLAY' | 'PASS';
    score: number;
    details?: { id?: string; idx?: number; reason: string };
}

export const evaluateAttackActions = (gameState: GameState): ScoredAction => {
    const ai = gameState.opponent;
    const player = gameState.player;
    const aiField = ai.field;
    const activeAttackers = aiField.filter(c => !c.isFlipped && !c.hasActed);
    const playerVisibleCount = player.field.filter(c => !c.isFlipped).length;

    if (activeAttackers.length === 0) return { type: 'ATTACK', score: -1, details: { reason: "Aucun attaquant" } };

    // --- CONTEXTE ---
    const playerFlippedCount = player.field.filter(c => c.isFlipped).length;
    const aiFlippedCount = aiField.filter(c => c.isFlipped).length;
    const isMomentumFinish = playerFlippedCount >= 2;
    const isMomentumDanger = aiFlippedCount >= AI_CONFIG.THRESHOLDS.MOMENTUM_DANGER_COUNT;
    const isStoppageTime = ai.deck.length === 0 && ai.hand.length === 0;
    const isWinning = ai.score > player.score;

    const defenderPowers = player.field.filter(c => !c.isFlipped).map(d => getTruePower(gameState, d, 'defender', player.field));
    const maxPlayerDefPower = defenderPowers.length > 0 ? Math.max(...defenderPowers) : 0;
    const minPlayerDefPower = defenderPowers.length > 0 ? Math.min(...defenderPowers) : 0;

    // 1. BUT OUVERT (Priorité Maximale : 100)
    if (playerVisibleCount === 0) {
        const bestAttacker = activeAttackers.reduce((prev, curr) => 
            getTruePower(gameState, prev, 'attacker', aiField) < getTruePower(gameState, curr, 'attacker', aiField) ? prev : curr
        );
        return { type: 'ATTACK', score: AI_CONFIG.PRIORITIES.OPEN_GOAL, details: { id: bestAttacker.instanceId, reason: "BUT OUVERT !" } };
    }

    // 2. MOMENTUM FINISH (Priorité : 90)
    if (isMomentumFinish) {
        const strongest = activeAttackers.reduce((prev, curr) => getTruePower(gameState, curr, 'attacker', aiField) > getTruePower(gameState, prev, 'attacker', aiField) ? curr : prev);
        return { type: 'ATTACK', score: AI_CONFIG.PRIORITIES.MOMENTUM_ALL_IN, details: { id: strongest.instanceId, reason: "FINISH HIM (Momentum Goal)" } };
    }

    // 3. ANALYSE DES DUELS
    let bestAttackScore = -100;
    let bestAttacker: Player | null = null;
    let reason = "";

    activeAttackers.forEach(att => {
        const attPower = getTruePower(gameState, att, 'attacker', aiField);
        const isAggressive = att.effects?.includes("AGRESSIF");
        const isGK = att.pos === 'GK';
        const isKeyDefender = ['CB', 'CDM'].includes(att.pos) || att.effects?.includes("MOTEUR");
        const isStriker = ['ST', 'LW', 'RW'].includes(att.pos);

        let score = 0;
        let currentReason = "";

        // RÈGLE 1 : SANCTUARISATION DU GK
        if (isGK) {
            score -= 50; 
            currentReason = "GK reste au but";
        }

        // RÈGLE 2 & 4 : GESTION DES MURS ET DUELS PERDUS D'AVANCE
        // Si on ne bat pas le défenseur le plus faible, c'est du suicide
        if (attPower < minPlayerDefPower) {
            score -= 60; // Malus augmenté
            currentReason = "Mur infranchissable";
        } 
        // RÈGLE 3 : GESTION DU PLAYMAKER
        // Si on a l'effet Meneur actif, on booste l'attaque car c'est une action gratuite/bonus
        if (gameState.meneurActive) {
            score += 20;
            currentReason += " (Effet Meneur)";
        }

        // Si on bat tout le monde (Victoire nette)
        if (attPower > maxPlayerDefPower) {
            score = AI_CONFIG.PRIORITIES.WINNING_DUEL; // 80
            currentReason = "Attaque dominante";
            if (!isKeyDefender && !isGK) score += 5;
        } 
        // Si on bat au moins le plus faible (Ciblage des faiblesses)
        else {
            // RÈGLE : EVITEMENT DU DRAW (ÉGALITÉ)
            // Si le meilleur défenseur a la même puissance que nous, on risque le Draw.
            // Draw = Perte de carte pour nous (Attaquant) vs Flip pour lui (Défenseur). C'est MAUVAIS.
            if (attPower === maxPlayerDefPower) {
                score -= 30; // On pénalise fortement le Draw sur le meilleur défenseur
                currentReason = "Risque de Draw inutile";
            } else if (attPower > minPlayerDefPower) {
                // On peut battre un faible, c'est bien.
                score = 30 + (attPower - minPlayerDefPower) * 2;
                currentReason = "Attaque ciblée sur faiblesse";
            } else {
                score -= 40; // On ne bat personne
            }

            // Protection Buteurs
            if (isStriker && attPower <= maxPlayerDefPower) {
                score -= 20; 
                currentReason = "Protection buteur";
            }

            // Prudence Agressive
            if (isAggressive && attPower <= maxPlayerDefPower) {
                score -= 20;
            }
            
            // Prudence Momentum
            if (isMomentumDanger) {
                score -= 30;
                currentReason = "Prudence Momentum";
            }
        }

        if (isStoppageTime && !isWinning && score > 0) {
            score += 30;
        }

        if (score > bestAttackScore) {
            bestAttackScore = score;
            bestAttacker = att;
            reason = currentReason;
        }
    });

    if (bestAttacker && bestAttackScore > 0) {
        return { type: 'ATTACK', score: bestAttackScore, details: { id: (bestAttacker as Player).instanceId, reason } };
    }

    // 4. ATTAQUE PAR DÉFAUT
    if (activeAttackers.length > 0) {
        const defaultAttacker = activeAttackers.reduce((prev, curr) => getTruePower(gameState, curr, 'attacker', aiField) > getTruePower(gameState, prev, 'attacker', aiField) ? curr : prev);
        return { type: 'ATTACK', score: 10, details: { id: defaultAttacker.instanceId, reason: "Attaque par défaut (Force)" } };
    }

    return { type: 'ATTACK', score: -1, details: { reason: "Aucune attaque valide" } };
};
