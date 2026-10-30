## Context

See proposal.md - Why. The site is a Cloudflare Pages Direct Upload of `dist/`. Pages treats a build
without a top-level `404.html` as a single-page app and answers unknown paths with `index.html` and
`200`. Pages reads response headers from a `_headers` file at the output root. Both HTML pages carry the
same inline OpenPanel bootstrap script, and the build replaces `__APP_VERSION__` inside it, so its
content changes with every release.

## Goals / Non-Goals

**Goals:**
- Real `404` responses with a styled, non-indexed page.
- A CSP strict enough to enforce the network allowlist from the `app-shell` spec, with no manual hash
  upkeep.

**Non-Goals:**
- Headers for non-Pages hosts. Other static hosts ignore `_headers`; the site still works there.
- CI or deploy automation, and a privacy notice for analytics (separate ship-check items).

## Decisions

### Generate `_headers` in the build, not in `public/`
The CSP hash must match the final inline script after `__APP_VERSION__` substitution and minification.
The build already rewrites each page's HTML, so it hashes every attribute-less `<script>` body in the
final HTML and writes `dist/_headers` after copying `public/`.
- *Alternative — static `public/_headers` with `'unsafe-inline'`*: rejected; it lets any injected inline
  script run.
- *Alternative — move the bootstrap to an external file*: rejected; the bundler would fold it into the
  module graph and change when the queue stub exists relative to `op1.js`.

### `style-src 'unsafe-inline'`
Prerendered markup carries `style` attributes for part colors, which hashes cannot cover. Style
injection is a much smaller risk than script injection, so this is accepted.

### Not-found page as a prerendered, unhydrated build entry
`404.html` joins the build's page list so it reuses the shared shell and the prerender step. It links
the stylesheets directly and has no module script, because it has no interactive state. It keeps the
analytics bootstrap so 404 hits appear as screen views, which also keeps the build's version-marker
check uniform across pages.

### Root-relative asset URLs and a clean output directory
`publicPath: '/'` makes asset URLs absolute-path, so `/a/b/missing` still loads `/chunk-*.css`.
The site is always served from the origin root, so this changes nothing for the other pages. The build
deletes `dist/` first because new chunk hashes otherwise pile up next to stale ones and get deployed.

## Risks / Trade-offs

- [The OpenPanel SDK starts needing another origin or inline code] → The browser would block it and
  analytics would stop silently. Mitigation: the README smoke test already checks OpenPanel requests in
  the network panel; a CSP violation shows in the console.
- [The bundler emits an empty JS chunk for the script-less 404 entry] → One extra empty, cached request
  on 404s. Accepted.
- [`_headers` only applies on Cloudflare Pages] → Elsewhere the site works without the extra protection.

## Migration Plan

Deploy as usual. Roll back by restoring the previous Pages deployment; `_headers` and `404.html` are
part of the deployed artifact, so they roll back with it. After deploy, run `curl -sI` on `/` and on an
unknown path to confirm the headers and the `404` status.
