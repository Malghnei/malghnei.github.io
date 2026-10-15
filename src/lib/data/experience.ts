import type { ExperienceEntry } from '$lib/types';

export const CATEGORY_COLOR: Record<ExperienceEntry['category'], string> = {
	Work: 'var(--nord-8)',
	Volunteering: 'var(--nord-7)',
	Extracurricular: 'var(--nord-9)',
	Internship: 'var(--nord-9)'
};

// "Sept. 2025 - Present" -> "sept. 2025 → present"
export const formatPeriod = (period: string) => period.toLowerCase().replace(' - ', ' → ');

const slug = (text: string) =>
	text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

// Short and stable: "Developer @ Western Engineering Auto Pilot (WEAP)" -> "developer-weap".
export const experienceId = (entry: ExperienceEntry) => {
	const acronym = entry.organization.match(/\(([^)]+)\)/)?.[1];
	return slug(`${entry.title} ${acronym ?? entry.organization}`);
};
