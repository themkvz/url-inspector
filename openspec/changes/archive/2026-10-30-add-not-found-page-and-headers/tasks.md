## 1. Not-found page

- [x] 1.1 Make the shell's `current` page prop optional so no nav link is marked current
- [x] 1.2 Add a prerendered not-found component with a heading, message, and link to `/`
- [x] 1.3 Add `404.html` with `noindex`, no canonical, icons, linked stylesheets, and the analytics bootstrap
- [x] 1.4 Add `404.html` to the build's page list and build with root-relative asset URLs

## 2. Response headers

- [x] 2.1 Clear `dist/` at the start of the build
- [x] 2.2 Hash every inline script in the final page HTML and write `dist/_headers` with the CSP, `nosniff`, `Referrer-Policy`, and immutable caching for `chunk-*`

## 3. Verification

- [x] 3.1 Test that the CSP script hashes exactly match the pages' inline scripts and allow no `'unsafe-inline'` scripts
- [x] 3.2 Test that the built not-found page is `noindex`, has no canonical, links to `/`, and uses root-relative stylesheets
- [x] 3.3 Run `bun run check` and `bun test`
- [x] 3.4 Serve `dist/` with `wrangler pages dev` and confirm `404` on an unknown nested path, the headers, the cache policy, and no CSP violations in the browser
- [x] 3.5 Add a post-deploy `curl -sI` header and `404` check to the README release steps
