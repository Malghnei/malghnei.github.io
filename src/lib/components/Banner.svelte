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

<!-- The rows are siblings of the page's other lines, not children of the h1: Firefox doesn't
     carry a count made inside a non-counting element on to the lines after it, so nesting
     restarted the gutter numbers after the banner. The h1 only names the page for assistive tech. -->
<h1 class="banner-h1 sr-only">{name}</h1>
{#each variants as v, i (i)}
	{#each v.rows as row, r (r)}<span class="line banner-row banner-art v{i}" aria-hidden="true"
			>{row}{#if r === v.rows.length - 1}<span class="cursor">█</span>{/if}</span
		>{/each}
{/each}
<span class="line banner-row banner-fallback" aria-hidden="true"
	><span use:typeIn>{name}</span><span class="cursor">█</span></span
>

<style>
	.banner-art {
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
