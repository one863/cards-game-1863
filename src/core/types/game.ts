// src/core/types/game.ts

export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST';

export type Keyword = 
    | 'AGRESSIF' | 'CONTRE' | 'AERIEN' | 'PHYSIQUE' | 'SOLIDAIRE'
    | 'PASSEUR' | 'VISION' | 'TECHNIQUE' | 'VOLUME'
    | 'VITESSE' | 'FINISSEUR' | 'TIRLOINTAIN' | 'PROVOCATEUR' | 'CPA';

export interface Player {
    id: string;
    name: string;
    fullName?: string;
    pos: Position;
    nat?: string;
    vaep: number;
    rating?: number;
    cost: number;
    effects: Keyword[];
    isFlipped?: boolean;
    hasActed?: boolean;
}

export interface MatchLogEntry {
    key: string;
    params: Record<string, any>;
    id: number;
}

export interface TeamState {
    name?: string;
    score: number;
    deck: Player[];
    hand: Player[];
    field: (Player | null)[];
}

export type MatchPhase = 'MAIN' | 'ATTACK_DECLARED' | 'GAME_OVER';
export type PlayerSide = 'player' | 'opponent' | 'home' | 'away';

export interface GameState {
    isFriendly: boolean;
    player: TeamState;
    opponent: TeamState;
    turn: PlayerSide;
    phase: MatchPhase;
    log: MatchLogEntry[];
    goalEvent: {
        type: 'goal' | 'GAME_OVER';
        scorer?: PlayerSide;
        scorerName?: string;
        reason?: string;
    } | null;
    attackerIdx: number | null;
    winner: PlayerSide | 'draw' | null;
    hasActionUsed: boolean;
}
