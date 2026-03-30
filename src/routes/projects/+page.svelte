<script lang="ts">
	import { getTagChipStyle, getTagHighlightStyle } from '$lib/tags/tagStyles';

	let { data } = $props();

	let query = $state('');
	let selectedTags = $state<string[]>([]);

	const allTags = $derived(
		Array.from(new Set(data.projects.flatMap((project) => project.techStack))).sort((a, b) =>
			a.localeCompare(b)
		)
	);

	const tagHighlightStyleMap = $derived(
		Object.fromEntries(allTags.map((tag) => [tag, getTagHighlightStyle(tag)]))
	);

	const tagChipStyleMap = $derived(
		Object.fromEntries(
			allTags.map((tag) => [
				tag,
				{
					selected: getTagChipStyle(tag, true),
					unselected: getTagChipStyle(tag, false)
				}
			])
		)
	);

	const chipStyleString = (tag: string, selected: boolean) => {
		const chip = selected ? tagChipStyleMap[tag]?.selected : tagChipStyleMap[tag]?.unselected;
		if (!chip) return '';
		return `border-color:${chip.borderColor}; color:${chip.color}; background-color:${chip.backgroundColor};`;
	};

	const toggleTag = (tag: string) => {
		if (selectedTags.includes(tag)) {
			selectedTags.splice(selectedTags.indexOf(tag), 1);
			return;
		}
		selectedTags.push(tag);
	};

	const filteredProjects = $derived(
		data.projects.filter((project) => {
			const q = query.trim().toLowerCase();
			const matchesQuery =
				!q ||
				project.title.toLowerCase().includes(q) ||
				project.summary.toLowerCase().includes(q) ||
				project.techStack.some((tech) => tech.toLowerCase().includes(q));
			const matchesTags =
				selectedTags.length === 0 || selectedTags.every((tag) => project.techStack.includes(tag));
			return matchesQuery && matchesTags;
		})
	);
</script>

<section class="space-y-4">
	<div class="terminal-surface p-4">
		<h1 class="terminal-title text-2xl">projects</h1>
		<p class="mt-2 text-sm">Search and filter by stack to quickly inspect project depth.</p>
	</div>

	<div class="terminal-surface p-4">
		<input
			type="search"
			placeholder="search by title, summary, or stack..."
			class="w-full border border-[var(--nord-3)] bg-[var(--nord-0)] px-3 py-2 text-sm text-[var(--nord-5)] outline-none focus:border-[var(--nord-8)]"
			bind:value={query}
		/>
		<div class="mt-3 flex flex-wrap gap-2">
			{#each allTags as tag}
				<button
					type="button"
					onclick={() => toggleTag(tag)}
					class="rounded border px-2 py-1 text-xs"
					style={chipStyleString(tag, selectedTags.includes(tag))}
				>
					{tag}
				</button>
			{/each}
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		{#if filteredProjects.length === 0}
			<p class="terminal-surface p-4 text-sm">No projects match the current filters.</p>
		{:else}
			{#each filteredProjects as project}
				<a href={`/projects/${project.slug}`} class="terminal-surface block p-4 hover:border-[var(--nord-8)]">
					<div class="flex items-start justify-between gap-3">
						<h2 class="font-semibold">{project.title}</h2>
						<span class="text-xs text-[var(--nord-9)]">{project.period}</span>
					</div>
					<p class="mt-2 text-sm leading-relaxed">{project.summary}</p>
					<p class="mt-3 text-xs text-[var(--nord-8)]">
						{#each project.techStack as tech, i}
							<span
								data-tag-highlighted="true"
								style={`color:${tagHighlightStyleMap[tech].color}; background-color:${tagHighlightStyleMap[tech].backgroundColor}; border-bottom:1px solid ${tagHighlightStyleMap[tech].borderColor}; border-radius:0.2em; padding:0 0.12em;`}
							>
								{tech}
							</span>
							{#if i < project.techStack.length - 1}
								<span class="text-[var(--nord-9)]"> · </span>
							{/if}
						{/each}
					</p>
				</a>
			{/each}
		{/if}
	</div>
</section>
