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

### Requirement: No tracking or persistence of user data
The application MUST NOT set cookies, MUST NOT include analytics or fingerprinting, and MUST NOT persist user-entered URLs to any storage (localStorage, sessionStorage, IndexedDB, cookies).

#### Scenario: No storage writes on use
- **WHEN** a user loads the application and interacts with it
- **THEN** no cookies are set and no user-entered content ends up in browser storage

### Requirement: Base presentation follows system theme
The application shell SHALL use semantic HTML landmarks (`header`, `main`) and SHALL render in light or dark mode to match the user's system color-scheme preference.

#### Scenario: Dark system preference
- **WHEN** the user's system prefers a dark color scheme
- **THEN** the application renders with a dark theme and no manual toggle is needed

#### Scenario: Shell landmarks present
- **WHEN** the application loads
- **THEN** the document contains a `header` with the product name "URL Inspector" and a `main` region
