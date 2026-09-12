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
A row of part labels below the input SHALL select the active part. The row SHALL be exposed as a labelled group of toggle buttons, each reporting whether it is the active part; it SHALL NOT claim tab semantics it does not implement. Placing the caret inside a part of the input SHALL select that part. Hovering or focusing a label SHALL highlight that part's span in the input. Labels for absent parts SHALL still be selectable, so the part can be added, and absence SHALL be conveyed in the label's accessible name, not by border style and color alone.

#### Scenario: Caret selects part
- **WHEN** the user places the caret inside the host
- **THEN** the host label becomes active and the host editor and reference are shown

#### Scenario: Add an absent part
- **WHEN** the URL has no fragment and the user selects the fragment label and enters `top`
- **THEN** `#top` is appended to the URL

#### Scenario: Active part is exposed as pressed state
- **WHEN** the user selects the Query label
- **THEN** the Query label reports itself as pressed and every other label reports itself as not pressed

#### Scenario: Absent part is announced as absent
- **WHEN** the URL has no port and the user reaches the Port label with a screen reader
- **THEN** the label's accessible name identifies it as the Port part and states that the part is not present

#### Scenario: Every label is reachable by Tab
- **WHEN** the user presses Tab repeatedly from the URL input
- **THEN** focus lands on each part label in visual order, each with a visible focus indicator, and Space or Enter selects the focused part

### Requirement: Part editor
The active part SHALL be editable below the labels. Scalar parts SHALL use a single text field. The query SHALL use a table of parameters, where each row has a key and value and can be removed or moved up or down, plus an "Add parameter" action. Each value SHALL have a raw ⇄ decoded toggle that reports its current state. Edits SHALL update the input immediately.

Every field and button in the query table SHALL have an accessible name that identifies both what it does and which parameter it acts on, so controls repeated across rows are distinguishable without sight. Reorder controls at the ends of the list SHALL remain focusable while reporting that they are unavailable, and SHALL do nothing when activated. After a parameter is removed, keyboard focus SHALL move to a defined control rather than being lost.

#### Scenario: Edit a query value decoded
- **WHEN** the user switches a value to decoded and changes `a b` to `a b c` for raw `a+b`
- **THEN** the input shows `a+b+c` for that value and nothing else in the URL changes

#### Scenario: Reorder parameters
- **WHEN** the user moves the second parameter up
- **THEN** the first two parameters swap in the input, with their raw text unchanged

#### Scenario: Flag parameter shown
- **WHEN** the query contains `x` with no `=`
- **THEN** its value cell indicates "no value", which is distinct from an empty value

#### Scenario: Query fields are individually named
- **WHEN** the query is `q=a&page=2` and the user tabs through the table with a screen reader
- **THEN** each key field, value field, and row button announces a distinct name naming the parameter it belongs to, and no two controls in the table share a name

#### Scenario: Decode toggle reports its state
- **WHEN** the user activates the raw ⇄ decoded toggle for a value
- **THEN** the toggle reports itself as pressed while the decoded form is shown and not pressed while the raw form is shown

#### Scenario: Focus survives a boundary reorder
- **WHEN** the keyboard user activates "move up" on the second parameter, making it first
- **THEN** focus stays on that row's "move up" control, which now reports itself unavailable and does nothing when activated again

#### Scenario: Focus survives a removal
- **WHEN** the keyboard user removes a parameter that is not the last row
- **THEN** focus moves to the remove control of the row that took its place

#### Scenario: Removing the last parameter keeps focus in the editor
- **WHEN** the keyboard user removes the only remaining parameter
- **THEN** focus moves to the "Add parameter" action and does not fall back to the document body

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
The inspector SHALL work at 400px width without horizontal page scroll (long URLs wrap inside the input), and every control SHALL be reachable and operable by keyboard with visible focus. The query table SHALL reflow at that width without introducing page-level horizontal scrolling. No interaction SHALL trap keyboard focus, and no action SHALL leave focus on the document body. Every focus indicator SHALL remain visible against its own background and against the adjacent page background.

#### Scenario: Narrow viewport
- **WHEN** the viewport is 400px wide and the URL is 300 characters long
- **THEN** the URL wraps inside the input and the page does not scroll horizontally

#### Scenario: Keyboard only
- **WHEN** the user navigates with Tab and arrow keys only
- **THEN** they can select any part, edit it, reorder parameters, open documentation links, and copy

#### Scenario: Narrow viewport with query table
- **WHEN** the viewport is 400px wide and the query has parameters with long keys and values
- **THEN** the query editor remains usable and the page itself does not scroll horizontally

#### Scenario: No focus trap
- **WHEN** the user tabs forward from the first control to past the last control and then shift-tabs back
- **THEN** focus leaves and re-enters the application in visual order without ever being held by a control

### Requirement: Announced status changes
Status the system reports on its own — the browser-rejects-this-URL message and the outcome of the Copy action — SHALL be exposed to assistive technology as polite status updates, so a user who is not looking at that part of the screen is told about it. These updates SHALL NOT steal focus and SHALL NOT announce on every keystroke of unrelated editing.

The browser-normalized form SHALL NOT be announced. Unlike the messages above it is derived from the URL text and changes on every keystroke, so announcing it would re-read the whole URL character by character; it is presented as ordinary text, for the same reason the plain-language summary is.

#### Scenario: Invalid URL is announced
- **WHEN** the user's edit makes the URL one a browser rejects
- **THEN** the rejection message is announced politely and keyboard focus stays where the user left it

#### Scenario: Normalized form is shown but not announced
- **WHEN** the user types a URL that a browser normalizes, one character at a time
- **THEN** the normalized form is visible as ordinary text and is not announced as a status update

#### Scenario: Copy result is announced
- **WHEN** the user activates Copy and the clipboard write succeeds
- **THEN** the success is announced politely

#### Scenario: Clipboard fallback names no single platform
- **WHEN** the clipboard write fails and the fallback instruction is shown
- **THEN** the instruction does not assume one platform's modifier key

### Requirement: Editor and reference are named regions
The part editor and the part reference SHALL each be exposed as a named region whose name identifies the part it describes, so a screen-reader user can jump to them directly instead of tabbing past every control above them.

#### Scenario: Regions carry the active part's name
- **WHEN** the Fragment part is active
- **THEN** the editor region and the reference region each expose a name identifying them as the fragment editor and the fragment reference

#### Scenario: Region names follow the active part
- **WHEN** the user switches the active part from Fragment to Host
- **THEN** both region names update to identify the host
