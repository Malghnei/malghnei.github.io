// Paints the block cursor, the visual selection and the yank flash as CSS custom highlights, so
// the content DOM is never touched. Styled by the ::highlight() rules in src/routes/layout.css.
export const highlights = typeof CSS !== 'undefined' && 'highlights' in CSS;
// Off on touch screens (spec non-goal), matching the preview pane's (hover: none) rule.
// The startup intro still paints there; Buffer decides.
export const supported = highlights && !matchMedia('(hover: none)').matches;

type Name = 'cursor' | 'cursor-glyph' | 'visual' | 'yank' | 'unrevealed';

// Unrevealed intro text hides even the char under the cursor, so the typed cell reads as an
// empty insert caret. The block cursor paints over a flash, and both over a selection.
const PRIORITY: Record<Name, number> = { unrevealed: 3, cursor: 2, 'cursor-glyph': 2, yank: 1, visual: 0 };
const YANK_FLASH_MS = 150;
let yankTimer: ReturnType<typeof setTimeout> | undefined;

const set = (name: Name, ranges: Range[]) => {
	if (!highlights) return;
	if (!ranges.length) {
		CSS.highlights.delete(name);
		return;
	}
	const highlight = new Highlight(...ranges);
	highlight.priority = PRIORITY[name];
	CSS.highlights.set(name, highlight);
};

// glyphOnly: the cell itself is drawn by CSS (art rows), so only the glyph's colour is set here.
export const paintCursor = (range: Range | null, glyphOnly = false) => {
	const ranges = range ? [range] : [];
	set(glyphOnly ? 'cursor-glyph' : 'cursor', ranges);
	set(glyphOnly ? 'cursor' : 'cursor-glyph', []);
};

export const paintSelection = (ranges: Range[]) => set('visual', ranges);

export const paintUnrevealed = (ranges: Range[]) => set('unrevealed', ranges);

export const flashYank = (ranges: Range[]) => {
	set('yank', ranges);
	clearTimeout(yankTimer);
	yankTimer = setTimeout(() => set('yank', []), YANK_FLASH_MS);
};

export const clearPaint = () => {
	(['cursor', 'cursor-glyph', 'visual', 'yank', 'unrevealed'] as const).forEach((name) => set(name, []));
};
