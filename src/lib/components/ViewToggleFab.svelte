<script lang="ts">
	import { browser } from '$app/environment';
	import { LAST_NON_TERMINAL_PATH_KEY } from '$lib/constants/viewToggle';
	import { onMount } from 'svelte';

	type Props = { isTerminal: boolean };
	let { isTerminal }: Props = $props();

	let exitHref = $state('/');

	onMount(() => {
		if (!browser || !isTerminal) return;
		const stored = sessionStorage.getItem(LAST_NON_TERMINAL_PATH_KEY);
		exitHref =
			stored && stored.startsWith('/') && !stored.startsWith('/terminal') ? stored : '/';
	});
</script>

{#if isTerminal}
	<a
		href={exitHref}
		class="view-toggle-fab border border-[var(--nord-8)] bg-[var(--nord-1)] px-4 py-3 text-sm text-[var(--nord-8)] shadow-lg backdrop-blur-sm hover:border-[var(--nord-7)] hover:text-[var(--nord-7)]"
		aria-label="Return to site"
	>
		standard view
	</a>
{:else}
	<a
		href="/terminal"
		class="view-toggle-fab border border-[var(--nord-8)] bg-[var(--nord-1)] px-4 py-3 text-sm text-[var(--nord-8)] shadow-lg backdrop-blur-sm hover:border-[var(--nord-7)] hover:text-[var(--nord-7)]"
		aria-label="Open terminal view"
	>
		terminal view
	</a>
{/if}

<style>
	.view-toggle-fab {
		position: fixed;
		z-index: 50;
		right: max(1rem, env(safe-area-inset-right, 0px));
		bottom: max(1rem, env(safe-area-inset-bottom, 0px));
		min-height: 44px;
		min-width: 44px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 2px;
		font-family: inherit;
	}
</style>
