<script lang="ts">
	import { decodeGlyph, settleAt } from '$lib/banner/decode';
	import { SHADOW_CHARS, sweepColor } from '$lib/banner/sweep';
	import { parseBanner } from '$lib/banner/variants';
	import { markIntroPlayed, shouldPlayIntro } from '$lib/editor/intro';
	import { getSessionStorage } from '$lib/editor/persist';
	import { onMount } from 'svelte';

	let { name, decoding = $bindable(false) }: { name: string; decoding?: boolean } = $props();

	let block: HTMLElement;
	let frame = 0;
	type Cell = { text: Text; ch: string; span: HTMLElement; at: number; seed: number; settled: boolean };
	let cells: Cell[] = [];

	const settle = (cell: Cell) => {
		cell.settled = true;
		cell.text.nodeValue = cell.ch;
		cell.span.style.opacity = '';
		if (cell.ch === '█') cell.span.classList.add('solid');
	};

	// Any key, click or wheel ends it at once; the key still does its own job.
	const finish = () => {
		if (!decoding) return;
		cancelAnimationFrame(frame);
		cells.forEach((cell) => cell.settled || settle(cell));
		decoding = false;
	};

	// Both variants decode together, so one revealed by a resize mid-way is never left scrambled.
	onMount(() => {
		const reveal = () => document.documentElement.classList.remove('intro');
		const storage = getSessionStorage();
		if (matchMedia('(prefers-reduced-motion: reduce)').matches || !shouldPlayIntro(storage)) return reveal();
		markIntroPlayed(storage);
		cells = [...block.querySelectorAll<HTMLElement>('.variant')].flatMap((variant) => {
			const width = Number(variant.style.getPropertyValue('--cols'));
			return [...variant.querySelectorAll('.art-row')].flatMap((row) =>
				[...row.children].flatMap((span, col) => {
					const text = span.firstChild;
					if (!(span instanceof HTMLElement) || !(text instanceof Text) || text.nodeValue === ' ') return [];
					return [{ text, ch: text.nodeValue ?? '', span, at: settleAt(col, width, Math.random()), seed: Math.random(), settled: false }];
				})
			);
		});
		decoding = true;
		const start = performance.now();
		const step = (now: number) => {
			const elapsed = now - start;
			let pending = false;
			for (const cell of cells) {
				if (cell.settled) continue;
				if (elapsed >= cell.at) {
					settle(cell);
					continue;
				}
				pending = true;
				cell.text.nodeValue = decodeGlyph(elapsed, cell.seed);
				cell.span.classList.remove('solid');
				cell.span.style.opacity = '0.4';
			}
			if (pending) frame = requestAnimationFrame(step);
			else finish();
		};
		// The first frame runs now, so the screen is revealed already scrambled.
		step(start);
		reveal();
		return finish;
	});

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
<svelte:window onkeydown={finish} onpointerdown={finish} onwheel={finish} />

<h1 class="banner-h1 sr-only">{name}</h1>
<div class="art-block" aria-hidden="true" bind:this={block}>
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
