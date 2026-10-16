import { describe, expect, it } from 'vitest';
import { clampPos, move, selectedText, selection, yankMessage, type Motion, type Pos } from './motions';

// 0: 'foo bar.baz'  1: ''  2: '  indented line'  3: 'x'
const texts = ['foo bar.baz', '', '  indented line', 'x'];
const at = (line: number, col: number): Pos => ({ line, col });
const go = (from: Pos, motion: Motion, count: number | null = null, want = from.col, lines = texts) =>
	move(lines, from, motion, count, want);

describe('clampPos', () => {
	it('keeps positions inside the text', () => {
		expect(clampPos(['abc', ''], at(1, 5))).toEqual(at(1, 0));
		expect(clampPos(['abc'], at(-1, -1))).toEqual(at(0, 0));
		expect(clampPos(['abc'], at(9, 9))).toEqual(at(0, 2));
	});

	it('returns the origin for an empty buffer', () => {
		expect(clampPos([], at(3, 3))).toEqual(at(0, 0));
	});
});

describe('move: h and l', () => {
	it('moves within the line and resets want', () => {
		expect(go(at(0, 4), 'l')).toEqual({ pos: at(0, 5), want: 5 });
		expect(go(at(0, 4), 'h', 2)).toEqual({ pos: at(0, 2), want: 2 });
	});

	it('stops at the line edges', () => {
		expect(go(at(0, 0), 'h').pos).toEqual(at(0, 0));
		expect(go(at(0, 10), 'l').pos).toEqual(at(0, 10));
		expect(go(at(0, 0), 'l', 99999).pos).toEqual(at(0, 10));
	});
});

describe('move: j and k', () => {
	it('keeps the wanted column across short and empty lines', () => {
		const first = go(at(0, 8), 'j');
		expect(first).toEqual({ pos: at(1, 0), want: 8 });
		const second = go(first.pos, 'j', null, first.want);
		expect(second).toEqual({ pos: at(2, 8), want: 8 });
		const third = go(second.pos, 'j', null, second.want);
		expect(third).toEqual({ pos: at(3, 0), want: 8 });
		expect(go(third.pos, 'k', 3, third.want)).toEqual({ pos: at(0, 8), want: 8 });
	});

	it('clamps huge counts to the buffer edges', () => {
		expect(go(at(0, 0), 'j', 99999).pos).toEqual(at(3, 0));
		expect(go(at(3, 0), 'k', 99999).pos).toEqual(at(0, 0));
	});
});

describe('move: 0 and $', () => {
	it('goes to the line start and end', () => {
		expect(go(at(0, 5), '0')).toEqual({ pos: at(0, 0), want: 0 });
		expect(go(at(0, 5), '$')).toEqual({ pos: at(0, 10), want: Infinity });
	});

	it('keeps sticking to the line end after $', () => {
		const end = go(at(0, 5), '$');
		const empty = go(end.pos, 'j', null, end.want);
		expect(empty.pos).toEqual(at(1, 0));
		expect(go(empty.pos, 'j', null, empty.want).pos).toEqual(at(2, 14));
	});

	it('moves down count - 1 lines with a counted $', () => {
		expect(go(at(0, 0), '$', 3).pos).toEqual(at(2, 14));
	});
});

describe('move: gg and G', () => {
	it('goes to the first or last line, keeping the wanted column', () => {
		expect(go(at(0, 5), 'G')).toEqual({ pos: at(3, 0), want: 5 });
		expect(go(at(3, 0), 'gg', null, 5)).toEqual({ pos: at(0, 5), want: 5 });
	});

	it('goes to a 1-based line with a count, clamped', () => {
		expect(go(at(0, 5), 'G', 3).pos).toEqual(at(2, 5));
		expect(go(at(0, 0), 'gg', 99).pos).toEqual(at(3, 0));
	});
});

