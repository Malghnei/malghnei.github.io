# IDE Redesign — Design Spec

**Date:** 2026-10-11
**Status:** Approved in conversation, pending written-spec review
**Branch:** `redesign`

## Goal

Revamp the portfolio so it's appealing and easy to use while keeping the terminal aesthetic, made cleaner, more minimal and more modern. Every page looks like a file open in nvim/LazyVim: line numbers, a typing feel, markdown-like formatting, square corners, a navbar (bufferline) and a status bar (lualine). Section boxes go away. Project cards are the only container left.

### Success criteria

- Every page reads like a markdown buffer, with a line-number gutter, `~` filler lines and a cursor line.
- The only boxed elements are project cards, drawn with ASCII-style borders and square corners.
- Featured projects sit directly under the description on Home.
- Projects can be filtered by role (solo / contribution) and domain (software / hardware).
- The terminal opens as a draggable, resizable window over the current page instead of a separate route.
- The site works on mobile (375px), with keyboard only, and with reduced motion enabled.

### Constraints

- Stack stays: SvelteKit 2 + Svelte 5 (runes), Tailwind 4, mdsvex, `adapter-static`, deployed to GitHub Pages.
- Nord palette stays: the existing `--nord-0` … `--nord-15` tokens in `src/routes/layout.css`.
- Every route stays prerendered (`prerender = true`, `trailingSlash = 'always'`).

## Decisions

| Topic | Decision |
|---|---|
| `/projects` | Kept as the full filterable list. Home shows featured projects plus a `→ see all projects` link. |
| Experience timeline | Moves from Home to About. |
| Setup, misc | Move from Home to About. |
| Links / contact | Last section of Home, as markdown-style links. The X and Instagram placeholders are removed. |
| `/other` | Removed from the navbar and deleted. |
| Terminal | Draggable, resizable, minimizable, maximizable floating window. Full-screen on mobile. |
| Typing feel | Subtle: heading types in, lines reveal within 300ms total, blinking block cursor. All of it is off under reduced motion. |
| Categorization UI | Filter toggles on `/projects`. Each card is labeled `role · domain`. |
| Keyboard | Light set: `j`/`k`, `gg`/`G`, `1`/`2`/`3`, `Space`+`h`/`a`/`p`, `Ctrl+/`, `?`. |
| Line numbers | CSS counters, one number per block element (approach 1). |

## 1. Layout and shell

```
 home.md   about.md   projects/                      [>_]
─────────────────────────────────────────────────────────────
  1  # Malik Alghneimin█
  2  Aspiring Software Engineer
  3
  4  I build stuff.
  5
  6  ## featured
  7  ┌─ condimental ──────────── apr 2026 ┐
  8  │ vision app that rates mayo pairings │
  9  │ solo · software   react · node      │
 10  └─────────────────────────────────────┘
 11  → see all projects
  ~
  ~
─────────────────────────────────────────────────────────────
 NORMAL │ ~/home.md │ [terminal] │        utf-8 │ md │ 6:1
```

The whole app fills one viewport. The navbar and status bar are fixed, and the buffer scrolls between them.

### Navbar (`Navbar.svelte`)
- Styled as a bufferline: one tab per page, `home.md`, `about.md`, `projects/`.
- The active tab gets a Nord-8 underline and a bright foreground. On a detail page it reads `projects/<slug>.md`.
- The `[>_]` button on the right toggles the terminal.
- One line tall, no shadow, no border radius.

### Buffer (`Buffer.svelte`)
- Fixed-width gutter, with right-aligned line numbers in Nord-3.
- The current line's number is bright, and its row gets a faint `cursorline` background.
- Content max width is about `80ch`.
- `~` filler lines take up any remaining viewport height below the content.
- Owns the gutter numbering (see §2) and cursor-line tracking.

### Status bar (`StatusBar.svelte`)
- Left side: mode pill (`NORMAL` / `TERMINAL`), then the file path, then a `[terminal]` tab shown only while the terminal is minimized.
- Right side: `utf-8 │ md │ line:col`.
- `line:col` follows the last clicked line, or the line nearest the middle of the view when scrolling.
- Flat, square, lualine-style segments.

