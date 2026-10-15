<script lang="ts">
	import '@fontsource/jetbrains-mono/400.css';
	import '@fontsource/jetbrains-mono/700.css';
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import Buffer from '$lib/components/editor/Buffer.svelte';
	import Navbar from '$lib/components/editor/Navbar.svelte';
	import PreviewPane from '$lib/components/preview/PreviewPane.svelte';
	import StatusBar from '$lib/components/editor/StatusBar.svelte';
	import TerminalWindow from '$lib/components/terminal/TerminalWindow.svelte';
	import { goto } from '$app/navigation';
	import WhichKey from '$lib/components/editor/WhichKey.svelte';
	import {
		isEditableTarget,
		resolveKey,
		resolveTimeout,
		SEQUENCE_TIMEOUT_MS,
		type KeyAction
	} from '$lib/editor/keymap';
	import { editor, toggleTerminal } from '$lib/editor/state.svelte';
	import { siteContent } from '$lib/data/site';
	import { setRefsContext } from '$lib/refs/context';
	import { buildDictionary } from '$lib/refs/tokenize';

	let { children, data } = $props();

	// A getter, so readers always see the dictionary for the current data.
	const dict = $derived(buildDictionary(data.projects));
	setRefsContext({
		get dict() {
			return dict;
		}
	});

	let buffer = $state<ReturnType<typeof Buffer> | undefined>();
	let pending = '';
	let pendingTimer: ReturnType<typeof setTimeout> | undefined;

	const runAction = (action: KeyAction) => {
		switch (action.type) {
			case 'scroll':
				return buffer?.moveCursor(action.lines);
			case 'top':
				return buffer?.scrollToEdge('top');
			case 'bottom':
				return buffer?.scrollToEdge('bottom');
			case 'pageDown':
				return buffer?.pageDown();
			case 'pageUp':
				return buffer?.pageUp();
			case 'goto':
				return goto(action.path);
			case 'toggleTerminal':
				return toggleTerminal();
			case 'toggleHelp':
				editor.helpOpen = !editor.helpOpen;
				return;
			case 'closeHelp':
				editor.helpOpen = false;
				return;
			case 'open': {
				const target = editor.preview;
				if (!target) return;
				if (target.kind === 'project') return goto(`/projects/${target.slug}/`);
				if (target.kind === 'tech') return goto(`/projects/?tag=${encodeURIComponent(target.name)}`);
				// window.open on mailto: can leave a blank tab behind.
				if (target.href.startsWith('mailto:')) location.href = target.href;
				else window.open(target.href, '_blank', 'noreferrer');
				return;
			}
		}
	};

	const onkeydown = (event: KeyboardEvent) => {
		if (event.defaultPrevented) return;
		// Space or Enter on a focused button or link keeps its native meaning.
		if ((event.key === ' ' || event.key === 'Enter') && event.target instanceof Element && event.target.closest('button, a, summary')) return;

		const result = resolveKey(pending, {
			key: event.key,
			ctrlKey: event.ctrlKey,
			altKey: event.altKey,
			metaKey: event.metaKey,
			inEditable: isEditableTarget(event.target),
			onBody: event.target === document.body || event.target === document.documentElement
		});
		pending = '';
		clearTimeout(pendingTimer);

		if (result.kind === 'passthrough') return;
		if (result.kind === 'pending') {
			event.preventDefault();
			pending = result.pending;
			pendingTimer = setTimeout(() => {
				const action = resolveTimeout(pending);
				pending = '';
				if (action) runAction(action);
			}, SEQUENCE_TIMEOUT_MS);
			return;
		}
		// Escape stays unprevented so it can still close browser UI.
		if (result.action.type !== 'closeHelp') event.preventDefault();
		runAction(result.action);
	};
</script>

<svelte:window {onkeydown} />

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Malik's Portfolio</title>
	<meta name="description" content="Welcome to my Web Portfolio" />
</svelte:head>

<div class="app">
	<Navbar />
	<div class="workspace">
		<div class="main">
			<Buffer bind:this={buffer}>
				{@render children()}
			</Buffer>
		</div>
		<PreviewPane projects={data.projects} links={siteContent.links.items} />
		<TerminalWindow projects={data.projects} />
		<WhichKey />
	</div>
	<StatusBar />
</div>

<style>
	.app {
		height: 100dvh;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		/* minmax(0, …): don't let the navbar's tab strip widen the whole app on phones */
		grid-template-columns: minmax(0, 1fr);
	}

	.workspace {
		position: relative;
		min-height: 0;
		display: flex;
		flex-direction: row;
	}

	/* Shrinkable: between 1280px and ~1376px the buffer's full width plus the pane's 40ch minimum
	   don't fit, and the buffer gives up the difference rather than overflowing the window. */
	.main {
		flex: 0 1 calc(80ch + var(--gutter) + 1ch);
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	/* The preview pane is hidden here, so the buffer takes the whole width as before. */
	@media (max-width: 1279px), (hover: none) {
		.main {
			flex: 1;
		}
	}
</style>
