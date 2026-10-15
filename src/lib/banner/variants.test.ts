import { describe, expect, it } from 'vitest';
import { ART_SCALE, artWidth, parseBanner, variantCss } from './variants';

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

	it('counts the cursor after the last row', () => {
		expect(parseBanner('ab\nabcdef\n').width).toBe(7);
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

describe('variantCss', () => {
	it('shows the full banner when it fits, the fallback below it', () => {
		const css = variantCss([40]);
		expect(css).toContain('.buffer-content .banner-row { display: none; }');
		expect(css).toContain('@container buffer (width >= 40ch) { .buffer-content .banner-row.v0 { display: block; } }');
		expect(css).toContain('@container buffer (width < 40ch) { .buffer-content .banner-fallback { display: block; } }');
	});

	it('shows the mobile banner between its width and the full width', () => {
		const css = variantCss([40, 20]);
		expect(css).toContain('@container buffer (width >= 40ch) { .buffer-content .banner-row.v0 { display: block; } }');
		expect(css).toContain(
			'@container buffer (20ch <= width < 40ch) { .buffer-content .banner-row.v1 { display: block; } }'
		);
		expect(css).toContain('@container buffer (width < 20ch) { .buffer-content .banner-fallback { display: block; } }');
	});

	it('always shows the fallback without any banner', () => {
		expect(variantCss([])).toContain('.buffer-content .banner-fallback { display: block; }');
		expect(variantCss([])).not.toContain('@container');
	});
});

describe('artWidth', () => {
	// JetBrains Mono's natural line box is 1.32em; scaled by ART_SCALE it fills one 1.65 body line.
	it('scales the art so a row is exactly one body line tall', () => {
		expect(ART_SCALE * 1.32).toBeCloseTo(1.65, 5);
	});

	it('converts art columns to buffer ch, rounding up so the art never overflows', () => {
		expect(artWidth(41)).toBe(52);
		expect(artWidth(40)).toBe(50);
		expect(artWidth(0)).toBe(0);
	});
});
