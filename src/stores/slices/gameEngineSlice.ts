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
    if (!draft || !draft.player || !draft.opponent) return false; 
    const isPlayerOut = draft.player.hand.length === 0 && draft.player.deck.length === 0 && draft.player.field.filter(c => !c.isFlipped).length <= 1;
    const isOpponentOut = draft.opponent.hand.length === 0 && draft.opponent.deck.length === 0 && draft.opponent.field.filter(c => !c.isFlipped).length <= 1;
    const isOutOfCards = isPlayerOut && isOpponentOut;
    
    if (forced || isOutOfCards || draft.player.score >= 10 || draft.opponent.score >= 10) {
        if (draft.player.score > draft.opponent.score) draft.winner = 'player';
        else if (draft.player.score < draft.opponent.score) draft.winner = 'opponent';
        else draft.winner = 'draw';
        addLog(draft, 'logs.final_whistle');
        draft.goalEvent = { type: 'GAME_OVER', reason: draft.winner === 'draw' ? "game.draw" : "game.game_over" };
        return true;
    }
    return false;
  };

  return {
    initMatch: (opponentDeckInput, playerDeckInput = null, userActiveTeam = [], userCollection = [], teamNames = { player: "YOU", opponent: "OPPONENT" }) => {
      let finalPlayerDeckSource = playerDeckInput && playerDeckInput.length > 0 ? playerDeckInput : (userActiveTeam.length === GAME_RULES.DECK_SIZE ? userActiveTeam : userCollection.slice(0, GAME_RULES.DECK_SIZE));
      let finalOpponentDeckSource = opponentDeckInput && opponentDeckInput.length > 0 ? opponentDeckInput : []; 
      if (finalPlayerDeckSource.length === 0) return;
      if (finalOpponentDeckSource.length === 0) finalOpponentDeckSource = [...finalPlayerDeckSource]; 

      const shuffle = (arr: Player[]) => [...arr].sort(() => Math.random() - 0.5);
      const mapToInstance = (p: Player) => ({ ...p, instanceId: `${p.id}_${Math.random().toString(36).substr(2, 5)}`, hasActed: false, isFlipped: false });
      const pDeckTotal = shuffle([...finalPlayerDeckSource]).map(mapToInstance);
      const oDeckTotal = shuffle([...finalOpponentDeckSource]).map(mapToInstance);
      const playerHandSize = Math.min(GAME_RULES.HAND_SIZE, pDeckTotal.length);
      const opponentHandSize = Math.min(GAME_RULES.HAND_SIZE, oDeckTotal.length);

      const initialGameState: GameState = {
        isFriendly: !!playerDeckInput, 
        player: { deck: pDeckTotal, hand: pDeckTotal.splice(0, playerHandSize), field: [], discard: [], score: 0, teamName: teamNames.player },
        opponent: { deck: oDeckTotal, hand: oDeckTotal.splice(0, opponentHandSize), field: [], discard: [], score: 0, teamName: teamNames.opponent },
        turn: 'player', phase: 'MAIN',
        log: [{ key: 'logs.start', params: {}, id: Math.random() }],
        goals: [], goalEvent: null, winner: null, hasActionUsed: false, stoppageTimeAction: null, meneurActive: false
      };
      set({ selectedAttackerId: null, selectedBoostId: null, gameState: initialGameState });
      set(produce((state: FullGameStore) => { if (state.gameState) get().startTurn(state.gameState); }));
    },

    startTurn: (draft) => {
      if (!draft || !draft.player || !draft.opponent) return; 
      if (draft.stoppageTimeAction) { internalCheckGameOver(draft, true, get().addLog); return; }
      const activeSideKey = draft.turn;
      const activeSide = draft[activeSideKey];
      if (!activeSide) return;
      activeSide.field.forEach(card => { if (card) card.hasActed = false; }); 
      while (activeSide.hand.length < GAME_RULES.HAND_SIZE && activeSide.deck.length > 0) {
          activeSide.hand.push(activeSide.deck.pop()!);
      }
      const activeNonFlippedCount = activeSide.field.filter(c => c && !c.isFlipped).length; 
      if (activeSide.hand.length === 0 && activeSide.deck.length === 0 && activeNonFlippedCount <= 1) {
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
      if (!draft || !draft.player || !draft.opponent) return; 
      const attackerSide = draft[attackerSideKey];
      const defenderSide = draft[defenderSideKey];
      if (!attackerSide || !defenderSide) return; 
      attackerSide.score++;
      get().addLog(draft, 'game.score_log', { home: draft.player.score, away: draft.opponent.score });
      const scorerName = attackerSide.field.find(c => c && c.instanceId === attackerId)?.name || 'Unknown'; 
      draft.goals.push({ scorerSide: attackerSideKey, scorerName, reason, timestamp: Date.now() });
      draft.goalEvent = { type: 'goal', scorer: attackerSideKey, scorerName, reason };
      const attIdx = attackerSide.field.findIndex(c => c && c.instanceId === attackerId); 
      if (attIdx !== -1) attackerSide.discard.push(attackerSide.field.splice(attIdx, 1)[0]);
      defenderSide.field.forEach(c => { if (c && c.isFlipped) defenderSide.discard.push(c); }); 
      defenderSide.field = defenderSide.field.filter(c => c && !c.isFlipped);
      if (internalCheckGameOver(draft, false, get().addLog)) return;
      draft.phase = 'MAIN';
      draft.attackerInstanceId = null;
      if (!draft.stoppageTimeAction) draft.turn = defenderSideKey; 
    },

    resumeGame: () => {
        set(produce((state: FullGameStore) => {
            const draft = state.gameState;
            if (!draft) return;
            
            // --- GESTION DES ÉVÉNEMENTS EXCEPTIONNELS (PENALTY, CORNER, ETC.) ---
            const event = draft.exceptionalEvent;
            if (event) {
                const defenderType = draft.turn;
                const attackerType = defenderType === 'player' ? 'opponent' : 'player';
                const attackerSide = draft[attackerType];
                const defenderSide = draft[defenderType];

                if (event.type === 'PENALTY') {
                    if (event.result === 'goal') {
                        get().addLog(draft, 'logs.penalty_goal', { player: event.attackerName });
                        get().resolveGoal(draft, attackerType, defenderType, draft.attackerInstanceId!, "logs.penalty_goal");
                    } else {
                        get().addLog(draft, 'logs.penalty_saved', { player: event.defenderName });
                        // Défausse de l'attaquant et du défenseur agressif après l'arrêt
                        const attIdx = attackerSide.field.findIndex(c => c.instanceId === draft.attackerInstanceId);
                        if (attIdx !== -1) attackerSide.discard.push(attackerSide.field.splice(attIdx, 1)[0]);
                        
                        const defIdx = defenderSide.field.findIndex(c => c.name === event.defenderName);
                        if (defIdx !== -1) defenderSide.discard.push(defenderSide.field.splice(defIdx, 1)[0]);
                        
                        draft.phase = 'MAIN';
                        draft.attackerInstanceId = null;
                        draft.turn = defenderType;
                        draft.hasActionUsed = false;
                        get().startTurn(draft);
                    }
                } 
                else if (event.type === 'CORNER' || event.type === 'FREE_KICK') {
                    // Logique pour Corner / Coup Franc (à implémenter plus tard)
                    get().addLog(draft, `logs.${event.type.toLowerCase()}_result`, { player: event.attackerName });
                    draft.phase = 'MAIN';
                    draft.attackerInstanceId = null;
                    draft.turn = defenderType;
                    draft.hasActionUsed = false;
                    get().startTurn(draft);
                }

                draft.exceptionalEvent = null;
                draft.penaltyEvent = null; // Nettoyage compatibilité
                return;
            }

            // Fallback pour l'ancien penaltyEvent si exceptionalEvent est vide (sécurité)
            if (draft.penaltyEvent?.active) {
                const penalty = draft.penaltyEvent;
                const defenderType = draft.turn;
                const attackerType = defenderType === 'player' ? 'opponent' : 'player';
                const attackerSide = draft[attackerType];
                const defenderSide = draft[defenderType];
                
                if (penalty.result === 'goal') {
                    get().addLog(draft, 'logs.penalty_goal', { player: penalty.attackerName });
                    get().resolveGoal(draft, attackerType, defenderType, draft.attackerInstanceId!, "logs.penalty_goal");
                } else {
                    get().addLog(draft, 'logs.penalty_saved', { player: penalty.defenderName });
                    const attIdx = attackerSide.field.findIndex(c => c.instanceId === draft.attackerInstanceId);
                    if (attIdx !== -1) attackerSide.discard.push(attackerSide.field.splice(attIdx, 1)[0]);
                    const defIdx = defenderSide.field.findIndex(c => c.name === penalty.defenderName);
                    if (defIdx !== -1) defenderSide.discard.push(defenderSide.field.splice(defIdx, 1)[0]);
                    draft.phase = 'MAIN';
                    draft.attackerInstanceId = null;
                    draft.turn = defenderType;
                    draft.hasActionUsed = false;
                    get().startTurn(draft);
                }
                draft.penaltyEvent = null;
                return;
            }

            draft.goalEvent = null;
            if (draft.winner) return;
            if (draft.stoppageTimeAction) internalCheckGameOver(draft, true, get().addLog);
            else get().startTurn(draft);
        }));
    },

    checkMomentumGoal: (draft) => {
      if (!draft) return false;
      const checkSide = (sideKey: 'player' | 'opponent') => {
          const side = draft[sideKey];
          if (!side || !side.field) return false; 
          
          if (side.field.filter(c => c && c.isFlipped).length >= 3) {
              const attackerSideKey = sideKey === 'player' ? 'opponent' : 'player';
              const attackerSide = draft[attackerSideKey];
              const attackerId = draft.attackerInstanceId || (attackerSide && attackerSide.field && attackerSide.field[0]?.instanceId);
              if (attackerId) {
                get().resolveGoal(draft, attackerSideKey, sideKey, attackerId, "logs.goal_momentum");
                return true;
              }
          }
          return false;
      };
      return checkSide('player') || checkSide('opponent');
    },

    checkGameOver: (draft, forced = false) => {
      if (draft) return internalCheckGameOver(draft, forced, get().addLog);
      else {
          set(produce((state: FullGameStore) => { if (state.gameState) internalCheckGameOver(state.gameState, forced, get().addLog); }));
          return true;
      }
    }
  };
};
