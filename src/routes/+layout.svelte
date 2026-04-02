<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import ViewToggleFab from '$lib/components/ViewToggleFab.svelte';
	import { LAST_NON_TERMINAL_PATH_KEY } from '$lib/constants/viewToggle';
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';

	let { children } = $props();
	const navLinks = [
		{ href: '/', label: 'home/' },
		{ href: '/about', label: 'about/' },
		{ href: '/projects', label: 'projects/' },
		{ href: '/other', label: 'other/' }
	];

	const isTerminalRoute = $derived(page.url.pathname.startsWith('/terminal'));

	function persistLastNonTerminalPath(pathname: string) {
		if (!browser) return;
		if (pathname.startsWith('/terminal')) return;
		sessionStorage.setItem(LAST_NON_TERMINAL_PATH_KEY, pathname);
	}

	onMount(() => {
		persistLastNonTerminalPath(page.url.pathname);
	});

	afterNavigate(({ to }) => {
		if (!to) return;
		persistLastNonTerminalPath(to.url.pathname);
	});
</script>

<svelte:head><link rel="icon" href={favicon} />
	<title>Malik's Portfolio</title>
	<meta name="description" content="Welcome to my Web Portfolio" />
</svelte:head>

{#if isTerminalRoute}
	<div class="relative min-h-screen">
		{@render children()}
		<ViewToggleFab isTerminal={true} />
	</div>
{:else}
	<div class="min-h-screen bg-[var(--nord-0)] text-[var(--nord-4)]">
		<header
			class="site-header fixed top-0 right-0 left-0 z-40 border-b border-[var(--nord-3)]"
		>
			<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<div class="text-sm terminal-title">malik@portfolio:~$</div>
				<nav class="flex flex-wrap items-center gap-4 text-sm">
					{#each navLinks as link}
						<a
							href={link.href}
							class="border border-transparent px-2 py-1 hover:border-[var(--nord-8)]"
							aria-current={page.url.pathname === link.href ? 'page' : undefined}
						>
							{link.label}
						</a>
					{/each}
				</nav>
			</div>
		</header>
		<main class="mx-auto max-w-6xl px-4 pt-16 pb-4">
			{@render children()}
		</main>
		<ViewToggleFab isTerminal={false} />
	</div>
{/if}
