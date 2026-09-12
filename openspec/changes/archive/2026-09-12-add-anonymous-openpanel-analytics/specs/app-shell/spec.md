## MODIFIED Requirements

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
The application MUST use OpenPanel only for anonymous screen-view, outgoing-link, and declarative
attribute events. It MUST NOT enable session replay, set analytics cookies, store persistent visitor
identifiers, transmit user-entered URL values, or persist those values in localStorage, sessionStorage,
IndexedDB, or cookies.

#### Scenario: Anonymous analytics starts
- **WHEN** the application loads with network access
- **THEN** it loads the SDK from `https://openpanel.themkvz.com/op1.js` and initializes client
  `2e6568f4-b5bc-46b9-bf0b-64c63e9f7263` against `https://openpanel.themkvz.com/api`

#### Scenario: Analytics is unavailable
- **WHEN** the analytics script or API cannot be reached
- **THEN** URL inspection continues to work

#### Scenario: No storage writes on use
- **WHEN** a user enters or edits a URL
- **THEN** that value is neither included in analytics events nor written to browser storage
