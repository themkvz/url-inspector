## MODIFIED Requirements

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

