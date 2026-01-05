// src/stores/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserSlice, UserSlice } from './slices/userSlice';

export const useUserStore = create<UserSlice>()(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
    }),
    {
      name: '1863_USER_STORE',
      partialize: (state) => ({
          credits: state.credits, 
          collection: state.collection, 
          activeTeam: state.activeTeam 
      }),
    }
  )
);
