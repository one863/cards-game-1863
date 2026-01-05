import { StateCreator } from 'zustand';
import { GameState, GameLog } from '../../types';

export interface GameStatusSlice {
  gameState: GameState | null;
  selectedAttackerId: string | null;
  selectedBoostId: string | null;
  setSelectedAttackerId: (id: string | null) => void;
  setSelectedBoostId: (id: string | null) => void;
  addLog: (draft: GameState, key: string, params?: any) => void;
  clearGoalEvent: () => void;
  quitMatch: () => void;
}

export const createGameStatusSlice: StateCreator<GameStatusSlice, [], [], GameStatusSlice> = (set, get) => ({
  gameState: null,
  selectedAttackerId: null,
  selectedBoostId: null,

  setSelectedAttackerId: (id) => set({ selectedAttackerId: id }),
  setSelectedBoostId: (id) => set({ selectedBoostId: id }),

  addLog: (draft, key, params = {}) => {
    if (!draft || !draft.log) return;
    draft.log.unshift({ key, params, id: Math.random() });
    if (draft.log.length > 150) draft.log.pop();
  },

  clearGoalEvent: () => set((state) => {
    if (!state.gameState) return state;
    return {
      gameState: { ...state.gameState, goalEvent: null }
    };
  }),

  quitMatch: () => set({ gameState: null, selectedAttackerId: null, selectedBoostId: null })
});
