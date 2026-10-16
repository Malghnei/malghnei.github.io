<script lang="ts">
	import { editor } from '$lib/editor/state.svelte';

	const KEYS: [string, string][] = [
		['h j k l', 'move'],
		['w b e', 'next / back / word end'],
		['0 $', 'line start / end'],
		['gg / G', 'top / bottom'],
		['v / V', 'visual / visual line'],
		['y', 'yank selection'],
		['␣ h a p', 'home / about / projects'],
		['⏎', 'open preview'],
		['ctrl+/', 'toggle terminal'],
		['?', 'toggle this help'],
		['esc', 'exit visual / close']
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
