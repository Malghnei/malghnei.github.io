import type { ProjectFrontmatter } from '$lib/types';

export type Dictionary = { projects: Map<string, string>; tech: Set<string> }; // title → slug

export type Segment =
	| { type: 'text'; value: string }
	| { type: 'project'; value: string; slug: string }
	| { type: 'tech'; value: string };

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

	// Longest first, so the alternation prefers "React Native" over "React".
	const pattern = new RegExp(names.map(escapeRegExp).join('|'), 'g');
	const segments: Segment[] = [];
	let last = 0;

	const pushText = (value: string) => {
		if (!value) return;
		const prev = segments[segments.length - 1];
		if (prev?.type === 'text') prev.value += value;
		else segments.push({ type: 'text', value });
	};

	let m: RegExpExecArray | null;
	while ((m = pattern.exec(text))) {
		const start = m.index;
		const end = start + m[0].length;
		// Manual boundary check: \b fails next to the "." in "Node.js".
		if (isWordChar(text[start - 1]) || isWordChar(text[end])) {
			pattern.lastIndex = start + 1;
			continue;
		}
		pushText(text.slice(last, start));
		const slug = dict.projects.get(m[0]);
		segments.push(
			slug !== undefined
				? { type: 'project', value: m[0], slug }
				: { type: 'tech', value: m[0] }
		);
		last = end;
	}
	pushText(text.slice(last));
	return segments;
};
