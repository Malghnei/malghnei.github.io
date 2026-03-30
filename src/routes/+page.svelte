<script lang="ts">
	import * as emoji from 'node-emoji';
	import { getTagHighlightStyle } from '$lib/tags/tagStyles';

	let { data } = $props();

	const categoryColor = (category: string) => {
		if (category === 'work') return 'text-[var(--nord-8)]';
		if (category === 'volunteering') return 'text-[var(--nord-7)]';
		return 'text-[var(--nord-9)]';
	};
</script>

<div class="space-y-8">
	<section class="terminal-surface p-4">
		<p class="terminal-title text-sm">{data.siteContent.heroCommand}</p>
		<h1 class="mt-2 text-2xl">{data.siteContent.name}</h1>
		<p class="text-[var(--nord-8)]">{data.siteContent.role}</p>
		<p class="mt-3 text-sm leading-relaxed">{data.siteContent.heroDescription}</p>
	</section>

	<section class="terminal-surface p-4">
		<h2 class="terminal-title text-lg">~/experience.md</h2>
		<div class="mt-4 space-y-4">
			{#each data.experienceTimeline as item}
				<article class="border-l border-[var(--nord-3)] pl-3">
					<p class="text-xs text-[var(--nord-9)]">{item.period}</p>
					<p class="mt-1 font-semibold">{item.title} @ {item.organization}</p>
					<p class={`text-xs uppercase ${categoryColor(item.category)}`}>{item.category}</p>
					<p class="mt-1 text-sm">{item.description}</p>
				</article>
			{/each}
		</div>
	</section>

	<section class="space-y-3">
		<h2 class="terminal-title text-lg">~/projects.md</h2>
		<div class="grid gap-4 md:grid-cols-3">
			{#each data.featuredProjects as project}
				<a href={`/projects/${project.slug}`} class="terminal-surface block p-4 hover:border-[var(--nord-8)]">
					<p class="text-xs text-[var(--nord-9)]">{project.period}</p>
					<h3 class="mt-1 font-semibold">{project.title}</h3>
					<p class="mt-2 text-sm leading-relaxed">{project.summary}</p>
					<p class="mt-3 text-xs text-[var(--nord-8)]">
						{#each project.techStack as tech, i}
							<span
								data-tag-highlighted="true"
								style={`color:${getTagHighlightStyle(tech).color}; background-color:${getTagHighlightStyle(tech).backgroundColor}; border-bottom:1px solid ${getTagHighlightStyle(tech).borderColor}; border-radius:0.2em; padding:0 0.12em;`}
							>
								{tech}
							</span>
							{#if i < project.techStack.length - 1}
								<span class="text-[var(--nord-9)]"> · </span>
							{/if}
						{/each}
					</p>
				</a>
			{/each}
		</div>
	</section>

	<section class="terminal-surface p-4">
		<h2 class="terminal-title text-lg">~/misc.md</h2>
		<div class="mt-3 grid gap-4 md:grid-cols-2">
			<div>
				<p class="text-sm text-[var(--nord-8)]"> Currently:</p>
				<ul class="mt-2 list-inside list-disc space-y-1 text-sm">
					{#each data.siteContent.misc.upTo as book}
						<li>{emoji.emojify(book)}</li>
					{/each}
				</ul>
			</div>
			<div>
				<p class="text-sm text-[var(--nord-8)]">Quick Links:</p>
				<ul class="mt-2 space-y-2 text-sm">
					{#each data.siteContent.misc.quickLinks as link}
						<li><a href={link.href} target="_blank" rel="noreferrer">{link.label}</a></li>
					{/each}
					<li>Contact: <a href={`mailto:${data.siteContent.misc.contactEmail}`}>{data.siteContent.misc.contactEmail}</a></li>
				</ul>
			</div>
		</div>
	</section>
</div>
