import type { Rect } from './geometry';

export const TERMINAL_RECT_KEY = 'portfolio:terminalRect';

const isFiniteNumber = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);

// Accessing `sessionStorage` itself throws when site data is blocked.
export const getSessionStorage = (): Storage | undefined => {
	try {
		return typeof sessionStorage === 'undefined' ? undefined : sessionStorage;
	} catch {
		return undefined;
	}
};

export const loadRect = (storage: Pick<Storage, 'getItem'> | undefined): Rect | null => {
	try {
		const raw = storage?.getItem(TERMINAL_RECT_KEY);
		if (!raw) return null;
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== 'object') return null;
		const { x, y, width, height } = parsed as Record<string, unknown>;
		if (![x, y, width, height].every(isFiniteNumber)) return null;
		return { x, y, width, height } as Rect;
	} catch {
		return null;
	}
};

export const saveRect = (storage: Pick<Storage, 'setItem'> | undefined, rect: Rect) => {
	try {
		storage?.setItem(TERMINAL_RECT_KEY, JSON.stringify(rect));
	} catch {
		// Storage unavailable or full; the window just won't remember its position.
	}
};
