export type Rect = { x: number; y: number; width: number; height: number };
export type Size = { width: number; height: number };
export type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const MIN_SIZE: Size = { width: 360, height: 200 };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Enforces the minimum size and keeps the whole window inside the viewport.
// A viewport smaller than the minimum wins: the window fills it.
export const clampRect = (rect: Rect, viewport: Size, min: Size = MIN_SIZE): Rect => {
	const width = Math.min(Math.max(rect.width, min.width), viewport.width);
	const height = Math.min(Math.max(rect.height, min.height), viewport.height);
	return {
		x: clamp(rect.x, 0, viewport.width - width),
		y: clamp(rect.y, 0, viewport.height - height),
		width,
		height
	};
};

export const defaultRect = (viewport: Size): Rect => {
	const width = Math.min(Math.max(Math.round(viewport.width * 0.7), MIN_SIZE.width), viewport.width);
	const height = Math.min(Math.max(Math.round(viewport.height * 0.6), MIN_SIZE.height), viewport.height);
	return clampRect(
		{
			x: Math.round((viewport.width - width) / 2),
			y: Math.round((viewport.height - height) / 2),
			width,
			height
		},
		viewport
	);
};

// Resizes from one edge or corner. The opposite edge stays fixed, and the moving edge stops at the
// minimum size or the viewport.
export const resizeRect = (
	start: Rect,
	edge: Edge,
	dx: number,
	dy: number,
	viewport: Size,
	min: Size = MIN_SIZE
): Rect => {
	let { x, y, width, height } = start;
	const right = start.x + start.width;
	const bottom = start.y + start.height;

	if (edge.includes('e')) width = clamp(start.width + dx, min.width, viewport.width - start.x);
	if (edge.includes('w')) {
		width = clamp(start.width - dx, min.width, right);
		x = right - width;
	}
	if (edge.includes('s')) height = clamp(start.height + dy, min.height, viewport.height - start.y);
	if (edge.includes('n')) {
		height = clamp(start.height - dy, min.height, bottom);
		y = bottom - height;
	}

	return { x, y, width, height };
};
