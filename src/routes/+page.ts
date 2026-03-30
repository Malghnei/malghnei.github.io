import { getAllProjects } from '$lib/content/projects';
import { experienceTimeline, siteContent } from '$lib/data/site';
import type { ProjectEntry } from '$lib/types';

export const load = async () => {
	const projects = await getAllProjects();
	const featuredProjects = siteContent.featuredProjectSlugs
		.map((slug) => projects.find((project) => project.slug === slug))
		.filter((project): project is ProjectEntry => Boolean(project));

	return {
		featuredProjects,
		siteContent,
		experienceTimeline
	};
};