describe('move: w, e and b', () => {
	it('w stops at word, punctuation and empty-line starts', () => {
		const stops: Pos[] = [];
		let pos = at(0, 0);
		for (let i = 0; i < 6; i++) {
			pos = go(pos, 'w').pos;
			stops.push(pos);
		}
		expect(stops).toEqual([at(0, 4), at(0, 7), at(0, 8), at(1, 0), at(2, 2), at(2, 11)]);
	});

	it('w at the last word goes to the last character, then stays', () => {
		expect(go(at(2, 11), 'w').pos).toEqual(at(3, 0));
		expect(go(at(3, 0), 'w').pos).toEqual(at(3, 0));
	});

	it('w with a count crosses lines and stops early at the end', () => {
		expect(go(at(2, 2), 'w', 2).pos).toEqual(at(3, 0));
		expect(go(at(0, 0), 'w', 99999).pos).toEqual(at(3, 0));
	});

	it('e stops at word ends and skips empty lines', () => {
		const stops: Pos[] = [];
		let pos = at(0, 0);
		for (let i = 0; i < 5; i++) {
			pos = go(pos, 'e').pos;
			stops.push(pos);
		}
		expect(stops).toEqual([at(0, 2), at(0, 6), at(0, 7), at(0, 10), at(2, 9)]);
	});

	it('b stops at word starts and empty lines', () => {
		const stops: Pos[] = [];
		let pos = at(3, 0);
		for (let i = 0; i < 4; i++) {
			pos = go(pos, 'b').pos;
			stops.push(pos);
		}
		expect(stops).toEqual([at(2, 11), at(2, 2), at(1, 0), at(0, 8)]);
		expect(go(at(0, 8), 'b', 99).pos).toEqual(at(0, 0));
	});

	it('treats a run of punctuation as one word', () => {
		expect(go(at(0, 0), 'w', null, 0, ['--> ok']).pos).toEqual(at(0, 4));
	});

	it('treats underscores and non-ASCII letters as keyword characters', () => {
		const line = ['snake_case café-au'];
		expect(go(at(0, 0), 'w', null, 0, line).pos).toEqual(at(0, 11));
		expect(go(at(0, 11), 'w', null, 0, line).pos).toEqual(at(0, 15));
	});

	it('resets want to the new column', () => {
		expect(go(at(0, 0), 'w', null, Infinity).want).toBe(4);
	});
});

describe('move: edge cases', () => {
	it('leaves an empty buffer alone', () => {
		expect(move([], at(0, 0), 'w', null, 0)).toEqual({ pos: at(0, 0), want: 0 });
	});

	it('clamps a stale starting position first', () => {
		expect(move(['ab'], at(5, 9), 'h', null, 0).pos).toEqual(at(0, 0));
	});
});

describe('selection', () => {
	it('orders the ends and keeps them inclusive in char mode', () => {
		expect(selection(at(0, 8), at(0, 4), 'char', texts)).toEqual({ start: at(0, 4), end: at(0, 8) });
	});

	it('spans whole lines in line mode', () => {
		expect(selection(at(2, 5), at(0, 3), 'line', texts)).toEqual({ start: at(0, 0), end: at(2, 14) });
	});

	it('clamps an anchor left behind by text that shrank', () => {
		expect(selection(at(9, 9), at(0, 0), 'char', texts)).toEqual({ start: at(0, 0), end: at(3, 0) });
	});
});

describe('selectedText', () => {
	it('slices a single line', () => {
		expect(selectedText(texts, { start: at(0, 4), end: at(0, 6) }, 'char')).toBe('bar');
	});

	it('joins lines with newlines in char mode', () => {
		expect(selectedText(texts, { start: at(0, 8), end: at(2, 9) }, 'char')).toBe('baz\n\n  indented');
	});

	it('ends with a newline in line mode, as nvim yanks', () => {
		expect(selectedText(texts, { start: at(0, 0), end: at(1, 0) }, 'line')).toBe('foo bar.baz\n\n');
	});
});

describe('yankMessage', () => {
	it('counts characters for a charwise selection on one line', () => {
		expect(yankMessage({ start: at(0, 4), end: at(0, 6) }, 'char', 'bar')).toBe('3 chars yanked');
		expect(yankMessage({ start: at(0, 4), end: at(0, 4) }, 'char', 'b')).toBe('1 char yanked');
	});

	it('counts lines for linewise or multi-line selections', () => {
		expect(yankMessage({ start: at(0, 8), end: at(2, 9) }, 'char', 'baz\n\n  indented')).toBe('3 lines yanked');
		expect(yankMessage({ start: at(0, 0), end: at(0, 10) }, 'line', 'foo bar.baz\n')).toBe('1 line yanked');
	});
});
