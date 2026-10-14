import type { ExperienceEntry } from '$lib/types';

export const siteContent = {
	name: 'Malik Alghneimin',
	role: 'Aspiring Software Engineer',
	heroDescription:
		'I build stuff.',
	aboutNarrative: [
		'W.',
		'I.',
		'P.'
	],
	setup: {
		items: [
			{ label: 'IDE', value: 'NeoVim' },
			{ label: 'Operating System', value: 'Nixos (Hyprland)' },
			{ label: 'Terminal', value: 'Kitty + Zsh' },
			{ label: 'Editor Theme', value: 'Nord' },
			{ label: 'LLM of Choice', value: 'Claude Opus 5.5' },
			{ label: 'Browser', value: 'Zen Browser' }
		]
	},
	links: {
		items: [
			{ label: 'github', href: 'https://github.com/Malghnei' },
			{ label: 'linkedin', href: 'https://linkedin.com/in/malik-alghneimin' }
		],
		contactEmail: 'malikalghneimin@gmail.com'
	},
	misc: {
		upTo: [
			'Vibe Coding random projects :robot:',
			'Studying for midterms :sob:',
			'Doomscrolling :iphone:'
		]
	}
};

export const experienceTimeline: ExperienceEntry[] = [
	{
		title: 'Developer',
		organization: 'Western Engineering Auto Pilot (WEAP)',
		period: 'Sept. 2025 - May 2026',
		category: 'Extracurricular',
		description:
			'Developed algorithms for autonomous vehicle navigation and decision-making.'
	},
	{
		title: 'Market Research Intern',
		organization: 'Clirio Inc.',
		period: 'Jun. 2025 - Aug. 2025',
		category: 'Work',
		description:
			'Conducted market research for Clirio Inc. to identify potential opportunities for the company to expand into new markets.'
	},
	{
		title: 'Camp Counselor - FoY',
		organization: 'Hamilton-Wentworth District School Board',
		period: 'Jun. 2024 - Aug. 2024',
		category: 'Work',
		description:
			'Supervised and assisted campers during summer camp activities.'
	},
	{
		title: 'Robotics Team Lead',
		organization: 'Vex Robotics',
		period: 'Oct. 2023 - Dec. 2023',
		category: 'Extracurricular',
		description:
			'Led a team of 5 to build a robot that competed in a local Vex Robotics Competition in Highschool.'
	}
];
