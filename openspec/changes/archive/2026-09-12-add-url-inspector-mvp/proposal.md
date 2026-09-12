## Why

The app shell exists but does nothing yet. The product promise is to break down, edit, and rebuild URLs without losing details, and the platform `URL` API can't deliver it: it lowercases, drops default ports, resolves dot segments, and re-serializes query strings (`?x` → `?x=`, `%20` ↔ `+`). The MVP needs its own lossless core and a focused UI modeled on crontab.guru: one big editable input, one part in focus at a time, and a reference for that part inline.

## What Changes

- A lossless URL core. It tokenizes any scheme using the RFC 3986 generic syntax and keeps every part as raw text, so `serialize(tokenize(x)) === x` holds for any input.
- A query model that preserves order, duplicate keys, flag params (`?x`) vs empty values (`?x=`), and the encoding style (`+` vs `%20`).
- Diagnostics for http(s): browser validity and "what the browser would send" (WHATWG-normalized form) when it differs from the input.
- An inspector UI in the crontab.guru style:
  - a plain-language summary of the URL
  - a large editable URL input, colored per part, with Copy
  - a row of part labels that selects the active part
  - an editor for the active part (a text field, or a table for the query)
  - a reference panel with delimiters, encoding notes, and links to RFC 3986 and the WHATWG URL Standard
  - an Example button
- Fixed, distinct colors per URL part, readable in both light and dark themes (follows the system theme).
- **Modified privacy rule:** user-clicked documentation links to official spec sites are allowed (opened with no referrer). Resource loads from other origins stay forbidden.

Out of scope, planned for later: manual theme switcher, per-scheme views (`mailto:`, `data:`), share links via `#fragment`, undo, nested-URL drill-down, diffing two URLs, tracking-param removal, user-customizable colors.

## Capabilities

### New Capabilities
- `url-core`: lossless tokenizing, serializing, and part editing of URLs; query-param model; decoded views with style-preserving re-encoding; browser-normalization diagnostics.
- `inspector-ui`: the single-screen inspector: summary, colored editable input, part selection, part editors, reference panel with spec links, copy, example, empty and invalid states.

### Modified Capabilities
- `app-shell`: "No outbound third-party requests" now distinguishes resource loads (still forbidden) from user-initiated navigation to allowlisted documentation sites (allowed, no referrer).

## Impact

- New code: `src/url/` (pure core + tests), `src/inspector/` (store + components), part color tokens in CSS.
- `src/app.tsx` replaces its placeholder with the inspector.
- `src/privacy.test.ts` changes from "no absolute URLs in resource positions" to "every absolute URL in the build points at an allowlisted documentation host."
- No new dependencies.
