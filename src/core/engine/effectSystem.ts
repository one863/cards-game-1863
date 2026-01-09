import { GameState, Player, Position } from '@/types';

export interface EffectDefinition {
  onPlay?: (context: EffectContext) => void;
  onDuelResolve?: (context: EffectContext, result: 'WIN' | 'LOSE' | 'DRAW', opponentCard: Player) => void;
  getPowerBonus?: (context: EffectContext, side: 'attacker' | 'defender') => number;
  logLabel?: (side: 'attacker' | 'defender') => string | null;
  value?: number;
}

export interface EffectContext {
  gameState: GameState;
  card: Player;
  ownerSide: 'player' | 'opponent';
  addLog: (key: string, params?: any) => void;
}

const createPoste = (type: 'attacker' | 'defender' | 'both', amount: number, label: string): EffectDefinition => ({
  getPowerBonus: (_, side) => (type === 'both' || side === type) ? amount : 0,
  logLabel: (side) => ((type === 'both' || side === type) && amount > 0) ? `${label} (+${amount} ${side === 'attacker' ? 'ATT' : 'DEF'})` : null
});

const MIDFIELD_POSITIONS: Position[] = ['CDM', 'CM', 'CAM', 'LM', 'RM'];
const CAM_TARGET_POSITIONS: Position[] = ['LW', 'RW', 'ST'];

export const CARD_EFFECTS: Record<string, EffectDefinition> = {
  "AGRESSIF": {
    onDuelResolve: ({ gameState, card, ownerSide, addLog }, result, opponentCard) => {
      if (result === 'LOSE' && gameState && !gameState.goalEvent) {
        const oppSideKey = ownerSide === 'player' ? 'opponent' : 'player';
        const oppSide = gameState[oppSideKey];
        if (oppSide && oppSide.field) {
            const oppIdx = oppSide.field.findIndex(c => c.instanceId === opponentCard.instanceId);
            if (oppIdx !== -1) {
              const victim = oppSide.field.splice(oppIdx, 1)[0];
              oppSide.discard.push(victim);
              gameState.explosionEvent = { active: true, timestamp: Date.now() };
              addLog('logs.aggressif_trigger', { side: ownerSide === 'player' ? 'logs.side_you' : 'logs.side_opp', player: card.name, victim: opponentCard.name });
            }
        }
      }
    }
  },
  "POSSESSION": { getPowerBonus: () => 0 },
  "BOOST1": { value: 1, getPowerBonus: () => 0 },
  "BOOST2": { value: 2, getPowerBonus: () => 0 },
  
  // MISE À JOUR : Gardien (GK) donne désormais +1 DEF au lieu de +2
  "GK": createPoste('defender', 1, 'GK'),
  
  "ST": {
    getPowerBonus: (context, side) => {
        if (side !== 'attacker') return 0;
        const oppSideKey = context.ownerSide === 'player' ? 'opponent' : 'player';
        const oppField = context.gameState[oppSideKey]?.field || [];
        const hasCB = oppField.some(p => !p.isFlipped && p.pos === 'CB');
        return hasCB ? 1 : 2;
    },
    logLabel: (side) => side === 'attacker' ? "ST" : null
  },

  "CB": createPoste('defender', 1, 'CB'),
  "CDM": createPoste('defender', 1, 'CDM'),
  "LB": createPoste('defender', 1, 'LB'),
  "RB": createPoste('defender', 1, 'RB'),
  
  "LW": {
    getPowerBonus: (context, side) => {
        if (side !== 'attacker') return 0;
        const oppSideKey = context.ownerSide === 'player' ? 'opponent' : 'player';
        const oppField = context.gameState[oppSideKey]?.field || [];
        const hasCounter = oppField.some(p => !p.isFlipped && ['LB', 'RB', 'LM', 'RM'].includes(p.pos));
        return hasCounter ? 0 : 2;
    },
    logLabel: (side) => (side === 'attacker' ? "LW (+2 ATT)" : null)
  },
  "RW": {
    getPowerBonus: (context, side) => {
        if (side !== 'attacker') return 0;
        const oppSideKey = context.ownerSide === 'player' ? 'opponent' : 'player';
        const oppField = context.gameState[oppSideKey]?.field || [];
        const hasCounter = oppField.some(p => !p.isFlipped && ['LB', 'RB', 'LM', 'RM'].includes(p.pos));
        return hasCounter ? 0 : 2;
    },
    logLabel: (side) => (side === 'attacker' ? "RW (+2 ATT)" : null)
  },
  
  "LM": createPoste('attacker', 1, 'LM'),
  "RM": createPoste('attacker', 1, 'RM'),
  
  "CAM": {
    onPlay: ({ gameState, card, ownerSide, addLog }) => {
      if (!gameState || !card) return;
      const side = gameState[ownerSide];
      if (side && side.field) {
          const validAttackers = side.field.filter(c => 
              c && 
              c.instanceId !== card.instanceId && 
              CAM_TARGET_POSITIONS.includes(c.pos) && 
              !c.isFlipped && 
              !c.hasActed
          );
          
          if (validAttackers.length > 0) {
            addLog('logs.meneur_trigger', { side: ownerSide === 'player' ? 'logs.side_you' : 'logs.side_opp', player: card.name });
            if (ownerSide === 'player') addLog('game.attack_bonus_instruction'); 
            gameState.hasActionUsed = false; 
            gameState.meneurActive = true;
            card.hasActed = true; 
          }
      }
    }
  },
  "CM": {},
  "VOLUME": { getPowerBonus: () => 0 },
  "TECHNIQUE": { getPowerBonus: () => 0 },
  "VISION": { getPowerBonus: () => 0 },
  "PROVOCATEUR": { getPowerBonus: () => 0 },
  "FINISSEUR": { getPowerBonus: () => 0 },
  "VITESSE": { getPowerBonus: () => 0 },
  "AERIEN": { getPowerBonus: () => 0 },
  "PASSEUR": { getPowerBonus: () => 0 },
  "SOLIDAIRE": { getPowerBonus: () => 0 },
  "PHYSIQUE": { getPowerBonus: () => 0 },
  "TIRLOINTAIN": { getPowerBonus: () => 0 }
};

