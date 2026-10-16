import { describe, expect, it } from 'vitest';
import { copyText } from './clipboard';

describe('copyText', () => {
	it('writes the text and reports success', async () => {
		let written = '';
		const ok = await copyText('hello', { writeText: async (text) => void (written = text) });
		expect(ok).toBe(true);
		expect(written).toBe('hello');
	});

	it('reports failure instead of throwing when the write is refused', async () => {
		const ok = await copyText('hello', { writeText: () => Promise.reject(new Error('denied')) });
		expect(ok).toBe(false);
	});

	it('reports failure when there is no clipboard (insecure context)', async () => {
		expect(await copyText('hello', null)).toBe(false);
	});
});
