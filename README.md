# auto-docs

A Claude skill that generates and manages [Fumadocs](https://fumadocs.vercel.app)-powered documentation for existing coding projects.

## What it does

Point Claude at any coding project and say `setup docs` — auto-docs analyzes your codebase, scaffolds a Fumadocs site, and generates MDX documentation. No manual setup required.

**Two folders, clean separation:**

```
your-project/
├── src/                  # your code
├── docs/                 # MDX content — yours to edit, always git tracked
└── .auto-docs/           # Fumadocs infra — generated, rarely touched
```

## Commands

| Command | What it does |
|---------|-------------|
| `setup docs` | Smart setup — detects project state, scaffolds infra, generates docs |
| `update docs` | Re-analyzes changed files, updates stale pages only |
| `add docs [topic]` | Generates a single doc page for a specific module or feature |
| `preview docs` | Runs Fumadocs dev server at `http://localhost:3000/docs` |

### `setup docs` is smart

It detects your project state automatically:

- **Fresh project** → scaffolds `.auto-docs/`, installs deps, analyzes codebase, generates `docs/`
- **Cloned with `.auto-docs/` tracked** → runs `npm install` only
- **Cloned without `.auto-docs/`** → scaffolds infra, installs deps, skips content gen

On first run it asks whether to track `.auto-docs/` in git or gitignore it.

## Installation

### Claude Code

```bash
# Clone into your Claude skills directory
git clone https://github.com/arifszn/auto-docs ~/.claude/skills/auto-docs
```

### Claude.ai

1. Download this repo as a ZIP
2. Go to **Settings → Capabilities → Skills**
3. Click **Upload skill** and select the ZIP

## Usage

Open any project in Claude and say:

```
setup docs
```

Claude will analyze your project, detect the framework (Next.js, Express, NestJS, CLI, library, etc.), and generate structured Fumadocs documentation.

```
update docs
```

After making code changes, sync your docs.

```
add docs authentication
```

Generate a doc page for a specific feature or module.

```
preview docs
```

Spin up the Fumadocs dev server to see your docs rendered.

## Requirements

- Node.js 18+
- Claude Code or Claude.ai with Skills enabled

## License

MIT
