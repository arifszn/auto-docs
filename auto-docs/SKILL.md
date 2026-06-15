---
name: auto-docs
description: |
  Generates and manages Fumadocs-powered documentation for existing coding projects.
  Use when user says "setup docs", "setup auto-docs", "preview docs", or asks to
  generate, create, update, or add pages to their project documentation.
license: MIT
compatibility: Requires Node.js 18+. Works with Claude Code and Claude.ai. Project must have a package.json or identifiable source directory.
metadata:
  author: arifszn
  version: 1.0.0
---

# auto-docs

Generates and manages [Fumadocs](https://fumadocs.vercel.app)-powered documentation for existing coding projects.

`docs/` is a single site covering the **entire project**. There is no per-feature or per-module docs — everything lives together. `preview docs` shows the full site.

## Project Layout

```
<project-root>/
├── src/                        # user's source code
├── docs/                       # MDX content — user-owned, always git tracked
│   ├── meta.json
│   ├── index.mdx
│   ├── getting-started.mdx
│   └── <section>/
│       └── index.mdx
└── .auto-docs/                 # Fumadocs infra — tracked or gitignored per user choice
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

One command. Detects project state and acts accordingly.

| State | `docs/` | `.auto-docs/` | Action |
|-------|---------|---------------|--------|
| Fresh project | ❌ | ❌ | Scaffold `.auto-docs/` → install deps → analyze codebase → generate `docs/` → ask gitignore |
| Cloned, `.auto-docs/` tracked | ✅ | ✅ | `npm install` inside `.auto-docs/` only |
| Cloned, `.auto-docs/` gitignored | ✅ | ❌ | Scaffold `.auto-docs/` → `npm install` → skip content gen |
| Weird state | ❌ | ✅ | Warn user: "`docs/` missing. Ask me to regenerate the docs." |

#### Fresh Project Flow

1. Detect project root (directory containing `package.json` or `src/`)
2. Create `.auto-docs/` with all files from **File Templates** section
3. Run `cd .auto-docs && npm install`
4. Analyze codebase — see **Codebase Analysis** section
5. Generate full `docs/` site — see **MDX Generation** section
6. Ask user:
   ```
   Track .auto-docs/ in git or gitignore it?

   [1] Track  — teammates run 'setup docs' to install deps, infra stays in repo
   [2] Ignore — smaller repo, teammates scaffold .auto-docs/ on first setup
   ```
7. Always append to `.gitignore` regardless of choice:
   ```gitignore
   # auto-docs build artifacts
   .auto-docs/node_modules
   .auto-docs/.next
   .auto-docs/.cache
   ```
8. If user picks **Ignore**, also append:
   ```gitignore
   # auto-docs infra (run 'setup docs' to regenerate)
   .auto-docs/
   ```

---

### `preview docs`

```bash
cd .auto-docs && npm run dev
```

Starts Fumadocs dev server at `http://localhost:3000/docs`. Shows the full project docs site.

---

## Editing Docs

All other doc work is free-form natural language. No explicit commands needed.

Examples of what users might say — and what to do:

| User says | Action |
|-----------|--------|
| "add a page about authentication" | Create `docs/authentication.mdx`, add to `docs/meta.json` |
| "create a new page for the payments flow" | Create `docs/payments.mdx`, add to `docs/meta.json` |
| "update the getting-started page" | Read `docs/getting-started.mdx`, edit in place |
| "my API changed, update the docs" | `git diff --name-only HEAD` → identify affected pages → update them |
| "add a rate limiting section to the API page" | Read relevant MDX file, append section |
| "remove the legacy section from configuration" | Read file, remove that section |

**Always before editing:**
1. Read the existing MDX file if it exists
2. Identify which `docs/meta.json` entries are affected
3. Update `docs/meta.json` if pages are added or removed

---

## Codebase Analysis

Run during `setup docs` on a fresh project to understand what to document.

**Step 1 — Read `package.json`:**
- Project name and description
- Framework: Next.js, Express, NestJS, Fastify, Vite, etc.
- Language: TypeScript or JavaScript
- Key dependencies that shape doc structure

**Step 2 — Read `README.md`:**
- Project purpose and overview
- Install and run steps
- Usage examples and feature list

**Step 3 — Scan source directory:**
- Top-level modules under `src/`, `app/`, `lib/`, `packages/`
- Route files, controller files, exported functions
- Config files (`.env.example`, config schemas)

**Step 4 — Detect project type, adapt doc structure:**

| Project Type | Detection | Doc Structure |
|-------------|-----------|---------------|
| Next.js app | `next` in deps | pages, API routes, components |
| Express/Fastify | `express`/`fastify` in deps | routes, middleware, controllers |
| NestJS | `@nestjs/core` in deps | modules, controllers, services |
| Library/SDK | `main`/`exports` in package.json, no framework | public API, exports, types |
| CLI tool | `bin` field in package.json | commands, flags, config |
| Monorepo | `workspaces` in package.json or `packages/` dir | per-package sections |

---

## MDX Generation

### `docs/meta.json`

```json
{
  "title": "<ProjectName>",
  "pages": [
    "index",
    "getting-started",
    "<section-1>",
    "<section-2>"
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

### `docs/<section>/index.mdx`

```mdx
---
title: <SectionName>
description: <what this covers>
---

## Overview

<what this section covers>

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
→ Run `cd .auto-docs && npm run dev` once — Next.js generates `.source` types on first run
