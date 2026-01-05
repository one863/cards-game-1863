import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { Player, GameState } from '../../types';
import { GAME_RULES } from '../../core/rules/settings';
import { GameStatusSlice } from './gameStatusSlice';

export interface GameEngineSlice {
  initMatch: (opponentDeckInput: Player[], playerDeckInput?: Player[] | null, userActiveTeam?: Player[], userCollection?: Player[], teamNames?: { player: string, opponent: string }) => void;
  startTurn: (draft: GameState) => void;
  checkMomentumGoal: (draft: GameState) => boolean;
  checkGameOver: (draft?: GameState | null, forced?: boolean) => boolean;
  resolveGoal: (draft: GameState, attackerSideKey: 'player' | 'opponent', defenderSideKey: 'player' | 'opponent', attackerId: string, reason?: string) => void;
  resumeGame: () => void;
}

type FullGameStore = GameStatusSlice & GameEngineSlice;

export const createGameEngineSlice: StateCreator<FullGameStore, [], [], GameEngineSlice> = (set, get) => {
  
  const internalCheckGameOver = (draft: GameState, forced: boolean, addLog: (d: GameState, k: string, p?: any) => void) => {
    const isPlayerOut = draft.player.hand.length === 0 && draft.player.deck.length === 0 && draft.player.field.filter(c => !c.isFlipped).length <= 1;
    const isOpponentOut = draft.opponent.hand.length === 0 && draft.opponent.deck.length === 0 && draft.opponent.field.filter(c => !c.isFlipped).length <= 1;
    const isOutOfCards = isPlayerOut && isOpponentOut;
    
    if (forced || isOutOfCards || draft.player.score >= 10 || draft.opponent.score >= 10) {
        if (draft.player.score > draft.opponent.score) draft.winner = 'player';
        else if (draft.player.score < draft.opponent.score) draft.winner = 'opponent';
        else draft.winner = 'draw';
        
        draft.goalEvent = { 
            type: 'GAME_OVER', 
            reason: draft.winner === 'draw' ? "game.draw" : "game.game_over" 
        };
        return true;
    }
    return false;
  };

  return {
    initMatch: (opponentDeckInput, playerDeckInput = null, userActiveTeam = [], userCollection = [], teamNames = { player: "YOU", opponent: "OPPONENT" }) => {
      let playerDeckSource = playerDeckInput || (userActiveTeam.length === GAME_RULES.DECK_SIZE ? userActiveTeam : userCollection.slice(0, GAME_RULES.DECK_SIZE));
      const shuffle = (arr: Player[]) => [...arr].sort(() => Math.random() - 0.5);
      const mapToInstance = (p: Player) => ({ ...p, instanceId: `${p.id}_${Math.random().toString(36).substr(2, 5)}`, hasActed: false, isFlipped: false });

      const pDeckTotal = shuffle([...playerDeckSource]).map(mapToInstance);
      const oDeckTotal = shuffle([...opponentDeckInput]).map(mapToInstance);

      const initialGameState: GameState = {
        isFriendly: !!playerDeckInput, 
        player: { deck: pDeckTotal, hand: pDeckTotal.splice(0, GAME_RULES.HAND_SIZE), field: [], discard: [], score: 0, teamName: teamNames.player },
        opponent: { deck: oDeckTotal, hand: oDeckTotal.splice(0, GAME_RULES.HAND_SIZE), field: [], discard: [], score: 0, teamName: teamNames.opponent },
        turn: 'player', phase: 'MAIN',
        log: [{ key: 'logs.start', params: {}, id: Math.random() }],
        goals: [], // Init
        goalEvent: null, winner: null, hasActionUsed: false, stoppageTimeAction: null
      };

      set({
        selectedAttackerId: null,
        selectedBoostId: null,
        gameState: initialGameState
      });

      set(produce((state: FullGameStore) => { 
          if (state.gameState) get().startTurn(state.gameState); 
      }));
    },

    startTurn: (draft) => {
      if (!draft) return;
      if (draft.stoppageTimeAction) { internalCheckGameOver(draft, true, get().addLog); return; }

      const activeSideKey = draft.turn;
      const activeSide = draft[activeSideKey];
      
      activeSide.field.forEach(card => {
          card.hasActed = false;
      });

      while (activeSide.hand.length < GAME_RULES.HAND_SIZE && activeSide.deck.length > 0) {
          activeSide.hand.push(activeSide.deck.pop()!);
      }

      const activeNonFlippedCount = activeSide.field.filter(c => !c.isFlipped).length;
      const isStoppageConditionMet = activeSide.hand.length === 0 && activeSide.deck.length === 0 && activeNonFlippedCount <= 1;
      
      if (isStoppageConditionMet) {
          get().addLog(draft, 'logs.stoppage_time');
          const opponentKey = activeSideKey === 'player' ? 'opponent' : 'player';
          draft.turn = opponentKey;
          draft.stoppageTimeAction = opponentKey;
          draft.phase = 'MAIN';
          draft.hasActionUsed = false;
          return;
      }

      draft.hasActionUsed = false;
      draft.phase = 'MAIN';
      get().addLog(draft, activeSideKey === 'player' ? 'logs.your_turn' : 'logs.opp_turn');
    },

    resolveGoal: (draft, attackerSideKey, defenderSideKey, attackerId, reason = "") => {
      if (!draft) return;
      const attackerSide = draft[attackerSideKey];
      const defenderSide = draft[defenderSideKey];
      
      attackerSide.score++;
      get().addLog(draft, 'game.score_log', { home: draft.player.score, away: draft.opponent.score });
      
      const scorerName = attackerSide.field.find(c => c.instanceId === attackerId)?.name || 'Unknown';
      
      // Enregistrement du but dans l'historique 🔥
      draft.goals.push({
          scorerSide: attackerSideKey,
          scorerName: scorerName,
          reason: reason,
          timestamp: Date.now()
      });

      draft.goalEvent = { type: 'goal', scorer: attackerSideKey, scorerName, reason: reason };

      const attIdx = attackerSide.field.findIndex(c => c.instanceId === attackerId);
      if (attIdx !== -1) attackerSide.discard.push(attackerSide.field.splice(attIdx, 1)[0]);
      
      defenderSide.field.forEach(c => { if (c.isFlipped) defenderSide.discard.push(c); });
      defenderSide.field = defenderSide.field.filter(c => !c.isFlipped);

      if (internalCheckGameOver(draft, false, get().addLog)) return;

      draft.phase = 'MAIN';
      draft.attackerInstanceId = null;
      
      if (draft.stoppageTimeAction) {
      } else {
          draft.turn = defenderSideKey; 
      }
    },

    resumeGame: () => {
        set(produce((state: FullGameStore) => {
            const draft = state.gameState;
            if (!draft) return;
            
            draft.goalEvent = null;

            if (draft.winner) return;

            if (draft.stoppageTimeAction) {
                internalCheckGameOver(draft, true, get().addLog);
            } else {
                get().startTurn(draft);
            }
        }));
    },

    checkMomentumGoal: (draft) => {
      if (!draft) return false;
      const checkSide = (sideKey: 'player' | 'opponent') => {
          const side = draft[sideKey];
          if (side.field.filter(c => c.isFlipped).length >= 3) {
              const attackerSideKey = sideKey === 'player' ? 'opponent' : 'player';
              const attackerSide = draft[attackerSideKey];
              const attackerId = draft.attackerInstanceId || attackerSide.field[0]?.instanceId;
              
              get().resolveGoal(draft, attackerSideKey, sideKey, attackerId!, "Momentum (3+ cartes retournées)");
              return true;
          }
          return false;
      };
      return checkSide('player') || checkSide('opponent');
    },

    checkGameOver: (draft, forced = false) => {
      if (draft) {
          return internalCheckGameOver(draft, forced, get().addLog);
      } else {
          set(produce((state: FullGameStore) => {
              if (state.gameState) internalCheckGameOver(state.gameState, forced, get().addLog);
          }));
          return true;
      }
    }
  };
};
