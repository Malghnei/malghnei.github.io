<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import { closeTerminal, session } from '$lib/editor/state.svelte';
	import { executeTerminalCommand } from '$lib/terminal/commands';
	import type { ProjectEntry } from '$lib/types';

	let { projects }: { projects: ProjectEntry[] } = $props();

	const prompt = 'malik@portfolio:~$';

	let command = $state('');
	let historyCursor = session.history.length;
	let inputEl = $state<HTMLInputElement | null>(null);
	let outputEl = $state<HTMLElement | null>(null);

	export const focus = () => inputEl?.focus();

	const scrollToEnd = async () => {
		await tick();
		outputEl?.scrollTo({ top: outputEl.scrollHeight });
	};

	const runCommand = async () => {
		const input = command.trim();
		command = '';
		session.lines.push({ input, output: '' });

		if (!input) {
			await scrollToEnd();
			return;
		}

		session.history.push(input);
		historyCursor = session.history.length;

		const result = await executeTerminalCommand(input, projects);
		if (result.clear) {
			session.lines.splice(0, session.lines.length);
		}
		if (result.output) {
			session.lines.push({ output: result.output });
		}
		if (result.error) {
			session.lines.push({ output: result.error, isError: true });
		}
		await scrollToEnd();

		// keepFocus: SvelteKit would otherwise move focus to <body> and pull it out of the terminal.
		if (result.navigate) await goto(result.navigate, { keepFocus: true });
		if (result.close) closeTerminal();
	};

	const handleHistory = (event: KeyboardEvent) => {
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (session.history.length === 0) return;
			historyCursor = Math.max(0, historyCursor - 1);
			command = session.history[historyCursor] ?? '';
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (session.history.length === 0) return;
			historyCursor = Math.min(session.history.length, historyCursor + 1);
			command = session.history[historyCursor] ?? '';
		}
	};
</script>

<div class="session" bind:this={outputEl} onclick={focus} role="presentation">
	{#each session.lines as line, index (index)}
		{#if line.input !== undefined}
			<p><span class="prompt">{prompt}</span> {line.input}</p>
		{/if}
		{#if line.output}
			<pre class:error={line.isError}>{line.output}</pre>
		{/if}
	{/each}

	<form
		class="input-row"
		onsubmit={async (event) => {
			event.preventDefault();
			await runCommand();
		}}
	>
		<label class="prompt" for="terminal-input">{prompt}</label>
		<input
			id="terminal-input"
			bind:value={command}
			bind:this={inputEl}
			onkeydown={handleHistory}
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
		/>
	</form>
</div>

<style>
	.session {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 0.5lh 1ch;
		cursor: text;
		font-size: 0.95em;
	}

	p,
	pre {
		margin: 0;
	}

	pre {
		white-space: pre-wrap;
		font: inherit;
		color: var(--nord-4);
	}

	pre.error {
		color: var(--nord-11);
	}

	.prompt {
		color: var(--nord-8);
	}

	.input-row {
		display: flex;
		gap: 1ch;
	}

	input {
		flex: 1;
		min-width: 0;
		background: transparent;
		color: var(--nord-6);
		caret-color: var(--nord-8);
		outline: none;
	}
</style>
