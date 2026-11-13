import { describe, expect, it } from 'vitest';
import { parseBanner } from './variants';
import banner from '../data/banner.txt?raw';
import bannerMobile from '../data/banner-mobile.txt?raw';

describe('parseBanner', () => {
	it('splits rows and trims trailing blank lines', () => {
		expect(parseBanner('ab\ncdef\n\n\n').rows).toEqual(['ab', 'cdef']);
	});

	it('keeps leading and inner blank rows', () => {
		expect(parseBanner('\nab\n\ncd\n').rows).toEqual(['', 'ab', '', 'cd']);
	});

	it('handles CRLF line endings and trailing spaces', () => {
		expect(parseBanner('ab  \r\ncd\r\n').rows).toEqual(['ab', 'cd']);
	});

	it('is as wide as its longest row', () => {
		expect(parseBanner('abcdef\nab\n').width).toBe(6);
	});

	it('is not widened by the last row', () => {
		expect(parseBanner('ab\nabcdef\n').width).toBe(6);
	});

	it('expands tabs to tab stops of 8', () => {
		const v = parseBanner('\tab\na\tb\n');
		expect(v.rows).toEqual(['        ab', 'a       b']);
		expect(v.width).toBe(10);
	});

	it('returns no rows for an empty file', () => {
		expect(parseBanner('\n \n')).toEqual({ rows: [], width: 0 });
	});
});

describe('the name art files', () => {
	it('draws the full name on one line, 119 columns wide', () => {
		const v = parseBanner(banner);
		expect(v.rows).toHaveLength(6);
		expect(v.width).toBe(119);
	});

	it('stacks first name over surname for narrow screens', () => {
		const v = parseBanner(bannerMobile);
		expect(v.rows).toHaveLength(12);
		expect(v.width).toBe(78);
	});
});
