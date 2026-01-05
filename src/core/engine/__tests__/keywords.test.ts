import { describe, test, expect } from 'vitest';
import { checkSpecialGoal } from '../../rules/keywords';
import { Player, Position } from '../../../types';

const createMockPlayer = (overrides: Partial<Player>): Player => ({
    id: 'mock',
    name: 'Mock',
    fullName: 'Mock Player',
    pos: 'ST' as Position,
    nat: 'FR',
    vaep: 5,
    rating: 80,
    cost: 10,
    effects: [],
    ...overrides
});

describe('Keywords Logic', () => {
    test('PROVOCATEUR triggers penalty if 2+ defenders are flipped', () => {
        const attacker = createMockPlayer({ effects: ['PROVOCATEUR'] });
        const blocker = createMockPlayer({ effects: [] });
        const field = [
            createMockPlayer({ isFlipped: true }),
            createMockPlayer({ isFlipped: true }),
            createMockPlayer({ isFlipped: false }),
        ];

        const result = checkSpecialGoal(attacker, blocker, field);
        expect(result).not.toBeNull();
        expect(result?.reason).toContain('PROVOCATEUR');
    });

    test('TIRLOINTAIN triggers if 4+ defenders are active', () => {
        const attacker = createMockPlayer({ effects: ['TIRLOINTAIN'] });
        const blocker = createMockPlayer({ effects: [] });
        const field = [
            createMockPlayer({ isFlipped: false }),
            createMockPlayer({ isFlipped: false }),
            createMockPlayer({ isFlipped: false }),
            createMockPlayer({ isFlipped: false }),
        ];

        const result = checkSpecialGoal(attacker, blocker, field);
        expect(result).not.toBeNull();
        expect(result?.reason).toBe('TIR LOINTAIN');
    });

    test('AERIEN vs no AERIEN triggers goal if 1+ flipped', () => {
        const attacker = createMockPlayer({ effects: ['AERIEN'] });
        const blocker = createMockPlayer({ effects: [] });
        const field = [createMockPlayer({ isFlipped: true })];

        const result = checkSpecialGoal(attacker, blocker, field);
        expect(result?.reason).toBe('DOMINATION AERIENNE');
    });
});
