// Paints the block cursor, the visual selection and the yank flash as CSS custom highlights, so
// the content DOM is never touched. Styled by the ::highlight() rules in src/routes/layout.css.
// Off on touch screens (spec non-goal), matching the preview pane's (hover: none) rule.
export const supported =
	typeof CSS !== 'undefined' && 'highlights' in CSS && !matchMedia('(hover: none)').matches;

type Name = 'cursor' | 'visual' | 'yank';

// The block cursor paints over a flash, and both over a selection.
const PRIORITY: Record<Name, number> = { cursor: 2, yank: 1, visual: 0 };
const YANK_FLASH_MS = 150;
let yankTimer: ReturnType<typeof setTimeout> | undefined;

const set = (name: Name, ranges: Range[]) => {
	if (!supported) return;
	if (!ranges.length) {
		CSS.highlights.delete(name);
		return;
	}
	const highlight = new Highlight(...ranges);
	highlight.priority = PRIORITY[name];
	CSS.highlights.set(name, highlight);
};

export const paintCursor = (range: Range | null) => set('cursor', range ? [range] : []);

export const paintSelection = (ranges: Range[]) => set('visual', ranges);

export const flashYank = (ranges: Range[]) => {
	set('yank', ranges);
	clearTimeout(yankTimer);
	yankTimer = setTimeout(() => set('yank', []), YANK_FLASH_MS);
};

export const clearPaint = () => {
	set('cursor', []);
	set('visual', []);
	set('yank', []);
};