const getCardEffects = (card: Player) => {
    if (!card) return [];
    const effects = (card.effects || []).filter(e => !!e && e !== "");
    if (card.pos) effects.push(card.pos);
    return effects;
};

export const calculateTotalPowerBonus = (
    gameState: GameState, 
    card: Player, 
    ownerSide: 'player' | 'opponent', 
    situation: 'attacker' | 'defender'
): { bonus: number, list: string | null } => {
    if (!card || !gameState || !ownerSide) return { bonus: 0, list: null };
    
    let totalBonus = 0;
    const labels: string[] = [];
    const context: EffectContext = { gameState, card, ownerSide, addLog: () => {} };

    getCardEffects(card).forEach(name => {
        const def = CARD_EFFECTS[name];
        if (def && def.getPowerBonus) {
            const b = def.getPowerBonus(context, situation);
            if (b > 0) {
                totalBonus += b;
                const l = def.logLabel?.(situation);
                if (name === 'ST' && situation === 'attacker') {
                    labels.push(`ST (+${b} ATT)`);
                } else if (l) {
                    labels.push(l);
                }
            }
        }
    });

    const sideData = gameState[ownerSide];
    if (sideData && sideData.field) {
        const hasActiveCMMate = sideData.field.some(p => p && p.instanceId !== card.instanceId && p.pos === 'CM' && !p.isFlipped);
        const isMidfielder = MIDFIELD_POSITIONS.includes(card.pos);
        if (situation === 'defender' && hasActiveCMMate && isMidfielder) {
            totalBonus += 1;
            labels.push("MOTEUR CM (+1 DEF)");
        }
    }

    return { bonus: totalBonus, list: labels.length > 0 ? labels.join(", ") : null };
};

export const triggerEffects = (trigger: keyof EffectDefinition, gameState: GameState, card: Player, ownerSide: 'player' | 'opponent', addLog: (k: string, p?: any) => void, extraArgs: any[] = []) => {
  if (!card || !gameState || !ownerSide) return;
  getCardEffects(card).forEach(name => {
    const def = CARD_EFFECTS[name];
    if (def && typeof def[trigger] === 'function') {
        try {
            (def[trigger] as Function)({ gameState, card, ownerSide, addLog }, ...extraArgs);
        } catch (e) {
            console.error(`Error triggering effect ${name}.${trigger}:`, e);
        }
    }
  });
};

export const getEffectValue = (card: Player, prop: keyof EffectDefinition = 'value'): number => {
  if (!card) return 0;
  return getCardEffects(card).reduce((acc, name) => {
    const val = CARD_EFFECTS[name]?.[prop];
    return acc + (typeof val === 'number' ? val : 0);
  }, 0);
};