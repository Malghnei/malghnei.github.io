// Cursor motions over the buffer's lines as plain strings. Positions are 0-based.
export type Pos = { line: number; col: number };
export type Motion = 'h' | 'j' | 'k' | 'l' | 'w' | 'b' | 'e' | '0' | '$' | 'gg' | 'G';
export type VisualMode = 'char' | 'line';
// Inclusive at both ends, like nvim's visual selection.
export type Selection = { start: Pos; end: Pos };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const lastCol = (text: string | undefined) => Math.max(0, (text?.length ?? 0) - 1);

export const clampPos = (texts: string[], pos: Pos): Pos => {
	if (!texts.length) return { line: 0, col: 0 };
	const line = clamp(pos.line, 0, texts.length - 1);
	return { line, col: clamp(pos.col, 0, lastCol(texts[line])) };
};

// nvim's word classes. An empty line is a word of its own.
const BLANK = 0;
const PUNCT = 1;
const WORD = 2;
const EMPTY = 3;

const classAt = (texts: string[], pos: Pos) => {
	const text = texts[pos.line];
	if (text === '') return EMPTY;
	const char = text[pos.col];
	if (/\s/.test(char)) return BLANK;
	return /[\p{L}\p{N}_]/u.test(char) ? WORD : PUNCT;
};

const next = (texts: string[], pos: Pos): Pos | null => {
	if (pos.col < texts[pos.line].length - 1) return { line: pos.line, col: pos.col + 1 };
	return pos.line < texts.length - 1 ? { line: pos.line + 1, col: 0 } : null;
};

const prev = (texts: string[], pos: Pos): Pos | null => {
	if (pos.col > 0) return { line: pos.line, col: pos.col - 1 };
	return pos.line > 0 ? { line: pos.line - 1, col: lastCol(texts[pos.line - 1]) } : null;
};

const lastPos = (texts: string[]): Pos => ({ line: texts.length - 1, col: lastCol(texts[texts.length - 1]) });

const wordForward = (texts: string[], pos: Pos): Pos => {
	const start = classAt(texts, pos);
	let at = next(texts, pos);
	// Leave the current word; a line break ends it too.
	if (start === WORD || start === PUNCT) {
		while (at && at.line === pos.line && classAt(texts, at) === start) at = next(texts, at);
	}
	while (at && classAt(texts, at) === BLANK) at = next(texts, at);
	return at ?? lastPos(texts);
};

const wordEnd = (texts: string[], pos: Pos): Pos => {
	let at = next(texts, pos);
	while (at && (classAt(texts, at) === BLANK || classAt(texts, at) === EMPTY)) at = next(texts, at);
	if (!at) return lastPos(texts);
	const cls = classAt(texts, at);
	for (let step = next(texts, at); step && step.line === at.line && classAt(texts, step) === cls; step = next(texts, at)) {
		at = step;
	}
	return at;
};

const wordBack = (texts: string[], pos: Pos): Pos => {
	let at = prev(texts, pos);
	while (at && classAt(texts, at) === BLANK) at = prev(texts, at);
	if (!at) return { line: 0, col: 0 };
	const cls = classAt(texts, at);
	if (cls === EMPTY) return at;
	for (let step = prev(texts, at); step && step.line === at.line && classAt(texts, step) === cls; step = prev(texts, at)) {
		at = step;
	}
	return at;
};

const WORD_STEPS = { w: wordForward, b: wordBack, e: wordEnd };

const withWant = (pos: Pos) => ({ pos, want: pos.col });

// want is the column j/k aim for (nvim's curswant): kept by vertical motions, Infinity after $.
export const move = (
	texts: string[],
	from: Pos,
	motion: Motion,
	count: number | null,
	want: number
): { pos: Pos; want: number } => {
	if (!texts.length) return { pos: from, want };
	const pos = clampPos(texts, from);
	const times = Math.max(1, count ?? 1);
	const onLine = (line: number, col: number) => clampPos(texts, { line, col });

	switch (motion) {
		case 'j':
		case 'k':
			return { pos: onLine(pos.line + (motion === 'j' ? times : -times), want), want };
		case 'gg':
		case 'G': {
			const line = count !== null ? count - 1 : motion === 'gg' ? 0 : texts.length - 1;
			return { pos: onLine(line, want), want };
		}
		case '$':
			return { pos: onLine(pos.line + times - 1, Infinity), want: Infinity };
		case 'h':
			return withWant(onLine(pos.line, pos.col - times));
		case 'l':
			return withWant(onLine(pos.line, pos.col + times));
		case '0':
			return withWant({ line: pos.line, col: 0 });
	}

	const step = WORD_STEPS[motion];
	let target = pos;
	for (let i = 0; i < times; i++) {
		const after = step(texts, target);
		// Stuck at a buffer edge: a huge count stops here instead of spinning.
		if (after.line === target.line && after.col === target.col) break;
		target = after;
	}
	return withWant(target);
};

const isBefore = (a: Pos, b: Pos) => a.line < b.line || (a.line === b.line && a.col <= b.col);

export const selection = (anchor: Pos, head: Pos, mode: VisualMode, texts: string[]): Selection => {
	const a = clampPos(texts, anchor);
	const h = clampPos(texts, head);
	const [start, end] = isBefore(a, h) ? [a, h] : [h, a];
	if (mode === 'char') return { start, end };
	return { start: { line: start.line, col: 0 }, end: { line: end.line, col: lastCol(texts[end.line]) } };
};

export const selectedText = (texts: string[], { start, end }: Selection, mode: VisualMode): string => {
	if (mode === 'line') return texts.slice(start.line, end.line + 1).join('\n') + '\n';
	if (start.line === end.line) return texts[start.line].slice(start.col, end.col + 1);
	return [
		texts[start.line].slice(start.col),
		...texts.slice(start.line + 1, end.line),
		texts[end.line].slice(0, end.col + 1)
	].join('\n');
};

export const yankMessage = ({ start, end }: Selection, mode: VisualMode, text: string): string => {
	const lines = end.line - start.line + 1;
	if (mode === 'line' || lines > 1) return lines === 1 ? '1 line yanked' : `${lines} lines yanked`;
	return text.length === 1 ? '1 char yanked' : `${text.length} chars yanked`;
};
