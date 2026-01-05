import { describe, it, expect, beforeEach } from 'vitest';
import { getAIDecision } from '../../ai/logic/aiDecision';
import { Player, GameState } from '../../../types';
import { GAME_RULES } from '../../rules/settings';

// Mock simple de joueur
const createPlayer = (id: string, name: string, pos: string, vaep: number, hasActed = false): Player => ({
    id, name, pos, vaep, cost: 0, effects: [], 
    instanceId: id, hasActed, isFlipped: false
});

describe('AI Logic Engine', () => {
    let mockState: GameState;

    beforeEach(() => {
        // État de base avant chaque test
        mockState = {
            isFriendly: true,
            player: { deck: [], hand: [], field: [], discard: [], score: 0, teamName: "P1" },
            opponent: { deck: [], hand: [], field: [], discard: [], score: 0, teamName: "CPU" },
            turn: 'opponent', phase: 'MAIN', log: [], goalEvent: null, winner: null, hasActionUsed: false, stoppageTimeAction: null
        };
    });

    it('should NOT attack with a tired player (hasActed=true)', () => {
        // Situation : L'IA a un attaquant puissant mais qui a déjà joué
        const exhaustedStriker = createPlayer('p1', 'Mbappé', 'ST', 9, true); // hasActed = true
        mockState.opponent.field = [exhaustedStriker];
        
        // Décision
        const decision = getAIDecision(mockState);

        // Vérification : L'IA ne doit pas choisir d'attaquer avec lui
        expect(decision.action).not.toBe('ATTACK');
    });

    it('should prioritize attacking an open goal', () => {
        // Situation : L'IA a un attaquant frais, le joueur n'a personne
        const freshStriker = createPlayer('p1', 'Haaland', 'ST', 9, false);
        mockState.opponent.field = [freshStriker];
        mockState.player.field = []; // Pas de défenseur

        const decision = getAIDecision(mockState);

        expect(decision.action).toBe('ATTACK');
        expect(decision.id).toBe(freshStriker.instanceId);
        expect(decision.reason).toContain('BUT OUVERT');
    });

    it('should prefer playing a card to build board if defensive', () => {
        // Situation : L'IA mène au score et a peu de joueurs -> Devrait jouer (PLAY) plutôt qu'attaquer à tout prix
        mockState.opponent.score = 1;
        mockState.player.score = 0;
        
        const handCard = createPlayer('h1', 'Defender', 'CB', 7);
        mockState.opponent.hand = [handCard];
        
        // Un attaquant est dispo mais on préfère sécuriser
        const fieldCard = createPlayer('f1', 'Midfielder', 'CM', 7, false);
        mockState.opponent.field = [fieldCard];

        // L'adversaire a 2 défenseurs, attaquer est risqué
        mockState.player.field = [createPlayer('d1', 'D1', 'CB', 7), createPlayer('d2', 'D2', 'CB', 7)];

        const decision = getAIDecision(mockState);

        // En mode défensif (mène au score), l'IA devrait construire son jeu
        expect(decision.action).toBe('PLAY');
    });
});
