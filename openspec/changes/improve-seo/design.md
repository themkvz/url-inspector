## Context

See proposal.md — Why. Relevant current state:

- `package.json` `build` is a single command: `bun build ./index.html --outdir dist --minify`. Bun's HTML
  bundler rewrites the relative `<script>`/CSS references into hashed `dist/` assets and copies the rest
  of `index.html` through verbatim.
- `src/main.tsx` calls `render(<App />, #app)`. `App` renders deterministically from the store's initial
  state (`raw = ''`); the only browser-dependent code is a `useEffect` that focuses the input and event
  handlers, so the initial tree is safe to produce outside a browser.
- `src/privacy.test.ts` builds the app and fails on any absolute URL in `dist/` outside the documentation
  host allowlist. Adding `https://url.themkvz.com` to the metadata trips it, so that test moves with the
  spec delta in `specs/app-shell/spec.md`.
- Canonical origin, decided with the user: `https://url.themkvz.com`, single page, trailing slash.

## Goals / Non-Goals

**Goals:**
- Served HTML is complete and indexable before any JavaScript executes.
- One canonical identity (`title`, description, canonical URL, origin) repeated consistently across head
  metadata, structured data, manifest, `robots.txt`, and `sitemap.xml`, with a test that keeps them in sync.
- Every added asset self-hosted at a stable, unhashed path.

**Non-Goals:**
- A general static-site or templating pipeline. The build script stays a handful of lines for one page.
- A build-time image pipeline. Raster assets are generated once by hand and committed.
- Runtime bundle-size or Core Web Vitals work (Pico CSS is ~138 KB); worth a separate change if field data
  warrants it.

## Decisions

### Prerender with `preact-render-to-string` in a build script

`package.json` `build` becomes `bun run scripts/build.ts`, which: runs the same `Bun.build` over
`index.html`, then reads `dist/index.html`, replaces the literal `<div id="app"></div>` with the same div
wrapping `renderToString(<App />)`, then copies `public/` into `dist/`. It throws if the mount marker is not
found, so a silent no-op prerender cannot ship.

- *Alternative — render into `happy-dom` and take `innerHTML`* (no new dependency; happy-dom is already a
  dev dep): rejected. It emulates a DOM and runs effects just to obtain a string that
  `renderToString` returns directly, and it is the wrong tool to debug at 3am.
- *Alternative — hand-written static HTML in `index.html` that the app replaces on mount*: rejected. The
  indexable copy would be maintained separately from the components and would drift.

`preact-render-to-string` is a **dev** dependency: it runs at build time only and never reaches the client
bundle, so the "minimal bundled runtime dependencies" constraint is untouched.

### `render` → `hydrate` in `src/main.tsx`

Preact's `hydrate` attaches to existing DOM instead of re-creating it, which is what makes the prerendered
markup worth shipping (no flash, no duplicate tree). With an empty container — the dev server case, where
`index.html` is served unprocessed — `hydrate` falls back to creating the tree, so dev and production both
work from the same entry point.

Consequence: the component tree must render identically in Node and in the browser. It does today
(deterministic from `raw = ''`); any future render-time use of `window`/`navigator`/`Date`/`Math.random`
would break the build loudly rather than silently, which is the desired failure mode.

### Static assets in `public/`, kept unhashed via the bundler's own naming option

`robots.txt`, `sitemap.xml`, `site.webmanifest`, `icon.svg`, `favicon.ico`, `apple-touch-icon.png`, and
`og.png` live in `public/` and are copied verbatim into `dist/`.

`og:image`, the manifest, and the crawl files must sit at fixed, guessable URLs, so the icon and manifest
references must survive the build unhashed. `Bun.build` is given `naming: { asset: '[name].[ext]' }`,
which turns hashing off at the mechanism that produces it; `index.html` then keeps referencing
`./public/icon.svg` and the output reads `./icon.svg`, which `cpSync` overwrites with the same bytes.

