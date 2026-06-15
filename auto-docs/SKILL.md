---
name: auto-docs
description: |
  Generates and manages Fumadocs-powered documentation for existing coding projects.
  Use when user says "setup docs", "setup auto-docs", "update docs", "add docs [topic]",
  "preview docs", or asks to generate, create, or update documentation for their project.
license: MIT
compatibility: Requires Node.js 18+. Works with Claude Code and Claude.ai. Project must have a package.json or identifiable source directory.
metadata:
  author: arifszn
  version: 1.0.0
---

# auto-docs

Generates and manages [Fumadocs](https://fumadocs.vercel.app)-powered documentation for existing coding projects.

Creates two things inside the project:
- `docs/` — MDX content, user-owned, always git tracked
- `.auto-docs/` — Fumadocs infra (Next.js app), tracked or gitignored per user choice

## Project Layout

```
<project-root>/
├── src/                        # user's source code
├── docs/                       # MDX content — user-owned, git tracked
│   ├── meta.json
│   ├── index.mdx
│   ├── getting-started.mdx
│   └── <module>/
│       └── index.mdx
└── .auto-docs/                 # Fumadocs infra
    ├── package.json
    ├── next.config.mjs
    ├── source.config.ts        # dir: '../docs'
    ├── tsconfig.json
    ├── app/
    │   ├── layout.tsx
    │   ├── docs/
    │   │   ├── layout.tsx
    │   │   └── [[...slug]]/
    │   │       └── page.tsx
    └── lib/
        └── source.ts
```

---

## Commands

### `setup docs`

Detect project state first, then act:

| State | `docs/` | `.auto-docs/` | Action |
|-------|---------|---------------|--------|
| Fresh project | ❌ | ❌ | Scaffold `.auto-docs/` → install deps → analyze codebase → generate `docs/` → ask gitignore |
| Cloned, `.auto-docs/` tracked | ✅ | ✅ | `npm install` inside `.auto-docs/` only |
| Cloned, `.auto-docs/` gitignored | ✅ | ❌ | Scaffold `.auto-docs/` → `npm install` → skip content gen |
| Weird state | ❌ | ✅ | Warn: "docs/ missing. Run `update docs` to regenerate content." |

#### Fresh Project Flow

1. Detect project root (directory containing `package.json` or `src/`)
2. Create `.auto-docs/` with all files from **File Templates** section
3. Run `cd .auto-docs && npm install`
4. Analyze codebase — see **Codebase Analysis** section
5. Generate `docs/` MDX files — see **MDX Generation** section
6. Ask user:
   ```
   Track .auto-docs/ in git or gitignore it?

   [1] Track  — teammates run 'setup docs' to install deps, infra in repo
   [2] Ignore — smaller repo, teammates scaffold .auto-docs/ on first setup
   ```
7. Always append to `.gitignore` (regardless of choice):
   ```gitignore
   # auto-docs build artifacts
   .auto-docs/node_modules
   .auto-docs/.next
   .auto-docs/.cache
   ```
8. If user picks **Ignore**, also append:
   ```gitignore
   # auto-docs infra (teammates run 'setup docs' to regenerate)
   .auto-docs/
   ```

---

### `update docs`

1. Identify changed source files — use `git diff --name-only HEAD` or scan `src/` modification times
2. Map changed files to affected doc pages
3. Re-analyze changed modules only
4. Update corresponding MDX pages in `docs/`
5. If new modules detected, generate new MDX pages and update `docs/meta.json`

---

### `add docs [topic]`

1. Search `src/` for module, file, or feature matching `[topic]`
2. Analyze that specific module/feature
3. Generate a single focused MDX page
4. Add entry to `docs/meta.json` in appropriate position

---

### `preview docs`

```bash
cd .auto-docs && npm run dev
```

Dev server runs at `http://localhost:3000/docs`

---

## Codebase Analysis

Before generating MDX, analyze the project to understand what to document.

**Step 1 — Read `package.json`:**
- Project name and description
- Framework: Next.js, Express, NestJS, Fastify, Vite, etc.
- Language: TypeScript or JavaScript
- Key dependencies that affect documentation structure

**Step 2 — Read `README.md`:**
- Project purpose and overview
- Install steps
- Usage examples
- Any existing feature list

**Step 3 — Scan source directory:**
- Identify top-level modules (`src/`, `app/`, `lib/`, `packages/`)
- List major features/subsystems from folder names and file names
- Check for route files, controller files, exported functions

**Step 4 — Detect project type and adapt docs structure:**

| Project Type | Detection | Docs Structure |
|-------------|-----------|----------------|
| Next.js app | `next` in deps | pages, API routes, components |
| Express/Fastify | `express`/`fastify` in deps | routes, middleware, controllers |
| NestJS | `@nestjs/core` in deps | modules, controllers, services |
| Library/SDK | no framework, has `main`/`exports` in package.json | public API, exports, types |
| CLI tool | `bin` field in package.json | commands, flags, config |
| Monorepo | `workspaces` in package.json or `packages/` dir | per-package docs |

---

## MDX Generation

### `docs/meta.json`

```json
{
  "title": "<ProjectName>",
  "pages": [
    "index",
    "getting-started",
    "<module-1>",
    "<module-2>"
  ]
}
```

For nested sections:
```json
{
  "title": "<ProjectName>",
  "pages": [
    "index",
    "getting-started",
    {
      "type": "folder",
      "name": "<section>",
      "pages": ["overview", "<sub-page>"]
    }
  ]
}
```

### `docs/index.mdx`

```mdx
---
title: <ProjectName>
description: <from README or package.json description>
---

## Overview

<2-3 sentence project summary>

## Features

- <key feature 1>
- <key feature 2>
- <key feature 3>

## Quick Start

<minimal working example from README or inferred from codebase>
```

### `docs/getting-started.mdx`

```mdx
---
title: Getting Started
description: Install and run <ProjectName>
---

## Prerequisites

<Node version, required tools, etc.>

## Installation

<detected package manager install command>

## Configuration

<env vars, config files if detected>

## First Run

<start/dev command from package.json scripts>
```

### `docs/<module>/index.mdx` (per module)

```mdx
---
title: <ModuleName>
description: <what this module does>
---

## Overview

<what this module/feature does>

## Usage

<code example>

## API Reference

<key functions, props, or endpoints>
```

### MDX Component Usage

Use Fumadocs components where appropriate:

```mdx
import { Callout } from 'fumadocs-ui/components/callout'
import { Card, Cards } from 'fumadocs-ui/components/card'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'

<Callout type="warn">Important warning here</Callout>

<Cards>
  <Card title="Feature A" href="/docs/feature-a">Description</Card>
</Cards>

<Tabs items={['npm', 'pnpm', 'yarn']}>
  <Tab value="npm">npm install</Tab>
  <Tab value="pnpm">pnpm add</Tab>
  <Tab value="yarn">yarn add</Tab>
</Tabs>
```

---

## File Templates

### `.auto-docs/package.json`

```json
{
  "name": "auto-docs",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "fumadocs-ui": "latest",
    "fumadocs-core": "latest",
    "fumadocs-mdx": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "@types/react": "latest",
    "typescript": "latest"
  }
}
```

### `.auto-docs/source.config.ts`

```ts
import { defineCollections, defineConfig } from 'fumadocs-mdx/config'

export default defineConfig({})

export const docs = defineCollections({
  type: 'doc',
  dir: '../docs',
})
```

### `.auto-docs/next.config.mjs`

```js
import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
}

export default withMDX(config)
```

### `.auto-docs/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"],
      "@/.source": ["./.source"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `.auto-docs/app/layout.tsx`

```tsx
import { RootProvider } from 'fumadocs-ui/provider'
import type { ReactNode } from 'react'
import 'fumadocs-ui/style.css'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
```

### `.auto-docs/app/docs/layout.tsx`

```tsx
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import type { ReactNode } from 'react'
import { source } from '@/lib/source'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} nav={{ title: 'Docs' }}>
      {children}
    </DocsLayout>
  )
}
```

### `.auto-docs/app/docs/[[...slug]]/page.tsx`

```tsx
import { source } from '@/lib/source'
import { DocsPage, DocsBody } from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import defaultMdxComponents from 'fumadocs-ui/mdx'

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) notFound()

  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc}>
      <DocsBody>
        <h1>{page.data.title}</h1>
        <MDX components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) notFound()
  return { title: page.data.title }
}
```

### `.auto-docs/lib/source.ts`

```ts
import { docs } from '@/.source'
import { createMDXSource } from 'fumadocs-mdx'
import { loader } from 'fumadocs-core/source'

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(docs),
})
```

---

## Troubleshooting

**`npm install` fails**
→ Verify Node.js 18+. Try `npm install --legacy-peer-deps` inside `.auto-docs/`

**`../docs` not resolving**
→ Verify `source.config.ts` has `dir: '../docs'`. Verify `docs/` exists at project root, not inside `.auto-docs/`

**Page not appearing in nav**
→ Check filename matches entry in `docs/meta.json` exactly (no `.mdx` extension in meta.json)

**MDX compilation error**
→ Check for unclosed JSX tags, missing imports for Fumadocs components, or invalid frontmatter YAML

**Dev server crash on start**
→ Run `cd .auto-docs && npx next build` to surface full error with line numbers

**TypeScript errors on `@/.source`**
→ Run `cd .auto-docs && npm run dev` once — Next.js generates the `.source` types on first run
