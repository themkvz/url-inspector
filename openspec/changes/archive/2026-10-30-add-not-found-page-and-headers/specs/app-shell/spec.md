## ADDED Requirements

### Requirement: Not-found response
A request for a path that matches no built file SHALL receive a `404` status and a static not-found
page. The page SHALL render the shared shell (one `h1`, header, and footer navigation with no link marked
`aria-current`), say that the page does not exist, and link to the inspector at `/`. It SHALL load its
styles from root-relative URLs so it renders the same at any path depth. The not-found page is not a
top-level page.

#### Scenario: Unknown nested path
- **WHEN** `/some/deep/missing` is requested from the deployed site
- **THEN** the response status is `404`, the body is the styled not-found page, and it contains a link
  to `/`

#### Scenario: Readable without JavaScript
- **WHEN** the not-found page is loaded with JavaScript disabled
- **THEN** its heading, message, and link are visible

### Requirement: Response security and cache headers
Every response from the deployed site SHALL carry:

1. A `Content-Security-Policy` that allows scripts only from the serving origin, from
   `https://openpanel.themkvz.com`, and from inline scripts identified by a SHA-256 hash; allows
   network connections only to the serving origin and `https://openpanel.themkvz.com`; allows images
   only from the serving origin and `data:`; and sets `object-src 'none'`, `base-uri 'none'`,
   `form-action 'none'`, and `frame-ancestors 'none'`. It MUST NOT allow `'unsafe-inline'` scripts.
2. `X-Content-Type-Options: nosniff`.
3. `Referrer-Policy: strict-origin-when-cross-origin`.

Content-hashed build chunks SHALL be served with
`Cache-Control: public, max-age=31536000, immutable`.

#### Scenario: CSP matches the inline scripts
- **WHEN** the build output's header rules and every page's inline scripts are compared
- **THEN** the policy's script hashes are exactly the SHA-256 hashes of the inline scripts on the pages

#### Scenario: App works under the policy
- **WHEN** the home page loads under the generated headers and a URL is inspected
- **THEN** the inspector works, the analytics script loads and sends events, and the browser reports no
  policy violations

#### Scenario: Framing blocked
- **WHEN** another origin embeds the site in a frame
- **THEN** the browser refuses to render it

#### Scenario: Hashed chunks cached
- **WHEN** a built `chunk-*` asset is requested
- **THEN** the response has `Cache-Control: public, max-age=31536000, immutable`
