<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { onMount, tick, type Snippet } from 'svelte';
	import { LINE_SELECTOR } from '$lib/editor/lines';
	import { editor } from '$lib/editor/state.svelte';

	let { children }: { children: Snippet } = $props();

	let scroller: HTMLElement;
	let content: HTMLElement;
	let lines: HTMLElement[] = [];
	let scrollFrame = 0;
	// While j/k/gg/G scroll smoothly, the cursor is already where it should be; don't let onscroll drag it.
	let programmaticScroll = false;
	let programmaticTimer: ReturnType<typeof setTimeout> | undefined;

	const scrollBehavior = (): ScrollBehavior =>
		matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

	// Chromium leaves counter() in later lines' ::after stale when earlier counted lines are removed;
	// toggling the scope's counter-reset makes it recount, keeping the gutter numbers CSS-driven.
	const recountGutter = () => {
		content.style.counterReset = 'none';
		void content.offsetWidth;
		content.style.counterReset = '';
	};

	const collectLines = () => {
		lines = Array.from(content.querySelectorAll<HTMLElement>(LINE_SELECTOR));
		lines.forEach((line, index) => line.style.setProperty('--line-index', String(index)));
		recountGutter();
	};

	const setCursor = (index: number) => {
		if (!lines.length) return;
		const next = Math.min(Math.max(index, 0), lines.length - 1);
		content.querySelector('.cursorline')?.classList.remove('cursorline');
		lines[next].classList.add('cursorline');
		editor.cursorLine = next + 1;
	};

	const replayReveal = () => {
		content.classList.remove('reveal');
		void content.offsetWidth; // force reflow so the animation restarts
		content.classList.add('reveal');
	};

	const holdCursorDuringScroll = () => {
		programmaticScroll = true;
		clearTimeout(programmaticTimer);
		// scrollend ends it early; the timeout covers scrolls that never start or browsers without scrollend.
		programmaticTimer = setTimeout(() => (programmaticScroll = false), 600);
	};

	const onscrollend = () => {
		programmaticScroll = false;
		clearTimeout(programmaticTimer);
	};

	export const moveCursor = (delta: number) => {
		holdCursorDuringScroll();
		setCursor(editor.cursorLine - 1 + delta);
		lines[editor.cursorLine - 1]?.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
	};

	export const scrollToEdge = (edge: 'top' | 'bottom') => {
		holdCursorDuringScroll();
		scroller.scrollTo({ top: edge === 'top' ? 0 : scroller.scrollHeight, behavior: scrollBehavior() });
		setCursor(edge === 'top' ? 0 : lines.length - 1);
	};

	export const pageDown = () => {
		scroller.scrollBy({ top: scroller.clientHeight * 0.9, behavior: scrollBehavior() });
	};

	export const pageUp = () => {
		scroller.scrollBy({ top: -scroller.clientHeight * 0.9, behavior: scrollBehavior() });
	};

	const onclick = (event: MouseEvent) => {
		const target = (event.target as Element).closest?.(LINE_SELECTOR);
		const index = target ? lines.indexOf(target as HTMLElement) : -1;
		if (index >= 0) setCursor(index);
	};

	// Like nvim: scrolling only drags the cursor once its line leaves the view.
	const onscroll = () => {
		if (programmaticScroll) return;
		cancelAnimationFrame(scrollFrame);
		scrollFrame = requestAnimationFrame(() => {
			const view = scroller.getBoundingClientRect();
			const current = lines[editor.cursorLine - 1]?.getBoundingClientRect();
			if (current && current.bottom > view.top && current.top < view.bottom) return;
			const middle = view.top + view.height / 2;
			let best = 0;
			let bestDistance = Infinity;
			lines.forEach((line, index) => {
				const rect = line.getBoundingClientRect();
				const distance = Math.abs(rect.top + rect.height / 2 - middle);
				if (distance < bestDistance) {
					best = index;
					bestDistance = distance;
				}
			});
			setCursor(best);
		});
	};

	onMount(() => {
		// Filtering on /projects adds and removes lines without navigating.
		const observer = new MutationObserver(() => requestAnimationFrame(collectLines));
		observer.observe(content, { childList: true, subtree: true });
		return () => observer.disconnect();
	});

	afterNavigate(async () => {
		await tick();
		requestAnimationFrame(() => {
			collectLines();
			scroller.scrollTop = 0;
			setCursor(0);
			replayReveal();
		});
	});
</script>

<!-- tabindex: lets keyboard users focus the scroll area so arrows/PageDown work natively -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="buffer"
	bind:this={scroller}
	{onscroll}
	{onscrollend}
	tabindex="0"
	role="region"
	aria-label="page content"
>
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="buffer-content" bind:this={content} {onclick}>
		{@render children()}
	</div>
	<div class="buffer-tildes" aria-hidden="true">
		{#each { length: 80 } as _}
			<span>~</span>
		{/each}
	</div>
</div>

<style>
	.buffer {
		flex: 1;
		outline-offset: -1px;
		min-height: 0;
		overflow-x: hidden;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.buffer-tildes {
		flex: 1 1 0;
		min-height: 0;
		overflow: hidden;
		color: var(--nord-3);
	}

	.buffer-tildes span {
		display: block;
		padding-left: 1ch;
	}
</style>
