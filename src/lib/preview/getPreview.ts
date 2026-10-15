import { getTagCategory, type TagCategory } from '$lib/tags/categories';
import { experienceId } from '$lib/data/experience';
import type { ExperienceEntry, LinkInfo, PreviewTarget, ProjectFrontmatter } from '$lib/types';

export type PreviewModel =
	| { kind: 'idle' }
	| { kind: 'project'; project: ProjectFrontmatter }
	| { kind: 'experience'; entry: ExperienceEntry }
	| {
			kind: 'tech';
			name: string;
			category: TagCategory | undefined;
			projects: ProjectFrontmatter[];
	  }
	| {
			kind: 'link';
			href: string;
			label: string;
			host: string;
			path: string;
			context?: string;
	  };

const parseHref = (href: string): { host: string; path: string } => {
	if (href.startsWith('mailto:')) return { host: 'email', path: '' };
	try {
		const url = new URL(href);
		return { host: url.host, path: url.pathname === '/' ? '' : url.pathname };
	} catch {
		// The pane still shows the full href when it can't be parsed.
		return { host: '', path: '' };
	}
};

const linkContext = (
	href: string,
	projects: ProjectFrontmatter[],
	links: LinkInfo[]
): string | undefined => {
	const described = links.find((l) => l.href === href)?.description;
	if (described) return described;
	const source = projects.find((p) => p.repoUrl === href);
	if (source) return `source for ${source.title}`;
	const demo = projects.find((p) => p.demoUrl === href);
	if (demo) return `live demo of ${demo.title}`;
	return undefined;
};

export const getPreview = (
	target: PreviewTarget | null,
	projects: ProjectFrontmatter[],
	links: LinkInfo[],
	experience: ExperienceEntry[] = []
): PreviewModel => {
	if (!target) return { kind: 'idle' };

	if (target.kind === 'project') {
		const project = projects.find((p) => p.slug === target.slug);
		return project ? { kind: 'project', project } : { kind: 'idle' };
	}

	if (target.kind === 'tech') {
		const used = projects.filter((p) => p.techStack.includes(target.name));
		if (used.length === 0) return { kind: 'idle' };
		return {
			kind: 'tech',
			name: target.name,
			category: getTagCategory(target.name),
			projects: used
		};
	}

	if (target.kind === 'experience') {
		const entry = experience.find((e) => experienceId(e) === target.id);
		return entry ? { kind: 'experience', entry } : { kind: 'idle' };
	}

	const context = linkContext(target.href, projects, links);
	return {
		kind: 'link',
		href: target.href,
		label: target.label,
		...parseHref(target.href),
		...(context ? { context } : {})
	};
};
