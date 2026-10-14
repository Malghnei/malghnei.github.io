import { getProjectRawBySlug } from '$lib/content/projects';
import { experienceTimeline, siteContent } from '$lib/data/site';
import { fileForPath } from '$lib/editor/files';
import type { ProjectEntry } from '$lib/types';

export type TerminalExecutionResult = {
	output?: string;
	error?: string;
	clear?: boolean;
	/** Path the page behind the terminal window should navigate to. */
	navigate?: string;
	/** Close the terminal window. */
	close?: boolean;
};

// Directories map to the page where that content now lives.
const CD_TARGETS = new Map<string, string>([
	['home', '/'],
	['about', '/about/'],
	['projects', '/projects/'],
	['experience', '/about/'],
	['contact', '/']
]);

const helpText = [
	'Available commands:',
	'  help                Show available commands',
	'  ls                  List directories and project files',
	'  cd <directory>      Go to home, about, projects, experience, or contact',
	'  open <project>      Open a project page',
	'  cat <filename>      Print file content',
	'  clear               Clear terminal output',
	'  exit                Close the terminal'
].join('\n');

const aboutFile = () =>
	[`# about.md`, '', ...siteContent.aboutNarrative].join('\n');

const experienceFile = () =>
	[
		'# experience.md',
		'',
		...experienceTimeline.map(
			(entry) =>
				`- ${entry.period} | ${entry.title} @ ${entry.organization} (${entry.category})\n  ${entry.description}`
		)
	].join('\n');

const contactFile = () =>
	[
		'# contact.md',
		`email: ${siteContent.links.contactEmail}`,
		...siteContent.links.items.map((link) => `${link.label.toLowerCase()}: ${link.href}`)
	].join('\n');

// Navigation always prints where it went: a full-screen terminal hides the page behind it.
const navigateTo = (path: string): TerminalExecutionResult => ({
	navigate: path,
	output: `→ ${fileForPath(path)}`
});

const isProjectFilename = (value: string) => value.endsWith('.md') && value.length > 3;

// "~/about/", "/about", "ABOUT" -> "about"; "~", "/", ".." -> "" (home)
const normalizeDirectory = (target: string) => {
	const name = target.toLowerCase().replace(/^~?\/?/, '').replace(/\/+$/, '');
	return name === '..' ? '' : name;
};

export const executeTerminalCommand = async (
	input: string,
	projects: ProjectEntry[]
): Promise<TerminalExecutionResult> => {
	const trimmed = input.trim();

	if (!trimmed) {
		return {};
	}

	const [command, ...args] = trimmed.split(/\s+/);

	switch (command) {
		case 'help':
			return { output: helpText };

		case 'clear':
			return { clear: true };

		case 'exit':
			return { close: true };

		case 'ls': {
			const width = Math.max(0, ...projects.map((project) => project.slug.length + 3));
			return {
				output: [
					[...CD_TARGETS.keys()].join('  '),
					'',
					'project files:',
					...projects.map(
						(project) =>
							`${`${project.slug}.md`.padEnd(width)}  ${project.role} · ${project.domain}`
					)
				].join('\n')
			};
		}

		case 'cd': {
			const target = args[0];
			if (!target) {
				return { error: 'cd: missing directory argument' };
			}
			const name = normalizeDirectory(target);
			const path = name === '' ? '/' : CD_TARGETS.get(name);
			if (!path) {
				return { error: `cd: no such directory: ${target}` };
			}
			return navigateTo(path);
		}

		case 'open': {
			const target = args[0];
			if (!target) {
				return { error: 'open: missing project name' };
			}
			const slug = target.toLowerCase().replace(/\.md$/, '');
			const project = projects.find((entry) => entry.slug === slug);
			if (!project) {
				return { error: `open: ${target}: No such project` };
			}
			return navigateTo(`/projects/${project.slug}/`);
		}

		case 'cat': {
			const target = args[0];
			if (!target) {
				return { error: 'cat: missing filename argument' };
			}

			if (target === 'about.md') {
				return { output: aboutFile() };
			}

			if (target === 'experience.md') {
				return { output: experienceFile() };
			}

			if (target === 'contact.md') {
				return { output: contactFile() };
			}

			if (!isProjectFilename(target)) {
				return { error: `cat: unsupported file: ${target}` };
			}

			const projectSlug = target.replace('.md', '');
			const rawProject = await getProjectRawBySlug(projectSlug);

			if (!rawProject) {
				return { error: `cat: ${target}: No such file` };
			}

			return { output: rawProject };
		}

		default:
			return { error: `${command}: command not found (type "help")` };
	}
};
