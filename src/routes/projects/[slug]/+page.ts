import { error } from '@sveltejs/kit';
import { getProjectBySlug, getProjectSlugs } from '$lib/content/projects';

export const entries = async () => {
	const slugs = getProjectSlugs();
	return slugs.map((slug) => ({ slug }));
};

export const load = async ({ params }) => {
	const project = await getProjectBySlug(params.slug);

	if (!project || !project.component) {
		throw error(404, 'Project not found');
	}

	return {
		project
	};
};
