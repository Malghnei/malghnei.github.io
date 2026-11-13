import { describe, expect, it } from 'vitest';
import { sweepColor } from './sweep';

describe('sweepColor', () => {
	it('starts at nord-7 and ends at nord-10', () => {
		expect(sweepColor(0, false)).toBe('rgb(143 188 187)');
		expect(sweepColor(1, false)).toBe('rgb(94 129 172)');
	});
	it('passes through nord-8 a third of the way', () => {
		expect(sweepColor(1 / 3, false)).toBe('rgb(136 192 208)');
	});
	it('mixes shadow characters 50% with nord-0', () => {
		expect(sweepColor(0, true)).toBe('rgb(95 120 126)');
	});
	it('clamps t outside 0..1', () => {
		expect(sweepColor(-1, false)).toBe(sweepColor(0, false));
		expect(sweepColor(2, false)).toBe(sweepColor(1, false));
	});
});
