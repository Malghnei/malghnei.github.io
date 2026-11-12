// The name art sweeps left to right through the Nord blues. These mirror --nord-7, -8, -9, -10.
const STOPS = [
	[143, 188, 187],
	[136, 192, 208],
	[129, 161, 193],
	[94, 129, 172]
];
// --nord-0: shadow characters are their column's colour mixed halfway into the background.
const BG = [46, 52, 64];

// The box-drawing characters that form ANSI Shadow's drop shadow.
export const SHADOW_CHARS = '╗╔╝╚═║';

// t: 0 at the art's left edge, 1 at its right.
export const sweepColor = (t: number, shadow: boolean): string => {
	const p = Math.min(Math.max(t, 0), 1) * (STOPS.length - 1);
	const i = Math.min(Math.floor(p), STOPS.length - 2);
	const f = p - i;
	const rgb = STOPS[i].map((c, k) => {
		const solid = c + (STOPS[i + 1][k] - c) * f;
		return Math.round(shadow ? (solid + BG[k]) / 2 : solid);
	});
	return `rgb(${rgb.join(' ')})`;
};
