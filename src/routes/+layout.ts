import { getAllProjects } from '$lib/content/projects';

export const prerender = true;
export const trailingSlash = 'always';

// Every page needs projects: home (featured), projects list, and the terminal window.
export const load = async () => ({ projects: await getAllProjects() });
