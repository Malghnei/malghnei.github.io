export const INTRO_PLAYED_KEY = 'portfolio:introPlayed';

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