- *Rejected — reference the assets as `/icon.svg` in `index.html` so the bundler skips them*: Bun's HTML
  bundler resolves a root-relative href as a project-root path and fails the build with
  `Could not resolve: "/icon.svg"`.
- *Rejected — regex the hashes back out of `dist/index.html` after the build*: patches the symptom one
  filename at a time, silently no-ops if Bun's hash format changes, and leaves the hashed duplicates
  Bun emitted sitting in `dist/`.

Single-page site served at the origin root, so the emitted `./icon.svg` and an absolute `/icon.svg`
resolve identically. The privacy scan's protocol-relative ban (`//host/…`) is unaffected.

### Origin literal repeated, consistency enforced by test

`https://url.themkvz.com` appears literally in `index.html` metadata and in the `public/` files rather than
being templated in from an env var or a shared constant. One origin, one deploy target; a templating layer
would be more machinery than the thing it templates. `src/discoverability.test.ts` parses the built
`dist/index.html` (with the already-installed `happy-dom`) and asserts canonical, `og:url`, JSON-LD `url`,
sitemap entry, and `robots.txt` sitemap line all agree, so a future origin change fails loudly in one place.

That test also covers the rest of the `discoverability` spec: description length, single `h1`, prerendered
content present in the HTML, JSON-LD parses, manifest parses, and every referenced asset path exists in
`dist/`. Like `privacy.test.ts`, it builds in `beforeAll` (a second build of a sub-second bundle — cheaper
than coordinating a shared build fixture).

### Raster assets generated once, committed

`og.png` (1200×630), `apple-touch-icon.png` (180×180), and `favicon.ico` are produced once at authoring
time from `icon.svg` plus a simple text-on-background composition, then committed. No converter becomes a
project dependency. For `favicon.ico`, a PNG can be wrapped directly in an ICO container (a 22-byte header
followed by the PNG bytes) if no icon tool is at hand.

### Structured data: `WebApplication`, nothing more

One `application/ld+json` block with `@type: WebApplication`, `name`, `description`, `url`,
`applicationCategory: DeveloperApplication`, `operatingSystem: Any`, and a free `offers` price of 0.
No `aggregateRating` or `review` — fabricating them is a manual-action risk and a lie. No `FAQPage`, since
the user chose to keep the page free of FAQ copy; adding FAQ markup without visible FAQ content violates
Google's structured-data policy.

### No search-console verification file or script

Verification, if ever wanted, goes through a DNS TXT record — a meta tag is fine but a verification
*script* would be a third-party load and break the anonymity constraint. Nothing to add now.

## Risks / Trade-offs

- **Hydration mismatch from a future browser-only render path** → the build runs the same component tree in
  Node, so such a change fails at build time; `discoverability.test.ts` asserts the prerendered content is
  present in `dist/index.html`.
- **Prerendered markup silently missing** (Bun output shape changes, mount marker renamed) → the build
  script throws when the marker is absent, and the test asserts the mount node is non-empty.
- **Widening the privacy allowlist weakens the guarantee** → the allowance is one exact host, the app's own
  origin, and the existing scan still rejects every other host and all protocol-relative references. The
  "only same-origin requests at runtime" requirement is unchanged.
- **Metadata drifts from the deployed origin** (host moves, `www.` variant, missing trailing-slash
  redirect) → single canonical form asserted across all files by test; deploy must serve the canonical
  origin over HTTPS and 301 any variant to it.
- **Icons at unhashed paths are cached aggressively** → acceptable; these change approximately never, and a
  filename bump is available if one does.

## Migration Plan

Not a data migration. Deploy order: build, verify `dist/index.html` contains the rendered markup and
`dist/robots.txt`/`dist/sitemap.xml` exist, then publish. Rollback is redeploying the previous `dist/` —
nothing persists and no URL shape changes. After first deploy, confirm with a live fetch that the page HTML
contains the heading without JavaScript and that the social preview resolves.
