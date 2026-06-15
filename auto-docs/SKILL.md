---
name: auto-docs
description: |
  Generates and manages documentation for existing coding projects.
  Use when user says "setup docs", "setup auto-docs", "preview docs", or asks to
  generate, create, update, or add pages to their project documentation.
license: MIT
compatibility: Requires Node.js 18+. Works with Claude Code and Claude.ai. Project must have a package.json or identifiable source directory.
metadata:
  author: arifszn
  version: 2.0.0
---

# auto-docs

Generates and manages documentation for existing coding projects.

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
└── .auto-docs/                 # docs infra — gitignored by default
    ├── package.json
    ├── source.config.ts        # points to ../docs
    ├── app/
    └── lib/
        └── shared.ts           # patched with project name during setup
```

---

## Commands

### `setup docs`

One command. Detects project state and acts accordingly.

| State | `docs/` | `.auto-docs/` | Action |
|-------|---------|---------------|--------|
| Fresh project | ❌ | ❌ | Copy template → patch → install deps → analyze codebase → generate `docs/` |
| Cloned, `.auto-docs/` present | ✅ | ✅ | `npm install` inside `.auto-docs/` only |
| Cloned, `.auto-docs/` missing | ✅ | ❌ | Copy template → patch → install deps → skip content gen |
| Weird state | ❌ | ✅ | Warn user: "`docs/` missing. Ask me to regenerate the docs." |

#### Fresh Project Flow

1. Detect project root (directory containing `package.json` or `src/`)
2. Detect project name from `package.json` → `name` field
3. Copy `template/` from the auto-docs repo into `.auto-docs/`:
   ```bash
   git clone https://github.com/arifszn/auto-docs /tmp/auto-docs-repo
   cp -r /tmp/auto-docs-repo/template <project-root>/.auto-docs
   rm -rf /tmp/auto-docs-repo
   ```
4. Patch `.auto-docs/lib/shared.ts` — replace `appName` with actual project name:
   ```ts
   export const appName = '<ProjectName>';  // replace with actual name
   ```
5. Run `cd .auto-docs && npm install`
6. Analyze codebase — see **Codebase Analysis** section
7. Generate full `docs/` site — see **MDX Generation** section

---

### `preview docs`

```bash
cd .auto-docs && npm run dev
```

Dev server starts at `http://localhost:3000/docs`. Shows the full project docs site.

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

MDX files must NOT use import statements — they live outside `.auto-docs/` and cannot resolve `fumadocs-ui` modules directly. All components are pre-registered globally in `.auto-docs/components/mdx.tsx`.

**Pre-registered (use directly in any MDX file):**

```mdx
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

**Need a component not in the list?** Add it to `.auto-docs/components/mdx.tsx` first:

```ts
import { Steps, Step } from 'fumadocs-ui/components/steps';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Callout, Card, Cards, Tab, Tabs,
    Steps, Step,  // add here
    ...components,
  } satisfies MDXComponents;
}
```

Then use in MDX without any import.

---

## Troubleshooting

**`npm install` fails**
→ Verify Node.js 18+. Try `npm install --legacy-peer-deps` inside `.auto-docs/`

**`../docs` not resolving**
→ Verify `source.config.ts` has `dir: '../docs'`. Verify `docs/` exists at project root, not inside `.auto-docs/`

**Page not appearing in nav**
→ Check filename matches entry in `docs/meta.json` exactly (no `.mdx` extension in meta.json)

**MDX compilation error**
→ Check for unclosed JSX tags, missing imports for components, or invalid frontmatter YAML

**Dev server crash on start**
→ Run `cd .auto-docs && npm run build` to surface full error with line numbers

**Types not resolving on first run**
→ Run `cd .auto-docs && npm run dev` once — type definitions are generated on first startup
