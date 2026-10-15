<script lang="ts">
	import ExtLink from '$lib/components/refs/ExtLink.svelte';
	import { siteContent } from '$lib/data/site';
	import { editor } from '$lib/editor/state.svelte';
	import { getPreview } from '$lib/preview/getPreview';
	import { CATEGORY_COLORS } from '$lib/tags/categories';
	import { getTagHighlightStyle } from '$lib/tags/tagStyles';
	import type { LinkInfo, ProjectFrontmatter } from '$lib/types';
	import { onMount } from 'svelte';

	let { projects, links }: { projects: ProjectFrontmatter[]; links: LinkInfo[] } = $props();

	// As on the home page: the real address only ever exists in the browser.
	let email = $state<LinkInfo>();
	onMount(() => {
		email = {
			label: 'email',
			href: `mailto:${siteContent.links.contactEmail.replace(/\s*\[@\]\s*/, '@')}`
		};
	});

	const model = $derived(getPreview(editor.preview, projects, email ? [...links, email] : links));

	const winbar = $derived.by(() => {
		switch (model.kind) {
			case 'idle':
				return '';
			case 'project':
				return `projects/${model.project.slug}.md`;
			case 'tech':
				return `tech: ${model.name}`;
			case 'link':
				return `${model.host}${model.path}`;
		}
	});
</script>

<!-- Outside .buffer-content, so the buffer's hover/focus handlers never see the pane's own links. -->
<aside class="pane" aria-label="preview">
	<p class="winbar">
		preview{#if winbar}<span class="sep">{' › '}</span><span class="file">{winbar}</span>{/if}
	</p>
	<div class="body">
		{#if model.kind === 'idle'}
			<p class="muted">
				hover or j/k onto a <span class="dim">[[</span><strong>highlighted</strong><span class="dim">]]</span> item or a card to preview it here
			</p>
			<p class="blank"></p>
			<p class="hints">
				<span class="key">j/k</span> move <span class="dim">·</span> <span class="key">⏎</span> open
				<span class="dim">·</span> <span class="key">?</span> all keys
			</p>
		{:else if model.kind === 'project'}
			{@const project = model.project}
			<p><a class="title" href={`/projects/${project.slug}/`}>{project.title}</a></p>
			<p class="blank"></p>
			{#if project.preview}
				<img src={project.preview} alt={`Screenshot of ${project.title}`} loading="lazy" />
				<p class="blank"></p>
			{/if}
			<p><span class="key">summary:</span> {project.summary}</p>
			<p><span class="key">period:</span> {project.period.toLowerCase()}</p>
			<p>
				<span class="key">role:</span> {project.role} · <span class="key">type:</span>
				{project.domain}
			</p>
			<p>
				<span class="key">stack:</span>
				<!-- The no-break space keeps each · on the line of the item before it. -->
				{#each project.techStack as tech, i (tech)}<span class="tech" style:color={getTagHighlightStyle(tech).color}
						>{tech}</span
					>{#if i < project.techStack.length - 1}<span class="dim">{'\u00a0·'}</span>{' '}{/if}{/each}
			</p>
			{#if project.repoUrl || project.demoUrl}
				<p class="blank"></p>
				<p class="links">
					{#if project.repoUrl}<ExtLink href={project.repoUrl} label="source" />{/if}
					{#if project.demoUrl}<ExtLink href={project.demoUrl} label="demo" />{/if}
				</p>
			{/if}
		{:else if model.kind === 'tech'}
			<p>
				<strong style:color={getTagHighlightStyle(model.name).color}>{model.name}</strong>
				{#if model.category}<span class="dim">·</span> {CATEGORY_COLORS[model.category].label}{/if}
			</p>
			<p class="blank"></p>
			<p>used in {model.projects.length} {model.projects.length === 1 ? 'project' : 'projects'}:</p>
			<ul>
				{#each model.projects as project (project.slug)}
					<li>
						<span class="dim">{'- '}</span><a href={`/projects/${project.slug}/`}>{project.title}</a>
						<span class="dim">·</span> <span class="period">{project.period.toLowerCase()}</span>
					</li>
				{/each}
			</ul>
			<p class="blank"></p>
			<p>
				<a href={`/projects/?tag=${encodeURIComponent(model.name)}`}>→ filter projects by {model.name}</a>
			</p>
		{:else}
			<p><ExtLink href={model.href} label={model.label} /></p>
			<p class="blank"></p>
			<p><span class="key">host:</span> {model.host || '—'}</p>
			<p class="url"><span class="key">url:</span> {model.href}</p>
			{#if model.context}
				<p class="blank"></p>
				<p>{model.context}</p>
			{/if}
		{/if}
		{#if model.kind !== 'idle'}
			<p class="blank"></p>
			<p class="hints"><span class="key">⏎</span> open</p>
		{/if}
	</div>
</aside>

<style>
	.pane {
		flex: 1;
		min-width: 40ch;
		min-height: 0;
		display: flex;
		flex-direction: column;
		border-left: 1px solid var(--nord-3);
		/* cqh: the screenshot is capped at a share of the pane's height. */
		container-type: size;
	}

	@media (max-width: 1279px) {
		.pane {
			display: none;
		}
	}

	p,
	ul {
		margin: 0;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	.blank {
		height: 1lh;
	}

	.winbar {
		padding: 0 2ch;
		background: var(--nord-1);
		color: var(--nord-4);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sep {
		color: var(--nord-9);
	}

	.file {
		color: var(--nord-6);
	}

	/* Wrap between stack items, never inside a name like "React Native". */
	.tech {
		white-space: nowrap;
	}

	.body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 1lh 2ch;
		overflow-wrap: anywhere;
	}

	.dim {
		color: var(--nord-3);
	}

	.muted {
		color: var(--nord-4);
	}

	/* Same look as a project ref, so the hint shows what to hover. */
	.muted strong {
		color: var(--nord-8);
	}

	.key {
		color: var(--nord-9);
	}

	.hints .key {
		color: var(--nord-13);
	}

	.title {
		color: var(--nord-6);
		font-weight: 700;
	}

	.period {
		color: var(--nord-9);
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0 2ch;
	}

	img {
		display: block;
		max-width: 100%;
		max-height: 40cqh;
		object-fit: contain;
	}
</style>
