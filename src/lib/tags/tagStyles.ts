import { CATEGORY_COLORS, getTagCategory } from './categories';

type TagHighlightStyle = {
	color: string;
	backgroundColor: string;
	borderColor: string;
};

export const getTagHighlightStyle = (tag: string): TagHighlightStyle => {
	const category = getTagCategory(tag);
	// Unknown tags are rejected at build time; this only keeps runtime input safe.
	const fg = category ? `var(${CATEGORY_COLORS[category].cssVar})` : 'var(--nord-4)';

	// Use CSS `color-mix` so we can keep a subtle background with only one palette color.
	// (Works in modern browsers; falls back to transparent-ish behavior if unsupported.)
	const backgroundColor = `color-mix(in srgb, ${fg} 18%, transparent)`;

	return {
		color: fg,
		backgroundColor,
		borderColor: fg
	};
};

export const getTagChipStyle = (tag: string, selected: boolean) => {
	const highlight = getTagHighlightStyle(tag);

	// Unselected chips still "follow" the tag color, but keep them subtle.
	const subtleText = `color-mix(in srgb, ${highlight.color} 65%, var(--nord-4))`;
	const subtleBorder = `color-mix(in srgb, ${highlight.borderColor} 55%, var(--nord-3))`;

	return {
		color: selected ? highlight.color : subtleText,
		borderColor: selected ? highlight.borderColor : subtleBorder,
		backgroundColor: selected ? highlight.backgroundColor : 'transparent'
	};
};

