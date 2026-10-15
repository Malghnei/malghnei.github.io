<script lang="ts">
	import { CATEGORY_COLOR, experienceId, formatPeriod } from '$lib/data/experience';
	import { encodeTarget } from '$lib/preview/target';
	import type { ExperienceEntry } from '$lib/types';

	let { entry }: { entry: ExperienceEntry } = $props();
</script>

<!-- Same frame as ProjectCard, without the link: ┌ title ──┐ / category · period / description / └──┘.
     The meta gets its own row: some titles fill most of the 80ch edge on their own. -->
<article class="card" data-preview={encodeTarget({ kind: 'experience', id: experienceId(entry) })}>
	<span class="line edge">
		<span class="label title">{entry.title} @ {entry.organization}</span>
	</span>
	<span class="line row meta"
		><span style={`color:${CATEGORY_COLOR[entry.category]}`}>{entry.category.toLowerCase()}</span> · {formatPeriod(
			entry.period
		)}</span
	>
	<span class="line row">{entry.description}</span>
	<span class="line edge" aria-hidden="true"></span>
</article>

<style>
	.card {
		--card-border: var(--nord-3);
		display: block;
		position: relative;
		color: var(--nord-4);
	}

	.card:has(:global(.cursorline)),
	.card:global([data-active]) {
		--card-border: var(--nord-8);
		--row-bg: var(--cursorline-bg);
	}

	.card:global([data-active]) {
		outline: none;
	}

	.card:has(:global(.cursorline)) .line,
	.card:global([data-active]) .line {
		background-color: var(--cursorline-bg);
	}

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
		z-index: 1;
	}

	.edge {
		display: flex;
		min-height: 1lh;
		justify-content: space-between;
		background-image: linear-gradient(var(--card-border), var(--card-border));
		/* Pinned to the first line, where the sides start: long titles wrap on phones. */
		background-position: 0 calc(0.5lh - 0.5px);
		background-size: 100% 1px;
		background-repeat: no-repeat;
	}

	.label {
		padding: 0 1ch;
		background-color: var(--row-bg, var(--nord-0));
	}

	.title {
		margin-left: 1ch;
		margin-right: 1ch; /* leaves the top-right corner of the rule showing when the title wraps */
		min-width: 0;
		color: var(--nord-6);
		font-weight: 700;
	}

	.meta {
		color: var(--nord-9);
	}

	.row {
		padding: 0 2ch;
	}
</style>
