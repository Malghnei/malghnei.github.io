export type NavPath = '/' | '/about/' | '/projects/';

export type KeyAction =
	| { type: 'scroll'; lines: number }
	| { type: 'top' }
	| { type: 'bottom' }
	| { type: 'pageDown' }
	| { type: 'pageUp' }
	| { type: 'goto'; path: NavPath }
	| { type: 'toggleTerminal' }
	| { type: 'toggleHelp' }
	| { type: 'closeHelp' }
	| { type: 'open' };

export type KeyInput = {
	key: string;
	ctrlKey: boolean;
	altKey: boolean;
	metaKey: boolean;
	inEditable: boolean;
	/** Nothing is focused, so the browser's own scroll keys would do nothing (the page never scrolls). */
	onBody?: boolean;
};

export type KeyResult =
	| { kind: 'action'; action: KeyAction }
	| { kind: 'pending'; pending: string }
	| { kind: 'passthrough' };

export const SEQUENCE_TIMEOUT_MS = 800;

const SCROLL_LINES = 3;
const LEADER = ' ';
const LEADER_PAGES: Record<string, NavPath> = { h: '/', a: '/about/', p: '/projects/' };
const NUMBER_PAGES: Record<string, NavPath> = { '1': '/', '2': '/about/', '3': '/projects/' };

const NATIVE_SCROLL_KEYS: Record<string, KeyAction> = {
	PageDown: { type: 'pageDown' },
	PageUp: { type: 'pageUp' },
	Home: { type: 'top' },
	End: { type: 'bottom' },
	ArrowDown: { type: 'scroll', lines: 1 },
	ArrowUp: { type: 'scroll', lines: -1 }
};

const action = (a: KeyAction): KeyResult => ({ kind: 'action', action: a });
const passthrough: KeyResult = { kind: 'passthrough' };

export const resolveKey = (pending: string, input: KeyInput): KeyResult => {
	if (input.key === '/' && input.ctrlKey && !input.altKey && !input.metaKey) {
		return action({ type: 'toggleTerminal' });
	}
	if (input.ctrlKey || input.altKey || input.metaKey || input.inEditable) return passthrough;

	const nativeScroll = input.onBody ? NATIVE_SCROLL_KEYS[input.key] : undefined;
	if (nativeScroll) return action(nativeScroll);

	if (pending === 'g') return input.key === 'g' ? action({ type: 'top' }) : passthrough;
	if (pending === LEADER) {
		const path = LEADER_PAGES[input.key];
		return path ? action({ type: 'goto', path }) : passthrough;
	}

	switch (input.key) {
		case 'j':
			return action({ type: 'scroll', lines: SCROLL_LINES });
		case 'k':
			return action({ type: 'scroll', lines: -SCROLL_LINES });
		case 'G':
			return action({ type: 'bottom' });
		case 'g':
			return { kind: 'pending', pending: 'g' };
		case LEADER:
			return { kind: 'pending', pending: LEADER };
		case '?':
			return action({ type: 'toggleHelp' });
		case 'Enter':
			return action({ type: 'open' });
		case 'Escape':
			return action({ type: 'closeHelp' });
	}

	const path = NUMBER_PAGES[input.key];
	return path ? action({ type: 'goto', path }) : passthrough;
};

// A lone Space keeps its native job (scroll a page) once the leader times out.
export const resolveTimeout = (pending: string): KeyAction | null =>
	pending === LEADER ? { type: 'pageDown' } : null;

export const isEditableTarget = (target: EventTarget | null): boolean =>
	typeof Element !== 'undefined' &&
	target instanceof Element &&
	target.closest(
		'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-terminal]'
	) !== null;
