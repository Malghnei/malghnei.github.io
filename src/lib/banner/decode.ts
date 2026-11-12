// The name arrives scrambled and settles left to right, like something being deciphered.
export const DECODE_POOL = '█▓▒░╗╔╝╚═║';
const POOL = [...DECODE_POOL];
const GLYPH_MS = 55;

// When a cell shows its real character. jitter in [0, 1) keeps a column from landing as one edge.
export const settleAt = (col: number, width: number, jitter: number) =>
	120 + (col / width) * 650 + jitter * 220;

// The scrambled character a cell shows before it settles; seed in [0, 1) desynchronises cells.
export const decodeGlyph = (elapsedMs: number, seed: number) =>
	POOL[Math.floor(elapsedMs / GLYPH_MS + seed * 97) % POOL.length];
