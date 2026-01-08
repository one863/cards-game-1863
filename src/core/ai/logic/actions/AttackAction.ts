import { GameState, Player } from '@/types';
import { getTruePower } from '../scorers/powerScorer';
import { AI_CONFIG } from '@/core/ai/aiConfig';

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
    const isMomentumDanger = aiFlippedCount >= 2; 
    const isStoppageTimeRisk = ai.deck.length === 0 && ai.hand.length <= 1;
    const isWinning = ai.score > player.score;
    const isLosing = ai.score < player.score;
    const isDraw = ai.score === player.score;

    const defenderData = player.field.filter(c => !c.isFlipped).map(d => ({
        instanceId: d.instanceId,
        power: getTruePower(gameState, d, 'defender', player.field),
        isMoteur: d.effects?.includes('MOTEUR'),
        pos: d.pos,
        name: d.name
    }));

    const maxPlayerDefPower = defenderData.length > 0 ? Math.max(...defenderData.map(d => d.power)) : 0;
    const minPlayerDefPower = defenderData.length > 0 ? Math.min(...defenderData.map(d => d.power)) : 0;
    const gkData = defenderData.find(d => d.pos === 'GK');

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
        const isGK = att.pos === 'GK';
        const isMoteur = att.effects?.includes("MOTEUR");
        const isST = att.pos === 'ST';

        let score = 0;
        let currentReason = "";

        // INTERDICTION D'ATTAQUER AVEC UN GK
        if (isGK) {
            score -= 200; 
            currentReason = "GK reste au but";
        }

        // PROTECTION DES MOTEURS
        if (isMoteur) {
            score -= 40;
            currentReason = "Garde le MOTEUR au sol";
        }

        // --- ÉVALUATION CIBLAGE ---
        const targetableDefenders = defenderData.filter(d => attPower > d.power);
        const drawDefenders = defenderData.filter(d => attPower === d.power);
        const superiorDefenders = defenderData.filter(d => attPower < d.power);

        if (targetableDefenders.length > 0) {
            // On peut battre quelqu'un (Maillon faible)
            score = 60 + (attPower - minPlayerDefPower) * 5;
            currentReason = "Ciblage maillon faible";

            // NETTOYAGE TERRAIN (Si terrain presque plein, on incite à l'attaque avec les forts)
            if (aiField.length >= 4 && attPower >= 7) {
                score += 30;
                currentReason = "Attaque de nettoyage (Libération terrain)";
            }
        } 
        else if (drawDefenders.length > 0) {
            const hasMoteurInDraw = drawDefenders.some(d => d.isMoteur);
            if (hasMoteurInDraw) {
                score = 50;
                currentReason = "Sacrifice pour MOTEUR adverse";
            } else {
                score = -40;
                currentReason = "Évite le Draw inutile";
            }
        } 
        else {
            score = -100;
            currentReason = "Infériorité statistique";
        }

        // --- PRUDENCE CONTRE GK ---
        if (gkData && attPower <= gkData.power) {
            // Si on ne bat pas NETTEMENT le GK
            if (isDraw || isWinning) {
                // Au score nul ou si on gagne, on ne prend pas le risque de perdre un attaquant sur le GK
                score -= 50;
                currentReason = "Prudence face au GK (Score sécurisé)";
                
                // Si on est ST mais qu'on n'a pas le bonus max (+2), on attend
                if (isST) {
                    const hasCB = player.field.some(p => !p.isFlipped && p.pos === 'CB');
                    if (hasCB) {
                        score -= 20;
                        currentReason = "Attente bonus ST (+2) face au GK";
                    }
                }
            }
        }

        // GESTION STOPPAGE TIME
        if (isStoppageTimeRisk) {
             if (isWinning) {
                 score -= 80;
             } else if (score < 80) {
                 score -= 50;
             }
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

    return { type: 'ATTACK', score: -1, details: { reason: "Aucune attaque statistiquement viable" } };
};
