import { getAllProjects } from '$lib/content/projects';

export const load = async () => {
	const projects = await getAllProjects();
	return { projects };
};
