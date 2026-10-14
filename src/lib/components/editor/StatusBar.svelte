<script lang="ts">
	import { page } from '$app/state';
	import { fileForPath } from '$lib/editor/files';
	import { currentMode, editor, openTerminal } from '$lib/editor/state.svelte';

	const mode = $derived(currentMode());
</script>

<footer class="statusbar">
	<span class="mode" class:terminal={mode === 'TERMINAL'}>{mode}</span>
	<span class="seg">{fileForPath(page.url.pathname)}</span>
	{#if editor.terminal.status === 'minimized'}
		<button type="button" class="seg restore" onclick={openTerminal}>[terminal]</button>
	{/if}
	<span class="spacer"></span>
	<span class="seg right hide-sm">utf-8</span>
	<span class="seg right hide-sm">md</span>
	<span class="seg right pos">{editor.cursorLine}:1</span>
</footer>

<style>
	.statusbar {
		display: flex;
		background: var(--nord-1);
		white-space: nowrap;
		overflow: hidden;
		font-size: 0.9em;
	}

	.mode {
		padding: 0 1ch;
		background: var(--nord-8);
		color: var(--nord-0);
		font-weight: 700;
	}

	.mode.terminal {
		background: var(--nord-14);
	}

	.seg {
		padding: 0 1ch;
		border-right: 1px solid var(--nord-3);
	}

	.seg.right {
		border-right: 0;
		border-left: 1px solid var(--nord-3);
	}

	.restore {
		color: var(--nord-13);
		cursor: pointer;
	}

	.spacer {
		flex: 1;
	}

	.pos {
		color: var(--nord-6);
	}

	@media (max-width: 639px) {
		.hide-sm {
			display: none;
		}
	}
</style>
