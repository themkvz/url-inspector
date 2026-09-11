## MODIFIED Requirements

### Requirement: No outbound third-party requests
The application MUST NOT load resources from any origin other than the one it is served from. That includes fonts, stylesheets, scripts, images, analytics, and error reporting. The only exception: user-initiated navigation links to allowlisted official documentation hosts (`datatracker.ietf.org`, `www.rfc-editor.org`, `url.spec.whatwg.org`). These MUST open in a new tab with `rel="noreferrer noopener"`, and MUST NOT be fetched or prefetched by the application.

#### Scenario: Page load makes only same-origin requests
- **WHEN** the application loads in a browser with network inspection enabled
- **THEN** every recorded request goes to the serving origin

#### Scenario: Build output references no external origins
- **WHEN** the production build output is scanned for absolute `http://` or `https://` URLs and protocol-relative `//` resource references
- **THEN** every absolute URL points at an allowlisted documentation host or is an XML namespace identifier, and there are no protocol-relative resource references

#### Scenario: Documentation link opened
- **WHEN** the user clicks a documentation link
- **THEN** the destination opens in a new tab and receives no referrer
