import type { PreviewTarget } from '$lib/types';

export const encodeTarget = (t: PreviewTarget): string => {
	if (t.kind === 'project') return `project:${t.slug}`;
	if (t.kind === 'tech') return `tech:${t.name}`;
	return `link:${t.href}`;
};

export const parseTarget = (value: string | null, label: string): PreviewTarget | null => {
	if (!value) return null;
	// Split on the first colon only: hrefs contain more of them.
	const i = value.indexOf(':');
	if (i < 0) return null;
	const kind = value.slice(0, i);
	const id = value.slice(i + 1);
	if (!id) return null;
	if (kind === 'project') return { kind, slug: id };
	if (kind === 'tech') return { kind, name: id };
	if (kind === 'link') return { kind, href: id, label };
	return null;
};
