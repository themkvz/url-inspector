## Why

The repo has no code or tooling yet. Before building URL parsing and editing features, the project needs an agreed stack, a dev/build loop, and a minimal app shell that already enforces the product's core promises: client-only, anonymous, no third-party requests.

## What Changes

- Bun as the single tool: package manager, dev server (`bun ./index.html`), static production build (`bun build ./index.html`), and test runner (`bun test`). No separate bundler.
- TypeScript in strict mode, with JSX compiled for Preact.
- Runtime deps: `preact`, `@preact/signals`, `@picocss/pico`. All bundled into the static output, none loaded from a CDN.
- Dev deps: `typescript`, `@biomejs/biome` (lint + format), `lefthook` (pre-commit), `@types/bun`.
- A minimal app shell: one HTML entry, a Preact root component with Pico styling and system light/dark theme. Placeholder content only; URL features come in later changes.
- Scripts: `dev`, `build`, `test`, `check` (Biome + `tsc --noEmit`).
- Project constraint relaxed from "dependency-free" to "minimal, bundled, self-hosted dependencies; each new runtime dependency needs explicit approval."

## Capabilities

### New Capabilities
- `app-shell`: the static, client-only application shell. Covers how the app is delivered (static files only), the privacy guarantee (no outbound requests, no storage of inspected URLs, no tracking), and base presentation (semantic HTML, system color scheme).

### Modified Capabilities
<!-- none: no existing specs -->

## Impact

- New files: `package.json`, `bun.lock`, `tsconfig.json`, `biome.json`, `lefthook.yml`, `index.html`, `src/` entry, `.gitignore`.
- `CLAUDE.md` gets real commands, and its dependency rule is updated.
- Output is a static `dist/` folder that any static host can serve.
