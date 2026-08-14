# Understand Plus

## Project Overview
An enhanced fork of Understand Anything — LLM-powered interactive knowledge graphs for codebases, docs, and wikis. Combines static analysis with LLM intelligence to produce explorable dashboards.

## Prerequisites
- Node.js >= 22 (developed on v24)
- pnpm >= 10 (pinned via `packageManager` field in root `package.json`)

## Architecture
- **Monorepo** with pnpm workspaces
- **understand-anything-plugin/** — Claude Code plugin containing all source code:
  - **packages/core** — Shared analysis engine (types, persistence, tree-sitter, search, schema, tours, plugins)
  - **packages/dashboard** — React + TypeScript web dashboard (React Flow, Zustand, TailwindCSS v4)
  - **src/** — Skill TypeScript source for `/understand-chat`, `/understand-diff`, `/understand-explain`, `/understand-onboard`
  - **skills/** — Skill definitions (`/understand`, `/understand-dashboard`, etc.)
  - **agents/** — Agent definitions (project-scanner, file-analyzer, architecture-analyzer, tour-builder, graph-reviewer)

## Dashboard
- Dark luxury theme: deep blacks (#0a0a0a), gold/amber accents (#d4a574), DM Serif Display typography
- Graph-first layout: 75% graph + 360px right sidebar
- No ChatPanel or Monaco Editor
- Sidebar tabs: `Info` (ProjectOverview default → NodeInfo when node selected → LearnPanel in Learn persona, composing) and `Files` (FileExplorer tree built from the structural graph)
- Code viewer: prism-react-renderer source viewer that slides up from the bottom on file node click; an expand button promotes it into a full-screen modal. Source content is fetched from the dev server's `/file-content.json` endpoint, gated by access token + a graph-derived path allowlist
- Schema validation on graph load with error banner

## Agent Pipeline
- Agents write intermediate results to the data directory's `intermediate/` subdirectory on disk (not returned to context) — `.ua/intermediate/`, or `.understand-anything/intermediate/` when that legacy directory is present
- Agent model field is omitted from frontmatter so each platform falls back to its configured default — `inherit` was a Claude Code-only keyword that opencode (and similar tools) treated as a literal model id and rejected with `ProviderModelNotFoundError` (see #167)
- `/understand` auto-triggers `/understand-dashboard` after completion
- Intermediate files cleaned up after graph assembly

## Key Commands
- `pnpm install` — Install all dependencies
- `pnpm --filter @understand-anything/core build` — Build the core package
- `pnpm --filter @understand-anything/core test` — Run core tests
- `pnpm --filter @understand-anything/skill build` — Build the plugin package
- `pnpm test` — Run all tests (skill tests live at repo-root `tests/skill/`, picked up by root `vitest.config.ts`)
- `pnpm --filter @understand-anything/dashboard build` — Build the dashboard
- `pnpm dev:dashboard` — Start dashboard dev server
- `pnpm lint` — Run ESLint across the project

## Conventions
- TypeScript strict mode everywhere
- Vitest for testing
- ESM modules (`"type": "module"`)
- Knowledge graph JSON lives in the analyzed project's data directory: `.ua/` for new projects, or the legacy `.understand-anything/` directory when it already exists (if `.understand-anything/` is present it is used for both reads and writes; otherwise `.ua/`). All bundled scripts and core code self-resolve this rule.
- Core uses subpath exports (`./search`, `./types`, `./schema`) to avoid pulling Node.js modules into browser

## Gotchas
- **tree-sitter**: Uses `web-tree-sitter` (WASM) instead of native `tree-sitter` — native bindings fail on darwin/arm64 + Node 24
- **Dashboard imports**: Dashboard must only import from core's browser-safe subpath exports (`./search`, `./types`, `./schema`), never the main entry point which pulls in Node.js modules

## Scripts
- `scripts/generate-large-graph.mjs` — Generates a fake knowledge graph for performance testing (e.g. large-graph layout). Writes to the project data directory's `knowledge-graph.json` (`.ua/knowledge-graph.json`, or `.understand-anything/` when that legacy directory is present). Usage: `node scripts/generate-large-graph.mjs [nodeCount]` (default: 3000 nodes). Not part of the production pipeline.

## Viewer Package
`packages/viewer` serves a committed graph without Claude Code, via `npx understand-plus-viewer`. Update it when (a) the dashboard UI changes — the tarball embeds the built `dist/` — or (b) the `vite.config.ts` dev-server middleware changes, which `bin/viewer.mjs` deliberately mirrors. On every release, repack (`pack:release` script) and re-upload the tarball to the GitHub release as `understand-plus-viewer.tgz` — exactly that name.

## Versioning
When pushing to remote, bump the version in **all six** of these files (keep them in sync):
- `understand-anything-plugin/package.json` → `"version"` field
- `understand-anything-plugin/.claude-plugin/plugin.json` → `"version"` field
- `understand-anything-plugin/packages/viewer/package.json` → `"version"` field
- `.claude-plugin/plugin.json` → `"version"` field
- `.cursor-plugin/plugin.json` → `"version"` field
- `.copilot-plugin/plugin.json` → `"version"` field

## Testing Local Plugin Changes

1. **Build the packages:**
   ```bash
   pnpm --filter @understand-anything/core build
   pnpm --filter @understand-anything/skill build
   ```

2. **Run `/understand --full`** in the target project to verify.
