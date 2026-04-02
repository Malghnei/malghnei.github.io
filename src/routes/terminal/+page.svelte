<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { siteContent } from '$lib/data/site';
	import { executeTerminalCommand } from '$lib/terminal/commands';

	let { data } = $props();

	type TerminalLine = {
		input?: string;
		output: string;
		isError?: boolean;
	};

	let command = $state('');
	let lines = $state<TerminalLine[]>([
		{ output: `Welcome to ${siteContent.name}'s interactive terminal.` },
		{ output: 'Type "help" to see available commands.' }
	]);
	let history = $state<string[]>([]);
	let historyCursor = $state(-1);
	let inputEl: HTMLInputElement | null = null;

	const prompt = 'malik@portfolio:~$';

	const appendLine = (line: TerminalLine) => {
		lines.push(line);
	};

	const runCommand = async () => {
		const input = command.trim();
		appendLine({ input, output: '' });

		if (!input) {
			command = '';
			return;
		}

		history.push(input);
		historyCursor = history.length;

		const result = await executeTerminalCommand(input, data.projects);
		if (result.clear) {
			lines.splice(0, lines.length);
		}
		if (result.output) {
			appendLine({ output: result.output });
		}
		if (result.error) {
			appendLine({ output: result.error, isError: true });
		}

		command = '';
	};

	const focusInput = () => {
		queueMicrotask(() => inputEl?.focus());
	};

	const handleHistory = (event: KeyboardEvent) => {
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (history.length === 0) return;
			historyCursor = Math.max(0, historyCursor - 1);
			command = history[historyCursor] ?? '';
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (history.length === 0) return;
			historyCursor = Math.min(history.length, historyCursor + 1);
			command = history[historyCursor] ?? '';
		}
	};

	onMount(async () => {
		await tick();
		inputEl?.focus();
	});
</script>

<div class="min-h-screen bg-[var(--nord-0)] p-4">
	<div
		class="mx-auto h-[calc(100vh-2rem)] max-w-6xl cursor-text terminal-surface"
		onclick={focusInput}
		role="presentation"
	>
		<div class="flex items-center border-b border-[var(--nord-3)] bg-[var(--nord-1)] px-4 py-2 text-xs">
			<span class="terminal-title">interactive terminal</span>
		</div>

		<div class="h-[calc(100%-2.5rem)] overflow-y-auto bg-[var(--nord-0)] p-4 text-sm">
			{#each lines as line}
				{#if line.input !== undefined}
					<p><span class="text-[var(--nord-8)]">{prompt}</span> {line.input}</p>
				{/if}
				{#if line.output}
					<pre class={`whitespace-pre-wrap ${line.isError ? 'text-[var(--nord-11)]' : 'text-[var(--nord-4)]'}`}>
{line.output}</pre
					>
				{/if}
			{/each}

			<form
				class="mt-2 flex items-center gap-2"
				onsubmit={async (event) => {
					event.preventDefault();
					await runCommand();
				}}
			>
				<label class="text-[var(--nord-8)]" for="terminal-input">{prompt}</label>
				<input
					id="terminal-input"
					class="flex-1 bg-transparent outline-none"
					bind:value={command}
					bind:this={inputEl}
					onkeydown={handleHistory}
					autocomplete="off"
				/>
			</form>
		</div>
	</div>
</div>
