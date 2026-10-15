<script lang="ts">
	import * as emoji from 'node-emoji';
	import Prose from '$lib/components/refs/Prose.svelte';
	import Blank from '$lib/components/editor/Blank.svelte';
	import { experienceTimeline, siteContent } from '$lib/data/site';
	import type { ExperienceEntry } from '$lib/types';

	const categoryColor: Record<ExperienceEntry['category'], string> = {
		Work: 'var(--nord-8)',
		Volunteering: 'var(--nord-7)',
		Extracurricular: 'var(--nord-9)',
		Internship: 'var(--nord-9)'
	};

	// "Sept. 2025 - Present" -> "sept. 2025 → present"
	const formatPeriod = (period: string) => period.toLowerCase().replace(' - ', ' → ');
</script>

<h1>about</h1>
{#each siteContent.aboutNarrative as paragraph}
	<p><Prose text={paragraph} /></p>
{/each}
<Blank />
<h2>experience</h2>
<ul>
	{#each experienceTimeline as item (item.title + item.organization)}
		<li>
			<span class="xp-head">
				<span class="xp-period">{formatPeriod(item.period)}</span>
				<span class="xp-title">{item.title} @ {item.organization}</span>
				<span class="xp-category" style={`color:${categoryColor[item.category]}`}>
					{item.category.toLowerCase()}
				</span>
			</span>
			<span class="xp-desc">{item.description}</span>
		</li>
	{/each}
</ul>
<Blank />
<h2>setup</h2>
{#each siteContent.setup.items as item (item.label)}
	<p class="setup-row">
		<span class="setup-key">{item.label.toLowerCase()}</span>
		<span>{item.value}</span>
	</p>
{/each}
<Blank />
<h2>misc</h2>
<p>currently:</p>
<ul>
	{#each siteContent.misc.upTo as entry (entry)}
		<li>{emoji.emojify(entry)}</li>
	{/each}
</ul>

<style>
	/* Three columns: fixed-width dates, a title that wraps inside its own column, category on the right. */
	.xp-head {
		display: inline-flex;
		gap: 0 2ch;
		width: calc(100% - 2ch);
		vertical-align: top;
	}

	.xp-period {
		flex: none;
		width: 22ch;
		white-space: nowrap;
		color: var(--nord-9);
	}

	.xp-title {
		flex: 1;
		min-width: 0;
		color: var(--nord-6);
	}

	.xp-category {
		flex: none;
	}

	.xp-desc {
		display: block;
		padding-left: 4ch;
	}

	.setup-row {
		display: flex;
	}

	/* Fixed key column with dotted leaders: "ide ............ Cursor" */
	.setup-key {
		flex: none;
		width: 20ch;
		margin-right: 1ch;
		overflow: hidden;
		white-space: nowrap;
		color: var(--nord-8);
	}

	.setup-key::after {
		content: ' ..............................';
		color: var(--nord-3);
	}

	@media (max-width: 639px) {
		.xp-head {
			flex-wrap: wrap;
		}

		.xp-period {
			width: auto;
		}

		/* Phones: dates, then title; the category doesn't fit beside the dates, and it's the least useful column. */
		.xp-category {
			display: none;
		}

		.xp-title {
			flex-basis: 100%;
		}

		.setup-key {
			width: auto;
			padding-right: 1ch;
		}

		.setup-key::after {
			content: ':';
		}
	}
</style>
