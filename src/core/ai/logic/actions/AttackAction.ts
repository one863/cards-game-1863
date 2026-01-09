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

    const playerFlippedCount = player.field.filter(c => c.isFlipped).length;
    
    // ANALYSE TACTIQUE : On veut cibler les faiblesses pour déclencher le Momentum
    const defenderData = player.field.filter(c => !c.isFlipped).map(d => ({
        instanceId: d.instanceId,
        power: getTruePower(gameState, d, 'defender', player.field),
        isMoteur: d.effects?.includes('MOTEUR'),
        pos: d.pos,
        name: d.name
    })).sort((a, b) => a.power - b.power); // On trie du plus faible au plus fort

    const minPlayerDefPower = defenderData.length > 0 ? defenderData[0].power : 0;
    const gkData = defenderData.find(d => d.pos === 'GK');

    // 1. BUT OUVERT (Priorité Maximale)
    if (playerVisibleCount === 0) {
        const bestAttacker = activeAttackers.reduce((prev, curr) => 
            getTruePower(gameState, prev, 'attacker', aiField) < getTruePower(gameState, curr, 'attacker', aiField) ? prev : curr
        );
        return { type: 'ATTACK', score: AI_CONFIG.PRIORITIES.OPEN_GOAL, details: { id: bestAttacker.instanceId, reason: "BUT OUVERT !" } };
    }

    // 2. MOMENTUM FINISH (Priorité : 90)
    if (playerFlippedCount >= 2) {
        const strongest = activeAttackers.reduce((prev, curr) => getTruePower(gameState, curr, 'attacker', aiField) > getTruePower(gameState, prev, 'attacker', aiField) ? curr : prev);
        return { type: 'ATTACK', score: AI_CONFIG.PRIORITIES.MOMENTUM_ALL_IN, details: { id: strongest.instanceId, reason: "MOMENTUM FINISH (Coup de grâce)" } };
    }

    let bestAttackScore = -100;
    let bestAttacker: Player | null = null;
    let reason = "";

    activeAttackers.forEach(att => {
        const attPower = getTruePower(gameState, att, 'attacker', aiField);
        let score = 0;
        let currentReason = "";

        if (att.pos === 'GK') score -= 200; 

        // --- ÉVALUATION CIBLAGE ---
        const targetableDefenders = defenderData.filter(d => attPower > d.power);
        const drawDefenders = defenderData.filter(d => attPower === d.power);

        if (targetableDefenders.length > 0) {
            // OPTIMISATION : On booste l'attaque si elle cible le maillon le plus faible
            const isTargetingWeakest = attPower > minPlayerDefPower;
            score = isTargetingWeakest ? 85 : 70;
            
            // On ajoute un bonus de progression Momentum
            score += (playerFlippedCount * 10); 
            currentReason = isTargetingWeakest ? "Assaut sur maillon faible (Objectif Momentum)" : "Attaque tactique viable";
        } 
        else if (drawDefenders.length > 0) {
            // Égalité : On évite de sacrifier ses cartes sauf si c'est pour détruire un Moteur adverse
            const hasMoteurInDraw = drawDefenders.some(d => d.isMoteur);
            if (hasMoteurInDraw) {
                score = 40;
                currentReason = "Sacrifice stratégique (Destruction moteur)";
            } else {
                score = -60; // On pénalise plus l'égalité pour préserver le plateau
                currentReason = "Évite le Draw inutile (Économie de troupes)";
            }
        } 
        else {
            score = -100;
            currentReason = "Infériorité statistique";
        }

        // --- PRUDENCE GK ---
        if (gkData && attPower <= gkData.power) {
            score -= 40;
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

    return { type: 'ATTACK', score: -1, details: { reason: "Aucune opportunité offensive favorable" } };
};
