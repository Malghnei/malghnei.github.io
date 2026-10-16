import type { Motion, VisualMode } from './motions';

export type NavPath = '/' | '/about/' | '/projects/';

export type KeyAction =
	| { type: 'motion'; motion: Motion; count: number | null }
	| { type: 'pageDown' }
	| { type: 'pageUp' }
	| { type: 'goto'; path: NavPath }
	| { type: 'visual'; mode: VisualMode }
	| { type: 'yank' }
	| { type: 'exitVisual' }
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
	/** A visual selection is active. */
	visual?: boolean;
};

export type KeyResult =
	| { kind: 'action'; action: KeyAction }
	| { kind: 'pending'; pending: string }
	| { kind: 'passthrough' };

export const SEQUENCE_TIMEOUT_MS = 800;

const LEADER = ' ';
const LEADER_PAGES: Record<string, NavPath> = { h: '/', a: '/about/', p: '/projects/' };
const MOTION_KEYS = new Set<string>(['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', 'G']);
const MODIFIER_KEYS = new Set<string>(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'AltGraph']);

const action = (a: KeyAction): KeyResult => ({ kind: 'action', action: a });
const motion = (m: Motion, count: number | null = null): KeyResult =>
	action({ type: 'motion', motion: m, count });
const passthrough: KeyResult = { kind: 'passthrough' };

const NATIVE_SCROLL_KEYS: Record<string, KeyResult> = {
	PageDown: action({ type: 'pageDown' }),
	PageUp: action({ type: 'pageUp' }),
	Home: motion('gg'),
	End: motion('G'),
	ArrowDown: motion('j'),
	ArrowUp: motion('k'),
	ArrowLeft: motion('h'),
	ArrowRight: motion('l')
};

export const resolveKey = (pending: string, input: KeyInput): KeyResult => {
	if (input.key === '/' && input.ctrlKey && !input.altKey && !input.metaKey) {
		return action({ type: 'toggleTerminal' });
	}
	// Typing G or $ sends a lone Shift keydown first; it must not drop a pending count or g.
	if (MODIFIER_KEYS.has(input.key)) return pending ? { kind: 'pending', pending } : passthrough;
	if (input.ctrlKey || input.altKey || input.metaKey || input.inEditable) return passthrough;

	const nativeScroll = input.onBody ? NATIVE_SCROLL_KEYS[input.key] : undefined;
	if (nativeScroll) return nativeScroll;

	if (pending === LEADER) {
		const path = LEADER_PAGES[input.key];
		return path ? action({ type: 'goto', path }) : passthrough;
	}

	// Otherwise pending is an optional count then an optional g: '', '12', 'g', '12g'.
	const [, digits = '', g = ''] = /^(\d*)(g?)$/.exec(pending) ?? [];
	const count = digits ? Number(digits) : null;
	if (g) return input.key === 'g' ? motion('gg', count) : passthrough;
	if (/^[1-9]$/.test(input.key) || (input.key === '0' && digits)) {
		return { kind: 'pending', pending: digits + input.key };
	}
	if (MOTION_KEYS.has(input.key)) return motion(input.key as Motion, count);

	// Any other key drops the count, as nvim does for keys that don't take one.
	switch (input.key) {
		case 'g':
			return { kind: 'pending', pending: digits + 'g' };
		case LEADER:
			return { kind: 'pending', pending: LEADER };
		case 'v':
			return action({ type: 'visual', mode: 'char' });
		case 'V':
			return action({ type: 'visual', mode: 'line' });
		case 'y':
			return input.visual ? action({ type: 'yank' }) : passthrough;
		case '?':
			return action({ type: 'toggleHelp' });
		case 'Enter':
			return action({ type: 'open' });
		case 'Escape':
			return input.visual ? action({ type: 'exitVisual' }) : action({ type: 'closeHelp' });
	}
	return passthrough;
};

// A lone Space keeps its native job (scroll a page) once the leader times out; a count or g is dropped.
export const resolveTimeout = (pending: string): KeyAction | null =>
	pending === LEADER ? { type: 'pageDown' } : null;

export const isEditableTarget = (target: EventTarget | null): boolean =>
	typeof Element !== 'undefined' &&
	target instanceof Element &&
	target.closest(
		'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-terminal]'
	) !== null;
