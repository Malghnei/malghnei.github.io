<script lang="ts">
	import { page } from '$app/state';
	import { fileForPath } from '$lib/editor/files';
	import { siteContent } from '$lib/data/site';
	import { currentMode, editor, openTerminal } from '$lib/editor/state.svelte';
	import { onMount } from 'svelte';

	const mode = $derived(currentMode());

	// Assembled in the browser, as on the home page, so the prerendered HTML never holds it.
	let emailHref = $state<string>();
	onMount(() => {
		emailHref = `mailto:${siteContent.links.contactEmail.replace(/\s*\[@\]\s*/, '@')}`;
	});
</script>

<footer class="statusbar">
	<!-- Live, so mode changes are announced; the position isn't, to avoid chatter on every motion. -->
	<span
		class="mode"
		class:terminal={mode === 'TERMINAL'}
		class:visual={mode.startsWith('VISUAL')}
		aria-live="polite">{mode}</span
	>
	<span class="seg file">{fileForPath(page.url.pathname)}</span>
	<!-- Always present, so screen readers announce it when the text arrives. -->
	<span class="seg msg" class:empty={!editor.message} role="status">{editor.message ?? ''}</span>
	{#if editor.terminal.status === 'minimized'}
		<button type="button" class="seg restore" onclick={openTerminal}>[terminal]</button>
	{/if}
	<span class="spacer"></span>
	<button
		type="button"
		class="seg right help"
		aria-label="keyboard shortcuts"
		aria-pressed={editor.helpOpen}
		onclick={() => (editor.helpOpen = !editor.helpOpen)}
	>
		?<span class="hide-sm">{' '}keys</span>
	</button>
	<span class="seg right hide-sm">utf-8</span>
	<span class="seg right hide-sm">md</span>
	<span class="seg right pos">{editor.cursorLine}:{editor.cursorCol}</span>
	<!-- Touch has no cursor, so the position's place goes to the contact links. -->
	<a class="seg right contact" href={emailHref}>email</a>
	{#each siteContent.links.items as link (link.href)}
		<a class="seg right contact" href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
	{/each}
</footer>

<style>
	.statusbar {
		display: flex;
		background: var(--nord-1);
		white-space: nowrap;
		overflow: hidden;
		font-size: 0.9em;
	}

	.mode {
		padding: 0 1ch;
		background: var(--nord-8);
		color: var(--nord-0);
		font-weight: 700;
	}

	.mode.terminal {
		background: var(--nord-14);
	}

	.mode.visual {
		background: var(--nord-15);
	}

	.msg {
		color: var(--nord-13);
	}

	.msg.empty {
		padding: 0;
		border: 0;
	}

	.seg {
		padding: 0 1ch;
		border-right: 1px solid var(--nord-3);
	}

	.seg.right {
		border-right: 0;
		border-left: 1px solid var(--nord-3);
	}

	.restore {
		color: var(--nord-13);
		cursor: pointer;
	}

	.help {
		color: var(--nord-13);
		cursor: pointer;
	}

	.spacer {
		flex: 1;
	}

	.pos {
		color: var(--nord-6);
	}

	.statusbar .contact {
		display: none;
		color: var(--nord-8);
	}

	/* On touch the contact links must fit; a long file name gives way instead. */
	@media (hover: none) {
		.statusbar .pos,
		.statusbar .help {
			display: none;
		}

		.statusbar .file {
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.statusbar .seg:not(.file),
		.statusbar .mode {
			flex-shrink: 0;
		}

		.statusbar .contact {
			display: flex;
			align-items: center;
		}
	}

	/* The narrowest phones can't fit a file name beside the contact links at all. */
	@media (hover: none) and (max-width: 359px) {
		.statusbar .file {
			display: none;
		}

		.statusbar .seg,
		.statusbar .mode {
			padding: 0 0.6ch;
		}
	}

	@media (max-width: 639px) {
		.hide-sm {
			display: none;
		}
	}

	/* Touch: 44px-tall bar, and the buttons at least 44px wide. */
	@media (pointer: coarse) {
		.statusbar {
			min-height: 44px;
		}

		.seg,
		.mode {
			display: flex;
			align-items: center;
		}

		.restore,
		.help {
			min-width: 44px;
			justify-content: center;
		}
	}
</style>
