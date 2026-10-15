import type { ProjectFrontmatter } from '$lib/types';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// "Apr. 2026" -> months since year 0; for ranges ("Sept. 2025 - May 2026") the end counts.
export const periodEnd = (period: string): number => {
	const end = period.split(/\s+-\s+/).pop()?.trim().toLowerCase() ?? '';
	if (end === 'present') return Infinity;
	const year = end.match(/\d{4}/);
	if (!year) return -Infinity;
	const month = MONTHS.indexOf(end.slice(0, 3));
	return Number(year[0]) * 12 + Math.max(month, 0);
};

// Featured first, then newest first, then by title.
export const compareProjects = (a: ProjectFrontmatter, b: ProjectFrontmatter) =>
	Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
	periodEnd(b.period) - periodEnd(a.period) ||
	a.title.localeCompare(b.title);
