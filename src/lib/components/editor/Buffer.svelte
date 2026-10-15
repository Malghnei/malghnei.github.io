<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { onMount, tick, type Snippet } from 'svelte';
	import { LINE_SELECTOR } from '$lib/editor/lines';
	import { editor } from '$lib/editor/state.svelte';
	import { encodeTarget, parseTarget } from '$lib/preview/target';

	let { children }: { children: Snippet } = $props();

	let scroller: HTMLElement;
	let content: HTMLElement;
	let lines: HTMLElement[] = [];
	let scrollFrame = 0;
	// While j/k/gg/G scroll smoothly, the cursor is already where it should be; don't let onscroll drag it.
	let programmaticScroll = false;
	let programmaticTimer: ReturnType<typeof setTimeout> | undefined;
	// Where the mouse rests inside the content, so wheel scrolling can keep the cursor under it.
	let lastPointer: { x: number; y: number } | null = null;
	let activeEl: HTMLElement | null = null;

	const scrollBehavior = (): ScrollBehavior =>
		matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

	const markActive = () => {
		const encoded = editor.preview ? encodeTarget(editor.preview) : null;
		const next = encoded
			? (Array.from(content.querySelectorAll<HTMLElement>('[data-preview]')).find(
					// Hidden elements (e.g. banner variants) must not take the marker.
					(el) => el.dataset.preview === encoded && el.offsetParent !== null
				) ?? null)
			: null;
		if (next === activeEl) return;
		activeEl?.removeAttribute('data-active');
		next?.setAttribute('data-active', '');
		activeEl = next;
	};

	// The visible text minus decoration such as ExtLink's aria-hidden `[` `](↗)`.
	const labelOf = (el: HTMLElement) => {
		const copy = el.cloneNode(true) as HTMLElement;
		copy.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
		return copy.textContent?.trim() ?? '';
	};

	const setPreview = (el: Element | null | undefined) => {
		if (!(el instanceof HTMLElement)) return;
		// Checked first so a pointermove over the current target costs no parsing or cloning.
		if (editor.preview && el.dataset.preview === encodeTarget(editor.preview)) return;
		const next = parseTarget(el.dataset.preview ?? null, labelOf(el));
		if (!next) return;
		editor.preview = next;
		markActive();
	};

	const clearPreview = () => {
		editor.preview = null;
		activeEl?.removeAttribute('data-active');
		activeEl = null;
	};

	// Chromium leaves counter() in later lines' ::after stale when earlier counted lines are removed;
	// toggling the scope's counter-reset makes it recount, keeping the gutter numbers CSS-driven.
	const recountGutter = () => {
		content.style.counterReset = 'none';
		void content.offsetWidth;
		content.style.counterReset = '';
	};

	const collectLines = () => {
		// offsetParent is null for display:none lines, which have no row on screen.
		lines = Array.from(content.querySelectorAll<HTMLElement>(LINE_SELECTOR)).filter(
			(line) => line.offsetParent !== null
		);
		lines.forEach((line, index) => line.style.setProperty('--line-index', String(index)));
		recountGutter();
		// Filtering may have re-rendered the active element.
		markActive();
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

	// A card row gives its project (own or ancestor target); otherwise the first ref on the line.
	const previewFromCursor = () => {
		const line = lines[editor.cursorLine - 1];
		if (line) setPreview(line.closest('[data-preview]') ?? line.querySelector('[data-preview]'));
	};

	export const moveCursor = (delta: number) => {
		holdCursorDuringScroll();
		setCursor(editor.cursorLine - 1 + delta);
		previewFromCursor();
		lines[editor.cursorLine - 1]?.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
	};

	export const scrollToEdge = (edge: 'top' | 'bottom') => {
		holdCursorDuringScroll();
		scroller.scrollTo({ top: edge === 'top' ? 0 : scroller.scrollHeight, behavior: scrollBehavior() });
		setCursor(edge === 'top' ? 0 : lines.length - 1);
		previewFromCursor();
	};

	export const pageDown = () => {
		scroller.scrollBy({ top: scroller.clientHeight * 0.9, behavior: scrollBehavior() });
	};

	export const pageUp = () => {
		scroller.scrollBy({ top: -scroller.clientHeight * 0.9, behavior: scrollBehavior() });
	};

	// By geometry rather than closest(): a card's stretched title link covers its other rows,
	// and the gutter numbers are pointer-events: none, so the element under the pointer can't say.
	const lineAt = (y: number) => {
		for (let index = 0; index < lines.length; index++) {
			const rect = lines[index].getBoundingClientRect();
			if (rect.top > y) break;
			if (y < rect.bottom) return index;
		}
		return -1;
	};

	const onclick = (event: MouseEvent) => {
		const index = lineAt(event.clientY);
		if (index >= 0) setCursor(index);
	};

	// Like nvim with mouse=a: the cursor follows the mouse, but hovering never scrolls.
	const pointAt = (target: Element | null, y: number): boolean => {
		if (!target || !content.contains(target)) return false;
		const index = lineAt(y);
		// Checked against the DOM: filtering can remove the cursor's line and leave cursorLine stale.
		if (index >= 0 && !lines[index].classList.contains('cursorline')) setCursor(index);
		setPreview(target.closest('[data-preview]'));
		return index >= 0;
	};

	const onpointermove = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return;
		lastPointer = { x: event.clientX, y: event.clientY };
		pointAt(event.target as Element, event.clientY);
	};

	const onpointerleave = () => {
		lastPointer = null;
	};

	const onfocusin = (event: FocusEvent) => {
		setPreview((event.target as Element).closest?.('[data-preview]'));
	};

	// Like nvim: scrolling only drags the cursor once its line leaves the view.
	const onscroll = () => {
		if (programmaticScroll) return;
		cancelAnimationFrame(scrollFrame);
		scrollFrame = requestAnimationFrame(() => {
			// With the mouse resting on a line, wheel scrolling keeps the cursor under it.
			if (lastPointer && pointAt(document.elementFromPoint(lastPointer.x, lastPointer.y), lastPointer.y)) return;
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
		clearPreview();
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
	{onfocusin}
	tabindex="0"
	role="region"
	aria-label="page content"
>
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="buffer-content"
		bind:this={content}
		{onclick}
		{onpointermove}
		{onpointerleave}
	>
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
