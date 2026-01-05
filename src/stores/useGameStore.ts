// src/stores/useGameStore.ts
import { create } from 'zustand';
import { createGameStatusSlice, GameStatusSlice } from './slices/gameStatusSlice';
import { createGameEngineSlice, GameEngineSlice } from './slices/gameEngineSlice';
import { createGameActionSlice, GameActionSlice } from './slices/gameActionSlice';

export type GameStore = GameStatusSlice & GameEngineSlice & GameActionSlice;

export const useGameStore = create<GameStore>()((...a) => ({
  ...createGameStatusSlice(...a),
  ...createGameEngineSlice(...a),
  ...createGameActionSlice(...a),
}));
