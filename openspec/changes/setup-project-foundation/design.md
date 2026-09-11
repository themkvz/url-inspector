## Context

Greenfield repo; only OpenSpec config exists. Motivation and scope: see proposal.md. Requirements: see specs/app-shell/spec.md. The stack below was agreed with the user during proposal.

## Goals / Non-Goals

**Goals:**
- One tool (Bun) for install, dev, build, and test.
- A strict TS + lint/format loop enforced before commit.
- Output a static `dist/` with every asset bundled and self-hosted.

**Non-Goals:**
- URL parsing/editing features (later changes).
- CI, hosting/deploy config, Docker. The output is static files, so a container adds nothing for now; revisit once hosting is chosen.
- PWA/service worker. Offline-after-load comes for free because nothing is fetched after load.
- Component/DOM test setup. `bun test` will cover pure logic once some exists.

## Decisions

**Bun only, no Vite.** `bun ./index.html` gives a dev server with HMR and TS/JSX/CSS bundling. `bun build ./index.html --outdir dist --minify` gives the static build (Bun ≥1.2; 1.4.2 installed).
- Alternative: Vite + `@preact/preset-vite`. Rejected because it adds builder deps; the only concrete gain is Preact Fast Refresh (state kept across edits), which matters little for a one-screen app. Easy to switch later, since `index.html` + `src/` is the same layout Vite uses.

**Preact + @preact/signals for UI.** ~4KB, JSX, strong TS support, React-like API.
- Alternative: Lit. Rejected because shadow DOM isolates components from Pico's global element styles.
- Alternative: vanilla TS. Rejected because the dynamic editable parameter list would need hand-written DOM diffing.
- Signals over hooks-only state: fine-grained updates, and URL state can live in plain modules outside components.
- JSX via tsconfig `"jsx": "react-jsx"`, `"jsxImportSource": "preact"`. Bun's transpiler honors this, so no `preact/compat` aliasing is needed.

**Pico CSS for styling.** Semantic and mostly classless, with a built-in `prefers-color-scheme` dark mode, which satisfies the theme requirement with zero code. Imported from `node_modules` in the entry CSS/TS so Bun bundles it into `dist/` (no CDN).
- Alternative: Tailwind. Rejected as heavier tooling and markup than a form tool needs.
- Alternative: hand-written CSS. Rejected because every form control would need designing from scratch.

**Biome for lint + format; lefthook for pre-commit.** Biome replaces ESLint + Prettier with one binary. Its config enforces 2-space indent, single quotes, no semicolons, and a 100-char line width. Pre-commit runs `biome check --write` on staged files plus `tsc --noEmit`.

**Layout.**
```
index.html          # Bun HTML entry; <script type="module" src="./src/main.tsx">
src/main.tsx        # imports Pico CSS, renders <App/> into #app
src/app.tsx         # shell: <header> + <main>
```
`tsconfig` path alias `@/*` → `src/*` (Bun resolves tsconfig paths natively).

**Privacy check as a test.** The "no external references" scenario is automated as a `bun test` that runs the build and greps `dist/` for absolute or protocol-relative URLs in resource positions. The same-origin network scenario is verified manually in DevTools for this change.

## Risks / Trade-offs

- [Bun's HTML bundler is younger than Vite] → Layout matches Vite's, so migrating means adding one config file.
- [HMR resets Preact component state] → Acceptable; keep state in signals modules so less of it lives in components.
- [Pico's bundled CSS may reference external resources] → The build grep test catches it. Pico ships no web fonts, so none are expected.
- [The grep test could flag harmless strings, e.g. the SVG namespace `http://www.w3.org/2000/svg`] → Match only resource positions (`src=`, `href=`, `url(`, `import`) and allowlist XML namespaces.
