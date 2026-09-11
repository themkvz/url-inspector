## 1. Tooling

- [x] 1.1 `git init` (lefthook needs a repo) and add `.gitignore` (`node_modules`, `dist`)
- [x] 1.2 `bun init`-equivalent `package.json` (private, `"type": "module"`); `bun add preact @preact/signals @picocss/pico`
- [x] 1.3 `bun add -d typescript @biomejs/biome lefthook @types/bun`
- [x] 1.4 `tsconfig.json`: strict, `noEmit`, `jsx: react-jsx`, `jsxImportSource: preact`, `moduleResolution: bundler`, paths `@/*` → `src/*`
- [x] 1.5 `biome.json`: 2-space, single quotes, no semicolons, line width 100, organize imports; ignore `dist`
- [x] 1.6 `lefthook.yml` pre-commit: `biome check --write` on staged files + `tsc --noEmit`; run `bunx lefthook install`
- [x] 1.7 Scripts: `dev` (`bun ./index.html`), `build` (`bun build ./index.html --outdir dist --minify`), `test` (`bun test`), `check` (`biome check . && tsc --noEmit`)

## 2. App shell

- [x] 2.1 `index.html` with `lang`, charset, viewport, `<title>URL Inspector</title>`, `#app` mount, module script `./src/main.tsx`
- [x] 2.2 `src/main.tsx`: import Pico CSS from the package, render `<App/>` into `#app`
- [x] 2.3 `src/app.tsx`: `<header>` with "URL Inspector" + `<main>` placeholder, using Pico's `container` layout
- [x] 2.4 Confirm `bun run dev` serves with HMR and `bun run build` produces a working static `dist/`

## 3. Verification

- [x] 3.1 `bun test` privacy check: build, then scan `dist/` for absolute/protocol-relative URLs in resource positions (`src=`, `href=`, `url(`, `import`), allowlisting XML namespaces
- [x] 3.2 Manual: load `dist/` from a static server, confirm in DevTools that all requests are same-origin, no cookies or storage writes, and dark mode follows the system setting
- [x] 3.3 `bun run check` passes

## 4. Docs

- [x] 4.1 Update `CLAUDE.md`: commands, stack, and the dependency rule ("minimal, bundled, self-hosted; new runtime deps need approval")
- [x] 4.2 Fill `openspec/config.yaml` `context` with the stack and product constraints
