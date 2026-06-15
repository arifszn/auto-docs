# auto-docs

Generate beautiful documentation with AI agent skill.

## Installation

### Claude Code (Plugin Marketplace)

```bash
/plugin marketplace add arifszn/auto-docs
/plugin install auto-docs
```

### Claude Code (Manual)

```bash
git clone https://github.com/arifszn/auto-docs /tmp/auto-docs-repo
cp -r /tmp/auto-docs-repo/auto-docs ~/.claude/skills/auto-docs
rm -rf /tmp/auto-docs-repo
```

### Other coding agents

Claude Code, Codex, Kimi Code, OpenCode, Gemini CLI, and similar agents all work. Send your agent this link and ask it to install the skill:

```
https://github.com/arifszn/auto-docs
```

## Usage

### Generate docs

```
setup docs
```

Reads your project, builds the doc site engine in `.auto-docs/`, and writes the initial `docs/` content based on what it finds.

### Preview

```
preview docs
```

Starts the dev server at `http://localhost:3000/docs`.

### Edit docs

Describe what you want in plain English. auto-docs handles the files.

| Say this | What happens |
|----------|-------------|
| `add a doc about authentication` | Creates `docs/authentication.mdx`, updates navigation |
| `add a rate limiting section to the API doc` | Appends the section to the existing page |
| `update the getting-started doc` | Edits the page in place |
| `my API changed, update the docs` | Diffs git, finds affected pages, updates them |
| `remove the legacy section from configuration` | Locates and removes the section |

## What gets generated

```
docs/
├── index.mdx            
├── meta.json            
└── <section>/
    └── index.mdx        
```

## Requirements

- Node.js 18+
- Claude Code or compatible coding agent

## License

[MIT](./LICENSE)
