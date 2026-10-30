## Why

A pre-release ship check found that Cloudflare Pages serves the home page with `200 OK` for any unknown
path, because the build has no top-level `404.html`. It also found that the site sends no Content Security
Policy or `frame-ancestors`, and that hashed assets are revalidated on every visit. Fixing these before
launch removes soft-404s for crawlers, gives users a real "not found" page, and lets the browser enforce
the existing "only OpenPanel" network promise.

## What Changes

- Add a static, prerendered, `noindex` not-found page that Pages serves with `404` for every unknown
  path, using the shared shell and a link back to the inspector.
- Emit Pages response headers with the build: a Content Security Policy that allows only same-origin
  resources, the hashed inline analytics bootstrap, and the first-party OpenPanel origin; plus
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and
  framing denied.
- Serve hashed build chunks with a one-year `immutable` cache policy.
- Reference built assets by root-relative URLs so the not-found page keeps its styles at nested paths.
- Clear the build output before each build so stale chunks are never deployed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: adds a not-found response requirement and a response-header (CSP, framing, caching)
  requirement.
- `discoverability`: adds a requirement that the not-found page is excluded from indexing and from the
  sitemap.

## Impact

- New `404.html` entry and `src/not-found.tsx`; `src/shell.tsx` `current` becomes optional.
- `scripts/build.tsx`: new page entry, `publicPath: '/'`, clean `dist/`, generated `dist/_headers`.
- Tests: `src/privacy.test.ts` (CSP hashes), `src/discoverability.test.ts` (404 page).
- No new dependencies. No change to analytics events or to what data leaves the device.
