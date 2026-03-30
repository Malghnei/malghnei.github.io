const paletteFgCssVars: string[] = [
	'var(--nord-8)',
	'var(--nord-7)',
	'var(--nord-9)',
	'var(--nord-10)',
	'var(--nord-11)',
	// Extended Nord palette (placeholders for more distinct tech tag colors)
	'var(--nord-12)',
	'var(--nord-13)',
	'var(--nord-14)',
	'var(--nord-15)'
];

type TagHighlightStyle = {
	color: string;
	backgroundColor: string;
	borderColor: string;
};

const fnv1a32 = (input: string) => {
	let hash = 0x811c9dc5; // FNV offset basis
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		// hash * 16777619
		hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
	}
	return hash >>> 0;
};

export const getTagHighlightStyle = (tag: string): TagHighlightStyle => {
	const fg = paletteFgCssVars[fnv1a32(tag) % paletteFgCssVars.length] ?? 'var(--nord-8)';

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

