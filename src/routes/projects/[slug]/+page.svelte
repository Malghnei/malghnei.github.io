<script lang="ts">
	import { onMount } from 'svelte';
	import { highlightTechStackInElement } from '$lib/tags/inlineTagHighlighter';
	import { getTagHighlightStyle } from '$lib/tags/tagStyles';

	let { data } = $props();

	let contentEl: HTMLElement | null = null;

	onMount(() => {
		// Ensure the mdsvex-rendered project component has been inserted into the DOM.
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (contentEl) highlightTechStackInElement(contentEl, data.project.techStack);
			});
		});
	});
</script>

<article class="space-y-4">
	<header class="terminal-surface p-5">
		<p class="text-xs text-[var(--nord-9)]">{data.project.period}</p>
		<h1 class="mt-1 text-2xl terminal-title">{data.project.title}</h1>
		<p class="mt-3 text-sm leading-relaxed">{data.project.summary}</p>
		<p class="mt-3 text-xs text-[var(--nord-8)]">
			{#each data.project.techStack as tech, i}
				<span
					data-tag-highlighted="true"
					style={`color:${getTagHighlightStyle(tech).color}; background-color:${getTagHighlightStyle(tech).backgroundColor}; border-bottom:1px solid ${getTagHighlightStyle(tech).borderColor}; border-radius:0.2em; padding:0 0.12em;`}
				>
					{tech}
				</span>
				{#if i < data.project.techStack.length - 1}
					<span class="text-[var(--nord-9)]"> · </span>
				{/if}
			{/each}
		</p>
		<div class="mt-4 flex flex-wrap gap-3 text-sm">
			{#if data.project.repoUrl}
				<a href={data.project.repoUrl} target="_blank" rel="noreferrer">source code</a>
			{/if}
			{#if data.project.demoUrl}
				<a href={data.project.demoUrl} target="_blank" rel="noreferrer">live demo</a>
			{/if}
		</div>
	</header>

	<section class="terminal-surface p-5">
		<div bind:this={contentEl}>
			<data.project.component />
		</div>
	</section>
</article>
