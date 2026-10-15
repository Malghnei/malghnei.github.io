import { describe, expect, it } from 'vitest';
import { CATEGORY_COLORS, contrastRatio, getTagCategory } from './categories';

// import.meta.glob instead of node:fs: @types/node isn't installed, so svelte-check rejects node imports.
const files = import.meta.glob<string>('/src/content/projects/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

const projectTags = Object.entries(files).flatMap(([file, source]) => {
	const line = source.match(/techStack:\s*\[(.*)\]/)?.[1] ?? '';
	return [...line.matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => ({ file, tag: m[1] ?? m[2] }));
});

describe('tag categories', () => {
	it('finds tags in the project files', () => {
		expect(projectTags.length).toBeGreaterThan(10);
	});

	it('categorizes every techStack tag used in src/content/projects', () => {
		for (const { file, tag } of projectTags) {
			expect(getTagCategory(tag), `${file}: ${tag}`).toBeDefined();
		}
	});

	it('returns undefined for an unknown tag', () => {
		expect(getTagCategory('COBOL')).toBeUndefined();
	});

	it('keeps every category colour readable on nord-0', () => {
		for (const { hex, label } of Object.values(CATEGORY_COLORS)) {
			expect(contrastRatio(hex, '#2e3440'), label).toBeGreaterThanOrEqual(4.5);
		}
	});
});

describe('contrastRatio', () => {
	it('matches the known nord-4 on nord-0 ratio', () => {
		expect(contrastRatio('#d8dee9', '#2e3440')).toBeCloseTo(9.25, 1);
	});
});
