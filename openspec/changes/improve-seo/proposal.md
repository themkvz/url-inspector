## Why

URL Inspector is about to be published at `https://url.themkvz.com`, and today the shipped page is
invisible to search engines and link previews: `index.html` carries only a charset, a viewport, and a
title; the body is an empty `<div id="app">` until JavaScript runs; there is no description, canonical,
social card, icon, `robots.txt`, or sitemap. Search and social crawlers therefore see a blank,
untitled-beyond-the-title page, and shared links render as a bare URL.

## What Changes

- Prerender the app's initial markup into `dist/index.html` at build time, so the served HTML contains
  the real heading, tagline, and tool UI instead of an empty mount node. The client bundle hydrates
  that markup rather than replacing it.
- Add a complete head metadata set to `index.html`: description, canonical, `theme-color`, Open Graph
  and Twitter card tags, and `robots`/`googlebot` directives.
- Add `SoftwareApplication` (WebApplication) JSON-LD structured data describing the tool.
- Add visible on-page copy: a single `h1` and a one-sentence description naming what the tool does.
  No explainer or FAQ section — the tool stays minimal.
- Add self-hosted static assets served from stable paths: SVG icon, `favicon.ico`, `apple-touch-icon.png`,
  a 1200×630 `og:image`, and a web app manifest.
- Add `robots.txt` and `sitemap.xml`.
- Replace the one-line `bun build` script with a small build script that runs the bundler, injects the
  prerendered markup, and copies the static files above into `dist/`.
- **Relax the privacy build scan** so the app's own production origin is allowed in self-referential
  metadata (canonical, `og:url`, sitemap, manifest, JSON-LD) while every other external origin stays
  banned. No new fetchable third-party reference is introduced.
- Add `preact-render-to-string` as a **dev** dependency (build-time only, not shipped in the client
  bundle) — approved by the user when selecting the prerender approach.

Non-goals: analytics or search-console verification scripts (would break the anonymous constraint —
verification, if ever needed, goes via DNS), multi-page content, i18n/`hreflang`, and performance work
on the Pico CSS bundle size.

## Capabilities

### New Capabilities
- `discoverability`: how the production build presents itself to search engines, social crawlers, and
  the browser chrome — prerendered indexable markup, head metadata, structured data, icons, manifest,
  `robots.txt`, and `sitemap.xml`, all self-hosted and consistent with the app's canonical origin.

### Modified Capabilities
- `app-shell`: the "no outbound third-party requests" build-scan requirement gains an allowance for the
  app's own canonical origin in self-referential metadata; the shell landmark requirement gains the
  single `h1` plus tagline and the requirement that the shell renders from server-delivered HTML before
  JavaScript runs.

## Impact

- `index.html` — head metadata, JSON-LD, icon/manifest links, prerender placeholder.
- `src/main.tsx` — `render` → `hydrate`.
- `src/app.tsx` — tagline copy alongside the existing `h1`.
- New: build script (bundle + prerender injection + static copy), `public/` static assets, a
  discoverability test alongside the existing privacy/a11y tests.
- `src/privacy.test.ts` — own-origin allowance; build invocation switches to `bun run build`.
- `package.json` — `build` script, `preact-render-to-string` devDependency.
- No change to `src/url/` — the lossless round-trip core is untouched.
