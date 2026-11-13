<script lang="ts">
	import { CATEGORY_COLOR, experienceId, logPeriod } from '$lib/data/experience';
	import { encodeTarget } from '$lib/preview/target';
	import type { ExperienceEntry } from '$lib/types';

	let { entries }: { entries: ExperienceEntry[] } = $props();
</script>

<!-- Laid out like `git log --graph`: a node per role, a fixed-width date column, the
     category and description indented under the title, and a rail joining the roles.
     Every row is an ordinary buffer line, so the cursor and the preview work as before. -->
{#each entries as entry, i (experienceId(entry))}
	<article
		class="entry"
		class:last={i === entries.length - 1}
		style:--node={CATEGORY_COLOR[entry.category]}
		data-preview={encodeTarget({ kind: 'experience', id: experienceId(entry) })}
	>
		<span class="line head">
			<span class="node" aria-hidden="true">●</span>
			<span class="date">{logPeriod(entry.period)}</span>
			<h3 class="title">{entry.title} <span class="org">@ {entry.organization}</span></h3>
		</span>
		<span class="line row category">{entry.category.toLowerCase()}</span>
		<span class="line row">{entry.description}</span>
		{#if i < entries.length - 1}<div class="line blank" aria-hidden="true"></div>{/if}
	</article>
{/each}

<style>
	.entry {
		/* 3ch for the graph, then a 17ch date column ("2025-09 → 2026-05") and a 2ch gap. */
		--graph: 3ch;
		--date: 17ch;
		--indent: calc(var(--graph) + var(--date) + 2ch);
		display: block;
		position: relative;
	}

	/* The rail, from under this role's node down to the next one. Above the row fills. */
	.entry:not(.last)::before {
		content: '';
		position: absolute;
		top: 1lh;
		bottom: 0;
		left: 0.5ch;
		border-left: 1px solid var(--nord-3);
		pointer-events: none;
		z-index: 1;
	}

	.entry :global(.line) {
		padding-left: var(--graph);
	}

	.head {
		display: grid;
		grid-template-columns: var(--date) minmax(0, 1fr);
		column-gap: 2ch;
	}

	.node {
		position: absolute;
		left: 0;
		top: 0;
		color: var(--node);
	}

	.date {
		color: var(--nord-4);
		white-space: nowrap;
	}

	/* A real heading so screen readers can jump between roles; it sits inside a numbered .line,
	   so it takes no number of its own, and it drops the markdown ### prefix headings get. */
	.title::before {
		content: none;
	}

	.title {
		font-size: 1em;
		margin: 0;
		color: var(--nord-6);
		font-weight: 700;
	}

	.org {
		color: var(--nord-4);
		font-weight: 400;
	}

	.entry .row {
		padding-left: var(--indent);
	}

	.category {
		color: var(--node);
	}

	/* The preview pane's marker: the rail lights up instead of the default outline. */
	.entry:global([data-active]) {
		outline: none;
		background: none;
	}

	.entry:global([data-active])::before,
	.entry:has(:global(.cursorline))::before {
		border-color: var(--nord-8);
	}

	/* Too narrow for a date column beside the title: the title drops under the date. */
	@container buffer (width < 620px) {
		.head {
			display: block;
		}

		.title {
			display: block;
		}

		.entry .row {
			padding-left: var(--graph);
		}
	}
</style>
