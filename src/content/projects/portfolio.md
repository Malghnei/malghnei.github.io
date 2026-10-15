<script module lang="ts">
	export const metadata = {
		title: 'Website Portfolio',
		summary:
			'This site: browse it like a normal website or drive it from a built-in terminal. Both read from the same content.',
		period: 'Dec. 2023',
		techStack: ['SvelteKit', 'TypeScript', 'Tailwind CSS', 'mdsvex'],
		role: 'solo',
		domain: 'software',
		repoUrl: 'https://github.com/malghnei/malghnei.github.io',
		demoUrl: 'https://malghnei.github.io/'
	};
</script>

## Overview

Most portfolios are a page you scroll. This one is styled like my editor: you can click through it like any website, move around with Vim keys, or open the terminal and explore with commands like `ls`, `cd`, and `open`.

Both views read from the same Markdown files, so they never drift out of sync.

## How It Works

- Each project is a Markdown file with typed metadata, validated when the site builds
- Dynamic routes turn each file into its own page, prerendered as a static site
- One command parser powers the terminal (`help`, `ls`, `cd`, `open`, `cat`)
- Vim-style navigation: `j`/`k` to move, `gg`/`G` to jump, `?` for every shortcut

## Outcome

A portfolio that's fun to explore and easy to maintain: adding a project means adding one Markdown file.
