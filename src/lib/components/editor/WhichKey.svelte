<script lang="ts">
	import { editor } from '$lib/editor/state.svelte';

	const KEYS: [string, string][] = [
		['j / k', 'move down / up'],
		['gg / G', 'top / bottom'],
		['1 2 3', 'home / about / projects'],
		['␣ h a p', 'home / about / projects'],
		['⏎', 'open preview'],
		['ctrl+/', 'toggle terminal'],
		['?', 'toggle this help'],
		['esc', 'close']
	];
</script>

{#if editor.helpOpen}
	<div class="which-key" role="dialog" aria-label="keyboard shortcuts">
		<p class="title">─ keys ─</p>
		{#each KEYS as [key, label] (key)}
			<p><span class="key">{key}</span>{label}</p>
		{/each}
	</div>
{/if}

<style>
	.which-key {
		position: absolute;
		right: 1ch;
		bottom: 0.5lh;
		z-index: 40;
		padding: 0.5lh 2ch;
		background: var(--nord-1);
		border: 1px solid var(--nord-3);
	}

	p {
		margin: 0;
	}

	.title {
		color: var(--nord-3);
	}

	.key {
		display: inline-block;
		width: 10ch;
		color: var(--nord-13);
	}
</style>
