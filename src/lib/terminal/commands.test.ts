import { describe, expect, it } from 'vitest';
import type { ProjectEntry } from '$lib/types';
import { executeTerminalCommand } from './commands';

const projects: ProjectEntry[] = [
	{ slug: 'condimental', title: 'Condimental', summary: '', period: 'Apr. 2026', techStack: ['React'], role: 'solo', domain: 'software' },
	{ slug: 'staying-alive', title: 'Staying Alive', summary: '', period: 'Apr. 2026', techStack: ['Java'], role: 'contribution', domain: 'software' }
];
const run = (input: string) => executeTerminalCommand(input, projects);

describe('cd', () => {
	it.each([
		['cd home', '/'],
		['cd about', '/about/'],
		['cd projects', '/projects/'],
		['cd experience', '/about/'],
		['cd contact', '/'],
		['cd /', '/'],
		['cd ..', '/'],
		['cd ~', '/'],
		['cd about/', '/about/'],
		['cd ~/about', '/about/'],
		['cd /about', '/about/'],
		['cd ABOUT', '/about/']
	])('%s navigates to %s', async (input, path) => {
		expect(await run(input)).toEqual({ navigate: path });
	});

	it('rejects unknown directories, including object prototype keys', async () => {
		expect(await run('cd nope')).toEqual({ error: 'cd: no such directory: nope' });
		expect(await run('cd constructor')).toEqual({ error: 'cd: no such directory: constructor' });
	});

	it('requires an argument', async () => {
		expect(await run('cd')).toEqual({ error: 'cd: missing directory argument' });
	});
});

describe('open', () => {
	it.each(['open condimental', 'open condimental.md', 'open Condimental'])('%s opens the project', async (input) => {
		expect(await run(input)).toEqual({ navigate: '/projects/condimental/' });
	});

	it('reports unknown projects', async () => {
		expect(await run('open nope')).toEqual({ error: 'open: nope: No such project' });
	});

	it('requires an argument', async () => {
		expect(await run('open')).toEqual({ error: 'open: missing project name' });
	});
});

describe('other commands', () => {
	it('exit closes the terminal', async () => {
		expect(await run('exit')).toEqual({ close: true });
	});

	it('ls lists directories and projects with role and domain', async () => {
		const { output } = await run('ls');
		expect(output).toContain('home  about  projects  experience  contact');
		expect(output).toMatch(/^condimental\.md\s+solo · software$/m);
		expect(output).toMatch(/^staying-alive\.md\s+contribution · software$/m);
	});

	it('help lists the new commands', async () => {
		const { output } = await run('help');
		expect(output).toContain('open <project>');
		expect(output).toContain('exit');
	});

	it('clear still clears', async () => {
		expect(await run('clear')).toEqual({ clear: true });
	});

	it('cat still prints files', async () => {
		expect((await run('cat about.md')).output).toMatch(/^# about\.md/);
		expect((await run('cat condimental.md')).output).toContain("title: 'Condimental'");
	});

	it('unknown commands still error', async () => {
		expect(await run('foo')).toEqual({ error: 'foo: command not found (type "help")' });
	});
});
