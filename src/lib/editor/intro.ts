import type { Pos } from './motions';

// The art banner types in within this long; the narrow fallback row types at its own pace.
export const INTRO_BUDGET_MS = 1200;
export const INTRO_PLAYED_KEY = 'portfolio:introPlayed';

// Chars revealed per tick so the whole banner fits the budget.
export const introStep = (totalChars: number, budgetMs: number, tickMs: number) =>
	Math.max(1, Math.ceil((totalChars * tickMs) / budgetMs));

// One frame per tick: the first `col` chars of row `line` are revealed, later rows are hidden.
export const introFrames = (rowLengths: number[], step: number): Pos[] => {
	const frames: Pos[] = [];
	rowLengths.forEach((length, line) => {
		for (let col = Math.min(step, length); ; col = Math.min(col + step, length)) {
			frames.push({ line, col });
			if (col >= length) break;
		}
	});
	return frames;
};

// Blocked storage means it plays on every home load, never that it breaks.
export const shouldPlayIntro = (storage: Pick<Storage, 'getItem'> | undefined) => {
	try {
		return storage?.getItem(INTRO_PLAYED_KEY) !== '1';
	} catch {
		return true;
	}
};

export const markIntroPlayed = (storage: Pick<Storage, 'setItem'> | undefined) => {
	try {
		storage?.setItem(INTRO_PLAYED_KEY, '1');
	} catch {
		// Storage unavailable; the intro just plays again next time.
	}
};
