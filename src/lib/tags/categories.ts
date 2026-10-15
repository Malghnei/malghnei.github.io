export type TagCategory = 'language' | 'framework' | 'platform' | 'ml';

export const TAG_CATEGORIES: Record<string, TagCategory> = {
	TypeScript: 'language',
	Python: 'language',
	Dart: 'language',
	Java: 'language',
	React: 'framework',
	'React Native': 'framework',
	SvelteKit: 'framework',
	Flutter: 'framework',
	'Express.js': 'framework',
	'Tailwind CSS': 'framework',
	mdsvex: 'framework',
	'Node.js': 'platform',
	Supabase: 'platform',
	PostgreSQL: 'platform',
	Mediapipe: 'ml',
	'Cloudflare Workers AI': 'ml'
};

// hex mirrors the css var, so contrast can be tested without a browser.
export const CATEGORY_COLORS: Record<TagCategory, { cssVar: string; hex: string; label: string }> = {
	language: { cssVar: '--nord-13', hex: '#ebcb8b', label: 'Language' },
	framework: { cssVar: '--nord-7', hex: '#8fbcbb', label: 'Framework' },
	platform: { cssVar: '--nord-14', hex: '#a3be8c', label: 'Platform' },
	ml: { cssVar: '--tag-ml', hex: '#ba98b4', label: 'ML' }
};

export const getTagCategory = (tag: string): TagCategory | undefined =>
	Object.hasOwn(TAG_CATEGORIES, tag) ? TAG_CATEGORIES[tag] : undefined;

const luminance = (hex: string) => {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// WCAG 2.x contrast ratio between two #rrggbb colours.
export const contrastRatio = (hexA: string, hexB: string) => {
	const [hi, lo] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
	return (hi + 0.05) / (lo + 0.05);
};
