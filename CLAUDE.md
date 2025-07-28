# claude.md

this file provides guidance to claude code (claude.ai/code) when working with code in this repository.

## development commands

this is a sveltekit project with static adapter configuration. use these commands:

- `pnpm run dev` - start development server
- `pnpm run build` - build for production (outputs to `build/` directory)
- `pnpm run preview` - preview production build
- `pnpm run check` - run svelte type checking
- `pnpm run lint` - run eslint and prettier checks
- `pnpm run format` - format code with prettier

## architecture overview

### core structure

- **sveltekit 2** - static site generation using `@sveltejs/adapter-static`
- **tailwindcss 4** - styling with vite plugin integration
- **typescript** - type safety
- **three.js + threlte** - 3d graphics (emoti-kun character)

### content management

- **blog/notes system**: markdown files in `/content/notes/` processed with:
  - `gray-matter` - frontmatter parsing
  - `micromark` - gfm extension for rendering
  - date-fns - date formatting
- **self-hosted notes** and **zenn integration** - unified note type
- content imported via vite's `import.meta.glob` with raw query

### key directories

- `src/routes/` - sveltekit routes with file-based routing
- `src/routes/_components/` - shared components including 3d emoti-kun
- `src/lib/` - utility functions and content management
- `content/notes/` - markdown blog posts
- `static/` - static assets including fonts and images

### pre-commit hooks

lefthook is configured to run lint and format commands before commits, with automatic staging of fixed files.

### component architecture

- layout components use svelte 5 syntax
- 3d components built with threlte (three.js wrapper for svelte)
- icon components are self-contained svg svelte components
- note/blog components handle both self-hosted and external content

## rules

### coding style

- always use es modules (import / export), never use commonjs.
- use destructure imports as default. (`import {foo} from 'bar'`)
- implement using svelte 5 runes syntax.

### workflow

- run `pnpm run lint` on written code and fix any errors.
- claude should not run development server checks, users will handle that.
