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

const dict2 = buildDictionary([project('n', 'N', ['Node', 'Node.js'])]);

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

	it('falls back to a shorter whole-word match when the longer one is rejected', () => {
		expect(tokenize('React Nativex', dict)).toEqual([
			{ type: 'tech', value: 'React' },
			{ type: 'text', value: ' Nativex' }
		]);
		expect(tokenize('Node.jsx', dict2)).toEqual([
			{ type: 'tech', value: 'Node' },
			{ type: 'text', value: '.jsx' }
		]);
	});

	it('is case sensitive', () => {
		expect(tokenize('java', dict)).toEqual([{ type: 'text', value: 'java' }]);
	});

	it('does not match a name followed by a word character', () => {
		expect(tokenize('Javas', dict)).toEqual([{ type: 'text', value: 'Javas' }]);
	});

	it('excludes a project title but still matches others', () => {
		expect(tokenize('Site and Kata', dict, { exclude: ['Site'] })).toEqual([
			{ type: 'text', value: 'Site and ' },
			{ type: 'project', value: 'Kata', slug: 'kata' }
		]);
	});
});
