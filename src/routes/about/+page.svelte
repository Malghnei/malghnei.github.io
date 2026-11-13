<script lang="ts">
	import * as emoji from 'node-emoji';
	import ExperienceLog from '$lib/components/ExperienceLog.svelte';
	import Prose from '$lib/components/refs/Prose.svelte';
	import ExtLink from '$lib/components/refs/ExtLink.svelte';
	import Blank from '$lib/components/editor/Blank.svelte';
	import { experienceTimeline, siteContent } from '$lib/data/site';
	import { onMount } from 'svelte';

	const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

	// As on the home page: the real address only ever exists in the browser.
	let emailHref = $state<string>();
	onMount(() => {
		emailHref = `mailto:${siteContent.links.contactEmail.replace(/\s*\[@\]\s*/, '@')}`;
	});
</script>

<!-- A rendered README: the name as the title, the role as its tagline. -->
<h1>{siteContent.name}</h1>
<blockquote>{siteContent.role}</blockquote>
<Blank />
{#each siteContent.aboutNarrative as paragraph, i}
	{#if i > 0}<Blank />{/if}
	<p><Prose text={paragraph} /></p>
{/each}
<Blank />
<!-- The spaces before the count sit outside aria-hidden, so it reads "experience 4 roles". -->
<h2>experience<span class="summary"><span aria-hidden="true">{'  --'}</span>{' '}{count(experienceTimeline.length, 'role')}</span></h2>
<ExperienceLog entries={experienceTimeline} />
<Blank />
<h2>setup<span class="summary"><span aria-hidden="true">{'  --'}</span>{' '}{count(siteContent.setup.items.length, 'tool')}</span></h2>
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
<Blank />
<h2>contact</h2>
<ul>
	<li><ExtLink href={emailHref} label="email" /></li>
	{#each siteContent.links.items as link (link.href)}
		<li><ExtLink href={link.href} label={link.label} /></li>
	{/each}
</ul>

<style>
	.summary {
		color: var(--comment);
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
		color: var(--marker);
	}

	@media (max-width: 639px) {
		/* A value that doesn't fit drops whole onto the next row instead of hanging off the key. */
		.setup-row {
			flex-wrap: wrap;
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
