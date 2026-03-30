# Product Requirements Document (PRD): Developer Portfolio V1.1

## 1. Project Overview
**Product Name:** Developer Portfolio V1.1
**Description:** A highly interactive, dual-interface personal portfolio website designed to showcase software engineering projects, work experience, and extracurricular involvement. The site features a standard web view with a unique "mixed cards and pages" layout, alongside a fully functional, interactive terminal simulation view. It leverages Markdown for seamless content management.
**Target Audience:** Technical recruiters (tech, quantitative finance), hiring managers, and university admissions committees.

## 2. Objectives & Goals
* **Showcase Competency:** Demonstrate strong frontend engineering skills through complex state management (terminal simulation), dynamic routing, and responsive design.
* **Highlight Experience:** Effectively display a timeline of work, volunteering, and club involvements.
* **Feature Key Projects:** Spotlight technical achievements with dedicated, rich-content pages for deep dives into architecture and tech stacks.
* **Stand Out:** Utilize a distinct Neovim/Terminal aesthetic with the Nord color palette to create a memorable user experience.

## 3. Technology Stack
* **Framework:** SvelteKit 
* **Content Management:** `mdsvex` (Markdown for Svelte) for parsing `.svx` or `.md` files into Svelte components.
* **Styling:** Tailwind CSS
* **Deployment:** Vercel, Netlify, or GitHub Pages (Adapter to be determined)
* **Version Control:** Git / GitHub

## 4. Design & UX Guidelines
* **Theme:** Neovim / Bash Terminal aesthetic.
* **Color Palette:** Nord Theme.
    * Backgrounds: Deep blues/grays (`#2e3440`, `#3b4252`, `#434c5e`).
    * Accents/Text: Nord Frost (`#8fbcbb`, `#88c0d0`, `#81a1c1`, `#5e81ac`) and Snow Storm.
* **Typography:** Monospace globally (e.g., JetBrains Mono, Fira Code).
* **UI Components:** Sharp edges (no rounded corners), high contrast, minimalistic borders.
* **Layout Structure:** A hybrid architecture utilizing a mix of modular cards for digestible summaries and full pages for deep dives.

## 5. Core Features & Requirements

### 5.1 Standard Web Interface
The primary GUI mode for general users, utilizing standard routing and the mixed cards/pages layout.

* **Vertical One-Pager Home (`/`):**
    * **Hero Section:** Terminal-style `whoami` introduction.
    * **Experience Timeline:** Vertical chronological display of work, volunteering, and clubs.
    * **Featured Projects Hub:** Exactly three highlighted projects presented as Neovim-style floating window cards, linking to their dedicated pages.
    * **Miscellaneous Section:** Quick links, current reading list, or contact info.
* **About Page (`/about`):** Detailed narrative of the developer's background and software engineering journey.
* **Projects Library (`/projects`):** * A comprehensive grid/list view of all past and current technical projects.
    * **Search & Filter:** A real-time search input and interactive toggle tags to filter projects by Tech Stack (e.g., "SvelteKit", "Flutter", "Java", "Python").
* **Dedicated Project Pages (`/projects/[slug]`):** * Dynamically routed pages generated via `mdsvex`.
    * Contains in-depth details, architectural diagrams/images, a designated tech stack list, and links to source code/live demos.
* **Expansion Page (`/other`):** Placeholder route for future content.
* **View Toggle:** A prominent UI switch to transition instantly between the Standard View and Terminal View.

### 5.2 Interactive Terminal Interface (`/terminal`)
A secondary, immersive CLI mode simulating a Linux environment.

* **Fullscreen CLI:** Strips away standard web navigation, presenting a pure terminal window.
* **Command Parser Engine:** Custom logic to interpret and execute user inputs.
* **Supported Commands:**
    * `help`: Outputs a directory of all available commands.
    * `ls`: Lists available virtual directories (`about`, `projects`, `experience`, `contact`).
    * `cd <directory>`: Changes the active context/path.
    * `cat <filename>`: Reads and outputs the specific content data. If reading a project file (e.g., `cat 2d-physics.md`), it will output the raw markdown text or a beautifully formatted terminal equivalent.
    * `clear`: Wipes the current terminal output history.
* **State Persistence:** Maintains command history allowing users to cycle through previous inputs using the `Up` and `Down` arrow keys.

## 6. Out of Scope (For V1)
* Backend database integration (all data statically managed via local JSON and `mdsvex` Markdown files).
* User authentication or login systems.
* Complex animations that detract from the stark terminal aesthetic.

## 7. Milestones & Phased Execution
* **Phase 1: Foundation.** Setup SvelteKit, integrate Tailwind, configure `mdsvex` for Markdown parsing, and establish the global Nord theme variables.
* **Phase 2: Shell & Content Architecture.** Build the `+layout.svelte` shell. Create the directory structure for the Markdown files and set up the dynamic routing logic for `/projects/[slug]`.
* **Phase 3: GUI Development (Core).** Populate the standard web view with the timeline, hero section, and the layout for individual `mdsvex` project pages.
* **Phase 4: GUI Development (Interactive).** Implement the projects gallery on `/projects` including the state logic for the live search bar and tech stack filtering.
* **Phase 5: CLI Development.** Build the terminal interface, implement the command parser, and wire up the mock file system logic to read from the project metadata.
* **Phase 6: Refinement.** Audit accessibility, ensure mobile responsiveness, and finalize content ingestion.