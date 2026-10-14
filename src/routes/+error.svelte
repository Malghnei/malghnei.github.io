<script lang="ts">
	import { page } from '$app/state';
	import Blank from '$lib/components/editor/Blank.svelte';
</script>

{#if page.status === 404}
	<p class="error">E37: no such file: {page.url.pathname}</p>
{:else}
	<p class="error">E{page.status}: {page.error?.message}</p>
{/if}
<Blank />
<p><a href="/">→ go home</a></p>

<style>
	.error {
		color: var(--nord-11);
	}
</style>
