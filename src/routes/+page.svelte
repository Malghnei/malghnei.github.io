<script lang="ts">
	import Banner from '$lib/components/Banner.svelte';
	import Blank from '$lib/components/editor/Blank.svelte';
	import { siteContent } from '$lib/data/site';
	import { openTerminal } from '$lib/editor/state.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

	// The prerendered HTML only ever holds the "user [@] domain" form; the real address is
	// assembled in the browser, so scrapers reading the static page don't get it.
	let emailHref = $state<string>();
	onMount(() => {
		emailHref = `mailto:${siteContent.links.contactEmail.replace(/\s*\[@\]\s*/, '@')}`;
	});
</script>

<!-- A start screen, like nvim's with no file open. Every row below the art is an ordinary
     buffer line, so the cursor, motions, visual mode and yank work as on every other page. -->
<div class="dash">
	<Banner name={siteContent.name} />
	<p class="role">{siteContent.role}</p>
	<p class="status"><span aria-hidden="true">●</span> {siteContent.status.toLowerCase()}</p>
	<Blank />
	<a class="line menu-row" href="/projects/">
		<span class="key">p</span><span class="label">projects</span><span class="leader" aria-hidden="true"></span><span class="note">{data.projectCount} files</span>
	</a>
	<a class="line menu-row" href="/about/">
		<span class="key">a</span><span class="label">about</span><span class="leader" aria-hidden="true"></span><span class="note">experience, setup</span>
	</a>
	<button type="button" class="line menu-row" onclick={openTerminal}>
		<span class="key">t</span><span class="label">terminal</span><span class="leader" aria-hidden="true"></span><span class="note">ls, cat, open</span>
	</button>
	<p class="contact">
		<a href={emailHref}>email</a>
		{#each siteContent.links.items as link (link.href)}
			<a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
		{/each}
	</p>
	<Blank />
	<h2>featured</h2>
	{#each data.featuredProjects as project (project.slug)}
		<a class="line feat" href={`/projects/${project.slug}/`}
			><strong>{project.title}</strong> <span class="summary">{project.summary}</span></a
		>
	{/each}
	<Blank />
	<p class="hint">j/k to move · ⏎ to open · ? for all keys</p>
</div>

<style>
	.dash {
		container: dash / inline-size;
		width: min(100%, 119ch);
	}

	.dash :global(.art-block) {
		margin-bottom: 0.5lh;
	}

	.role {
		color: var(--nord-9);
	}

	.status {
		font-weight: 700;
		color: var(--nord-14);
	}

	.menu-row {
		display: flex;
		align-items: center;
		gap: 2ch;
		width: 100%;
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		color: var(--nord-4);
		text-align: left;
		cursor: pointer;
	}

	.key {
		font-weight: 700;
		color: var(--nord-13);
	}

	.leader {
		flex: 1;
		align-self: center;
		border-bottom: 1px dotted var(--nord-3);
	}

	.note,
	.summary,
	.hint {
		color: var(--nord-9);
	}

	.contact {
		display: flex;
		gap: 3ch;
		padding-left: 3ch;
	}

	.feat {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--nord-4);
	}

	.feat strong {
		color: var(--nord-6);
	}

	.summary {
		margin-left: 1ch;
	}

	.hint {
		text-align: center;
	}

	/* nvim's own heading marker doesn't belong on a start screen. */
	.dash h2::before {
		content: none;
	}

	@container dash (width < 840px) {
		.feat {
			white-space: normal;
		}

		.summary {
			display: block;
			margin-left: 0;
		}
	}

	@media (hover: none) {
		.key,
		.hint,
		.contact {
			display: none;
		}

		.menu-row,
		.feat {
			min-height: 44px;
		}

		.feat {
			padding-block: 0.25lh;
		}
	}
</style>
