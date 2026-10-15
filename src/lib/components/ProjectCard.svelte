<script lang="ts">
	import TechRef from '$lib/components/refs/TechRef.svelte';
	import { encodeTarget } from '$lib/preview/target';
	import type { ProjectFrontmatter } from '$lib/types';

	let { project }: { project: ProjectFrontmatter } = $props();
</script>

<!-- Four numbered lines: ┌─ title ── role · domain · period ┐ / summary / meta / └──┘ -->
<article class="card" data-preview={encodeTarget({ kind: 'project', slug: project.slug })}>
	<span class="line edge">
		<span class="label title-wrap"
			><a class="title" href={`/projects/${project.slug}/`}>{project.title}</a></span
		>
		<span class="label period">{project.role} · {project.domain} · {project.period}</span>
	</span>
	<span class="line row">{project.summary}</span>
	<span class="line row meta">
		{#each project.techStack as tech (tech)}
			<span class="tech"><TechRef name={tech} /></span>
		{/each}
	</span>
	<span class="line edge" aria-hidden="true"><span class="label open">open →</span></span>
</article>

<style>
	.card {
		--card-border: var(--nord-3);
		--card-open: var(--nord-9);
		display: block;
		position: relative;
		color: var(--nord-4);
	}

	.card:has(a.title:focus-visible) {
		--card-border: var(--nord-8);
		--card-open: var(--nord-8);
	}

	/* Cursor on any row of the card (or forced active): all four rows share the cursorline fill. */
	.card:has(:global(.cursorline)),
	.card:global([data-active]) {
		--card-border: var(--nord-8);
		--card-open: var(--nord-8);
		--row-bg: var(--cursorline-bg);
	}

	.card:has(:global(.cursorline)) .line,
	.card:global([data-active]) .line {
		background-color: var(--cursorline-bg);
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

	.title-wrap {
		margin-left: 1ch;
	}

	.title {
		color: var(--nord-6);
		font-weight: 700;
		text-decoration: none;
	}

	/* Stretch the title link over the whole card so the card opens from anywhere. */
	.title::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.title:focus-visible {
		outline: none;
	}

	.tech {
		position: relative;
		z-index: 1;
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

</style>
