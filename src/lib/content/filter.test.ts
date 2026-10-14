import { describe, expect, it } from 'vitest';
import type { ProjectFrontmatter } from '$lib/types';
import { filterProjects, type ProjectFilters } from './filter';

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

const projects = [
	make({ slug: 'condimental', title: 'Condimental', summary: 'Mayonnaise vision app', techStack: ['React', 'Node.js'] }),
	make({ slug: 'staying-alive', title: 'Staying Alive', summary: 'Type-to-survive game', techStack: ['Java'], role: 'contribution' }),
	make({ slug: 'rover', title: 'Rover', summary: 'Line-following robot', techStack: ['C++', 'Arduino'], domain: 'hardware' })
];

const none: ProjectFilters = { query: '', role: 'all', domain: 'all', tags: [] };
const slugs = (list: ProjectFrontmatter[]) => list.map((project) => project.slug);
const run = (filters: Partial<ProjectFilters>) => slugs(filterProjects(projects, { ...none, ...filters }));

describe('filterProjects', () => {
	it('returns everything, in order, with no filters', () => {
		expect(run({})).toEqual(['condimental', 'staying-alive', 'rover']);
	});

	it('matches the query against the title, case-insensitively', () => {
		expect(run({ query: 'condi' })).toEqual(['condimental']);
	});

	it('matches the query against the summary', () => {
		expect(run({ query: 'robot' })).toEqual(['rover']);
	});

	it('matches the query against the tech stack', () => {
		expect(run({ query: 'java' })).toEqual(['staying-alive']);
	});

	it('trims the query and ignores case', () => {
		expect(run({ query: '  REACT ' })).toEqual(['condimental']);
	});

	it('requires every selected tag', () => {
		expect(run({ tags: ['React', 'Node.js'] })).toEqual(['condimental']);
		expect(run({ tags: ['React', 'Java'] })).toEqual([]);
	});

	it('filters by role', () => {
		expect(run({ role: 'contribution' })).toEqual(['staying-alive']);
	});

	it('filters by domain', () => {
		expect(run({ domain: 'hardware' })).toEqual(['rover']);
	});

	it('combines all filters', () => {
		expect(run({ role: 'solo', domain: 'software', query: 'app' })).toEqual(['condimental']);
	});

	it('returns an empty list when nothing matches', () => {
		expect(run({ query: 'kubernetes' })).toEqual([]);
	});
});
