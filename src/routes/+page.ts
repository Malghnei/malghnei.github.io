export const load = async ({ parent }) => {
	const { projects } = await parent();
	return { featuredProjects: projects.filter((project) => project.featured) };
};