### Visual rules
- `border-radius: 0` everywhere.
- No shadows. No section boxes or panel backgrounds, except project cards.
- One font size for body text and headings. Headings are told apart by color and a `#` / `##` prefix.
- Dividers are drawn with `─`.
- JetBrains Mono, self-hosted under `static/fonts/` (no Google Fonts request).

### Mobile (< 640px)
- The gutter narrows to two digits.
- Navbar tabs scroll sideways.
- The status bar drops `utf-8` and `md`.
- The terminal opens full-screen.

### Structure
- `src/routes/+layout.svelte` renders `<Navbar>`, `<Buffer>{children}</Buffer>`, `<StatusBar>` and `<TerminalWindow>`, and registers the global keymap listener.
- Shared state lives in `src/lib/editor/state.svelte.ts`, a Svelte 5 runes module, and holds:
  - `cursorLine`, `cursorCol`
  - `mode: 'NORMAL' | 'TERMINAL'`
  - `terminal: { status: 'closed' | 'open' | 'minimized'; maximized: boolean; rect }`
  - terminal session lines and command history
- Removed: `ViewToggleFab.svelte`, `constants/viewToggle.ts`, and the `isTerminalRoute` branch in the layout.

## 2. Pages

### Line numbering

Inside `<Buffer>`, each of these counts as one line through a CSS `counter-increment`, shown in the gutter with `::before`:
- headings
- `p`
- `li`
- `hr`
- `pre` (one number per block)
- the `<Blank />` spacer component

A wrapped paragraph gets one number, like nvim with `wrap` on. Section spacing uses `<Blank />` lines, not margins. mdsvex output on detail pages is numbered by the same selectors.

`ProjectCard.svelte` renders 4 numbered rows: top border with the title and period, summary, labels (`role · domain` plus the tech stack), and bottom border. The card borders use real CSS borders styled to look like box-drawing characters, so the card stays responsive.

### Home: `src/routes/+page.svelte` (`~/home.md`)
```
# Malik Alghneimin█           ← typeIn
Aspiring Software Engineer

I build stuff.

## featured
<ProjectCard> × featured projects
→ see all projects

## links
[github]  [linkedin]  [email]
```

### About: `src/routes/about/+page.svelte` (`~/about.md`)
```
# about
<siteContent.aboutNarrative paragraphs>

## experience
- sep 2025 → present   Developer @ WEAP           extracurricular
    Developed algorithms for autonomous vehicle navigation…

## setup
ide ............ Cursor
os ............. Arch Linux (KDE Plasma)

## misc
currently:
- Vibe coding random projects 🤖
```
- The experience category tag is right-aligned and colored as on today's Home.
- The setup dotted leaders collapse to `key: value` under 640px.
- The about narrative stays as the existing placeholder (`W.` / `I.` / `P.`). Malik writes the real text. It is not generated.

### Projects: `src/routes/projects/+page.svelte` (`~/projects/`)
```
# projects
/search…█
role: [all] solo  contribution
type: [all] software  hardware
tags: react  svelte  python  …
─────────────────────────
<ProjectCard> × matching projects (one column)
```
- The active role and type option shows as `[x]`. The other options are plain text buttons.
- Tags are toggle buttons. Selected tags use the existing `getTagChipStyle`.
- An empty result shows `-- no matches --`.

### Project detail: `src/routes/projects/[slug]/+page.svelte` (`~/projects/<slug>.md`)
```
---
title: Condimental
period: apr 2026
role: solo · type: software
stack: react · express.js · node.js · cloudflare workers ai
---
[source]  [demo]
<mdsvex body, with inline tech highlighting via highlightTechStackInElement>
```

### Error: `src/routes/+error.svelte` (new)
`E37: no such file: <path>`, followed by `→ go home`.

