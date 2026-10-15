<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { filterProjects, type ProjectFilters } from '$lib/content/filter';
	import { getTagChipStyle } from '$lib/tags/tagStyles';

	let { data } = $props();

	const ROLE_OPTIONS: ProjectFilters['role'][] = ['all', 'solo', 'contribution'];
	const DOMAIN_OPTIONS: ProjectFilters['domain'][] = ['all', 'software', 'hardware'];

	let query = $state('');
	let role = $state<ProjectFilters['role']>('all');
	let domain = $state<ProjectFilters['domain']>('all');
	let selectedTags = $state<string[]>([]);

	// Show the most-used tags first; the rest sit behind "+N more".
	const TAG_LIMIT = 8;
	let showAllTags = $state(false);

	const tagCounts = $derived(
		data.projects.flatMap((project) => project.techStack).reduce((counts, tag) => {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
			return counts;
		}, new Map<string, number>())
	);

	const allTags = $derived(Array.from(tagCounts.keys()).sort((a, b) => a.localeCompare(b)));

	const topTags = $derived(
		new Set(
			[...allTags].sort((a, b) => tagCounts.get(b)! - tagCounts.get(a)! || a.localeCompare(b)).slice(0, TAG_LIMIT)
		)
	);

	// Selected tags stay visible even when collapsed, so a filter is never hidden.
	const visibleTags = $derived(
		showAllTags ? allTags : allTags.filter((tag) => topTags.has(tag) || selectedTags.includes(tag))
	);

	const filtered = $derived(filterProjects(data.projects, { query, role, domain, tags: selectedTags }));

	// Client-only: pages are prerendered, so search params are unavailable at build time.
	// Re-applies only when the URL's tag list changes (same-route navigation, back/forward),
	// so it never fights the user's own chip toggles.
	let appliedKey: string | null = null;
	$effect(() => {
		if (!browser) return;
		const fromUrl = [...new Set(page.url.searchParams.getAll('tag'))].filter((t) => allTags.includes(t));
		const key = fromUrl.join('\u0000');
		if (key === appliedKey) return;
		appliedKey = key;
		selectedTags = fromUrl;
	});

	const toggleTag = (tag: string) => {
		selectedTags = selectedTags.includes(tag)
			? selectedTags.filter((selected) => selected !== tag)
			: [...selectedTags, tag];
	};

	const chipStyle = (tag: string) => {
		const chip = getTagChipStyle(tag, selectedTags.includes(tag));
		return `color:${chip.color}; background-color:${chip.backgroundColor};`;
	};
</script>

<h1>projects</h1>
<p class="search">
	<label for="project-search" class="prompt">/</label>
	<input
		id="project-search"
		type="search"
		placeholder="search titles, summaries, tech…"
		autocomplete="off"
		bind:value={query}
	/>
</p>
<p class="opts">
	<span class="opt-label">role:</span>
	{#each ROLE_OPTIONS as option (option)}
		<button type="button" class="opt" aria-pressed={role === option} onclick={() => (role = option)}>
			{role === option ? `[${option}]` : option}
		</button>
	{/each}
</p>
<p class="opts">
	<span class="opt-label">type:</span>
	{#each DOMAIN_OPTIONS as option (option)}
		<button type="button" class="opt" aria-pressed={domain === option} onclick={() => (domain = option)}>
			{domain === option ? `[${option}]` : option}
		</button>
	{/each}
</p>
<p class="opts">
	<span class="opt-label">tags:</span>
	{#each visibleTags as tag (tag)}
		<button
			type="button"
			class="tag"
			aria-pressed={selectedTags.includes(tag)}
			style={chipStyle(tag)}
			onclick={() => toggleTag(tag)}
		>
			{tag}
		</button>
	{/each}
	{#if allTags.length > TAG_LIMIT}
		<button type="button" class="more" aria-expanded={showAllTags} onclick={() => (showAllTags = !showAllTags)}>
			{showAllTags ? '− less' : `+${allTags.length - visibleTags.length} more`}
		</button>
	{/if}
</p>
<hr />
{#if filtered.length}
	<p class="count" aria-live="polite">-- {filtered.length} of {data.projects.length} projects --</p>
{/if}
{#each filtered as project (project.slug)}
	<ProjectCard {project} />
{:else}
	<p class="empty">-- no matches --</p>
{/each}

<style>
	.search {
		display: flex;
		gap: 1ch;
	}

	.prompt {
		color: var(--nord-8);
	}

	.search:focus-within .prompt {
		color: var(--nord-13);
	}

	/* Inset underline (not a border) so the field reads as an input without growing the line. */
	.search input {
		flex: 1;
		min-width: 0;
		background: transparent;
		color: var(--nord-5);
		caret-color: var(--nord-8);
		outline: none;
		box-shadow: inset 0 -1px var(--nord-3);
	}

	.search input:focus {
		box-shadow: inset 0 -1px var(--nord-8);
	}

	.search input::placeholder {
		color: var(--nord-9);
	}

	.opts {
		display: flex;
		flex-wrap: wrap;
		gap: 0 2ch;
	}

	.opt-label {
		color: var(--nord-9);
	}

	.opt,
	.tag,
	.more {
		cursor: pointer;
	}

	/* Dotted underline marks the unselected filters as controls; a fill or brackets mark the selected ones. */
	.opt[aria-pressed='false'],
	.tag[aria-pressed='false'],
	.more {
		text-decoration: underline dotted var(--nord-3);
		text-underline-offset: 0.25em;
	}

	.opt[aria-pressed='false']:hover,
	.tag[aria-pressed='false']:hover,
	.more:hover {
		text-decoration: underline solid var(--nord-8);
	}

	.opt {
		color: var(--nord-4);
	}

	.opt[aria-pressed='true'] {
		color: var(--nord-8);
		font-weight: 700;
	}

	.tag {
		padding: 0 0.5ch;
	}

	.more {
		color: var(--nord-9);
	}

	.count {
		color: var(--nord-9);
	}

	.empty {
		color: var(--nord-13);
	}
</style>
