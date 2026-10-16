import { describe, expect, it } from 'vitest';
import { resolveKey, resolveTimeout, type KeyInput } from './keymap';

const key = (k: string, mods: Partial<KeyInput> = {}): KeyInput => ({
	key: k, ctrlKey: false, altKey: false, metaKey: false, inEditable: false, ...mods
});
const action = (a: object) => ({ kind: 'action', action: a });
const motion = (m: string, count: number | null = null) => action({ type: 'motion', motion: m, count });
const pending = (p: string) => ({ kind: 'pending', pending: p });
const passthrough = { kind: 'passthrough' };

describe('resolveKey: motions', () => {
	it('maps h j k l w b e 0 $ G to motions without a count', () => {
		for (const m of ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', 'G']) {
			expect(resolveKey('', key(m))).toEqual(motion(m));
		}
	});

	it('jumps to the top with gg', () => {
		expect(resolveKey('', key('g'))).toEqual(pending('g'));
		expect(resolveKey('g', key('g'))).toEqual(motion('gg'));
	});

	it('drops a pending g when another key follows', () => {
		expect(resolveKey('g', key('x'))).toEqual(passthrough);
	});
});

describe('resolveKey: counts', () => {
	it('builds a count from digits', () => {
		expect(resolveKey('', key('1'))).toEqual(pending('1'));
		expect(resolveKey('1', key('2'))).toEqual(pending('12'));
		expect(resolveKey('12', key('j'))).toEqual(motion('j', 12));
	});

	it('treats 0 as a digit only inside a count', () => {
		expect(resolveKey('', key('0'))).toEqual(motion('0'));
		expect(resolveKey('1', key('0'))).toEqual(pending('10'));
		expect(resolveKey('10', key('w'))).toEqual(motion('w', 10));
	});

	it('passes a count to gg and G', () => {
		expect(resolveKey('5', key('g'))).toEqual(pending('5g'));
		expect(resolveKey('5g', key('g'))).toEqual(motion('gg', 5));
		expect(resolveKey('5', key('G'))).toEqual(motion('G', 5));
	});

	it('keeps a pending count or g across a lone modifier keydown, as typing G or $ sends Shift first', () => {
		expect(resolveKey('5', key('Shift'))).toEqual(pending('5'));
		expect(resolveKey('3g', key('Shift'))).toEqual(pending('3g'));
		expect(resolveKey('', key('Shift'))).toEqual(passthrough);
	});

	it('no longer navigates pages with digits', () => {
		for (const digit of ['1', '2', '3']) expect(resolveKey('', key(digit))).toEqual(pending(digit));
	});

	it('drops the count when a non-motion key follows', () => {
		expect(resolveKey('5', key('?'))).toEqual(action({ type: 'toggleHelp' }));
		expect(resolveKey('5', key(' '))).toEqual(pending(' '));
		expect(resolveKey('12', key('x'))).toEqual(passthrough);
	});
});

describe('resolveKey: visual mode', () => {
	it('enters charwise and linewise visual', () => {
		expect(resolveKey('', key('v'))).toEqual(action({ type: 'visual', mode: 'char' }));
		expect(resolveKey('', key('V'))).toEqual(action({ type: 'visual', mode: 'line' }));
	});

	it('yanks only in visual', () => {
		expect(resolveKey('', key('y', { visual: true }))).toEqual(action({ type: 'yank' }));
		expect(resolveKey('', key('y'))).toEqual(passthrough);
	});

	it('Escape leaves visual first, otherwise closes help', () => {
		expect(resolveKey('', key('Escape', { visual: true }))).toEqual(action({ type: 'exitVisual' }));
		expect(resolveKey('', key('Escape'))).toEqual(action({ type: 'closeHelp' }));
	});
});

describe('resolveKey: everything else', () => {
	it('goes to pages with the space leader', () => {
		expect(resolveKey('', key(' '))).toEqual(pending(' '));
		expect(resolveKey(' ', key('h'))).toEqual(action({ type: 'goto', path: '/' }));
		expect(resolveKey(' ', key('a'))).toEqual(action({ type: 'goto', path: '/about/' }));
		expect(resolveKey(' ', key('p'))).toEqual(action({ type: 'goto', path: '/projects/' }));
	});

	it('passes through an unknown key after the leader', () => {
		expect(resolveKey(' ', key('z'))).toEqual(passthrough);
	});

	it('toggles help with ?', () => {
		expect(resolveKey('', key('?'))).toEqual(action({ type: 'toggleHelp' }));
	});

	it('opens the preview target with Enter, but not while typing', () => {
		expect(resolveKey('', key('Enter'))).toEqual(action({ type: 'open' }));
		expect(resolveKey('', key('Enter', { inEditable: true }))).toEqual(passthrough);
	});

	it('ignores keys while typing', () => {
		expect(resolveKey('', key('j', { inEditable: true }))).toEqual(passthrough);
		expect(resolveKey('', key(' ', { inEditable: true }))).toEqual(passthrough);
		expect(resolveKey('', key('1', { inEditable: true }))).toEqual(passthrough);
		expect(resolveKey('', key('v', { inEditable: true }))).toEqual(passthrough);
	});

	it('toggles the terminal with ctrl+/ even while typing', () => {
		expect(resolveKey('', key('/', { ctrlKey: true }))).toEqual(action({ type: 'toggleTerminal' }));
		expect(resolveKey('', key('/', { ctrlKey: true, inEditable: true }))).toEqual(action({ type: 'toggleTerminal' }));
	});

	it('leaves browser shortcuts alone', () => {
		expect(resolveKey('', key('j', { ctrlKey: true }))).toEqual(passthrough);
		expect(resolveKey('', key('1', { metaKey: true }))).toEqual(passthrough);
		expect(resolveKey('', key('g', { altKey: true }))).toEqual(passthrough);
		expect(resolveKey('', key('/', { ctrlKey: true, altKey: true }))).toEqual(passthrough);
	});

	it('passes through unbound keys', () => {
		expect(resolveKey('', key('x'))).toEqual(passthrough);
	});
});

describe('native keys with nothing focused', () => {
	const onBody = { onBody: true };

	it('drive the cursor, since the page itself never scrolls', () => {
		expect(resolveKey('', key('PageDown', onBody))).toEqual(action({ type: 'pageDown' }));
		expect(resolveKey('', key('PageUp', onBody))).toEqual(action({ type: 'pageUp' }));
		expect(resolveKey('', key('End', onBody))).toEqual(motion('G'));
		expect(resolveKey('', key('Home', onBody))).toEqual(motion('gg'));
		expect(resolveKey('', key('ArrowDown', onBody))).toEqual(motion('j'));
		expect(resolveKey('', key('ArrowUp', onBody))).toEqual(motion('k'));
		expect(resolveKey('', key('ArrowLeft', onBody))).toEqual(motion('h'));
		expect(resolveKey('', key('ArrowRight', onBody))).toEqual(motion('l'));
	});

	it('stay native when something else has focus', () => {
		expect(resolveKey('', key('PageDown'))).toEqual(passthrough);
		expect(resolveKey('', key('ArrowDown'))).toEqual(passthrough);
		expect(resolveKey('', key('End', { onBody: true, inEditable: true }))).toEqual(passthrough);
	});
});

describe('resolveTimeout', () => {
	it('falls back to scrolling a page when the space leader times out', () => {
		expect(resolveTimeout(' ')).toEqual({ type: 'pageDown' });
	});

	it('drops a pending g or count', () => {
		expect(resolveTimeout('g')).toBeNull();
		expect(resolveTimeout('3')).toBeNull();
		expect(resolveTimeout('3g')).toBeNull();
	});
});
