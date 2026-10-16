import { describe, expect, it } from 'vitest';
import { INTRO_PLAYED_KEY, introFrames, introStep, markIntroPlayed, shouldPlayIntro } from './intro';

describe('introStep', () => {
	it('reveals enough chars per tick to finish within the budget', () => {
		expect(introStep(600, 1200, 16)).toBe(8);
	});

	it('reveals at least one char per tick', () => {
		expect(introStep(12, 1200, 16)).toBe(1);
		expect(introStep(0, 1200, 16)).toBe(1);
	});
});

describe('introFrames', () => {
	it('steps through each row, ending exactly at its length', () => {
		expect(introFrames([5, 3], 2)).toEqual([
			{ line: 0, col: 2 },
			{ line: 0, col: 4 },
			{ line: 0, col: 5 },
			{ line: 1, col: 2 },
			{ line: 1, col: 3 }
		]);
	});

	it('gives an empty row one frame and no rows none', () => {
		expect(introFrames([0, 2], 5)).toEqual([{ line: 0, col: 0 }, { line: 1, col: 2 }]);
		expect(introFrames([], 1)).toEqual([]);
	});
});

describe('session flag', () => {
	const memory = () => {
		const items = new Map<string, string>();
		return {
			getItem: (key: string) => items.get(key) ?? null,
			setItem: (key: string, value: string) => void items.set(key, value)
		};
	};

	it('plays once per session', () => {
		const storage = memory();
		expect(shouldPlayIntro(storage)).toBe(true);
		markIntroPlayed(storage);
		expect(storage.getItem(INTRO_PLAYED_KEY)).toBe('1');
		expect(shouldPlayIntro(storage)).toBe(false);
	});

	it('still plays, and never throws, when storage is blocked', () => {
		const blocked = {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('blocked');
			}
		};
		expect(shouldPlayIntro(blocked)).toBe(true);
		expect(() => markIntroPlayed(blocked)).not.toThrow();
		expect(shouldPlayIntro(undefined)).toBe(true);
	});
});
