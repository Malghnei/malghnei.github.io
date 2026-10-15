import type { ExperienceEntry, LinkInfo } from '$lib/types';

export const siteContent = {
	name: 'Malik Alghneimin',
	role: 'Software Developer · CS @ Western University',
	status: 'Open to 2027 internships',
	heroDescription: 'Building Kata, a martial arts training platform.',
	aboutNarrative: [
		"I'm Malik, a third-year Computer Science student at Western University. I'm most interested in cybersecurity, machine learning, and embedded systems.",
		"I handle software and electronics for the micro-class team at Western Aero Design. Outside of class, I'm building Kata, a platform that helps people train martial arts on their own.",
		'Away from the keyboard, I play badminton, train Taekwondo, and go rock climbing. When I want to switch off, it’s video games or a good TV show.'
	],
	setup: {
		items: [
			{ label: 'IDE', value: 'Neovim' },
			{ label: 'Operating System', value: 'NixOS (Hyprland)' },
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
		] as LinkInfo[],
		contactEmail: 'malikalghneimin [@] gmail.com'
	},
	misc: {
		upTo: [
			'Building Kata :robot:',
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
			'Developed navigation and decision-making algorithms for an autonomous vehicle.'
	},
	{
		title: 'Market Research Intern',
		organization: 'Clirio Inc.',
		period: 'Jun. 2025 - Aug. 2025',
		category: 'Work',
		description:
			'Researched new markets and identified opportunities for Clirio to expand into them.'
	},
	{
		title: 'Camp Counselor - FoY',
		organization: 'Hamilton-Wentworth District School Board',
		period: 'Jun. 2024 - Aug. 2024',
		category: 'Work',
		description:
			'Supervised and supported campers through daily summer camp activities.'
	},
	{
		title: 'Robotics Team Lead',
		organization: 'VEX Robotics',
		period: 'Oct. 2023 - Dec. 2023',
		category: 'Extracurricular',
		description:
			'Led a five-person high school team to build a robot for a local VEX Robotics competition.'
	}
];
