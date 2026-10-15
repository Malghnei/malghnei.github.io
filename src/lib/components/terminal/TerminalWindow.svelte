<script lang="ts">
	import { onMount, tick, untrack } from 'svelte';
	import TerminalSession from './TerminalSession.svelte';
	import { clampRect, defaultRect, resizeRect, type Edge, type Rect, type Size } from '$lib/editor/geometry';
	import { getSessionStorage, loadRect, saveRect } from '$lib/editor/persist';
	import { closeTerminal, editor, minimizeTerminal, toggleMaximize } from '$lib/editor/state.svelte';
	import type { ProjectEntry } from '$lib/types';

	let { projects }: { projects: ProjectEntry[] } = $props();

	const EDGES: Edge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

	let layer: HTMLElement;
	let sessionView = $state<ReturnType<typeof TerminalSession> | undefined>();
	let viewport = $state<Size>({ width: 0, height: 0 });
	let rect = $state<Rect | null>(null);
	let isMobile = $state(false);
	let drag: { kind: 'move' | Edge; startX: number; startY: number; start: Rect } | null = null;

	const visible = $derived(editor.terminal.status === 'open');
	const fullscreen = $derived(isMobile || editor.terminal.maximized);

	const measure = () => {
		viewport = { width: layer.clientWidth, height: layer.clientHeight };
		if (rect) rect = clampRect(rect, viewport);
	};

	onMount(() => {
		const query = matchMedia('(max-width: 639px)');
		const syncMobile = () => (isMobile = query.matches);
		syncMobile();
		query.addEventListener('change', syncMobile);
		const observer = new ResizeObserver(measure);
		observer.observe(layer);
		return () => {
			query.removeEventListener('change', syncMobile);
			observer.disconnect();
		};
	});

	$effect(() => {
		if (!visible) return;
		untrack(() => {
			if (!rect) {
				measure();
				rect = clampRect(loadRect(getSessionStorage()) ?? defaultRect(viewport), viewport);
			}
		});
		tick().then(() => sessionView?.focus());
	});

	const startDrag = (event: PointerEvent, kind: 'move' | Edge) => {
		if (fullscreen || !rect || event.button !== 0) return;
		if (kind === 'move' && (event.target as Element).closest('button')) return;
		event.preventDefault();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		drag = { kind, startX: event.clientX, startY: event.clientY, start: rect };
	};

	const onDrag = (event: PointerEvent) => {
		if (!drag) return;
		const dx = event.clientX - drag.startX;
		const dy = event.clientY - drag.startY;
		rect =
			drag.kind === 'move'
				? clampRect({ ...drag.start, x: drag.start.x + dx, y: drag.start.y + dy }, viewport)
				: clampRect(resizeRect(drag.start, drag.kind, dx, dy, viewport), viewport);
	};

	const endDrag = () => {
		if (!drag) return;
		drag = null;
		if (rect) saveRect(getSessionStorage(), rect);
	};

	const onkeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape') return;
		event.stopPropagation(); // don't also trigger the global keymap
		closeTerminal();
	};
</script>

<div class="terminal-layer" bind:this={layer}>
	{#if visible && rect}
		<div
			class="terminal"
			class:fullscreen
			role="dialog"
			aria-label="terminal"
			tabindex="-1"
			data-terminal
			style={fullscreen ? '' : `left:${rect.x}px; top:${rect.y}px; width:${rect.width}px; height:${rect.height}px;`}
			{onkeydown}
		>
			<div
				class="titlebar"
				role="presentation"
				onpointerdown={(event) => startDrag(event, 'move')}
				onpointermove={onDrag}
				onpointerup={endDrag}
				onpointercancel={endDrag}
				ondblclick={() => !isMobile && toggleMaximize()}
			>
				<span class="title">═ terminal ═══</span>
				<span class="controls">
					<button type="button" aria-label="minimize terminal" onclick={minimizeTerminal}>_</button>
					{#if !isMobile}
						<button
							type="button"
							aria-label={editor.terminal.maximized ? 'restore terminal size' : 'maximize terminal'}
							onclick={toggleMaximize}
						>
							□
						</button>
					{/if}
					<button type="button" aria-label="close terminal" onclick={closeTerminal}>x</button>
				</span>
			</div>

			<TerminalSession bind:this={sessionView} {projects} {fullscreen} />

			{#if !fullscreen}
				{#each EDGES as edge (edge)}
					<div
						class="handle handle-{edge}"
						aria-hidden="true"
						onpointerdown={(event) => startDrag(event, edge)}
						onpointermove={onDrag}
						onpointerup={endDrag}
						onpointercancel={endDrag}
					></div>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.terminal-layer {
		position: absolute;
		inset: 0;
		z-index: 30;
		pointer-events: none;
	}

	.terminal {
		position: absolute;
		display: flex;
		flex-direction: column;
		pointer-events: auto;
		background: var(--nord-0);
		border: 3px double var(--nord-8);
	}

	.terminal.fullscreen {
		inset: 0;
	}

	.titlebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1ch;
		background: var(--nord-1);
		color: var(--nord-8);
		cursor: move;
		user-select: none;
		touch-action: none;
	}

	.fullscreen .titlebar {
		cursor: default;
	}

	.controls {
		display: flex;
		gap: 1ch;
	}

	.controls button {
		padding: 0 0.5ch;
		color: var(--nord-4);
		cursor: pointer;
	}

	.controls button:hover {
		background: var(--nord-2);
		color: var(--nord-6);
	}

	/* Touch: the one-character _ □ x buttons get 44px targets. */
	@media (pointer: coarse) {
		.controls button {
			min-width: 44px;
			min-height: 44px;
		}
	}

	.handle {
		position: absolute;
		touch-action: none;
	}

	.handle-n, .handle-s { left: 8px; right: 8px; height: 8px; cursor: ns-resize; }
	.handle-e, .handle-w { top: 8px; bottom: 8px; width: 8px; cursor: ew-resize; }
	.handle-n { top: -5px; }
	.handle-s { bottom: -5px; }
	.handle-e { right: -5px; }
	.handle-w { left: -5px; }
	.handle-ne, .handle-nw, .handle-se, .handle-sw { width: 12px; height: 12px; }
	.handle-ne { top: -6px; right: -6px; cursor: nesw-resize; }
	.handle-sw { bottom: -6px; left: -6px; cursor: nesw-resize; }
	.handle-nw { top: -6px; left: -6px; cursor: nwse-resize; }
	.handle-se { bottom: -6px; right: -6px; cursor: nwse-resize; }
</style>
