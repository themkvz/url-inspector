## MODIFIED Requirements

### Requirement: Discoverability assets are self-hosted
Every icon, image, manifest, and stylesheet referenced by the discoverability metadata MUST be served
from the application's own origin. Absolute URLs in metadata MUST only ever name the canonical origin
`https://url.themkvz.com`, and MUST NOT cause the browser to fetch from any other origin.

#### Scenario: No third-party asset hosts
- **WHEN** the metadata added by this capability is scanned for absolute URLs
- **THEN** every one has the host `url.themkvz.com`

#### Scenario: Loading the page fetches only same-origin resources
- **WHEN** the built page is loaded with network inspection enabled
- **THEN** every icon, image, manifest, and stylesheet request goes to the serving origin
