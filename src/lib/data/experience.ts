import type { ExperienceEntry } from '$lib/types';

// One hue per category, none shared with dates (nord-9) or titles; all clear 4.5:1 on the cursorline.
export const CATEGORY_COLOR: Record<ExperienceEntry['category'], string> = {
	Work: 'var(--nord-14)',
	Volunteering: 'var(--nord-7)',
	Extracurricular: 'var(--nord-13)',
	Internship: 'var(--nord-8)'
};

// "Sept. 2025 - Present" -> "sept. 2025 → present"
export const formatPeriod = (period: string) => period.toLowerCase().replace(' - ', ' → ');

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// "Sept. 2025" -> "2025-09", "Present" -> "now"; null for anything else.
const isoMonth = (date: string) => {
	if (/^present$/i.test(date.trim())) return 'now';
	const m = date.trim().match(/^([a-z]{3})[a-z]*\.?\s+(\d{4})$/i);
	const month = m ? MONTHS.indexOf(m[1].toLowerCase()) : -1;
	return month < 0 ? null : `${m![2]}-${String(month + 1).padStart(2, '0')}`;
};

// Fixed width for the log's date column: "Sept. 2025 - May 2026" -> "2025-09 → 2026-05".
// Falls back to formatPeriod when a date doesn't parse.
export const logPeriod = (period: string) => {
	const [from, to] = period.split(' - ').map(isoMonth);
	return from && to ? `${from} → ${to}` : formatPeriod(period);
};

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
