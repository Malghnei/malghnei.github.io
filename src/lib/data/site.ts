import type { ExperienceEntry } from '$lib/types';

export const siteContent = {
	name: 'Malik Alghneimin',
	role: 'Aspiring Software Engineer',
	heroCommand: 'whoami',
	heroDescription:
		'I build stuff.',
	aboutNarrative: [
		'W.',
		'I.',
		'P.'
	],
	featuredProjectSlugs: ['condimental', 'sentiment-analysis', 'qiyami'],
	setup: {
		items: [
			{ label: 'IDE', value: 'Cursor' },
			{ label: 'Operating System', value: 'Arch Linux (KDE Plasma)' },
			{ label: 'Terminal', value: 'Kitty + Bash' },
			{ label: 'Editor Theme', value: 'Nord' },
			{ label: 'LLM of Choice', value: 'Gemini 3.1 Pro' },
			{ label: 'Browser', value: 'Zen Browser' }
		]
	},
	links: {
		items: [
			{ label: 'GitHub', href: 'https://github.com/Malghnei' },
			{ label: 'LinkedIn', href: 'https://linkedin.com/in/malik-alghneimin' },
			{ label: 'X / Twitter (don\'t have)', href: 'https://x.com/' },
			{ label: 'Instagram (soon...)', href: 'https://instagram.com/' },
			// { label: 'Resume', href: '#' }
		],
		contactEmail: 'malikalghneimin@gmail.com'
	},
	misc: {
		upTo: [
			'Vibe Coding random projects :robot:',
			'Studying for final exams :sob:',
			'Doomscrolling :iphone:'
		]
	}
};

export const experienceTimeline: ExperienceEntry[] = [
	{
		title: 'Developer',
		organization: 'Western Engineering Auto Pilot (WEAP)',
		period: 'Sept. 2025 - Present',
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
