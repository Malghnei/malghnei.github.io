<script lang="ts">
	import * as emoji from 'node-emoji';
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
	<p>{paragraph}</p>
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
	.xp-head {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0 2ch;
		width: calc(100% - 2ch);
	}

	.xp-period {
		color: var(--nord-9);
	}

	.xp-title {
		color: var(--nord-6);
	}

	.xp-category {
		margin-left: auto;
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
		.setup-key {
			width: auto;
			padding-right: 1ch;
		}

		.setup-key::after {
			content: ':';
		}
	}
</style>
