<script lang="ts">
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

	const allTags = $derived(
		Array.from(new Set(data.projects.flatMap((project) => project.techStack))).sort((a, b) =>
			a.localeCompare(b)
		)
	);

	const filtered = $derived(filterProjects(data.projects, { query, role, domain, tags: selectedTags }));

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
	<input id="project-search" type="search" placeholder="search…" autocomplete="off" bind:value={query} />
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
	{#each allTags as tag (tag)}
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
</p>
<hr />
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

	.search input {
		flex: 1;
		min-width: 0;
		background: transparent;
		color: var(--nord-5);
		caret-color: var(--nord-8);
		outline: none;
	}

	.search input::placeholder {
		color: var(--nord-3);
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
	.tag {
		cursor: pointer;
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

	.empty {
		color: var(--nord-13);
	}
</style>
