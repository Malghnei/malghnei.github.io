<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { openTerminal } from '$lib/editor/state.svelte';

	// Old links to the terminal page land on home with the terminal window open.
	onMount(() => {
		openTerminal();
		goto('/', { replaceState: true, keepFocus: true });
	});
</script>

<svelte:head>
	<!-- noscript: a bare refresh would also fire with JS on and reload away the open terminal -->
	<noscript><meta http-equiv="refresh" content="0; url=/" /></noscript>
</svelte:head>

<p>opening terminal… <a href="/">→ go home</a></p>
