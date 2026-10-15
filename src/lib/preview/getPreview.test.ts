import { describe, it, expect } from 'vitest';
import { getPreview } from './getPreview';
import type { LinkInfo, ProjectFrontmatter } from '$lib/types';

const project = (over: Partial<ProjectFrontmatter>): ProjectFrontmatter => ({
	slug: 'kata',
	title: 'Kata',
	summary: 's',
	period: '2025',
	techStack: ['Java'],
	role: 'solo',
	domain: 'software',
	...over
});

const kata = project({
	repoUrl: 'https://github.com/x/kata',
	demoUrl: 'https://kata.example.com/app'
});
const other = project({ slug: 'other', title: 'Other', techStack: ['Java', 'React'] });
const projects = [kata, other];
const links: LinkInfo[] = [
	{ label: 'github', href: 'https://github.com/Malghnei', description: 'my code' },
	{ label: 'email', href: 'mailto:a@b.c' }
];

describe('getPreview', () => {
	it('is idle for null', () => {
		expect(getPreview(null, projects, links)).toEqual({ kind: 'idle' });
	});

	it('returns a project', () => {
		expect(getPreview({ kind: 'project', slug: 'kata' }, projects, links)).toEqual({
			kind: 'project',
			project: kata
		});
	});

	it('is idle for an unknown slug', () => {
		expect(getPreview({ kind: 'project', slug: 'nope' }, projects, links)).toEqual({
			kind: 'idle'
		});
	});

	it('lists every project using a tech, in order', () => {
		const model = getPreview({ kind: 'tech', name: 'Java' }, projects, links);
		expect(model).toMatchObject({ kind: 'tech', name: 'Java', projects: [kata, other] });
	});

	it('includes the tech category', () => {
		const model = getPreview({ kind: 'tech', name: 'React' }, projects, links);
		expect(model).toMatchObject({ kind: 'tech', category: 'framework', projects: [other] });
	});

	it('is idle for an unknown tech', () => {
		expect(getPreview({ kind: 'tech', name: 'Cobol' }, projects, links)).toEqual({
			kind: 'idle'
		});
	});

	it('uses the links list description as context', () => {
		expect(
			getPreview(
				{ kind: 'link', href: 'https://github.com/Malghnei', label: 'github' },
				projects,
				links
			)
		).toEqual({
			kind: 'link',
			href: 'https://github.com/Malghnei',
			label: 'github',
			host: 'github.com',
			path: '/Malghnei',
			context: 'my code'
		});
	});

	it('derives context from repoUrl and demoUrl', () => {
		const repo = getPreview(
			{ kind: 'link', href: 'https://github.com/x/kata', label: 'repo' },
			projects,
			links
		);
		expect(repo).toMatchObject({ kind: 'link', context: 'source for Kata' });
		const demo = getPreview(
			{ kind: 'link', href: 'https://kata.example.com/app', label: 'demo' },
			projects,
			links
		);
		expect(demo).toMatchObject({ kind: 'link', context: 'live demo of Kata' });
	});

	it('omits context for unknown links', () => {
		const model = getPreview(
			{ kind: 'link', href: 'https://unknown.dev/a', label: 'a' },
			projects,
			links
		);
		expect(model).toEqual({
			kind: 'link',
			href: 'https://unknown.dev/a',
			label: 'a',
			host: 'unknown.dev',
			path: '/a'
		});
	});

	it('uses host "email" for mailto links', () => {
		expect(
			getPreview({ kind: 'link', href: 'mailto:a@b.c', label: 'email' }, projects, links)
		).toMatchObject({ kind: 'link', host: 'email', href: 'mailto:a@b.c' });
	});

	it('gives an empty host for an invalid URL and keeps the href', () => {
		expect(
			getPreview({ kind: 'link', href: 'not a url', label: 'x' }, projects, links)
		).toMatchObject({ kind: 'link', host: '', path: '', href: 'not a url' });
	});
});
