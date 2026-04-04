# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm run dev` - start development server
- `pnpm run build` - build for production
- `pnpm run preview` - preview production build
- `pnpm run check` - run svelte type checking
- `pnpm run lint` - run eslint and prettier checks
- `pnpm run format` - format code with prettier
- `pnpm run deploy` - build and deploy to Cloudflare Workers

## Architecture Overview

### Core Structure

- **SvelteKit 2** with `@sveltejs/adapter-cloudflare` for Cloudflare Workers deployment
- **Static Site Generation** - `prerender = true` in `+layout.ts`, all pages are pre-rendered at build time
- **TailwindCSS 4** - styling with vite plugin integration
- **TypeScript** - type safety throughout
- **Three.js + Threlte** - 3D graphics (emoti-kun character on homepage)

### Content Management (Notes/Blog)

Markdown files are processed using **mdsvex** with the following pipeline:

- `contents/notes/*.md` - markdown posts with frontmatter
- **shiki** - syntax highlighting (catppuccin-mocha theme)
- **remark-gfm** - GitHub Flavored Markdown support
- **rehype-slug + rehype-autolink-headings** - automatic heading links
- **zod** - frontmatter validation via `selfNoteMetadataSchema`

Frontmatter schema (required fields):

```yaml
title: string
emoji: string
published_at: string (date)
published: boolean
```

Content is loaded via `import.meta.glob` and rendered as Svelte components.

### Key Directories

- `src/routes/` - SvelteKit file-based routing
- `src/routes/_components/` - shared components (emoti-kun 3D scene, footer, etc.)
- `src/routes/notes/_lib/` - note-related utilities and types
- `contents/notes/` - markdown blog posts
- `src/ogp/` - OGP image generation with satori + sharp

### Pre-commit Hooks

Lefthook runs lint and format commands before commits with automatic staging of fixed files.

## Rules

### Coding Style

- Always use ES modules (import/export), never CommonJS
- Use destructured imports: `import { foo } from 'bar'`
- Implement using Svelte 5 runes syntax

### Workflow

- Run `pnpm run lint` on written code and fix any errors
- Do not run the development server; users will handle that
