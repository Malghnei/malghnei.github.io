<script lang="ts">
	import { siteContent } from '$lib/data/site';
</script>
<div class="space-y-8">
	<article class="terminal-surface p-5">
		<h1 class="terminal-title text-2xl">~/about/</h1>
		<div class="mt-4 space-y-4 text-sm leading-relaxed">
			{#each siteContent.aboutNarrative as paragraph}
				<p>{paragraph}</p>
			{/each}
		</div>
	</article>
</div>
