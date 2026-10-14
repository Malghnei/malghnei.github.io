import type { ProjectDomain, ProjectFrontmatter, ProjectRole } from '$lib/types';

export type ProjectFilters = {
	query: string;
	role: ProjectRole | 'all';
	domain: ProjectDomain | 'all';
	tags: string[];
};

export const filterProjects = <T extends ProjectFrontmatter>(
	projects: T[],
	filters: ProjectFilters
): T[] => {
	const q = filters.query.trim().toLowerCase();

	return projects.filter((project) => {
		const matchesQuery =
			!q ||
			project.title.toLowerCase().includes(q) ||
			project.summary.toLowerCase().includes(q) ||
			project.techStack.some((tech) => tech.toLowerCase().includes(q));
		const matchesRole = filters.role === 'all' || project.role === filters.role;
		const matchesDomain = filters.domain === 'all' || project.domain === filters.domain;
		const matchesTags = filters.tags.every((tag) => project.techStack.includes(tag));
		return matchesQuery && matchesRole && matchesDomain && matchesTags;
	});
};
