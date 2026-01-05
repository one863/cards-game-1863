import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { GameStatusSlice } from './gameStatusSlice';
import { GameEngineSlice } from './gameEngineSlice';
import { getKeywordPowerDetails } from '../../core/rules/keywords';
import { GAME_RULES } from '../../core/rules/settings';
import { GameState } from '../../types';

export interface GameActionSlice {
  handlePlayCard: (cardIndex: number, playerType?: 'player' | 'opponent') => void;
  handleAttack: (attackerId: string, playerType?: 'player' | 'opponent') => void;
  handleBlock: (blockerId: string, boostId?: string | null) => void;
  handleAIIntent: (action: string, reason: string) => void;
  handlePass: (playerType?: 'player' | 'opponent') => void;
  clearExplosion: () => void;
}

type FullGameStore = GameStatusSlice & GameEngineSlice & GameActionSlice;

export const createGameActionSlice: StateCreator<FullGameStore, [], [], GameActionSlice> = (set, get) => {

  return {
    clearExplosion: () => {
        set(produce((state: FullGameStore) => {
            if (state.gameState) {
                state.gameState.explosionEvent = null;
            }
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
          
          // EFFET MENEUR (CAM ou mot-clé MENEUR)
          const hasMeneur = card.effects?.includes("MENEUR") || card.pos === 'CAM';
          const canAttackWithOthers = playerSide.field.some(c => !c.isFlipped);

          // Si c'est un MENEUR, il consomme son action pour en donner une à un autre
          // NOTE: On ne force PAS l'attaque immédiate si pas possible ou si le joueur veut passer
          // Le bouton "PASSER" est géré dans l'interface, ici on prépare juste l'état.
          const finalHasActed = hasMeneur && canAttackWithOthers;
          
          playerSide.field.push({ ...card, hasActed: finalHasActed, isFlipped: false });
          get().addLog(draft, 'logs.play_card', { player: card.name, vaep: card.vaep });

          if (hasMeneur && canAttackWithOthers) {
              get().addLog(draft, 'logs.meneur_trigger', { player: card.name });
              // On reste dans le tour du même joueur pour qu'il puisse attaquer AVEC UN AUTRE
              draft.hasActionUsed = false; 
              draft.phase = 'MAIN';
          } else {
              draft.turn = playerType === 'player' ? 'opponent' : 'player';
              draft.phase = 'MAIN';
              get().startTurn(draft);
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
          get().addLog(draft, 'logs.attack', { player: card.name, vaep: card.vaep });
          
          const hasBlockers = draft[opponentType].field.some(c => !c.isFlipped);
          
          if (!hasBlockers) {
              get().resolveGoal(draft, playerType, opponentType, attackerId, "Pénurie de bloqueurs");
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

    handlePass: (playerType = 'player') => {
        set(produce((state: FullGameStore) => {
            const draft = state.gameState;
            if (!draft || draft.winner || draft.turn !== playerType) return;
            
            // Logique spéciale pour passer le tour du MENEUR
            const lastLog = draft.log[0];
            const isMeneurPhase = lastLog?.key === 'logs.meneur_trigger';

            if (isMeneurPhase) {
                get().addLog(draft, 'logs.pass_turn'); // Ou un log spécifique "Meneur skipped"
                // On redonne la main à l'adversaire
                draft.turn = playerType === 'player' ? 'opponent' : 'player';
                draft.phase = 'MAIN';
                get().startTurn(draft);
            } else {
                // Passage de tour normal (fin de timer ou action volontaire rare)
                get().addLog(draft, 'logs.pass_turn');
                draft.turn = playerType === 'player' ? 'opponent' : 'player';
                draft.phase = 'MAIN';
                get().startTurn(draft);
            }
        }));
    },

    handleAIIntent: (action, reason) => {
      set(produce((state: FullGameStore) => { if (state.gameState) get().addLog(state.gameState, 'logs.ai_intent', { action, reason }); }));
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
              draft.phase = 'MAIN'; 
              draft.turn = AttackerType;
              get().startTurn(draft); 
              return; 
          }

          let boostValue = 0;
          if (boostId) {
              const boostIdx = defenderSide.hand.findIndex(c => c.instanceId === boostId);
              if (boostIdx !== -1) {
                  const boostCard = defenderSide.hand.splice(boostIdx, 1)[0];
                  boostValue = boostCard.effects.includes("BOOST2") ? 2 : 1;
                  defenderSide.discard.push(boostCard);
                  get().addLog(draft, 'logs.use_boost', { player: blockerCard.name, boostCard: boostCard.name, val: boostValue });
              }
          }

          const attDetails = getKeywordPowerDetails(attackerCard, 'attacker', attackerSide.field);
          const attTotal = attackerCard.vaep + attDetails.bonus;

          const defDetails = getKeywordPowerDetails(blockerCard, 'defender', defenderSide.field);
          const defTotal = blockerCard.vaep + defDetails.bonus + boostValue;

          // LOG DES EFFETS ACTIFS 🔥
          if (attDetails.list) {
              get().addLog(draft, 'logs.active_effects', { player: attackerCard.name, list: attDetails.list });
          }
          if (defDetails.list) {
              get().addLog(draft, 'logs.active_effects', { player: blockerCard.name, list: defDetails.list });
          }

          get().addLog(draft, '-----------------------');
          get().addLog(draft, 'logs.duel_win_check', { attacker: attackerCard.name, attTotal, defender: blockerCard.name, defTotal });

          if (attTotal > defTotal) {
              get().addLog(draft, 'logs.duel_outcome_win', { attacker: attackerCard.name, defender: blockerCard.name });
              blockerCard.isFlipped = true; 
              
              // RENOMMAGE SACRIFICE -> AGRESSIF 🔥
              if (blockerCard.effects?.includes("AGRESSIF")) {
                  get().addLog(draft, 'logs.aggressif_trigger', { player: blockerCard.name, victim: attackerCard.name });
                  const attIdx = attackerSide.field.findIndex(c => c.instanceId === attackerId);
                  if (attIdx !== -1) {
                      attackerSide.discard.push(attackerSide.field.splice(attIdx, 1)[0]);
                      draft.explosionEvent = { active: true, timestamp: Date.now() };
                  }
              }

              if (!get().checkMomentumGoal(draft)) {
                  draft.phase = 'MAIN';
                  draft.attackerInstanceId = null;
                  draft.turn = DefenderType; 
                  get().startTurn(draft);
              }
          } 
          else if (attTotal < defTotal) {
              get().addLog(draft, 'logs.duel_outcome_lose', { attacker: attackerCard.name, defender: blockerCard.name });
              
              const attIdx = attackerSide.field.findIndex(c => c.instanceId === attackerId);
              if (attIdx !== -1) {
                  const attCard = attackerSide.field.splice(attIdx, 1)[0];
                  attackerSide.discard.push(attCard);

                  // RENOMMAGE SACRIFICE -> AGRESSIF 🔥
                  if (attCard.effects?.includes("AGRESSIF")) {
                      get().addLog(draft, 'logs.aggressif_trigger', { player: attCard.name, victim: blockerCard.name });
                      const defIdx = defenderSide.field.findIndex(c => c.instanceId === blockerId);
                      if (defIdx !== -1) {
                          defenderSide.discard.push(defenderSide.field.splice(defIdx, 1)[0]);
                          draft.explosionEvent = { active: true, timestamp: Date.now() };
                      }
                  }
              }

              const flippedIdx = defenderSide.field.findIndex(c => c.isFlipped);
              if (flippedIdx !== -1) {
                  defenderSide.discard.push(defenderSide.field.splice(flippedIdx, 1)[0]);
                  get().addLog(draft, 'logs.defensive_recovery');
              }

              draft.phase = 'MAIN';
              draft.attackerInstanceId = null;
              draft.turn = DefenderType; 
              get().startTurn(draft);
          } 
          else {
              get().addLog(draft, 'logs.duel_outcome_draw', { attacker: attackerCard.name, defender: blockerCard.name });
              
              const attIdx = attackerSide.field.findIndex(c => c.instanceId === attackerId);
              if (attIdx !== -1) attackerSide.discard.push(attackerSide.field.splice(attIdx, 1)[0]);
              
              const defIdx = defenderSide.field.findIndex(c => c.instanceId === blockerId);
              if (defIdx !== -1) defenderSide.discard.push(defenderSide.field.splice(defIdx, 1)[0]);

              draft.phase = 'MAIN';
              draft.attackerInstanceId = null;
              draft.turn = DefenderType;
              get().startTurn(draft);
          }
      }));
      set({ selectedBoostId: null });
    }
  };
};
