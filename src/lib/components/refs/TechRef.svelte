<script lang="ts">
	import { encodeTarget } from '$lib/preview/target';
	import { getTagHighlightStyle } from '$lib/tags/tagStyles';

	let { name }: { name: string } = $props();

	const color = $derived(getTagHighlightStyle(name).color);
</script>

<a
	href={`/projects/?tag=${encodeURIComponent(name)}`}
	data-preview={encodeTarget({ kind: 'tech', name })}
	><span class="dim" aria-hidden="true">`</span><span
		class="name"
		style={`color: ${color}; background: color-mix(in srgb, ${color} 12%, transparent)`}>{name}</span
	><span class="dim" aria-hidden="true">`</span></a
>

<style>
	.dim {
		color: var(--nord-3);
		user-select: none;
	}
</style>
