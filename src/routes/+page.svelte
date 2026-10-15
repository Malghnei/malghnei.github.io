<script lang="ts">
	import Blank from '$lib/components/editor/Blank.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { siteContent } from '$lib/data/site';
	import { typeIn } from '$lib/editor/typeIn';

	let { data } = $props();
</script>

<h1>
	<span class="sr-only">{siteContent.name}</span>
	<span aria-hidden="true" use:typeIn>{siteContent.name}</span><span class="cursor" aria-hidden="true">█</span>
</h1>
<p class="role">{siteContent.role}</p>
<Blank />
<p>{siteContent.heroDescription}</p>
<!-- Contact sits in the hero so it's on the first screen, not after the project cards. -->
<p class="links">
	{#each siteContent.links.items as link (link.href)}
		<a href={link.href} target="_blank" rel="noreferrer">[{link.label}]</a>
	{/each}
	<a href={`mailto:${siteContent.links.contactEmail}`}>[email]</a>
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

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0 2ch;
	}
</style>
