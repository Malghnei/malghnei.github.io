import type { Component } from 'svelte';

export type ProjectRole = 'solo' | 'contribution';
export type ProjectDomain = 'software' | 'hardware';

export type ProjectFrontmatter = {
	slug: string;
	title: string;
	summary: string;
	period: string;
	techStack: string[];
	role: ProjectRole;
	domain: ProjectDomain;
	featured?: boolean;
	repoUrl?: string;
	demoUrl?: string;
	preview?: string;
};

export type ProjectEntry = ProjectFrontmatter & {
	component?: Component;
	raw?: string;
};

export type ExperienceEntry = {
	title: string;
	organization: string;
	period: string;
	category: 'Work' | 'Volunteering' | 'Extracurricular' | 'Internship';
	description: string;
};
