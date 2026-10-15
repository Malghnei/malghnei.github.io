<script lang="ts">
	import Blank from '$lib/components/editor/Blank.svelte';
	import { highlightTechStackInElement } from '$lib/tags/inlineTagHighlighter';

	let { data } = $props();

	let contentEl = $state<HTMLElement | null>(null);

	// Same order as the projects list, so prev/next walks it.
	const index = $derived(data.projects.findIndex((project) => project.slug === data.project.slug));
	const prev = $derived(index > 0 ? data.projects[index - 1] : undefined);
	const next = $derived(index >= 0 ? data.projects[index + 1] : undefined);

	// The {#key} below recreates contentEl when moving between projects (e.g. `open` in the terminal),
	// so this runs once per project body.
	$effect(() => {
		const el = contentEl;
		const stack = data.project.techStack;
		if (!el) return;
		const frame = requestAnimationFrame(() => highlightTechStackInElement(el, stack));
		return () => cancelAnimationFrame(frame);
	});
</script>

<h1>{data.project.title}</h1>
<p class="fm">---</p>
<p><span class="fm-key">summary:</span> {data.project.summary}</p>
<p><span class="fm-key">period:</span> {data.project.period.toLowerCase()}</p>
<p>
	<span class="fm-key">role:</span> {data.project.role} · <span class="fm-key">type:</span>
	{data.project.domain}
</p>
<p><span class="fm-key">stack:</span> {data.project.techStack.join(' · ')}</p>
<p class="fm">---</p>
{#if data.project.repoUrl || data.project.demoUrl}
	<p class="fm-links">
		{#if data.project.repoUrl}
			<a href={data.project.repoUrl} target="_blank" rel="noreferrer">[source]</a>
		{/if}
		{#if data.project.demoUrl}
			<a href={data.project.demoUrl} target="_blank" rel="noreferrer">[demo]</a>
		{/if}
	</p>
{/if}
<Blank />
{#key data.project.slug}
	<div class="project-body" bind:this={contentEl}>
		<data.project.component />
	</div>
{/key}
<Blank />
<hr />
<p class="pager">
	{#if prev}<a href={`/projects/${prev.slug}/`}>← {prev.title}</a>{/if}
	<a href="/projects/">all projects</a>
	{#if next}<a href={`/projects/${next.slug}/`}>{next.title} →</a>{/if}
</p>

<style>
	.fm {
		color: var(--nord-3);
	}

	.fm-key {
		color: var(--nord-9);
	}

	.fm-links {
		display: flex;
		gap: 2ch;
	}

	/* A blank line above each section heading (except the first) and between paragraphs, as in rendered markdown. */
	.project-body :global(h2:not(:first-child)),
	.project-body :global(p + p) {
		margin-top: 1lh;
	}

	.pager {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0 2ch;
	}
</style>
