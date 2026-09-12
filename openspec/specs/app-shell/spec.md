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
The application MUST NOT load resources from any origin other than the one it is served from. That includes fonts, stylesheets, scripts, images, analytics, and error reporting. Two exceptions:

1. User-initiated navigation links to allowlisted official documentation hosts (`datatracker.ietf.org`, `www.rfc-editor.org`, `url.spec.whatwg.org`). These MUST open in a new tab with `rel="noreferrer noopener"`, and MUST NOT be fetched or prefetched by the application.
2. The application's own canonical origin (`url.themkvz.com`) named in self-referential discoverability metadata — canonical link, Open Graph and Twitter URLs and image, structured data, manifest, `robots.txt`, and `sitemap.xml`. These identify the app to crawlers; they are same-origin and MUST NOT introduce a request to any other host.

#### Scenario: Page load makes only same-origin requests
- **WHEN** the application loads in a browser with network inspection enabled
- **THEN** every recorded request goes to the serving origin

#### Scenario: Build output references no external origins
- **WHEN** the production build output is scanned for absolute `http://` or `https://` URLs and protocol-relative `//` resource references
- **THEN** every absolute URL points at an allowlisted documentation host, the app's own canonical origin, or is an XML namespace identifier, and there are no protocol-relative resource references

#### Scenario: Documentation link opened
- **WHEN** the user clicks a documentation link
- **THEN** the destination opens in a new tab and receives no referrer

### Requirement: No tracking or persistence of user data
The application MUST NOT set cookies, MUST NOT include analytics or fingerprinting, and MUST NOT persist user-entered URLs to any storage (localStorage, sessionStorage, IndexedDB, cookies).

#### Scenario: No storage writes on use
- **WHEN** a user loads the application and interacts with it
- **THEN** no cookies are set and no user-entered content ends up in browser storage

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
