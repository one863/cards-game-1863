// src/core/ai/aiConfig.ts

export const AI_CONFIG = {
    // SEUILS STRATÉGIQUES
    THRESHOLDS: {
        MOMENTUM_DANGER_COUNT: 2, // Nombre de cartes retournées déclenchant le mode survie
        HIGH_VAEP_STAR: 8,        // Seuil pour considérer une carte comme "Star"
        SUPER_STAR_VAEP: 9,       // Seuil pour une "Super Star" (Messi/Ronaldo tier)
    },

    // POIDS D'ÉVALUATION DES CARTES (evaluateCardWeight)
    WEIGHTS: {
        BASE_BONUS: 0,
        
        // Postes
        GK_EMERGENCY_BONUS: 10,   // Bonus pour jouer un GK en urgence
        GK_HOLD_PENALTY: -15,     // Malus pour jouer un GK trop tôt
        
        DEFENDER_MOMENTUM_BONUS: 5, // Bonus pour jouer DEF si danger Momentum
        
        SYNERGY_BONUS: 3,         // Bonus pour jouer une carte en synergie (CM <-> Milieu)
        
        WING_COUNTER_BONUS: 3,    // Bonus pour jouer un latéral contre un ailier
        
        STAR_RESPONSE_BONUS: 5,   // Bonus pour jouer une grosse carte face à une star adverse
        
        FLIPPED_PENALTY: -5,      // Malus pour une carte déjà retournée (moins utile)
    },

    // PRIORITÉS D'ACTION (Pour les logs ou scoring futur)
    PRIORITIES: {
        OPEN_GOAL: 100,
        MOMENTUM_ALL_IN: 90,
        WINNING_DUEL: 80,
        TACTICAL_PLAY: 60,
        FORCED_ATTACK: 40,
        SACRIFICE: 20
    }
};
