import { describe, it, expect } from 'vitest';
import { CATEGORY_COLOR, experienceId, formatPeriod, logPeriod } from './experience';
import { experienceTimeline } from './site';
import type { ExperienceEntry } from '$lib/types';

const entry = (title: string, organization: string): ExperienceEntry => ({
	title,
	organization,
	period: 'Jan. 2025 - Feb. 2025',
	category: 'Work',
	description: 'd'
});

describe('experienceId', () => {
	it('uses a parenthesised acronym as the organisation', () => {
		expect(experienceId(entry('Developer', 'Western Engineering Auto Pilot (WEAP)'))).toBe('developer-weap');
	});

	it('uses the full organisation when there is no acronym', () => {
		expect(experienceId(entry('Market Research Intern', 'Clirio Inc.'))).toBe('market-research-intern-clirio-inc');
	});

	it('collapses punctuation and trims dashes', () => {
		expect(experienceId(entry('Camp Counselor - FoY', 'Hamilton-Wentworth District School Board'))).toBe(
			'camp-counselor-foy-hamilton-wentworth-district-school-board'
		);
		expect(experienceId(entry('  Lead!! ', '(X)'))).toBe('lead-x');
	});

	it('is unique across the real timeline', () => {
		const ids = experienceTimeline.map(experienceId);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('formatPeriod', () => {
	it('lowercases and turns the dash into an arrow', () => {
		expect(formatPeriod('Sept. 2025 - May 2026')).toBe('sept. 2025 → may 2026');
		expect(formatPeriod('Sept. 2025 - Present')).toBe('sept. 2025 → present');
	});
});

describe('logPeriod', () => {
	it('gives fixed-width year-month ranges', () => {
		expect(logPeriod('Sept. 2025 - May 2026')).toBe('2025-09 → 2026-05');
		expect(logPeriod('Jun. 2024 - Aug. 2024')).toBe('2024-06 → 2024-08');
		expect(logPeriod('Oct. 2023 - Present')).toBe('2023-10 → now');
	});

	it('falls back to formatPeriod on dates it cannot read', () => {
		expect(logPeriod('Summer 2024 - Fall 2024')).toBe('summer 2024 → fall 2024');
	});

	it('parses every period in the real timeline', () => {
		for (const item of experienceTimeline) expect(logPeriod(item.period)).toMatch(/^\d{4}-\d{2} → (\d{4}-\d{2}|now)$/);
	});
});

describe('CATEGORY_COLOR', () => {
	it('has a colour for every category used in the timeline', () => {
		for (const item of experienceTimeline) expect(CATEGORY_COLOR[item.category]).toMatch(/^var\(--nord-\d+\)$/);
	});
});
