<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { onMount, tick, type Snippet } from 'svelte';
	import { copyText } from '$lib/editor/clipboard';
	import { LINE_SELECTOR } from '$lib/editor/lines';
	import {
		clampPos,
		move,
		selectedText,
		selection,
		yankMessage,
		type Motion,
		type Pos,
		type VisualMode
	} from '$lib/editor/motions';
	import { clearPaint, flashYank, paintCursor, paintSelection, supported as paintSupported } from '$lib/editor/paint';
	import { editor } from '$lib/editor/state.svelte';
	import { colAtPoint, mapLine, rangeAt, type LineMap } from '$lib/editor/textmap';
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
	// Each line's on-screen text and where it lives in the DOM; rebuilt with lines.
	let maps: LineMap[] = [];
	// The column j/k aim for across short lines (nvim's curswant); Infinity after $.
	let want = 0;
	let cellLine: HTMLElement | null = null;
	let visualRows: HTMLElement[] = [];

	const texts = () => maps.map((map) => map.folded.text);
	const pos = (): Pos => ({ line: editor.cursorLine - 1, col: editor.cursorCol - 1 });

	const scrollBehavior = (): ScrollBehavior =>
		matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

	const mark = (el: HTMLElement | null) => {
		if (el === activeEl) return;
		activeEl?.removeAttribute('data-active');
		el?.setAttribute('data-active', '');
		activeEl = el;
	};

	// The marker stays on the element that set the target (it shows which item the preview
	// describes); only if a re-render dropped or hid it does the first visible match take over.
	const markActive = () => {
		const encoded = editor.preview ? encodeTarget(editor.preview) : null;
		if (!encoded) return mark(null);
		const visible = (el: HTMLElement) => el.isConnected && el.offsetParent !== null;
		if (activeEl && visible(activeEl) && activeEl.dataset.preview === encoded) return;
		mark(
			Array.from(content.querySelectorAll<HTMLElement>('[data-preview]')).find(
				// Hidden elements (e.g. banner variants) must not take the marker.
				(el) => el.dataset.preview === encoded && visible(el)
			) ?? null
		);
	};

	// The visible text minus decoration such as ExtLink's aria-hidden `[` `](↗)`.
	const labelOf = (el: HTMLElement) => {
		const copy = el.cloneNode(true) as HTMLElement;
		copy.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
		return copy.textContent?.trim() ?? '';
	};

	const setPreview = (el: Element | null | undefined) => {
		if (!(el instanceof HTMLElement)) return;
		// Same target from another element (a card and a ref to it): only the marker moves.
		// Checked first so a pointermove over the current target costs no parsing or cloning.
		if (editor.preview && el.dataset.preview === encodeTarget(editor.preview)) return mark(el);
		const next = parseTarget(el.dataset.preview ?? null, labelOf(el));
		if (!next) return;
		editor.preview = next;
		mark(el);
	};

	const clearPreview = () => {
		editor.preview = null;
		mark(null);
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
		maps = lines.map(mapLine);
		lines.forEach((line, index) => line.style.setProperty('--line-index', String(index)));
		recountGutter();
		// Filtering may have re-rendered the active element.
		markActive();
		// Text changed under the cursor (filtering, the banner typing in): keep the place, clamped.
		if (editor.visual) editor.visual = { ...editor.visual, anchor: clampPos(texts(), editor.visual.anchor) };
		setPos(pos());
		// The old highlight ranges may point at replaced text nodes.
		repaint();
	};

	// Every cursor move goes through here; the position is clamped to the text.
	const setPos = (next: Pos) => {
		if (!lines.length) return;
		const at = clampPos(texts(), next);
		const row = lines[at.line];
		if (!row.classList.contains('cursorline')) {
			content.querySelector('.cursorline')?.classList.remove('cursorline');
			row.classList.add('cursorline');
		}
		editor.cursorLine = at.line + 1;
		editor.cursorCol = at.col + 1;
	};

	// Rows set by the mouse and by scrolling aim for the remembered column, as j/k do.
	const setCursor = (index: number) => setPos({ line: index, col: want });

	const selectionRanges = (start: Pos, end: Pos): Range[] => {
		const ranges: Range[] = [];
		for (let line = start.line; line <= end.line; line++) {
			const length = maps[line].folded.text.length;
			const from = line === start.line ? start.col : 0;
			const to = line === end.line ? Math.min(end.col + 1, length) : length;
			const range = rangeAt(maps[line], from, to);
			if (range) ranges.push(range);
		}
		return ranges;
	};

	const repaint = () => {
		visualRows.forEach((row) => row.classList.remove('visual-line'));
		visualRows = [];
		const head = pos();
		const map = maps[head.line];
		// A line with no text can't hold a highlight; CSS draws its cursor cell instead.
		const cell = paintSupported && map?.folded.text === '' ? lines[head.line] : null;
		if (cell !== cellLine) {
			cellLine?.classList.remove('cursor-cell');
			cell?.classList.add('cursor-cell');
			cellLine = cell;
		}
		if (!paintSupported || !map) return clearPaint();
		paintCursor(rangeAt(map, head.col, head.col + 1));
		const visual = editor.visual;
		if (!visual) return paintSelection([]);
		const { start, end } = selection(visual.anchor, head, visual.mode, texts());
		if (visual.mode === 'line') {
			visualRows = lines.slice(start.line, end.line + 1);
			visualRows.forEach((row) => row.classList.add('visual-line'));
		}
		paintSelection(selectionRanges(start, end));
	};

	$effect(() => {
		// Read everything repaint depends on up front, so runs that return early still subscribe.
		void [editor.cursorLine, editor.cursorCol, editor.visual?.mode, editor.visual?.anchor.line, editor.visual?.anchor.col];
		repaint();
	});

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

	export const motion = (name: Motion, count: number | null) => {
		if (!lines.length) return;
		holdCursorDuringScroll();
		const row = editor.cursorLine;
		const result = move(texts(), pos(), name, count, want);
		want = result.want;
		setPos(result.pos);
		if (editor.cursorLine !== row) previewFromCursor();
		// Bare gg/G scroll all the way, so whatever sits above the first line or below the last shows too.
		if ((name === 'gg' || name === 'G') && count === null) {
			scroller.scrollTo({ top: name === 'gg' ? 0 : scroller.scrollHeight, behavior: scrollBehavior() });
		} else {
			lines[editor.cursorLine - 1]?.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
		}
	};

	// Like nvim: v in charwise visual leaves it, V there switches to linewise and keeps the anchor.
	export const startVisual = (mode: VisualMode) => {
		if (!lines.length) return;
		if (editor.visual?.mode === mode) editor.visual = null;
		else editor.visual = { mode, anchor: editor.visual?.anchor ?? pos() };
	};

	export const exitVisual = () => {
		editor.visual = null;
	};

	export const yank = async () => {
		const visual = editor.visual;
		if (!visual || !lines.length) return;
		const all = texts();
		const sel = selection(visual.anchor, pos(), visual.mode, all);
		const text = selectedText(all, sel, visual.mode);
		const ranges = selectionRanges(sel.start, sel.end);
		editor.visual = null;
		want = sel.start.col;
		setPos(sel.start);
		if (await copyText(text)) {
			flashYank(ranges);
			editor.message = yankMessage(sel, visual.mode, text);
		} else {
			editor.message = 'yank failed';
		}
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

	// The character under the pointer; off the text, the row keeps the remembered column.
	const posAt = (x: number, y: number): Pos | null => {
		const line = lineAt(y);
		if (line < 0) return null;
		return { line, col: colAtPoint(maps[line], x, y) ?? want };
	};

	// Movement under this many px is still a click.
	const DRAG_THRESHOLD_PX = 4;
	let drag: { x: number; y: number; anchor: Pos; active: boolean } | null = null;
	// The click that ends a drag must not follow a link the drag started on.
	let suppressClick = false;

	// Capture phase, so a drag that ended on a link is stopped before the link or the router sees it.
	const onclickcapture = (event: MouseEvent) => {
		if (!suppressClick) return;
		suppressClick = false;
		event.preventDefault();
		event.stopPropagation();
	};

	const onclick = (event: MouseEvent) => {
		// Links, buttons and form controls keep their own click.
		if ((event.target as Element).closest('a, button, input, select, textarea, label')) return;
		const at = posAt(event.clientX, event.clientY);
		if (!at) return;
		editor.visual = null;
		want = at.col;
		setPos(at);
	};

	const onpointerdown = (event: PointerEvent) => {
		suppressClick = false;
		if (event.pointerType !== 'mouse' || event.button !== 0) return;
		const at = posAt(event.clientX, event.clientY);
		drag = at && { x: event.clientX, y: event.clientY, anchor: at, active: false };
	};

	const endDrag = () => {
		if (drag?.active) {
			content.classList.remove('dragging');
			suppressClick = true;
		}
		drag = null;
	};

	// Links are draggable natively, which would swallow the pointer moves of a selection drag.
	const ondragstart = (event: DragEvent) => {
		if (drag) event.preventDefault();
	};

	// Like nvim with mouse=a: the cursor follows the mouse, but hovering never scrolls.
	const pointAt = (target: Element | null, y: number): boolean => {
		if (!target || !content.contains(target)) return false;
		const index = lineAt(y);
		// Checked against the DOM: filtering can remove the cursor's line and leave cursorLine stale.
		// In visual, hover leaves the row alone so the selection doesn't follow a wandering mouse.
		if (index >= 0 && !editor.visual && !lines[index].classList.contains('cursorline')) setCursor(index);
		setPreview(target.closest('[data-preview]'));
		return index >= 0;
	};

	const onpointermove = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return;
		lastPointer = { x: event.clientX, y: event.clientY };
		if (drag && event.buttons & 1) {
			if (!drag.active) {
				if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < DRAG_THRESHOLD_PX) return;
				drag.active = true;
				content.classList.add('dragging');
				window.getSelection()?.removeAllRanges();
				editor.visual = { mode: 'char', anchor: drag.anchor };
			}
			const at = posAt(event.clientX, event.clientY);
			if (at) {
				want = at.col;
				setPos(at);
			}
			return;
		}
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
		editor.visual = null;
		want = 0;
		await tick();
		requestAnimationFrame(() => {
			collectLines();
			scroller.scrollTop = 0;
			setPos({ line: 0, col: 0 });
			replayReveal();
		});
	});
</script>

<svelte:window onpointerup={endDrag} onpointercancel={endDrag} />

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
		{onclickcapture}
		{onpointerdown}
		{onpointermove}
		{onpointerleave}
		{ondragstart}
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
