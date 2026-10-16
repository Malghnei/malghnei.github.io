<script lang="ts">
	import { ART_SCALE, artWidth, parseBanner, variantCss } from '$lib/banner/variants';

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
	const css = `<style>${variantCss(variants.map((v) => artWidth(v.width)))}</style>`;
</script>

<svelte:head>
	{@html css}
</svelte:head>

<!-- The rows are siblings of the page's other lines, not children of the h1: Firefox doesn't
     carry a count made inside a non-counting element on to the lines after it, so nesting
     restarted the gutter numbers after the banner. The h1 only names the page for assistive tech. -->
<h1 class="banner-h1 sr-only">{name}</h1>
{#each variants as v, i (i)}
	{#each v.rows as row, r (r)}<span
			class="line banner-row banner-art v{i}"
			style:--art-scale={ART_SCALE}
			aria-hidden="true"
			><span class="art">{row}</span></span
		>{/each}
{/each}
<span class="line banner-row banner-fallback" aria-hidden="true"
	><span>{name}</span></span
>

<style>
	/* The row keeps the body line height so its gutter number spaces like every other line;
	   the art inside is scaled (ART_SCALE) so its natural 1.32 line box fills that row exactly. */
	.banner-art {
		white-space: pre;
		color: var(--nord-8);
	}

	.art {
		display: block;
		font-size: calc(var(--art-scale) * 1em);
		line-height: 1.32;
	}

	.banner-fallback::before {
		content: '# ';
		color: var(--nord-3);
	}
</style>
