import { describe, expect, it } from 'vitest';
import { INTRO_PLAYED_KEY, markIntroPlayed, shouldPlayIntro } from './intro';

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
