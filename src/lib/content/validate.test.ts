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
});
