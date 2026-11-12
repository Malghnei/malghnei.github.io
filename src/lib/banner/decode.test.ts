import { describe, expect, it } from 'vitest';
import { DECODE_POOL, decodeGlyph, settleAt } from './decode';

describe('settleAt', () => {
	it('settles the first column at 120ms with no jitter', () => {
		expect(settleAt(0, 119, 0)).toBe(120);
	});
	it('settles later columns later', () => {
		expect(settleAt(60, 119, 0)).toBeGreaterThan(settleAt(10, 119, 0));
	});
	it('finishes every cell within about a second', () => {
		expect(settleAt(118, 119, 0.999)).toBeLessThan(1000);
	});
});

describe('decodeGlyph', () => {
	it('always returns a pool character', () => {
		for (let t = 0; t < 1000; t += 37) expect(DECODE_POOL).toContain(decodeGlyph(t, 0.42));
	});
	it('holds a glyph for 55ms, then changes', () => {
		expect(decodeGlyph(54, 0)).toBe(decodeGlyph(0, 0));
		expect(decodeGlyph(55, 0)).not.toBe(decodeGlyph(0, 0));
	});
});
