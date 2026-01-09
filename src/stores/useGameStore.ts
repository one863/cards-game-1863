// src/stores/useGameStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createGameStatusSlice, GameStatusSlice } from './slices/gameStatusSlice';
import { createGameEngineSlice, GameEngineSlice } from './slices/gameEngineSlice';
import { createGameActionSlice, GameActionSlice } from './slices/gameActionSlice';

export type GameStore = GameStatusSlice & GameEngineSlice & GameActionSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createGameStatusSlice(...a),
      ...createGameEngineSlice(...a),
      ...createGameActionSlice(...a),
    }),
    {
      name: 'game-storage-v2', // Nouvelle version pour éviter les conflits
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gameState: state.gameState,
        saveHistory: state.saveHistory, // On persiste l'historique !
        selectedAttackerId: state.selectedAttackerId,
        selectedBoostId: state.selectedBoostId,
        isDeckOpen: state.isDeckOpen,
        isDiscardOpen: state.isDiscardOpen
      }),
    }
  )
);
