<script lang="ts">
	import { encodeTarget } from '$lib/preview/target';

	// href is undefined until mount for the email link, which is assembled client-side.
	let { href, label }: { href?: string; label: string } = $props();

	const isMail = $derived(href?.startsWith('mailto:') ?? false);
</script>

<a
	{href}
	target={href && !isMail ? '_blank' : undefined}
	rel={href && !isMail ? 'noreferrer' : undefined}
	data-preview={href ? encodeTarget({ kind: 'link', href, label }) : undefined}
	><span class="dim" aria-hidden="true">[</span>{label}<span class="dim" aria-hidden="true">](↗)</span></a
>

<style>
	.dim {
		color: var(--nord-3);
		user-select: none;
	}
</style>
