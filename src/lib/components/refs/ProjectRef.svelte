<script lang="ts">
	import { encodeTarget } from '$lib/preview/target';

	let { title, slug }: { title: string; slug: string } = $props();
</script>

<a href={`/projects/${slug}/`} data-preview={encodeTarget({ kind: 'project', slug })}
	><span class="dim" aria-hidden="true">[[</span><strong>{title}</strong><span class="dim" aria-hidden="true">]]</span
	></a
>

<style>
	.dim {
		color: var(--nord-3);
		user-select: none;
	}

	strong {
		font-weight: 700;
		color: var(--nord-8);
	}
</style>
