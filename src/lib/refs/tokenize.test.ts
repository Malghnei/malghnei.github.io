import { describe, it, expect } from 'vitest';
import { buildDictionary, tokenize } from './tokenize';
import type { ProjectFrontmatter } from '$lib/types';

const project = (slug: string, title: string, techStack: string[]): ProjectFrontmatter => ({
	slug,
	title,
	summary: '',
	period: '2025',
	techStack,
	role: 'solo',
	domain: 'software'
});

const dict = buildDictionary([
	project('kata', 'Kata', ['Java', 'React', 'React Native']),
	project('site', 'Site', ['Node.js'])
]);

describe('buildDictionary', () => {
	it('maps titles to slugs and collects tech', () => {
		expect(dict.projects.get('Kata')).toBe('kata');
		expect([...dict.tech].sort()).toEqual(['Java', 'Node.js', 'React', 'React Native']);
	});
});

describe('tokenize', () => {
	it('matches a tech name', () => {
		expect(tokenize('I use Java', dict)).toEqual([
			{ type: 'text', value: 'I use ' },
			{ type: 'tech', value: 'Java' }
		]);
	});

	it('does not match inside a longer word', () => {
		expect(tokenize('JavaScript', dict)).toEqual([{ type: 'text', value: 'JavaScript' }]);
		expect(tokenize('Katana', dict)).toEqual([{ type: 'text', value: 'Katana' }]);
	});

	it('matches Node.js and prefers React Native over React', () => {
		expect(tokenize('Node.js, React Native and React', dict)).toEqual([
			{ type: 'tech', value: 'Node.js' },
			{ type: 'text', value: ', ' },
			{ type: 'tech', value: 'React Native' },
			{ type: 'text', value: ' and ' },
			{ type: 'tech', value: 'React' }
		]);
	});

	it('leaves excluded names as text', () => {
		expect(tokenize('Kata is Kata', dict, { exclude: ['Kata'] })).toEqual([
			{ type: 'text', value: 'Kata is Kata' }
		]);
	});

	it('matches a project and returns its slug', () => {
		expect(tokenize('Kata', dict)).toEqual([{ type: 'project', value: 'Kata', slug: 'kata' }]);
	});

	it('matches at the start and the end', () => {
		expect(tokenize('Java and React', dict)).toEqual([
			{ type: 'tech', value: 'Java' },
			{ type: 'text', value: ' and ' },
			{ type: 'tech', value: 'React' }
		]);
	});

	it('returns [] for an empty string', () => {
		expect(tokenize('', dict)).toEqual([]);
	});

	it('returns one text piece when nothing matches', () => {
		expect(tokenize('nothing here', dict)).toEqual([{ type: 'text', value: 'nothing here' }]);
	});

	it('handles adjacent matches separated by a comma', () => {
		expect(tokenize('Java,React', dict)).toEqual([
			{ type: 'tech', value: 'Java' },
			{ type: 'text', value: ',' },
			{ type: 'tech', value: 'React' }
		]);
	});
});
