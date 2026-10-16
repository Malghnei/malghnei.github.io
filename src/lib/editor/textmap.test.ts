import { describe, expect, it } from 'vitest';
import { foldSegments, visibleOffset } from './textmap';

describe('foldSegments', () => {
	it('folds whitespace across segment boundaries', () => {
		const folded = foldSegments(['Hello ', ' world'], false);
		expect(folded.text).toBe('Hello world');
		expect(folded.points[5]).toEqual({ segment: 0, offset: 5 });
		expect(folded.points[6]).toEqual({ segment: 1, offset: 1 });
	});

	it('drops leading and trailing whitespace, as layout does', () => {
		const folded = foldSegments(['\n\t\t', 'title', '\n\t\t', 'role', ' \n'], false);
		expect(folded.text).toBe('title role');
		expect(folded.points[0]).toEqual({ segment: 1, offset: 0 });
		expect(folded.points[5]).toEqual({ segment: 2, offset: 0 });
		expect(folded.points[6]).toEqual({ segment: 3, offset: 0 });
	});

	it('keeps whitespace on pre lines such as the banner', () => {
		const folded = foldSegments(['  ██  '], true);
		expect(folded.text).toBe('  ██  ');
		expect(folded.points.map((point) => point.offset)).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it('keeps non-breaking spaces', () => {
		expect(foldSegments(['a  b'], false).text).toBe('a  b');
	});

	it('gives empty text for no segments or only whitespace', () => {
		expect(foldSegments([], false)).toEqual({ text: '', points: [] });
		expect(foldSegments(['  \n ', '\t'], false)).toEqual({ text: '', points: [] });
	});
});

describe('visibleOffset', () => {
	const folded = foldSegments(['\n\t\t', 'title', '\n\t\t', 'role'], false);

	it('maps a raw point to its visible character', () => {
		expect(visibleOffset(folded, { segment: 3, offset: 2 })).toBe(8);
		expect(visibleOffset(folded, { segment: 1, offset: 0 })).toBe(0);
	});

	it('maps a point inside folded whitespace to the space kept for it', () => {
		expect(visibleOffset(folded, { segment: 2, offset: 1 })).toBe(5);
	});

	it('clamps points before the first and after the last character', () => {
		expect(visibleOffset(folded, { segment: 0, offset: 0 })).toBe(0);
		expect(visibleOffset(folded, { segment: 3, offset: 10 })).toBe(9);
	});
});
