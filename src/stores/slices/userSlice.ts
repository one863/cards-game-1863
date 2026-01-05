// src/stores/slices/userSlice.ts
import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { Player, UserProfile } from '../../types';
import { generateTeam } from '../../core/engine/playerGenerator';
import { openBooster } from '../../core/engine/shopEngine';
import { GAME_RULES } from '../../core/rules/settings';
import BOOSTERS from '../../data/boosters.json';

export interface UserSlice {
  credits: number;
  collection: Player[];
  activeTeam: Player[];
  initStarterPack: () => void;
  buyBooster: (packId: string) => { success: boolean; cards?: Player[]; message?: string };
  saveActiveTeam: (newTeam: Player[]) => void;
  addCredits: (amount: number) => void;
  resetProfile: () => void;
}

const INITIAL_USER_STATE: UserProfile = {
  credits: 500,
  collection: [],
  activeTeam: []
};

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (set, get) => ({
  ...INITIAL_USER_STATE,

  initStarterPack: () => {
    if (get().collection.length > 0) return;

    console.log("Zustand Slice: Generating Starter Pack...");
    const starterTeam = generateTeam(60);
    set({ 
        collection: starterTeam,
        activeTeam: starterTeam.slice(0, GAME_RULES.DECK_SIZE)
    });
  },

  buyBooster: (packId: string) => {
    const state = get();
    const pack = (BOOSTERS as any[]).find(b => b.id === packId);
    
    if (!pack) return { success: false, message: "Invalid pack" };
    if (state.credits < pack.cost) return { success: false, message: "Not enough credits" };

    const newCards = openBooster(packId);

    set(produce((draft: UserSlice) => {
      draft.credits -= pack.cost;
      draft.collection.push(...newCards);
    }));

    return { success: true, cards: newCards };
  },

  saveActiveTeam: (newTeam: Player[]) => {
    set({ activeTeam: newTeam });
  },

  addCredits: (amount: number) => {
    set(produce((draft: UserSlice) => {
      draft.credits += amount;
    }));
  },
  
  resetProfile: () => set(INITIAL_USER_STATE)
});