### Removed
`src/routes/other/` and its navbar entry.

## 3. Project data

### Frontmatter
Two new required fields on every project:
```ts
role: 'solo' | 'contribution';
domain: 'software' | 'hardware';
```
`ProjectFrontmatter` in `src/lib/types.ts` gets both fields.

### Validation
`getAllProjects()` and `getProjectBySlug()` in `src/lib/content/projects.ts` check the metadata through `validateProjectMetadata(slug, metadata)`. A missing or invalid `role` or `domain` throws an error naming the file, such as `condimental.md: invalid role "Solo"`, which fails the build.

### Featured projects
The frontmatter `featured: true` flag is the only source. `siteContent.featuredProjectSlugs` is deleted.

### Assignments (confirmed)

| project | role | domain | featured |
|---|---|---|---|
| condimental | solo | software | yes |
| sentiment-analysis | solo | software | yes |
| qiyami | solo | software | yes |
| 2d-physics-simulation | solo | software | no |
| portfolio | solo | software | no (currently `true`, change to `false`) |
| staying-alive | contribution | software | no |

### Filtering
`src/lib/content/filter.ts` exports `filterProjects(projects, { query, role, domain, tags })`:
- `query`: case-insensitive match on title, summary or any techStack entry. An empty query matches everything.
- `role` / `domain`: `'all'` or an exact match.
- `tags`: a project must have every selected tag (AND). An empty list matches everything.

## 4. Terminal window

### Components
- `src/lib/components/terminal/TerminalWindow.svelte`: frame, title bar (`═ terminal ═══ _ □ x`), drag, resize, minimize, maximize.
- `src/lib/components/terminal/TerminalSession.svelte`: output lines, input and arrow-key history, taken from the current `src/routes/terminal/+page.svelte`. It has no window logic.

### Geometry
- `src/lib/editor/geometry.ts` exports `clampRect(rect, viewport, min)`:
  - enforces a minimum size of 360×200
  - keeps the window fully inside the viewport
  - when the viewport is smaller than the minimum, fills the viewport
- Dragging is done with pointer events on the title bar and `setPointerCapture`.
- Resizing uses 8 handles: 4 edges and 4 corners.
- `clampRect` runs again on every viewport `resize`.
- On first open, the window is centered at 70% × 60% of the buffer area.
- The rect is saved to `sessionStorage` and restored on the next open. Every access is wrapped in try/catch, falling back to the default.
- Under 640px the window is always full-screen, with no drag or resize handles.

### States

| action | result |
|---|---|
| `[>_]` in the navbar, `Ctrl+/` | toggle open / closed (opens from minimized) |
| `_` | minimized; `[terminal]` tab shows in the status bar, and clicking it reopens |
| `□`, or double-click the title bar | toggle `maximized` (fills the buffer area) |
| `x`, `Esc` (focus inside the terminal), `exit` | closed |

- Session lines and history live in editor state. They survive minimize, close and navigation, and are cleared only by `clear` or a full reload.
- Opening focuses the input and sets mode to `TERMINAL`.
- Closing or minimizing sets mode to `NORMAL` and returns focus to the button that opened it.

### Command changes (`src/lib/terminal/commands.ts`)
- `TerminalExecutionResult` gets `navigate?: string` and `close?: boolean`. The window carries these out with `goto()` and a state change.
- `cd home|about|projects` returns `navigate` to `/`, `/about/` or `/projects/`. `cd /` and `cd ..` go to `/`. Any other target keeps the existing error.
- `open <slug>` (new) returns `navigate: /projects/<slug>/` if the slug exists, otherwise `open: <slug>: No such project`.
- `exit` (new) returns `close: true`.
- `ls` lists project files with role and domain, e.g. `condimental.md  solo · software`.
- `help` lists the new commands. `cat` and `clear` are unchanged.
- `getAllProjects()` moves into the root `src/routes/+layout.ts` load, so `data.projects` is available everywhere.

