export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST';

export interface Player {
  id: string;
  instanceId?: string; // ID unique pour chaque instance de carte sur le terrain 🔥
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
  teamName: string; // Ajout du nom de l'équipe 🔥
}

export interface GoalRecord {
  scorerSide: 'player' | 'opponent';
  scorerName: string;
  reason: string;
  timestamp: number;
}

export interface GameState {
  isFriendly: boolean;
  player: GameSide;
  opponent: GameSide;
  turn: 'player' | 'opponent';
  phase: 'MAIN' | 'ATTACK_DECLARED';
  log: GameLog[];
  goals: GoalRecord[]; // Historique des buts 🔥
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
  boostEvent?: { // Nouvel événement Boost 🔥
    active: boolean;
    val: number;
    side: 'player' | 'opponent';
    timestamp: number;
  } | null;
  attackerInstanceId?: string | null; // Suivi de l'attaquant par ID 🔥
  winner: 'player' | 'opponent' | 'draw' | null;
  hasActionUsed: boolean;
  stoppageTimeAction?: 'player' | 'opponent' | null;
  meneurActive?: boolean; // Flag pour l'effet Meneur 🔥
}

export interface UserProfile {
  credits: number;
  collection: Player[];
  activeTeam: Player[];
}
