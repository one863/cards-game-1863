export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST';

export interface Player {
  id: string;
  instanceId?: string;
  name: string;
  fullName: string;
  pos: Position;
  nat: string;
  vaep: number;
  rating: number;
  cost: number;
  effects: string[];
  hasActed?: boolean;
  isFlipped?: boolean;
}

export interface GameLog {
  id: number;
  key: string;
  params: Record<string, any>;
}

export interface GameSide {
  deck: Player[];
  hand: Player[];
  field: Player[];
  discard: Player[];
  score: number;
  teamName: string;
}

export interface GoalRecord {
  scorerSide: 'player' | 'opponent';
  scorerName: string;
  reason: string;
  timestamp: number;
}

export type ExceptionalEventType = 'PENALTY' | 'CORNER' | 'FREE_KICK' | null;

export interface GameState {
  isFriendly: boolean;
  player: GameSide;
  opponent: GameSide;
  turn: 'player' | 'opponent';
  phase: 'MAIN' | 'ATTACK_DECLARED';
  log: GameLog[];
  goals: GoalRecord[];
  goalEvent: {
    type: 'goal' | 'GAME_OVER';
    scorer?: 'player' | 'opponent';
    scorerName?: string;
    reason?: string;
  } | null;
  explosionEvent: {
    active: boolean;
    timestamp: number;
  } | null;
  boostEvent?: {
    active: boolean;
    val: number;
    side: 'player' | 'opponent';
    timestamp: number;
  } | null;
  
  // --- SYSTÈME D'ÉVÉNEMENTS EXCEPTIONNELS ---
  exceptionalEvent?: {
    type: ExceptionalEventType;
    attackerName: string;
    defenderName: string;
    result?: 'goal' | 'saved' | 'success' | 'fail';
    timestamp: number;
  } | null;

  penaltyEvent?: { // Gardé pour compatibilité temporaire si nécessaire, mais on privilégiera exceptionalEvent
    active: boolean;
    attackerName: string;
    defenderName: string;
    result: 'goal' | 'saved';
    timestamp: number;
  } | null;

  attackerInstanceId?: string | null;
  winner: 'player' | 'opponent' | 'draw' | null;
  hasActionUsed: boolean;
  stoppageTimeAction?: 'player' | 'opponent' | null;
  meneurActive?: boolean;
}

export interface UserProfile {
  credits: number;
  collection: Player[];
  activeTeam: Player[];
}
