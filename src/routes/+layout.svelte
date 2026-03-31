<script lang="ts">
	import { page } from '$app/state';
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
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isTerminalRoute}
	{@render children()}
{:else}
	<div class="min-h-screen bg-[var(--nord-0)] text-[var(--nord-4)]">
		<header class="border-b border-[var(--nord-3)] bg-[var(--nord-1)]">
			<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<div class="text-sm terminal-title">malik@portfolio:~$</div>
				<nav class="flex items-center gap-4 text-sm">
					{#each navLinks as link}
						<a
							href={link.href}
							class="border border-transparent px-2 py-1 hover:border-[var(--nord-8)]"
							aria-current={page.url.pathname === link.href ? 'page' : undefined}
						>
							{link.label}
						</a>
					{/each}
					<a href="/terminal" class="border border-[var(--nord-8)] px-2 py-1 text-[var(--nord-8)]">
						terminal view
					</a>
				</nav>
			</div>
		</header>
		<main class="mx-auto max-w-6xl p-4">
			{@render children()}
		</main>
	</div>
{/if}
