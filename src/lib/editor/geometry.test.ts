import { describe, expect, it } from 'vitest';
import { clampRect, defaultRect, resizeRect } from './geometry';

const viewport = { width: 1000, height: 600 };
const start = { x: 100, y: 100, width: 400, height: 300 };

describe('clampRect', () => {
	it('leaves a rect that already fits unchanged', () => {
		expect(clampRect({ x: 100, y: 50, width: 400, height: 300 }, viewport)).toEqual({
			x: 100, y: 50, width: 400, height: 300
		});
	});

	it('enforces the 360x200 minimum size', () => {
		expect(clampRect({ x: 0, y: 0, width: 100, height: 50 }, viewport)).toEqual({
			x: 0, y: 0, width: 360, height: 200
		});
	});

	it('pulls the window back past the left and top edges', () => {
		expect(clampRect({ x: -50, y: -20, width: 400, height: 300 }, viewport)).toMatchObject({ x: 0, y: 0 });
	});

	it('pulls the window back past the right and bottom edges', () => {
		expect(clampRect({ x: 900, y: 500, width: 400, height: 300 }, viewport)).toMatchObject({ x: 600, y: 300 });
	});

	it('fills a viewport smaller than the minimum size', () => {
		expect(clampRect({ x: 10, y: 10, width: 400, height: 300 }, { width: 320, height: 180 })).toEqual({
			x: 0, y: 0, width: 320, height: 180
		});
	});
});

describe('defaultRect', () => {
	it('centers a 70% x 60% window', () => {
		expect(defaultRect(viewport)).toEqual({ x: 150, y: 120, width: 700, height: 360 });
	});

	it('respects the minimum size on a small viewport and stays centered', () => {
		expect(defaultRect({ width: 400, height: 300 })).toEqual({ x: 20, y: 50, width: 360, height: 200 });
	});
});

describe('resizeRect', () => {
	it('grows from the south-east corner', () => {
		expect(resizeRect(start, 'se', 50, 20, viewport)).toEqual({ x: 100, y: 100, width: 450, height: 320 });
	});

	it('moves the west edge while keeping the east edge fixed', () => {
		expect(resizeRect(start, 'w', -50, 0, viewport)).toEqual({ x: 50, y: 100, width: 450, height: 300 });
	});

	it('stops the west edge at the viewport', () => {
		expect(resizeRect(start, 'w', -500, 0, viewport)).toEqual({ x: 0, y: 100, width: 500, height: 300 });
	});

	it('stops the north edge at the minimum height, keeping the bottom fixed', () => {
		expect(resizeRect(start, 'n', 0, 250, viewport)).toEqual({ x: 100, y: 200, width: 400, height: 200 });
	});

	it('stops the east edge at the viewport', () => {
		expect(resizeRect(start, 'e', 1000, 0, viewport)).toEqual({ x: 100, y: 100, width: 900, height: 300 });
	});
});
