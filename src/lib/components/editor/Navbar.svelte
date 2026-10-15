<script lang="ts">
	import { page } from '$app/state';
	import { isTabActive, tabLabel, TABS } from '$lib/editor/files';
	import { editor, toggleTerminal } from '$lib/editor/state.svelte';

	// "projects/kata.md" -> ["projects", "/kata.md"]; phones drop the suffix so all tabs fit.
	const splitLabel = (label: string) => {
		const [, name = label, suffix = ''] = label.match(/^([^./]+)(.*)$/) ?? [];
		return { name, suffix };
	};
</script>

<header class="navbar">
	<nav class="tabs" aria-label="pages">
		{#each TABS as tab (tab.path)}
			{@const active = isTabActive(tab.path, page.url.pathname)}
			{@const label = splitLabel(tabLabel(tab, page.url.pathname))}
			<a href={tab.path} class="tab" class:active aria-current={active ? 'page' : undefined}>
				{label.name}<span class="suffix">{label.suffix}</span>
			</a>
		{/each}
	</nav>
	<button
		type="button"
		class="term-toggle"
		aria-label="toggle terminal"
		aria-pressed={editor.terminal.status === 'open'}
		onclick={toggleTerminal}
	>
		[&gt;_<span class="term-label">{' '}terminal</span>]
	</button>
</header>

<style>
	.navbar {
		display: flex;
		justify-content: space-between;
		background: var(--nord-1);
		border-bottom: 1px solid var(--nord-3);
	}

	.tabs {
		display: flex;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.tab {
		padding: 0 2ch;
		color: var(--nord-4);
		white-space: nowrap;
		border-bottom: 2px solid transparent;
	}

	.tab:hover {
		color: var(--nord-6);
		background: var(--nord-2);
	}

	.tab.active {
		color: var(--nord-6);
		background: var(--nord-0);
		border-bottom-color: var(--nord-8);
	}

	.term-toggle {
		padding: 0 2ch;
		color: var(--nord-8);
		border-left: 1px solid var(--nord-3);
		cursor: pointer;
		white-space: nowrap;
	}

	.term-toggle[aria-pressed='true'] {
		background: var(--nord-8);
		color: var(--nord-0);
	}

	.term-toggle:hover {
		background: var(--nord-2);
	}

	.term-toggle[aria-pressed='true']:hover {
		background: var(--nord-7);
	}

	@media (max-width: 639px) {
		.tab {
			padding: 0 1ch;
		}

		.suffix,
		.term-label {
			display: none;
		}
	}

	/* Touch: 44px-tall targets. */
	@media (pointer: coarse) {
		.tab,
		.term-toggle {
			display: flex;
			align-items: center;
			min-height: 44px;
		}

		.term-toggle {
			min-width: 44px;
			justify-content: center;
		}
	}
</style>
