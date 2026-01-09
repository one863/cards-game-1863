import { StateCreator } from 'zustand';
import { GameState, GameLog } from '@/types';

export interface GameStatusSlice {
  gameState: GameState | null;
  selectedAttackerId: string | null;
  selectedBoostId: string | null;
  isDiscardOpen: boolean;
  isDeckOpen: boolean; 
  canViewDeck: boolean; 
  saveHistory: { id: string, state: GameState, timestamp: number }[]; 
  setSelectedAttackerId: (id: string | null) => void;
  setSelectedBoostId: (id: string | null) => void;
  setDiscardOpen: (isOpen: boolean) => void;
  setDeckOpen: (isOpen: boolean) => void; 
  setCanViewDeck: (canView: boolean) => void; 
  addLog: (draft: GameState, key: string, params?: any) => void;
  clearGoalEvent: () => void;
  quitMatch: (saveCurrent?: boolean) => void; 
  loadSave: (saveId: string) => void;
  deleteSave: (saveId: string) => void;
  archiveMatch: (state: GameState) => void; // Nouvelle méthode explicite d'archivage
}

export const createGameStatusSlice: StateCreator<GameStatusSlice, [], [], GameStatusSlice> = (set, get) => ({
  gameState: null,
  selectedAttackerId: null,
  selectedBoostId: null,
  isDiscardOpen: false,
  isDeckOpen: false,
  canViewDeck: false, 
  saveHistory: [],

  setSelectedAttackerId: (id) => set({ selectedAttackerId: id }),
  setSelectedBoostId: (id) => set({ selectedBoostId: id }),
  setDiscardOpen: (isOpen) => set({ isDiscardOpen: isOpen }),
  setDeckOpen: (isOpen) => set({ isDeckOpen: isOpen }),
  setCanViewDeck: (canView) => set({ canViewDeck: canView }),

  addLog: (draft, key, params = {}) => {
    if (!draft || !draft.log) return;
    draft.log.unshift({ key, params, id: Math.random() });
    if (draft.log.length > 500) draft.log.pop();
  },

  clearGoalEvent: () => set((state) => {
    if (!state.gameState) return state;
    return {
      gameState: { ...state.gameState, goalEvent: null }
    };
  }),

  archiveMatch: (matchState) => set((state) => {
      let newHistory = [...state.saveHistory];
      const matchId = matchState.id;
      const existingIdx = newHistory.findIndex(s => s.state.id === matchId);
      
      const newSave = {
          id: matchId,
          state: matchState,
          timestamp: Date.now()
      };

      if (existingIdx !== -1) {
          newHistory[existingIdx] = newSave;
      } else {
          newHistory.unshift(newSave);
      }
      
      if (newHistory.length > 15) newHistory.pop(); // On passe à 15 sauvegardes pour plus de confort
      return { saveHistory: newHistory };
  }),

  quitMatch: (saveCurrent = true) => set((state) => {
      if (saveCurrent && state.gameState) {
          get().archiveMatch(state.gameState);
      }

      return { 
          gameState: null, 
          selectedAttackerId: null, 
          selectedBoostId: null, 
          isDiscardOpen: false,
          isDeckOpen: false,
          canViewDeck: false
      };
  }),

  loadSave: (saveId) => set((state) => {
      const save = state.saveHistory.find(s => s.id === saveId);
      if (!save) return state;
      return {
          gameState: save.state,
          selectedAttackerId: null,
          selectedBoostId: null
      };
  }),

  deleteSave: (saveId) => set((state) => ({
      saveHistory: state.saveHistory.filter(s => s.id !== saveId)
  }))
});
