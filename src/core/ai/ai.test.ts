import { describe, it, expect } from 'vitest';
import { getAIDecision } from './logic/aiDecision';
import { GameState, Player } from '../../types';

// Helper pour créer un joueur fictif
const createPlayer = (id: string, name: string, vaep: number, pos: string, isFlipped = false, hasActed = false): Player => ({
    id, name, vaep, pos, isFlipped, hasActed,
    instanceId: id, rarity: 'common', teamId: 'test', cost: 10, stats: { ATT: 80, DEF: 80, PHY: 80, MEN: 80 }, effects: []
});

describe('AI Decision Engine', () => {
    
    it('should prioritize PLAY over ATTACK in neutral state with empty field', () => {
        const state = createMockState();
        state.opponent.hand = [createPlayer('p1', 'Defender', 7, 'CB')];
        state.opponent.field = [];
        
        const decision = getAIDecision(state);
        expect(decision.action).toBe('PLAY');
    });

    it('should prioritize ATTACK (All-in) when having 2 flipped cards (Momentum Finish for Player)', () => {
        const state = createMockState();
        // L'IA (Opponent) a un attaquant puissant
        state.opponent.field = [createPlayer('att1', 'Striker', 9, 'ST')];
        state.opponent.hand = [];
        // Le Joueur (Player) a 2 cartes retournées -> Momentum Finish Opportunité pour l'IA
        state.player.field = [
            createPlayer('f1', 'Flipped1', 5, 'CB', true),
            createPlayer('f2', 'Flipped2', 5, 'CB', true),
            createPlayer('def', 'Defender', 6, 'CB') // Cible facile
        ];

        const decision = getAIDecision(state);
        expect(decision.action).toBe('ATTACK');
        expect(decision.reason).toContain('Momentum Goal');
    });

    it('should NOT play GK early in the game', () => {
        const state = createMockState();
        state.opponent.hand = [
            createPlayer('gk', 'Goalie', 9, 'GK'),
            createPlayer('cb', 'Defender', 7, 'CB')
        ];
        state.opponent.field = [createPlayer('m1', 'Mid', 7, 'CM')];

        const decision = getAIDecision(state);
        expect(decision.action).toBe('PLAY');
        // Elle doit jouer le CB (index 1) plutôt que le GK (index 0) car GK a un malus
        expect(decision.idx).toBe(1); 
    });

    it('should force ATTACK if hand is empty and field has active players', () => {
        const state = createMockState();
        state.opponent.hand = [];
        state.opponent.field = [createPlayer('p1', 'Player', 7, 'CM')];
        state.player.field = [createPlayer('def', 'Defender', 8, 'CB')]; // Défenseur fort

        const decision = getAIDecision(state);
        expect(decision.action).toBe('ATTACK');
        expect(decision.reason).toContain('Attaque forcée');
    });

});

const createMockState = (): GameState => ({
    player: { deck: [], hand: [], field: [], discard: [], score: 0, teamName: 'Player' },
    opponent: { deck: [], hand: [], field: [], discard: [], score: 0, teamName: 'AI' },
    turn: 'opponent',
    phase: 'MAIN',
    log: [],
    goals: [],
    goalEvent: null,
    winner: null,
    hasActionUsed: false,
    stoppageTimeAction: null,
    meneurActive: false
});
