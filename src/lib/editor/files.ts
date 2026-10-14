export type Tab = { path: '/' | '/about/' | '/projects/'; label: string };

export const TABS: Tab[] = [
	{ path: '/', label: 'home.md' },
	{ path: '/about/', label: 'about.md' },
	{ path: '/projects/', label: 'projects/' }
];

const withTrailingSlash = (pathname: string) => (pathname.endsWith('/') ? pathname : `${pathname}/`);

const projectSlug = (pathname: string) =>
	withTrailingSlash(pathname).match(/^\/projects\/([^/]+)\/$/)?.[1] ?? null;

export const isTabActive = (tabPath: Tab['path'], pathname: string) => {
	const path = withTrailingSlash(pathname);
	return tabPath === '/' ? path === '/' : path.startsWith(tabPath);
};

export const tabLabel = (tab: Tab, pathname: string) => {
	const slug = tab.path === '/projects/' ? projectSlug(pathname) : null;
	return slug ? `projects/${slug}.md` : tab.label;
};

export const fileForPath = (pathname: string) => {
	const path = withTrailingSlash(pathname);
	if (path === '/') return '~/home.md';
	const slug = projectSlug(path);
	if (slug) return `~/projects/${slug}.md`;
	const tab = TABS.find((entry) => entry.path === path);
	return tab ? `~/${tab.label}` : `~${path}`;
};
