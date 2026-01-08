import { StateCreator } from 'zustand';
import { GameState, GameLog } from '@/types';

export interface GameStatusSlice {
  gameState: GameState | null;
  selectedAttackerId: string | null;
  selectedBoostId: string | null;
  isDiscardOpen: boolean;
  isDeckOpen: boolean; 
  canViewDeck: boolean; 
  setSelectedAttackerId: (id: string | null) => void;
  setSelectedBoostId: (id: string | null) => void;
  setDiscardOpen: (isOpen: boolean) => void;
  setDeckOpen: (isOpen: boolean) => void; 
  setCanViewDeck: (canView: boolean) => void; 
  addLog: (draft: GameState, key: string, params?: any) => void;
  clearGoalEvent: () => void;
  quitMatch: () => void;
}

export const createGameStatusSlice: StateCreator<GameStatusSlice, [], [], GameStatusSlice> = (set, get) => ({
  gameState: null,
  selectedAttackerId: null,
  selectedBoostId: null,
  isDiscardOpen: false,
  isDeckOpen: false,
  canViewDeck: false, 

  setSelectedAttackerId: (id) => set({ selectedAttackerId: id }),
  setSelectedBoostId: (id) => set({ selectedBoostId: id }),
  setDiscardOpen: (isOpen) => set({ isDiscardOpen: isOpen }),
  setDeckOpen: (isOpen) => set({ isDeckOpen: isOpen }),
  setCanViewDeck: (canView) => set({ canViewDeck: canView }),

  addLog: (draft, key, params = {}) => {
    if (!draft || !draft.log) return;
    draft.log.unshift({ key, params, id: Math.random() });
    // Augmentation de la limite de logs à 500 pour ne pas perdre l'historique
    if (draft.log.length > 500) draft.log.pop();
  },

  clearGoalEvent: () => set((state) => {
    if (!state.gameState) return state;
    return {
      gameState: { ...state.gameState, goalEvent: null }
    };
  }),

  quitMatch: () => set({ 
      gameState: null, 
      selectedAttackerId: null, 
      selectedBoostId: null, 
      isDiscardOpen: false,
      isDeckOpen: false,
      canViewDeck: false 
  })
});
