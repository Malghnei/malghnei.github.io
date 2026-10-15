<script lang="ts">
	import { getTagHighlightStyle } from '$lib/tags/tagStyles';
	import type { ProjectFrontmatter } from '$lib/types';

	let { project }: { project: ProjectFrontmatter } = $props();

	// Text colour only: a filled chip would read as a button, and these aren't clickable.
	const tagStyle = (tech: string) => `color:${getTagHighlightStyle(tech).color};`;
</script>

<!-- Four numbered lines: ┌─ title ── period ┐ / summary / meta / └──┘ -->
<a class="card" href={`/projects/${project.slug}/`}>
	<span class="line edge">
		<span class="label title">{project.title}</span>
		<span class="label period">{project.period}</span>
	</span>
	<span class="line row">{project.summary}</span>
	<span class="line row meta">
		<span class="kind">{project.role} · {project.domain}</span>
		{#each project.techStack as tech (tech)}
			<span class="tech" data-tag-highlighted="true" style={tagStyle(tech)}>{tech}</span>
		{/each}
	</span>
	<span class="line edge" aria-hidden="true"><span class="label open">open →</span></span>
</a>

<style>
	.card {
		--card-border: var(--nord-3);
		--card-open: var(--nord-9);
		display: block;
		position: relative;
		color: var(--nord-4);
	}

	.card:hover,
	.card:focus-visible {
		--card-border: var(--nord-8);
		--card-open: var(--nord-8);
		color: var(--nord-4);
		outline: none;
	}

	/* Vertical sides run from the middle of the top line to the middle of the bottom line. */
	.card::before {
		content: '';
		position: absolute;
		top: 0.5lh;
		bottom: 0.5lh;
		left: 0;
		right: 0;
		border-left: 1px solid var(--card-border);
		border-right: 1px solid var(--card-border);
		pointer-events: none;
	}

	/* Horizontal rule through the middle of the line; labels paint over it. */
	.edge {
		display: flex;
		min-height: 1lh; /* the bottom edge has no text but is still a full line */
		justify-content: space-between;
		background-image: linear-gradient(var(--card-border), var(--card-border));
		background-position: center;
		background-size: 100% 1px;
		background-repeat: no-repeat;
	}

	.label {
		padding: 0 1ch;
		background-color: var(--row-bg, var(--nord-0));
	}

	.title {
		margin-left: 1ch;
		color: var(--nord-6);
		font-weight: 700;
	}

	.period {
		margin-right: 1ch;
		color: var(--nord-9);
	}

	/* Always visible, so touch users (no hover) can tell the whole card opens. */
	.open {
		margin: 0 1ch 0 auto;
		color: var(--card-open);
	}

	.row {
		padding: 0 2ch;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1.5ch;
	}

	.kind {
		color: var(--nord-15);
	}
</style>
