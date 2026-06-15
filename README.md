# auto-docs

An agent skill that generates and manages documentation for existing coding projects.

## What it does

Say `setup docs` — auto-docs analyzes your codebase, scaffolds a docs site, and generates content covering your entire project. Preview it at `http://localhost:4141/docs`.

**Two folders, clean separation:**

```
your-project/
├── src/                  # your code
├── docs/                 # MDX content — yours to edit, always git tracked
└── .auto-docs/           # docs infra — gitignored by default
```

## Commands

| What you say | What happens |
|-------------|-------------|
| `setup docs` | Detects project state, scaffolds infra if needed, generates docs |
| `preview docs` | Starts dev server at `http://localhost:4141/docs` |

Everything else is natural language:

- "add a doc about authentication"
- "create a new doc for the payments flow"
- "update the getting-started doc"
- "my API changed, update the docs"
- "add a rate limiting section to the API doc"

## `setup docs` is smart

Detects your state automatically:

- **Fresh project** → copies bundled template, installs deps, analyzes codebase, generates `docs/`
- **Cloned, `.auto-docs/` present** → runs `npm install` only
- **Cloned, `.auto-docs/` missing** → copies template, installs deps, leaves `docs/` untouched

## Installation

### Claude Code

```bash
git clone https://github.com/arifszn/auto-docs /tmp/auto-docs-repo
cp -r /tmp/auto-docs-repo/auto-docs ~/.claude/skills/auto-docs
rm -rf /tmp/auto-docs-repo
```

### Other Coding Agents

Agents such as Codex, Kimi Code, OpenCode, Gemini CLI, or other local coding assistants can use the same core skill. The simplest path is to send the agent this GitHub repo link and ask it to copy the auto-docs skill to the relevant path:

```
https://github.com/arifszn/auto-docs
```

## Requirements

- Node.js 18+

## License

MIT
