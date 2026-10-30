## Purpose

Defines how URL Inspector is delivered and the privacy guarantees it gives: a static, client-only web app that never sends inspected data anywhere.

## Requirements

### Requirement: Static client-only delivery
The application SHALL be delivered as static files (HTML, JS, CSS, and optional static assets) that run entirely in the browser, with no application server or backend API.

#### Scenario: Served from a plain static host
- **WHEN** the production build output is served by any static file server
- **THEN** the application loads and renders its shell with no server-side logic

#### Scenario: Works offline after load
- **WHEN** the application has loaded and the network is then disconnected
- **THEN** the application keeps working, and nothing that already rendered fails because of the missing network

### Requirement: No outbound third-party requests
The application MUST NOT load resources from origins other than the one it is served from except for
these explicit cases:

1. User-initiated navigation links to allowlisted official documentation hosts
   (`datatracker.ietf.org`, `www.rfc-editor.org`, `url.spec.whatwg.org`). These MUST open in a new tab
   with `rel="noreferrer noopener"`, and MUST NOT be fetched or prefetched by the application.
2. The application's canonical origin (`url.themkvz.com`) named in self-referential discoverability
   metadata.
3. The first-party analytics origin (`openpanel.themkvz.com`), limited to loading `/op1.js` and
   sending anonymous events to `/api`.

#### Scenario: Page load makes only same-origin requests
- **WHEN** the application loads in a browser with network inspection enabled
- **THEN** every recorded request goes to the serving origin or `openpanel.themkvz.com`

#### Scenario: Build output references no external origins
- **WHEN** the production build output is scanned for absolute `http://` or `https://` URLs and
  protocol-relative `//` resource references
- **THEN** every absolute URL points at an allowlisted documentation host, the app's canonical origin,
  the first-party analytics origin, or an identifier host, and there are no protocol-relative resource
  references

#### Scenario: Documentation link opened
- **WHEN** the user clicks a documentation link
- **THEN** the destination opens in a new tab and receives no referrer

### Requirement: No tracking or persistence of user data
The application MUST use OpenPanel only for anonymous screen-view, outgoing-link, declarative
attribute, and the following interaction events: `url_copied`, `example_loaded`, `url_part_opened`,
`query_parameter_added`, `query_parameter_removed`, and `query_parameter_moved`. Every event MUST
include the global properties `app: "url-inspector"` and an `environment` that is `production` on
`url.themkvz.com` and `development` elsewhere. It MUST NOT enable session replay, set analytics
cookies, store persistent visitor identifiers, transmit user-entered URL values, or persist those
values in localStorage, sessionStorage, IndexedDB, or cookies.

#### Scenario: Anonymous analytics starts
- **WHEN** the application loads with network access
- **THEN** it loads the SDK from `https://openpanel.themkvz.com/op1.js` and initializes client
  `2e6568f4-b5bc-46b9-bf0b-64c63e9f7263` against `https://openpanel.themkvz.com/api`

#### Scenario: Interaction is tracked without URL content
- **WHEN** a user copies a URL, loads the example, opens a URL part, or changes the query-parameter
  structure
- **THEN** the corresponding allowed event is sent with only the part name or move direction when
  applicable, never a URL, query key, or query value

#### Scenario: Global event context is set
- **WHEN** the SDK processes an event
- **THEN** it includes `app: "url-inspector"` and the environment matching the current hostname

#### Scenario: Analytics is unavailable
- **WHEN** the analytics script or API cannot be reached
- **THEN** URL inspection continues to work

#### Scenario: No storage writes on use
- **WHEN** a user enters or edits a URL
- **THEN** that value is neither included in analytics events nor written to browser storage

### Requirement: Base presentation follows system theme
The application shell SHALL use semantic HTML landmarks (`header`, `main`), SHALL present exactly one `h1` naming the product and a one-sentence description of what the tool does, and SHALL render in light or dark mode to match the user's system color-scheme preference. It SHALL also respect the user's motion and contrast preferences: when reduced motion is preferred, decorative transitions and transforms SHALL be suppressed; when a forced-colors mode is active, the URL text SHALL render exactly once and legibly in the system-assigned colors.

#### Scenario: Dark system preference
- **WHEN** the user's system prefers a dark color scheme
- **THEN** the application renders with a dark theme and no manual toggle is needed

#### Scenario: Shell landmarks present
- **WHEN** the application loads
- **THEN** the document contains a `header` with the product name "URL Inspector" as the page's only `h1`, a one-sentence description of the tool, and a `main` region

#### Scenario: Reduced motion preference
- **WHEN** the user's system prefers reduced motion and they hover or focus a part label
- **THEN** the label changes state without a movement or transition animation, and the state remains visually distinguishable

#### Scenario: Forced colors mode
- **WHEN** the user's system has a forced-colors mode active and the input contains a URL
- **THEN** the URL text is shown once, in system colors, with no duplicated or invisible copy, and every control keeps a visible boundary and focus indicator

### Requirement: Legible contrast in both themes
All text and meaningful non-text presentation SHALL meet WCAG 2.1 AA contrast against the background it is drawn on, in both the light and dark themes: at least 4.5:1 for body text, at least 3:1 for large text, and at least 3:1 for control boundaries, state indicators, and focus indicators. This applies to the per-part colors used in the input and on the part labels, to labels for absent parts, and to any text rendered at reduced opacity.

#### Scenario: Part colors in both themes
- **WHEN** each part color is measured against the page background in the light theme and again in the dark theme
- **THEN** every one meets at least 4.5:1

#### Scenario: Part label chips
- **WHEN** a part label's text is measured against its filled chip background, and an absent part's label text and dashed border are measured against the page background
- **THEN** the text meets at least 4.5:1 and the border meets at least 3:1

#### Scenario: Dimmed text
- **WHEN** text rendered at reduced opacity, such as the browser-form line and the "no value" placeholder, is measured against its effective background
- **THEN** it meets at least 4.5:1, or the opacity is raised until it does

### Requirement: Shared site navigation
A `footer` after the main content SHALL include a `nav` landmark listing a link to every top-level
page (currently Home and FAQ), rendered identically on every page. The link to the page currently
being viewed SHALL be marked `aria-current="page"`.

#### Scenario: Navigate between pages
- **WHEN** a user on the home page activates the FAQ link in the navigation
- **THEN** they arrive at the FAQ page, and its navigation marks the FAQ link `aria-current="page"`

#### Scenario: Navigation present on every page, after the content
- **WHEN** any top-level page is inspected
- **THEN** a `footer` landmark follows the `main` content and contains a `nav` landmark with a link to
  each top-level page

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
