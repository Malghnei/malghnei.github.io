import { describe, expect, it } from 'vitest';
import { validateProjectMetadata } from './validate';

const base = { title: 'X', summary: 'S', period: 'Apr. 2026', techStack: ['Java'] };

describe('validateProjectMetadata', () => {
	it('returns the metadata when role and domain are valid', () => {
		const metadata = { ...base, role: 'contribution', domain: 'hardware' };
		expect(validateProjectMetadata('x', metadata)).toEqual(metadata);
	});

	it('names the file when role is missing', () => {
		expect(() => validateProjectMetadata('condimental', { ...base, domain: 'software' })).toThrow(
			'condimental.md: missing role'
		);
	});

	it('rejects a role with the wrong case', () => {
		expect(() =>
			validateProjectMetadata('condimental', { ...base, role: 'Solo', domain: 'software' })
		).toThrow('condimental.md: invalid role "Solo"');
	});

	it('names the file when domain is missing', () => {
		expect(() => validateProjectMetadata('qiyami', { ...base, role: 'solo' })).toThrow(
			'qiyami.md: missing domain'
		);
	});

	it('rejects an unknown domain', () => {
		expect(() =>
			validateProjectMetadata('qiyami', { ...base, role: 'solo', domain: 'firmware' })
		).toThrow('qiyami.md: invalid domain "firmware"');
	});

	it('rejects a techStack tag with no category', () => {
		expect(() =>
			validateProjectMetadata('kata', { ...base, techStack: ['COBOL'], role: 'solo', domain: 'software' })
		).toThrow('kata.md: unknown tag "COBOL" (add it to src/lib/tags/categories.ts)');
	});

	it('rejects a preview that is not a root-relative path', () => {
		expect(() =>
			validateProjectMetadata('kata', { ...base, preview: 'kata.png', role: 'solo', domain: 'software' })
		).toThrow('kata.md: invalid preview "kata.png"');
	});

	it('accepts a root-relative preview', () => {
		const metadata = { ...base, preview: '/previews/kata.png', role: 'solo', domain: 'software' };
		expect(validateProjectMetadata('kata', metadata)).toEqual(metadata);
	});
});
