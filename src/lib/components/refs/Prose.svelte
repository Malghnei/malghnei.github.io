<script lang="ts">
	import { getRefExclude, getRefsContext } from '$lib/refs/context';
	import { tokenize } from '$lib/refs/tokenize';
	import ProjectRef from './ProjectRef.svelte';
	import TechRef from './TechRef.svelte';

	let { text }: { text: string } = $props();

	const { dict } = getRefsContext();
	const exclude = getRefExclude();
	const segments = $derived(tokenize(text, dict, { exclude: exclude() }));
</script>

<!-- No wrapper element: this flows inside the caller's <p>, which is the numbered line. -->
{#each segments as segment}
	{#if segment.type === 'project'}
		<ProjectRef title={segment.value} slug={segment.slug} />
	{:else if segment.type === 'tech'}
		<TechRef name={segment.value} />
	{:else}
		{segment.value}
	{/if}
{/each}
