---
name: auto-docs
description: |
  Generates and manages documentation for existing coding projects.
  Use when user says "setup docs", "setup auto-docs", "preview docs", or asks to
  generate, create, update, or add docs to their project documentation.
license: MIT
compatibility: Requires Node.js 18+.
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
└── .auto-docs/                 # docs infra
    ├── package.json
    ├── source.config.ts        # points to ../docs
    ├── app/
    └── lib/
        └── shared.ts
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

1. Detect project root
2. Copy `assets/template/` from the skill directory into `.auto-docs/`:
   ```bash
   cp -r <skill-base-dir>/assets/template <project-root>/.auto-docs
   ```
   The skill base directory is shown at the top of every skill invocation (`Base directory for this skill: ...`).
4. Run `cd .auto-docs && npm install`
5. Analyze codebase — see **Codebase Analysis** section
6. Generate full `docs/` site — see **MDX Generation** section

---

### `preview docs`

```bash
cd .auto-docs && npm run dev -- --port 4141
```

Dev server starts at `http://localhost:4141/docs`. Shows the full project docs site.

---

## Editing Docs

All other doc work is free-form natural language. No explicit commands needed.

Examples of what users might say — and what to do:

| User says | Action |
|-----------|--------|
| "add a doc about authentication" | Create `docs/authentication.mdx`, add to `docs/meta.json` |
| "create a new doc for the payments flow" | Create `docs/payments.mdx`, add to `docs/meta.json` |
| "update the getting-started doc" | Read `docs/getting-started.mdx`, edit in place |
| "my API changed, update the docs" | `git diff --name-only HEAD` → identify affected docs → update them |
| "add a rate limiting section to the API doc" | Read relevant MDX file, append section |
| "remove the legacy section from configuration" | Read file, remove that section |

**Always before editing:**
1. Read the existing MDX file if it exists
2. Identify which `docs/meta.json` entries are affected
3. Update `docs/meta.json` if docs are added or removed

---

## Codebase Analysis

Run during `setup docs` on a fresh project to understand what to document.

**Step 1 — Identify Project Type:**
- Check for `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, or similar config files if they exist.
- Determine language (e.g., TypeScript, Python, Go, Rust) and framework.
- Identify key dependencies that shape doc structure.
- Extract project description.

**Step 2 — Read `README.md`:**
- Project purpose and overview
- Install and run steps
- Usage examples and feature list

**Step 3 — Scan source directory:**
- Top-level modules under `src/`, `app/`, `lib/`, `packages/`, or the root directory.
- Route files, controller files, exported functions.
- Config files (`.env.example`, config schemas).

Use these findings to dynamically adapt the documentation structure for the project.

---

## MDX Generation

### `docs/meta.json`

```json
{
  "title": "Docs",
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
  "title": "Docs",
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
title: Overview
description: <from README or description>
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
description: Install and run the project
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
