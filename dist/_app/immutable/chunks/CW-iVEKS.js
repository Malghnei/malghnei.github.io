const t=`<script module lang="ts">
	export const metadata = {
		title: 'Website Portfolio',
		summary:
			'An interactive portfolio with a standard GUI and a command-driven terminal mode powered by shared content sources.',
		period: 'Dec. 2023',
		techStack: ['SvelteKit', 'TypeScript', 'Tailwind CSS', 'mdsvex'],
		featured: true,
		repoUrl: 'https://github.com/',
		demoUrl: 'https://example.com/'
	};
<\/script>

## Overview

This project explores how to present a software profile through two interfaces:
web-native navigation and terminal-style interaction. Both surfaces are backed by
the same content model to avoid drift.

## Architecture

- Dynamic routes for project detail pages
- Markdown-driven content pipeline with metadata
- Shared command parser for CLI mode

## Outcome

The result is a memorable portfolio experience that still remains practical to
maintain and extend.
`;export{t as default};
