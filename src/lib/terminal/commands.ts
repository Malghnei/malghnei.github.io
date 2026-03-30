import { getProjectRawBySlug } from '$lib/content/projects';
import { experienceTimeline, siteContent } from '$lib/data/site';
import type { ProjectEntry } from '$lib/types';

export type TerminalState = {
	cwd: '/';
};

export type TerminalExecutionResult = {
	output?: string;
	error?: string;
	clear?: boolean;
	nextCwd?: '/';
};

const ROOT_DIRECTORIES = ['about', 'projects', 'experience', 'contact'] as const;

const helpText = [
	'Available commands:',
	'  help                Show available commands',
	'  ls                  List directories/files in current context',
	'  cd <directory>      Change directory context',
	'  cat <filename>      Print file content',
	'  clear               Clear terminal output'
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
		`email: ${siteContent.misc.contactEmail}`,
		...siteContent.misc.quickLinks.map((link) => `${link.label.toLowerCase()}: ${link.href}`)
	].join('\n');

const isProjectFilename = (value: string) => value.endsWith('.md') && value.length > 3;

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

		case 'ls':
			return {
				output: [
					ROOT_DIRECTORIES.join('  '),
					'',
					'project files:',
					...projects.map((project) => `${project.slug}.md`)
				].join('\n')
			};

		case 'cd': {
			const target = args[0];
			if (!target) {
				return { error: 'cd: missing directory argument' };
			}
			if (target === '/') {
				return { nextCwd: '/' };
			}
			if (target === '..') {
				return { nextCwd: '/' };
			}
			if (!ROOT_DIRECTORIES.includes(target as (typeof ROOT_DIRECTORIES)[number])) {
				return { error: `cd: no such directory: ${target}` };
			}

			return {
				output: `context switched to /${target}`
			};
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
