import { describe, expect, it } from 'vitest';
import { resolveKey, resolveTimeout, type KeyInput } from './keymap';

const key = (k: string, mods: Partial<KeyInput> = {}): KeyInput => ({
	key: k, ctrlKey: false, altKey: false, metaKey: false, inEditable: false, ...mods
});
const action = (a: object) => ({ kind: 'action', action: a });
const passthrough = { kind: 'passthrough' };

describe('resolveKey', () => {
	it('scrolls 3 lines with j and k', () => {
		expect(resolveKey('', key('j'))).toEqual(action({ type: 'scroll', lines: 3 }));
		expect(resolveKey('', key('k'))).toEqual(action({ type: 'scroll', lines: -3 }));
	});

	it('jumps to the bottom with G', () => {
		expect(resolveKey('', key('G'))).toEqual(action({ type: 'bottom' }));
	});

	it('jumps to the top with gg', () => {
		expect(resolveKey('', key('g'))).toEqual({ kind: 'pending', pending: 'g' });
		expect(resolveKey('g', key('g'))).toEqual(action({ type: 'top' }));
	});

	it('drops a pending g when another key follows', () => {
		expect(resolveKey('g', key('x'))).toEqual(passthrough);
	});

	it('goes to pages with 1, 2, 3', () => {
		expect(resolveKey('', key('1'))).toEqual(action({ type: 'goto', path: '/' }));
		expect(resolveKey('', key('2'))).toEqual(action({ type: 'goto', path: '/about/' }));
		expect(resolveKey('', key('3'))).toEqual(action({ type: 'goto', path: '/projects/' }));
	});

	it('goes to pages with the space leader', () => {
		expect(resolveKey('', key(' '))).toEqual({ kind: 'pending', pending: ' ' });
		expect(resolveKey(' ', key('h'))).toEqual(action({ type: 'goto', path: '/' }));
		expect(resolveKey(' ', key('a'))).toEqual(action({ type: 'goto', path: '/about/' }));
		expect(resolveKey(' ', key('p'))).toEqual(action({ type: 'goto', path: '/projects/' }));
	});

	it('passes through an unknown key after the leader', () => {
		expect(resolveKey(' ', key('z'))).toEqual(passthrough);
	});

	it('toggles help with ? and closes it with Escape', () => {
		expect(resolveKey('', key('?'))).toEqual(action({ type: 'toggleHelp' }));
		expect(resolveKey('', key('Escape'))).toEqual(action({ type: 'closeHelp' }));
	});

	it('ignores keys while typing', () => {
		expect(resolveKey('', key('j', { inEditable: true }))).toEqual(passthrough);
		expect(resolveKey('', key(' ', { inEditable: true }))).toEqual(passthrough);
		expect(resolveKey('', key('1', { inEditable: true }))).toEqual(passthrough);
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

describe('native scroll keys with nothing focused', () => {
	const onBody = { onBody: true };

	it('drives the buffer, since the page itself never scrolls', () => {
		expect(resolveKey('', key('PageDown', onBody))).toEqual(action({ type: 'pageDown' }));
		expect(resolveKey('', key('PageUp', onBody))).toEqual(action({ type: 'pageUp' }));
		expect(resolveKey('', key('End', onBody))).toEqual(action({ type: 'bottom' }));
		expect(resolveKey('', key('Home', onBody))).toEqual(action({ type: 'top' }));
		expect(resolveKey('', key('ArrowDown', onBody))).toEqual(action({ type: 'scroll', lines: 1 }));
		expect(resolveKey('', key('ArrowUp', onBody))).toEqual(action({ type: 'scroll', lines: -1 }));
	});

	it('leaves them native when something else has focus', () => {
		expect(resolveKey('', key('PageDown'))).toEqual(passthrough);
		expect(resolveKey('', key('ArrowDown'))).toEqual(passthrough);
		expect(resolveKey('', key('End', { onBody: true, inEditable: true }))).toEqual(passthrough);
	});
});

describe('resolveTimeout', () => {
	it('falls back to scrolling a page when the space leader times out', () => {
		expect(resolveTimeout(' ')).toEqual({ type: 'pageDown' });
	});

	it('does nothing when g times out', () => {
		expect(resolveTimeout('g')).toBeNull();
	});
});
