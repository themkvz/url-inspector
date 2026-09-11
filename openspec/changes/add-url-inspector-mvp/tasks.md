## 1. URL core (`src/url/`)

- [ ] 1.1 `Parts`/`Param` types; `tokenize` via the RFC 3986 Appendix B regex plus authority split (last `@`, IPv6 brackets, port), returning parts and their character ranges
- [ ] 1.2 `serialize(parts)`; round-trip test table covering the spec scenarios (normalizable, malformed, custom/opaque schemes, IPv6, empty vs absent delimiters, `a&&b`)
- [ ] 1.3 Query parse/serialize with ordered `Param[]` (`null` vs `""` values)
- [ ] 1.4 Edit functions: `setPart`, `setParam`, `addParam`, `removeParam`, `moveParam`, including delimiter insert/remove; tests check that only the target substring changes
- [ ] 1.5 Codec: `decode` (keeps invalid `%XX` literally), `encodeLike(originalRaw, decoded)` preserving `+`/`%20` style, `%20` for new params; tests
- [ ] 1.6 `diagnose(raw)` using `new URL()` as the oracle (valid, browser form if different; validity only for non-http(s)); tests
- [ ] 1.7 `describe(parts)` summary sentence; tests

## 2. State and part data (`src/inspector/`)

- [ ] 2.1 `store.ts`: `raw` and `activePart` signals; `parts`, `diagnostics`, `summary` computed values; `update(fn)` that writes `raw = serialize(fn(parts))`
- [ ] 2.2 `parts.ts`: the `PARTS` record (label, color token, explanation, delimiter rows, RFC + WHATWG links); verify every WHATWG anchor resolves
- [ ] 2.3 Part color tokens `--part-*`, for light and dark (`prefers-color-scheme`), each ≥4.5:1 against the Pico background; monospace font stack via Pico variables

## 3. UI components

- [ ] 3.1 `url-input.tsx`: transparent textarea over a colored mirror, shared wrapping and scroll sync, caret → `activePart`, label hover → span highlight
- [ ] 3.2 Copy button ("Copy" → "Copied", with a fallback when clipboard is unavailable) and an Example action loading a URL that has every part
- [ ] 3.3 Summary sentence, empty state ("Paste a URL to see its parts."), and browser line ("Browser sends: …" / rejection message)
- [ ] 3.4 `part-labels.tsx`: labels rendered from `PARTS`, keyboard selectable, absent parts still selectable
- [ ] 3.5 `part-editor.tsx`: a text field for scalar parts; adding an absent part inserts its delimiter
- [ ] 3.6 `query-table.tsx`: key/value rows, "no value" indicator, raw ⇄ decoded toggle, move up/down, remove, "Add parameter"
- [ ] 3.7 `part-reference.tsx`: explanation, delimiter table, spec links (`target="_blank" rel="noreferrer noopener"`) and the RFC vs WHATWG footer line
- [ ] 3.8 Replace the `app.tsx` placeholder with the inspector; the input is focused on load

## 4. Privacy and verification

- [ ] 4.1 Rewrite `src/privacy.test.ts` as a host allowlist (documentation hosts + `www.w3.org` xmlns) plus the protocol-relative resource check
- [ ] 4.2 `bun test` and `bun run check` pass
- [ ] 4.3 Manual check in Chrome, Firefox, and Safari: overlay alignment with long wrapping URLs, IME/paste/undo, a 400px viewport, keyboard-only flow, light and dark themes, only same-origin requests in DevTools
- [ ] 4.4 Update `CLAUDE.md` architecture (core/store/UI data flow, lossless invariant)
