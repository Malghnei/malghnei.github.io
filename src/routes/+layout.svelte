<script lang="ts">
	import '@fontsource/jetbrains-mono/400.css';
	import '@fontsource/jetbrains-mono/700.css';
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import Buffer from '$lib/components/editor/Buffer.svelte';
	import Navbar from '$lib/components/editor/Navbar.svelte';
	import StatusBar from '$lib/components/editor/StatusBar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Malik's Portfolio</title>
	<meta name="description" content="Welcome to my Web Portfolio" />
</svelte:head>

<div class="app">
	<Navbar />
	<div class="workspace">
		<Buffer>
			{@render children()}
		</Buffer>
	</div>
	<StatusBar />
</div>

<style>
	.app {
		height: 100dvh;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		/* minmax(0, …): don't let the navbar's tab strip widen the whole app on phones */
		grid-template-columns: minmax(0, 1fr);
	}

	.workspace {
		position: relative;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
</style>
