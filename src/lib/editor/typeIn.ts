import type { Action } from 'svelte/action';

// Clears the element's prerendered text and types it back in.
// Put it on an aria-hidden copy; screen readers get the text from an sr-only twin.
export const typeIn: Action<HTMLElement, { speed?: number } | undefined> = (node, options) => {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const full = node.textContent ?? '';
	const speed = options?.speed ?? 40;
	let typed = 0;
	node.textContent = '';

	const timer = setInterval(() => {
		typed += 1;
		node.textContent = full.slice(0, typed);
		if (typed >= full.length) clearInterval(timer);
	}, speed);

	return {
		destroy() {
			clearInterval(timer);
		}
	};
};
