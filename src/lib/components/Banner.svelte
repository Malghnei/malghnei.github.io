<script lang="ts">
	import { SHADOW_CHARS, sweepColor } from '$lib/banner/sweep';
	import { parseBanner } from '$lib/banner/variants';

	let { name }: { name: string } = $props();

	const files = import.meta.glob<string>('../data/banner*.txt', {
		query: '?raw',
		import: 'default',
		eager: true
	});

	// Art files stack six-row blocks (one per word on the narrow variant); each block sweeps
	// its own width, so a short first name still runs the whole colour range.
	const BLOCK_ROWS = 6;
	const colour = (rows: string[]) =>
		rows.map((row, r) => {
			const start = r - (r % BLOCK_ROWS);
			const block = rows.slice(start, start + BLOCK_ROWS);
			const span = Math.max(1, Math.max(...block.map((line) => line.length)) - 1);
			return [...row].map((ch, x) => ({
				ch,
				color: ch === ' ' ? '' : sweepColor(x / span, SHADOW_CHARS.includes(ch))
			}));
		});

	const variants = [files['../data/banner.txt'], files['../data/banner-mobile.txt']].map((raw) => {
		const { rows, width } = parseBanner(raw);
		return { width, rows: colour(rows) };
	});
</script>

<!-- The art rows are not buffer lines: the cursor skips them and they carry no gutter number.
     The h1 names the page for assistive tech; .banner-h1 keeps it out of the line count. -->
<h1 class="banner-h1 sr-only">{name}</h1>
<div class="art-block" aria-hidden="true">
	{#each variants as v, i (i)}
		<div class="variant v{i}" style:--cols={v.width}>
			{#each v.rows as row, r (r)}
				<div class="art-row">{#each row as cell, x (x)}<span class:solid={cell.ch === '█'} style:--c={cell.color || null}>{cell.ch}</span>{/each}</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.art-block {
		container-type: inline-size;
	}

	/* Sized from the column width so the whole art always fits. */
	.variant {
		font-size: min(calc(100cqw / (var(--cols) * 0.565)), var(--max));
		line-height: 1.28;
		white-space: pre;
		user-select: none;
	}

	/* Each cell is a fixed box, not a glyph advance: small sizes round advances to whole pixels,
	   which would push the art past its column. */
	.art-row span {
		display: inline-block;
		vertical-align: top;
		width: 0.565em;
		color: var(--c);
	}

	/* Full blocks are painted as boxes that bleed slightly into their neighbours. Glyph edges at
	   fractional positions antialias into faint hairlines between cells; filled boxes don't. */
	.art-row .solid {
		background: var(--c);
		box-shadow: 0 0 0 0.03em var(--c);
		color: transparent;
	}

	.v0 {
		--max: 1em;
	}

	.v1 {
		--max: 1.25em;
		display: none;
	}

	@container (width < 840px) {
		.v0 {
			display: none;
		}

		.v1 {
			display: block;
		}
	}
</style>
