// src/core/engine/playerGenerator.ts
import { Player, Position } from '../../types';

const FIRST_NAMES = ["Leo", "Cristiano", "Kylian", "Erling", "Kevin", "Luka", "Vinicius", "Jude", "Harry", "Mohamed", "Antoine", "Zinedine", "Thierry", "Didier", "Michel", "David", "Andres", "Xavi", "Iker", "Manuel"];
const LAST_NAMES = ["Messi", "Ronaldo", "Mbappé", "Haaland", "De Bruyne", "Modric", "Junior", "Bellingham", "Kane", "Salah", "Griezmann", "Zidane", "Henry", "Deschamps", "Platini", "Beckham", "Iniesta", "Alonso", "Casillas", "Neuer"];
const NATIONS = ["FRA", "BRA", "ARG", "ENG", "ESP", "GER", "ITA", "POR", "BEL", "NED"];
const POSITIONS: Position[] = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"];

const KEYWORDS_POOL: Record<string, string[]> = {
    DEF: ["AGRESSIF", "CONTRE", "AERIEN", "PHYSIQUE", "SOLIDAIRE"],
    MID: ["PASSEUR", "VISION", "CONTRE", "TECHNIQUE", "VOLUME"],
    FWD: ["VITESSE", "FINISSEUR", "TIRLOINTAIN", "PROVOCATEUR", "AERIEN", "CPA"]
};

const getPosCategory = (pos: Position) => {
    if (["GK", "CB", "LB", "RB"].includes(pos)) return "DEF";
    if (["CDM", "CM", "CAM"].includes(pos)) return "MID";
    return "FWD";
};

export const generatePlayer = (options: { minRating?: number, maxRating?: number, position?: Position } = {}): Player => {
    const minR = options.minRating || 50;
    const maxR = options.maxRating || 99;
    const rating = Math.floor(Math.random() * (maxR - minR + 1)) + minR;
    const vaep = Math.min(9, Math.max(5, Math.floor(rating / 10)));

    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const nation = NATIONS[Math.floor(Math.random() * NATIONS.length)];
    const pos = options.position || POSITIONS[Math.floor(Math.random() * POSITIONS.length)];

    const effects: string[] = [];
    const category = getPosCategory(pos);
    const pool = KEYWORDS_POOL[category];
    const traitChance = (rating - 40) / 60; 
    
    if (Math.random() < traitChance) {
        const trait1 = pool[Math.floor(Math.random() * pool.length)];
        effects.push(trait1);
        if (rating > 80 && Math.random() < 0.4) {
            let trait2 = pool[Math.floor(Math.random() * pool.length)];
            while (trait2 === trait1) trait2 = pool[Math.floor(Math.random() * pool.length)];
            effects.push(trait2);
        }
    }

    return {
        id: crypto.randomUUID(), 
        name: `${firstName[0]}. ${lastName}`,
        fullName: `${firstName} ${lastName}`,
        pos: pos,
        nat: nation,
        vaep: vaep,
        rating: rating,
        cost: Math.floor(Math.pow(2, vaep - 4) * 5 * (1 + (rating % 10) * 0.1) * (1 + effects.length * 0.2)),
        effects: effects
    };
};

export const generateTeam = (avgRating = 70): Player[] => {
    const team: Player[] = [];
    team.push(generatePlayer({ position: 'GK', minRating: avgRating - 5, maxRating: avgRating + 5 }));
    for (let i = 0; i < 15; i++) team.push(generatePlayer({ minRating: avgRating - 10, maxRating: avgRating + 10 }));
    return team;
};