### Accessibility
- The window is `role="dialog"` with `aria-label="terminal"` and is not modal.
- Each title-bar button has an `aria-label`.
- Dragging is pointer-only. Keyboard users have the maximize and close buttons.

### Legacy `/terminal`
`src/routes/terminal/+page.svelte` is replaced with a prerendered stub:
- on mount it opens the terminal and calls `goto('/', { replaceState: true })`
- its `<head>` has `<meta http-equiv="refresh" content="0; url=/">` as a no-JS fallback

`src/routes/terminal/+page.ts` is deleted, because projects now come from the layout load.

## 5. Keyboard and motion

### Keymap (`src/lib/editor/keymap.ts`)

| key | action |
|---|---|
| `j` / `k` | scroll 3 lines down / up and move the cursor line |
| `gg` / `G` | top / bottom |
| `1` `2` `3` | go to `/`, `/about/`, `/projects/` |
| `Space` then `h` `a` `p` | same as `1` `2` `3` |
| `Ctrl+/` | toggle terminal |
| `?` | toggle the which-key popup (`WhichKey.svelte`); `Esc` closes it |

- A pure `resolve(pending, event)` returns `{ action } | { pending } | { passthrough }`. Sequences time out after 800ms.
- `Space` with no follow-up key within 800ms runs the native page-down scroll.
- Shortcuts are ignored when `event.target` is an `input`, a `textarea`, a contenteditable element, or inside the terminal. `Ctrl+/` is the exception.
- Key presses with Alt or Meta, or with Ctrl other than `Ctrl+/`, pass through untouched.
- One `keydown` listener, registered in `+layout.svelte`.
- Scrolling uses `behavior: 'smooth'`, or `'auto'` under reduced motion.

### Motion
- **`typeIn` action** (`src/lib/editor/typeIn.ts`, about 20 lines):
  - The heading text is in the prerendered HTML.
  - On mount the action clears it and types it back at about 40ms per character, followed by a block cursor `█`.
  - It replaces the `typewriter-effect` package.
- **Line reveal:** a CSS fade-in delayed by `min(var(--line-index) * 15ms, 240ms)` with a 60ms fade, so the whole page has revealed within 300ms.
- **Cursor blink:** `@keyframes` using `steps(1)`.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, there is no type-in, no reveal and no blink.
- **Navigation:** effects replay on every page visit.

### Dependencies
- Remove `typewriter-effect`.
- Remove `node-emojis`. Confirmed unused; only `node-emoji` is imported.
- Keep `node-emoji`.
- Add `vitest` as a dev dependency.

## 6. Testing and verification

### Unit tests (Vitest)

| unit | cases |
|---|---|
| `filterProjects` | query matches title, summary and stack; tag AND; role filter; domain filter; combined filters; no matches |
| `clampRect` | minimum size; clamped at all 4 edges; viewport smaller than the minimum |
| `keymap.resolve` | single keys; `gg`; `Space h/a/p`; sequence timeout; Space falls back to scroll; ignored in inputs; modifier passthrough; `Ctrl+/` inside an input |
| `validateProjectMetadata` | valid; missing role; invalid domain; error message names the file |
| `executeTerminalCommand` | `cd about` → navigate; `cd nope` → error; `open <slug>`; `open` with a bad slug; `exit` → close; `help`, `ls`, `cat`, `clear` unchanged |

Svelte components are not unit-tested. They're checked by hand in a browser.

### Done when
1. `npm run check` reports 0 errors.
2. `npx vitest run` passes.
3. `npm run build` prerenders `/`, `/about/`, `/projects/`, all 6 project pages, and `/terminal/`.
4. Manual browser check at 1440px and 375px:
   - every page renders and the gutter lines up
   - the terminal opens, drags, resizes, minimizes, maximizes and closes
   - keymap works and is ignored in the search input
   - reduced motion turns off all animation
   - no console errors

## Out of scope

- Writing the about narrative or project write-ups.
- A light theme.
- A `:` command line, or vim-style cursor movement between links.
- Relative line numbers.
- Reviving `/other`.
