import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { GameStatusSlice } from './gameStatusSlice';
import { GameEngineSlice } from './gameEngineSlice';
import { GAME_RULES } from '../../core/rules/settings';
import { GameState, ExceptionalEventType } from '../../types';
import { triggerEffects, getEffectValue, calculateTotalPowerBonus } from '../../core/engine/effectSystem';

export interface GameActionSlice {
  handlePlayCard: (cardIndex: number, playerType?: 'player' | 'opponent') => void;
  handleAttack: (attackerId: string, playerType?: 'player' | 'opponent') => void;
  handleBlock: (blockerId: string, boostId?: string | null) => void;
  handleAIIntent: (action: string, reason: string) => void;
  handlePass: (playerType?: 'player' | 'opponent', force?: boolean) => void;
  clearExplosion: () => void;
  clearBoost: () => void;
  clearPenalty: () => void; 
  clearExceptionalEvent: () => void; 
}

type FullGameStore = GameStatusSlice & GameEngineSlice & GameActionSlice;

const getSideKey = (type: string) => type === 'player' ? 'logs.side_you' : 'logs.side_opp';

export const createGameActionSlice: StateCreator<FullGameStore, [], [], GameActionSlice> = (set, get) => {

  return {
    clearExplosion: () => {
        set(produce((state: FullGameStore) => {
            if (state.gameState) state.gameState.explosionEvent = null;
        }));
    },

    clearBoost: () => {
        set(produce((state: FullGameStore) => {
            if (state.gameState) state.gameState.boostEvent = null;
        }));
    },

    clearPenalty: () => {
        set(produce((state: FullGameStore) => {
            if (state.gameState) {
                state.gameState.penaltyEvent = null;
                state.gameState.exceptionalEvent = null;
            }
        }));
    },

    clearExceptionalEvent: () => {
        set(produce((state: FullGameStore) => {
            if (state.gameState) state.gameState.exceptionalEvent = null;
        }));
    },

    handlePlayCard: (cardIndex, playerType = 'player') => {
      set(produce((state: FullGameStore) => {
        const draft = state.gameState;
        if (!draft || draft.winner || draft.hasActionUsed || draft.turn !== playerType) return;
        const playerSide = draft[playerType];
        if (!playerSide || !playerSide.hand || !playerSide.field) return;

        if (playerSide.field.length >= GAME_RULES.FIELD_SIZE) {
            get().addLog(draft, 'logs.field_full');
            return;
        }

        if (playerSide.hand[cardIndex]) {
          const card = playerSide.hand.splice(cardIndex, 1)[0];
          playerSide.field.push({ ...card, hasActed: false, isFlipped: false });
          get().addLog(draft, 'logs.play_card', { side: getSideKey(playerType), player: card.name, vaep: card.vaep });

          const addLogWrapper = (key: string, params?: any) => get().addLog(draft, key, params);
          const playedCardRef = playerSide.field[playerSide.field.length - 1];
          triggerEffects('onPlay', draft, playedCardRef, playerType, addLogWrapper);

          if (!draft.meneurActive) {
              draft.turn = playerType === 'player' ? 'opponent' : 'player';
              draft.phase = 'MAIN';
              get().startTurn(draft);
          } else {
              draft.phase = 'MAIN';
          }
        }
      }));
    },

    handleAttack: (attackerId, playerType = 'player') => {
      set(produce((state: FullGameStore) => {
        const draft = state.gameState;
        if (!draft || draft.winner || draft.hasActionUsed || draft.turn !== playerType) return;
        const attackerSide = draft[playerType];
        const opponentType = playerType === 'player' ? 'opponent' : 'player';
        const card = attackerSide.field.find(c => c.instanceId === attackerId);
        
        if (card && !card.isFlipped && !card.hasActed) {
          get().addLog(draft, 'logs.attack', { side: getSideKey(playerType), player: card.name, vaep: card.vaep });
          const hasBlockers = draft[opponentType].field.some(c => !c.isFlipped);
          draft.meneurActive = false; 
          if (!hasBlockers) {
              get().addLog(draft, 'logs.goal_open');
              get().resolveGoal(draft, playerType, opponentType, attackerId, "logs.goal_open");
          } else {
              draft.attackerInstanceId = attackerId;
              draft.phase = 'ATTACK_DECLARED';
              draft.turn = opponentType; 
              draft.hasActionUsed = true;
          }
        }
      }));
      set({ selectedAttackerId: null });
    },

    handlePass: (playerType = 'player', force = false) => {
        set(produce((state: FullGameStore) => {
            const draft = state.gameState;
            if (!draft || draft.winner || draft.turn !== playerType) return;

            const activePlayerSide = draft[playerType];
            const hasBlockersAvailable = activePlayerSide.field.some(c => !c.isFlipped);

            if (draft.phase === 'ATTACK_DECLARED') {
                if (hasBlockersAvailable && !force) {
                    get().addLog(draft, 'logs.must_block');
                    return;
                }
                
                if (draft.attackerInstanceId) {
                    const AttackerType = playerType === 'player' ? 'opponent' : 'player';
                    get().addLog(draft, 'logs.goal_open');
                    get().resolveGoal(draft, AttackerType, playerType, draft.attackerInstanceId, "logs.goal_open");
                    return;
                }
            }

            // CORRECTION : Autoriser le PASS si meneurActive est vrai (Passer l'action bonus)
            const canPass = force || draft.stoppageTimeAction === playerType || draft.meneurActive;
            
            if (!canPass) {
                get().addLog(draft, 'logs.no_pass_allowed'); 
                return;
            }

            draft.meneurActive = false;
            // Si c'était une action Meneur qu'on a passée, on log différemment ?
            // get().addLog(draft, 'logs.pass_turn', { side: getSideKey(playerType) }); // Gardons le log standard pour l'instant
            
            draft.turn = playerType === 'player' ? 'opponent' : 'player';
            draft.phase = 'MAIN';
            get().startTurn(draft);
        }));
    },

    handleAIIntent: (action, reason) => {
      set(produce((state: FullGameStore) => { 
          if (state.gameState) {
              const ai = state.gameState.opponent;
              let mentality = 'logs.mentality_NEUTRAL';
              if (ai.score < state.gameState.player.score) mentality = 'logs.mentality_OFFENSIVE';
              else if (ai.score > state.gameState.player.score) mentality = 'logs.mentality_DEFENSIVE';
              get().addLog(state.gameState, 'logs.ai_intent', { action, reason });
              get().addLog(state.gameState, 'logs.ai_context', { hand: ai.hand.length, field: ai.field.filter(c => !c.isFlipped).length, mentality });
          }
      }));
    },

    handleBlock: (blockerId, boostId = null) => {
      set(produce((state: FullGameStore) => {
          const draft = state.gameState;
          const attackerId = draft?.attackerInstanceId;
          if (!draft || draft.winner || !attackerId) return;

          const DefenderType = draft.turn;
          const AttackerType = DefenderType === 'player' ? 'opponent' : 'player';
          const attackerSide = draft[AttackerType];
          const defenderSide = draft[DefenderType];
          const attackerCard = attackerSide.field.find(c => c.instanceId === attackerId);
          const blockerCard = defenderSide.field.find(c => c.instanceId === blockerId);
          
          if (!attackerCard || !blockerCard) { 
              draft.phase = 'MAIN'; draft.turn = AttackerType; draft.attackerInstanceId = null;
              get().startTurn(draft); return; 
          }

          let boostValue = 0;
          if (boostId) {
              const boostIdx = defenderSide.hand.findIndex(c => c.instanceId === boostId);
              if (boostIdx !== -1) {
                  const boostCard = defenderSide.hand.splice(boostIdx, 1)[0];
                  boostValue = getEffectValue(boostCard, 'value');
                  defenderSide.discard.push(boostCard);
                  get().addLog(draft, 'logs.use_boost', { side: getSideKey(DefenderType), player: blockerCard.name, val: boostValue });
                  draft.boostEvent = { active: true, val: boostValue, side: DefenderType, timestamp: Date.now() };
              }
          }

          const attDetails = calculateTotalPowerBonus(draft, attackerCard, AttackerType, 'attacker');
          const attTotal = attackerCard.vaep + attDetails.bonus;
          const defDetails = calculateTotalPowerBonus(draft, blockerCard, DefenderType, 'defender');
          const defTotal = blockerCard.vaep + defDetails.bonus + boostValue;

          if (attDetails.list) get().addLog(draft, 'logs.active_effects', { player: attackerCard.name, list: attDetails.list });
          if (defDetails.list) get().addLog(draft, 'logs.active_effects', { player: blockerCard.name, list: defDetails.list });

          get().addLog(draft, 'logs.duel_win_check', { attName: attackerCard.name, attTotal, defName: blockerCard.name, defTotal });

          const addLogWrapper = (key: string, params?: any) => get().addLog(draft, key, params);

          if (attTotal > defTotal) {
              get().addLog(draft, 'logs.duel_outcome_win', { attacker: attackerCard.name, defender: blockerCard.name });
              blockerCard.isFlipped = true; 
              triggerEffects('onDuelResolve', draft, attackerCard, AttackerType, addLogWrapper, ['WIN', blockerCard]);
              triggerEffects('onDuelResolve', draft, blockerCard, DefenderType, addLogWrapper, ['LOSE', attackerCard]);
              if (defenderSide.field.filter(c => c.isFlipped).length >= 3) {
                  get().addLog(draft, 'logs.goal_momentum');
                  get().checkMomentumGoal(draft);
              } else {
                  draft.phase = 'MAIN'; draft.attackerInstanceId = null; draft.turn = DefenderType; draft.hasActionUsed = false; get().startTurn(draft);
              }
          } 
          else if (attTotal < defTotal) {
              get().addLog(draft, 'logs.duel_outcome_lose', { attacker: attackerCard.name, defender: blockerCard.name });
              const attIdx = attackerSide.field.findIndex(c => c.instanceId === attackerId);
              if (attIdx !== -1) {
                  const attCard = attackerSide.field.splice(attIdx, 1)[0];
                  attackerSide.discard.push(attCard);
                  triggerEffects('onDuelResolve', draft, attackerCard, AttackerType, addLogWrapper, ['LOSE', blockerCard]);
                  triggerEffects('onDuelResolve', draft, blockerCard, DefenderType, addLogWrapper, ['WIN', attackerCard]);
              }
              const flippedIdx = defenderSide.field.findIndex(c => c.isFlipped);
              if (flippedIdx !== -1) { defenderSide.discard.push(defenderSide.field.splice(flippedIdx, 1)[0]); get().addLog(draft, 'logs.defensive_recovery'); }
              draft.phase = 'MAIN'; draft.attackerInstanceId = null; draft.turn = DefenderType; draft.hasActionUsed = false; get().startTurn(draft);
          } 
          else {
              get().addLog(draft, 'logs.duel_outcome_draw', { attacker: attackerCard.name, defender: blockerCard.name });
              let selectedEvent: ExceptionalEventType = null;
              const isBlockerAggressive = blockerCard.effects?.includes("AGRESSIF");
              if (isBlockerAggressive) {
                  selectedEvent = 'PENALTY';
              } 
              if (selectedEvent) {
                  const result = selectedEvent === 'PENALTY' ? (Math.random() < 0.7 ? 'goal' : 'saved') : 'success';
                  
                  draft.exceptionalEvent = {
                      type: selectedEvent,
                      attackerName: attackerCard.name,
                      defenderName: blockerCard.name,
                      result: result as any,
                      timestamp: Date.now(),
                      attackerId: attackerId
                  };
                  
                  if (selectedEvent === 'PENALTY') {
                      draft.penaltyEvent = {
                          active: true,
                          attackerName: attackerCard.name,
                          defenderName: blockerCard.name,
                          result: result as any,
                          timestamp: Date.now()
                      };
                      get().addLog(draft, 'logs.penalty_trigger_defender', { player: blockerCard.name });
                  } else {
                      get().addLog(draft, `logs.${selectedEvent.toLowerCase()}_trigger`, { player: blockerCard.name });
                  }
              } else {
                  const attIdx = attackerSide.field.findIndex(c => c.instanceId === attackerId);
                  if (attIdx !== -1) attackerSide.discard.push(attackerSide.field.splice(attIdx, 1)[0]);
                  const defIdx = defenderSide.field.findIndex(c => c.instanceId === blockerId);
                  if (defIdx !== -1) defenderSide.discard.push(defenderSide.field.splice(defIdx, 1)[0]);
                  triggerEffects('onDuelResolve', draft, attackerCard, AttackerType, addLogWrapper, ['DRAW', blockerCard]);
                  triggerEffects('onDuelResolve', draft, blockerCard, DefenderType, addLogWrapper, ['DRAW', attackerCard]);
                  draft.phase = 'MAIN'; draft.attackerInstanceId = null; draft.turn = DefenderType; draft.hasActionUsed = false; get().startTurn(draft);
              }
          }
      }));
      set({ selectedBoostId: null });
    }
  };
};