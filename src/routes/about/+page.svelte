<script lang="ts">
	import * as emoji from 'node-emoji';
	import ExperienceCard from '$lib/components/ExperienceCard.svelte';
	import Prose from '$lib/components/refs/Prose.svelte';
	import Blank from '$lib/components/editor/Blank.svelte';
	import { experienceTimeline, siteContent } from '$lib/data/site';

	const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
</script>

<h1>about</h1>
{#each siteContent.aboutNarrative as paragraph, i}
	{#if i > 0}<Blank />{/if}
	<p><Prose text={paragraph} /></p>
{/each}
<Blank />
<h2>experience<span class="summary"><span aria-hidden="true">{'  -- '}</span>{count(experienceTimeline.length, 'role')}</span></h2>
{#each experienceTimeline as item (item.title + item.organization)}
	<ExperienceCard entry={item} />
{/each}
<Blank />
<h2>setup<span class="summary"><span aria-hidden="true">{'  -- '}</span>{count(siteContent.setup.items.length, 'tool')}</span></h2>
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
	.summary {
		color: var(--nord-3);
		font-weight: 400;
		white-space: pre;
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
