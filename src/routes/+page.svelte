<script lang="ts">
	import Banner from '$lib/components/Banner.svelte';
	import Blank from '$lib/components/editor/Blank.svelte';
	import ExtLink from '$lib/components/refs/ExtLink.svelte';
	import Prose from '$lib/components/refs/Prose.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { siteContent } from '$lib/data/site';
	import { onMount } from 'svelte';

	let { data } = $props();

	// The prerendered HTML only ever holds the "user [@] domain" form; the real address is
	// assembled in the browser, so scrapers reading the static page don't get it.
	let emailHref = $state<string>();
	onMount(() => {
		emailHref = `mailto:${siteContent.links.contactEmail.replace(/\s*\[@\]\s*/, '@')}`;
	});
</script>

<Banner name={siteContent.name} />
<p class="role">{siteContent.role}</p>
<Blank />
<div class="callout">
	<p class="status"><span aria-hidden="true">●</span> {siteContent.status.toLowerCase()}</p>
	<p><Prose text={siteContent.heroDescription} /></p>
</div>
<!-- Contact sits in the hero so it's on the first screen, not after the project cards. -->
<p class="links">
	{#each siteContent.links.items as link (link.href)}
		<ExtLink href={link.href} label={link.label} />
	{/each}
	<ExtLink href={emailHref} label="email" />
</p>
<Blank />
<h2>featured</h2>
{#each data.featuredProjects as project (project.slug)}
	<ProjectCard {project} />
{/each}
<p><a href="/projects/">→ see all projects</a></p>

<style>
	.role {
		color: var(--nord-9);
	}

	/* The bar is drawn, not a border, so the lines keep the buffer's left edge: their gutter
	   numbers stay aligned and the cursorline fill spans the row. Same approach as the cards. */
	.callout {
		position: relative;
	}

	.callout::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		border-left: 2px solid var(--nord-14);
		pointer-events: none;
		z-index: 1; /* above the cursorline fill */
	}

	.callout p {
		padding-left: calc(2px + 1.5ch);
	}

	.status {
		font-weight: 700;
		color: var(--nord-14);
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0 2ch;
	}
</style>
