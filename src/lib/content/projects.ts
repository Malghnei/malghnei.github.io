import type { Component } from 'svelte';
import type { ProjectEntry, ProjectFrontmatter } from '$lib/types';

type ProjectModule = {
	default: Component;
	metadata: Omit<ProjectFrontmatter, 'slug'>;
};

const projectModules = import.meta.glob('/src/content/projects/*.md');
const projectRawModules = import.meta.glob('/src/content/projects/*.md', {
	query: '?raw',
	import: 'default'
});

const slugFromPath = (path: string) => path.split('/').pop()?.replace('.md', '') ?? '';

export const getProjectSlugs = () =>
	Object.keys(projectModules)
		.map(slugFromPath)
		.filter(Boolean)
		.sort((a, b) => a.localeCompare(b));

export const getAllProjects = async (): Promise<ProjectEntry[]> => {
	const entries = await Promise.all(
		Object.entries(projectModules).map(async ([path, resolver]) => {
			const loaded = (await resolver()) as ProjectModule;
			const slug = slugFromPath(path);

			return {
				slug,
				...loaded.metadata
			} satisfies ProjectEntry;
		})
	);

	return entries.sort((a, b) => a.title.localeCompare(b.title));
};

export const getProjectBySlug = async (slug: string): Promise<ProjectEntry | null> => {
	const path = `/src/content/projects/${slug}.md`;
	const resolver = projectModules[path];

	if (!resolver) {
		return null;
	}

	const loaded = (await resolver()) as ProjectModule;

	return {
		slug,
		component: loaded.default,
		...loaded.metadata
	};
};

export const getProjectRawBySlug = async (slug: string): Promise<string | null> => {
	const path = `/src/content/projects/${slug}.md`;
	const resolver = projectRawModules[path];

	if (!resolver) {
		return null;
	}

	return (await resolver()) as string;
};
