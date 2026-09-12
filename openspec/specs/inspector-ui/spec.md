## Purpose

The single-screen inspector, modeled on crontab.guru: one large editable URL, one part in focus at a time, an editor and plain-language reference for that part, and links to the official specs.

## Requirements

### Requirement: Editable URL input colored by part
The main input SHALL show the URL in a monospace face, with each part (scheme, username, password, host, port, path, query, fragment) in its own fixed color. It SHALL stay a normal text field: typing, pasting, selection, the native undo shortcut, and the caret all work as in any text field. Colors SHALL be readable in both light and dark themes and SHALL NOT be the only way parts are distinguished (part labels also exist).

#### Scenario: Paste colors parts
- **WHEN** the user pastes `https://a.com:8080/p?q=1#f`
- **THEN** each part is shown in its part color, and the text is exactly as pasted

#### Scenario: Typing is not disrupted
- **WHEN** the user types in the middle of the URL
- **THEN** the caret stays where it was, and the text is never rewritten by the app

### Requirement: Plain-language summary
Above the input, the system SHALL show a one-sentence description of the URL naming its scheme, host, port if present, path, number of query parameters, and fragment if present.

#### Scenario: Summary for a full URL
- **WHEN** the URL is `https://api.example.com:8443/v1/items?q=a&x&q=2#top`
- **THEN** the summary names HTTPS, `api.example.com`, port `8443`, path `/v1/items`, 3 query parameters, and fragment `top`

### Requirement: Browser form and validity line
Below the summary, the system SHALL show the browser-normalized form when it differs from the input, or a validity error when a browser rejects the URL. It SHALL show nothing extra when the URL is already normalized.

#### Scenario: Normalization shown
- **WHEN** the URL is `HTTP://Example.COM/a/./b`
- **THEN** a line reads "Browser sends: http://example.com/a/b"

#### Scenario: Invalid URL shown
- **WHEN** a browser rejects the URL
- **THEN** a line says the browser rejects this URL, and all parts can still be inspected and edited

### Requirement: Part selection
A row of part labels below the input SHALL select the active part. Placing the caret inside a part of the input SHALL select that part. Hovering or focusing a label SHALL highlight that part's span in the input. Labels for absent parts SHALL still be selectable, so the part can be added.

#### Scenario: Caret selects part
- **WHEN** the user places the caret inside the host
- **THEN** the host label becomes active and the host editor and reference are shown

#### Scenario: Add an absent part
- **WHEN** the URL has no fragment and the user selects the fragment label and enters `top`
- **THEN** `#top` is appended to the URL

### Requirement: Part editor
The active part SHALL be editable below the labels. Scalar parts SHALL use a single text field. The query SHALL use a table of parameters, where each row has a key and value and can be removed or moved up or down, plus an "Add parameter" action. Each value SHALL have a raw ⇄ decoded toggle. Edits SHALL update the input immediately.

#### Scenario: Edit a query value decoded
- **WHEN** the user switches a value to decoded and changes `a b` to `a b c` for raw `a+b`
- **THEN** the input shows `a+b+c` for that value and nothing else in the URL changes

#### Scenario: Reorder parameters
- **WHEN** the user moves the second parameter up
- **THEN** the first two parameters swap in the input, with their raw text unchanged

#### Scenario: Flag parameter shown
- **WHEN** the query contains `x` with no `=`
- **THEN** its value cell indicates "no value", which is distinct from an empty value

### Requirement: Part reference with official documentation
For the active part, the system SHALL show a short explanation, a table of its delimiters and special characters with meanings, and links to the relevant section of RFC 3986 and the WHATWG URL Standard. Links SHALL open in a new tab without sending a referrer.

#### Scenario: Query reference
- **WHEN** the query part is active
- **THEN** the reference lists `?`, `&`, `=`, `+`, and `%XX` with their meanings and links to RFC 3986 §3.4 and the WHATWG URL Standard's query and `application/x-www-form-urlencoded` sections

#### Scenario: Links do not leak referrer
- **WHEN** the user opens a documentation link
- **THEN** it opens in a new tab with `rel="noreferrer noopener"`

### Requirement: Copy and example
The input SHALL have a Copy button that copies the exact current URL to the clipboard and confirms with "Copied". An Example action SHALL load a URL that contains every part.

#### Scenario: Copy exact text
- **WHEN** the user clicks Copy
- **THEN** the clipboard contains the input text byte-for-byte and the button briefly reads "Copied"

#### Scenario: Example fills all parts
- **WHEN** the user clicks Example
- **THEN** the input contains a URL where every part label refers to a present part

### Requirement: Empty state
With an empty input, the system SHALL show "Paste a URL to see its parts." in place of the summary, and SHALL keep the Example action available.

#### Scenario: Initial load
- **WHEN** the app loads
- **THEN** the input is empty and focused, and the empty-state message and Example action are shown

### Requirement: Responsive and keyboard accessible
The inspector SHALL work at 400px width without horizontal page scroll (long URLs wrap inside the input), and every control SHALL be reachable and operable by keyboard with visible focus.

#### Scenario: Narrow viewport
- **WHEN** the viewport is 400px wide and the URL is 300 characters long
- **THEN** the URL wraps inside the input and the page does not scroll horizontally

#### Scenario: Keyboard only
- **WHEN** the user navigates with Tab and arrow keys only
- **THEN** they can select any part, edit it, reorder parameters, open documentation links, and copy
