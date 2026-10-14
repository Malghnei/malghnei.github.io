import { describe, expect, it } from 'vitest';
import { loadRect, saveRect, TERMINAL_RECT_KEY } from './persist';

const memoryStorage = () => {
	const map = new Map<string, string>();
	return {
		getItem: (key: string) => map.get(key) ?? null,
		setItem: (key: string, value: string) => void map.set(key, value)
	};
};

const rect = { x: 10, y: 20, width: 400, height: 300 };

describe('persist', () => {
	it('round-trips a rect', () => {
		const storage = memoryStorage();
		saveRect(storage, rect);
		expect(loadRect(storage)).toEqual(rect);
	});

	it('returns null when nothing is saved', () => {
		expect(loadRect(memoryStorage())).toBeNull();
	});

	it('returns null for corrupt JSON', () => {
		const storage = memoryStorage();
		storage.setItem(TERMINAL_RECT_KEY, '{not json');
		expect(loadRect(storage)).toBeNull();
	});

	it('returns null when a field is missing or not a finite number', () => {
		const storage = memoryStorage();
		storage.setItem(TERMINAL_RECT_KEY, JSON.stringify({ x: 1, y: 2, width: 'big', height: 4 }));
		expect(loadRect(storage)).toBeNull();
		storage.setItem(TERMINAL_RECT_KEY, JSON.stringify({ x: 1, y: 2, width: 3 }));
		expect(loadRect(storage)).toBeNull();
		storage.setItem(TERMINAL_RECT_KEY, 'null');
		expect(loadRect(storage)).toBeNull();
	});

	it('returns null when reading throws (private mode, blocked storage)', () => {
		const throwing = { getItem: () => { throw new Error('SecurityError'); } };
		expect(loadRect(throwing)).toBeNull();
	});

	it('swallows write errors (quota, private mode)', () => {
		const throwing = { setItem: () => { throw new Error('QuotaExceededError'); } };
		expect(() => saveRect(throwing, rect)).not.toThrow();
	});

	it('handles storage being unavailable', () => {
		expect(loadRect(undefined)).toBeNull();
		expect(() => saveRect(undefined, rect)).not.toThrow();
	});
});
