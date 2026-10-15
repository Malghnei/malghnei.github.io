import { describe, expect, it } from 'vitest';
import type { ProjectFrontmatter } from '$lib/types';
import { compareProjects, periodEnd } from './order';

const make = (overrides: Partial<ProjectFrontmatter>): ProjectFrontmatter => ({
	slug: 'p',
	title: 'P',
	summary: '',
	period: '',
	techStack: [],
	role: 'solo',
	domain: 'software',
	...overrides
});

describe('periodEnd', () => {
	it('reads abbreviated and full month names', () => {
		expect(periodEnd('Apr. 2026')).toBe(2026 * 12 + 3);
		expect(periodEnd('Sept. 2025')).toBe(2025 * 12 + 8);
		expect(periodEnd('August 2026')).toBe(2026 * 12 + 7);
	});

	it('uses the end of a range', () => {
		expect(periodEnd('Sept. 2025 - May 2026')).toBe(2026 * 12 + 4);
	});

	it('puts ongoing work last in time', () => {
		expect(periodEnd('Sept. 2025 - Present')).toBe(Infinity);
	});

	it('falls back to the year, then to nothing', () => {
		expect(periodEnd('2024')).toBe(2024 * 12);
		expect(periodEnd('')).toBe(-Infinity);
	});
});

describe('compareProjects', () => {
	const order = (list: ProjectFrontmatter[]) => [...list].sort(compareProjects).map((project) => project.slug);

	it('puts featured projects first, then newest first', () => {
		expect(
			order([
				make({ slug: 'old', period: 'Oct. 2023' }),
				make({ slug: 'new', period: 'Aug. 2026' }),
				make({ slug: 'featured-old', period: 'Apr. 2026', featured: true }),
				make({ slug: 'featured-new', period: 'Aug. 2026', featured: true })
			])
		).toEqual(['featured-new', 'featured-old', 'new', 'old']);
	});

	it('breaks ties by title', () => {
		expect(
			order([
				make({ slug: 'b', title: 'Staying Alive', period: 'Apr. 2026' }),
				make({ slug: 'a', title: 'Condimental', period: 'Apr. 2026' })
			])
		).toEqual(['a', 'b']);
	});
});
