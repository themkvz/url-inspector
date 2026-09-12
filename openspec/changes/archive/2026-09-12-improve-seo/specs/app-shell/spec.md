## MODIFIED Requirements

### Requirement: No outbound third-party requests
The application MUST NOT load resources from any origin other than the one it is served from. That includes fonts, stylesheets, scripts, images, analytics, and error reporting. Two exceptions:

1. User-initiated navigation links to allowlisted official documentation hosts (`datatracker.ietf.org`, `www.rfc-editor.org`, `url.spec.whatwg.org`). These MUST open in a new tab with `rel="noreferrer noopener"`, and MUST NOT be fetched or prefetched by the application.
2. The application's own canonical origin (`url.themkvz.com`) named in self-referential discoverability metadata — canonical link, Open Graph and Twitter URLs and image, structured data, manifest, `robots.txt`, and `sitemap.xml`. These identify the app to crawlers; they are same-origin and MUST NOT introduce a request to any other host.

Identifier hosts that name a vocabulary rather than a resource — XML namespaces and the JSON-LD `@context` — are not references at all and are never fetched.

#### Scenario: Page load makes only same-origin requests
- **WHEN** the application loads in a browser with network inspection enabled
- **THEN** every recorded request goes to the serving origin

#### Scenario: Build output references no external origins
- **WHEN** the production build output is scanned for absolute `http://` or `https://` URLs and protocol-relative `//` resource references
- **THEN** every absolute URL points at an allowlisted documentation host, the app's own canonical origin, or an identifier host that is never fetched (an XML namespace or the JSON-LD vocabulary), and there are no protocol-relative resource references

#### Scenario: Documentation link opened
- **WHEN** the user clicks a documentation link
- **THEN** the destination opens in a new tab and receives no referrer

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
