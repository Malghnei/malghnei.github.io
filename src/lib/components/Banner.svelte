<script lang="ts">
	import { parseBanner, variantCss } from '$lib/banner/variants';
	import { typeIn } from '$lib/editor/typeIn';

	let { name }: { name: string } = $props();

	// Glob, not import: banner-mobile.txt is optional and may not exist.
	const files = import.meta.glob<string>('../data/banner*.txt', {
		query: '?raw',
		import: 'default',
		eager: true
	});
	const variants = [files['../data/banner.txt'], files['../data/banner-mobile.txt']]
		.filter((raw) => raw !== undefined)
		.map(parseBanner)
		.filter((v) => v.rows.length > 0);

	// Container-query widths come from the art itself, so the rules are built here, not in <style>.
	const css = `<style>${variantCss(variants.map((v) => v.width))}</style>`;
</script>

<svelte:head>
	{@html css}
</svelte:head>

<h1 class="banner-h1">
	<span class="sr-only">{name}</span>
	{#each variants as v, i (i)}
		<span class="banner v{i}" aria-hidden="true">
			{#each v.rows as row, r (r)}<span class="line">{row}{#if r === v.rows.length - 1}<span
							class="cursor">█</span
						>{/if}</span
				>{/each}
		</span>
	{/each}
	<span class="line banner-fallback" aria-hidden="true"
		><span use:typeIn>{name}</span><span class="cursor">█</span></span
	>
</h1>

<style>
	/* The h1 is a wrapper, not a line: its rows carry the markdown look themselves. */
	.banner-h1::before {
		content: none;
	}

	.banner .line {
		/* Block art is drawn to fill the font's natural line box; the body's 1.65 would stripe it. */
		line-height: normal;
		min-height: 1lh;
		white-space: pre;
		color: var(--nord-8);
	}

	.banner-fallback::before {
		content: '# ';
		color: var(--nord-3);
	}
</style>
