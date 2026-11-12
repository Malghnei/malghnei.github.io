<script lang="ts">
	import { page } from '$app/state';
	import { fileForPath } from '$lib/editor/files';
	import { currentMode, editor, openTerminal } from '$lib/editor/state.svelte';

	const mode = $derived(currentMode());
</script>

<footer class="statusbar">
	<!-- Live, so mode changes are announced; the position isn't, to avoid chatter on every motion. -->
	<span
		class="mode"
		class:terminal={mode === 'TERMINAL'}
		class:visual={mode.startsWith('VISUAL')}
		aria-live="polite">{mode}</span
	>
	<span class="seg">{fileForPath(page.url.pathname)}</span>
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
