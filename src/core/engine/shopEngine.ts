// src/core/engine/shopEngine.ts
import BOOSTERS from '@/data/boosters.json';
import { generatePlayer } from './playerGenerator';
import { Player } from '@/types';

interface Pack {
  id: string;
  name: string;
  cost: number;
  cardCount: number;
  dropRates: Record<string, number>;
}

const drawOneCard = (rates: Record<string, number>): Player => {
  const rand = Math.random();
  let cumulative = 0;
  let targetTier = 'min_50';

  for (const [tier, prob] of Object.entries(rates)) {
    cumulative += prob;
    if (rand < cumulative) {
      targetTier = tier;
      break;
    }
  }

  const minRating = parseInt(targetTier.split('_')[1]);
  const maxRating = minRating + 9;

  return generatePlayer({ minRating, maxRating });
};

export const openBooster = (packId: string): Player[] => {
  const pack = (BOOSTERS as Pack[]).find(b => b.id === packId);
  if (!pack) throw new Error("Unknown pack");

  const cards: Player[] = [];
  for (let i = 0; i < pack.cardCount; i++) {
    cards.push(drawOneCard(pack.dropRates));
  }

  return cards;
};
