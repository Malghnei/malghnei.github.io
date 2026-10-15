import type { ProjectFrontmatter } from '$lib/types';

export type Dictionary = { projects: Map<string, string>; tech: Set<string> }; // title → slug

export type Segment =
	| { type: 'text'; value: string }
	| { type: 'project'; value: string; slug: string }
	| { type: 'tech'; value: string };

const isWordChar = (ch: string | undefined) => ch !== undefined && /[A-Za-z0-9]/.test(ch);

export const buildDictionary = (projects: ProjectFrontmatter[]): Dictionary => ({
	projects: new Map(projects.map((p) => [p.title, p.slug])),
	tech: new Set(projects.flatMap((p) => p.techStack))
});

export const tokenize = (
	text: string,
	dict: Dictionary,
	options: { exclude?: string[] } = {}
): Segment[] => {
	if (!text) return [];
	const exclude = new Set(options.exclude ?? []);
	const names = [...dict.projects.keys(), ...dict.tech]
		.filter((n) => n && !exclude.has(n))
		.sort((a, b) => b.length - a.length);
	if (names.length === 0) return [{ type: 'text', value: text }];

	const segments: Segment[] = [];
	let last = 0;
	let i = 0;
	while (i < text.length) {
		// Manual boundary check: \b fails next to the "." in "Node.js".
		// Names are longest first, so the first whole-word hit wins; a rejected
		// long name ("React Nativex") still lets a shorter one ("React") match.
		const name = isWordChar(text[i - 1])
			? undefined
			: names.find((n) => text.startsWith(n, i) && !isWordChar(text[i + n.length]));
		if (name === undefined) {
			i++;
			continue;
		}
		if (i > last) segments.push({ type: 'text', value: text.slice(last, i) });
		const slug = dict.projects.get(name);
		segments.push(
			slug !== undefined ? { type: 'project', value: name, slug } : { type: 'tech', value: name }
		);
		i += name.length;
		last = i;
	}
	if (last < text.length) segments.push({ type: 'text', value: text.slice(last) });
	return segments;
};
