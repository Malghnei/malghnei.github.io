import { describe, it, expect } from 'vitest';
import { encodeTarget, parseTarget } from './target';

describe('encodeTarget', () => {
	it('encodes each kind', () => {
		expect(encodeTarget({ kind: 'project', slug: 'kata' })).toBe('project:kata');
		expect(encodeTarget({ kind: 'tech', name: 'Node.js' })).toBe('tech:Node.js');
		expect(encodeTarget({ kind: 'link', href: 'https://x.y', label: 'x' })).toBe('link:https://x.y');
	});
});

describe('parseTarget', () => {
	it('round-trips a project', () => {
		const t = { kind: 'project', slug: 'kata' } as const;
		expect(parseTarget(encodeTarget(t), '')).toEqual(t);
	});

	it('round-trips a tech', () => {
		const t = { kind: 'tech', name: 'React Native' } as const;
		expect(parseTarget(encodeTarget(t), '')).toEqual(t);
	});

	it('round-trips a link with its label', () => {
		const t = { kind: 'link', href: 'https://github.com/Malghnei', label: 'github' } as const;
		expect(parseTarget(encodeTarget(t), 'github')).toEqual(t);
	});

	it('keeps the full href when it contains colons', () => {
		expect(parseTarget('link:https://x.y/z?a=b:c', 'z')).toEqual({
			kind: 'link',
			href: 'https://x.y/z?a=b:c',
			label: 'z'
		});
	});

	it('returns null for malformed values', () => {
		expect(parseTarget('project:', '')).toBeNull();
		expect(parseTarget('foo:bar', '')).toBeNull();
		expect(parseTarget('', '')).toBeNull();
		expect(parseTarget(null, '')).toBeNull();
	});
});
