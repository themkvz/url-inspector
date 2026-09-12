## 1. Shared CSS utilities

- [x] 1.1 Add a visually-hidden utility class to `src/styles/app.css` (standard clip-rect pattern); Pico ships none
- [x] 1.2 Add `[aria-disabled="true"]` styling mirroring Pico's `[disabled]` dimming, so buttons kept focusable still read as unavailable

## 2. Part labels

- [x] 2.1 In `src/inspector/part-labels.tsx`, replace `role="tablist"` with `role="group" aria-label="URL parts"` and each button's `role="tab"`/`aria-selected` with `aria-pressed`
- [x] 2.2 Append a visually-hidden "(not present)" inside labels whose part is absent, so absence is in the accessible name and not only the dashed border
- [x] 2.3 Verify the existing `:focus-visible` outline is still visible on both filled and `.part-absent` chips in light and dark themes

## 3. Query table naming

- [x] 3.1 In `src/inspector/query-table.tsx`, give each key input an `aria-label` naming its parameter (key text, falling back to the 1-based index when empty)
- [x] 3.2 Give each value input the same treatment, including the read-only "no value" case
- [x] 3.3 Rewrite the per-row button `aria-label`s (move up, move down, remove parameter, add value, remove value, decode toggle) to carry the same parameter identifier
- [x] 3.4 Append the row index to composed names when a key is duplicated within the query, so no two controls share a name
- [x] 3.5 Add `aria-pressed` to the raw ⇄ decoded toggle reflecting `isDecoded`

## 4. Query table focus management

- [x] 4.1 Swap the move up/down buttons from `disabled` to `aria-disabled`, with an early return in the click handler at the boundaries
- [x] 4.2 Add a `Map<number, HTMLButtonElement>` ref of remove buttons plus a ref for the "Add parameter" button, populated by `ref` callbacks
- [x] 4.3 Add a `useLayoutEffect` that, after a removal, focuses the remove button of the row that took the removed index, or "Add parameter" when the removed row was last — keep this state local to the component, never in `store.ts`

## 5. Status announcements

- [x] 5.1 Change `src/inspector/browser-line.tsx` to always render its wrapper with `role="status"`, carrying an empty string when there is nothing to report, instead of returning `null`
- [x] 5.2 In `src/inspector/inspector.tsx`, route the Copy button's fallback instruction through a `role="status"` region
- [x] 5.3 Replace the hardcoded `Ctrl+C` fallback text with platform-neutral wording
- [x] 5.4 Confirm the plain-language `summary` is left as ordinary text — it changes on every keystroke and must not be a live region

## 6. Named regions

- [x] 6.1 Wrap the part editor in `src/inspector/part-editor.tsx` with `role="region"` named for the active part
- [x] 6.2 Do the same for `src/inspector/part-reference.tsx`
- [x] 6.3 Give `src/inspector/query-table.tsx` the same region treatment, since it replaces the part editor when the query is active

## 7. Media-query presentation

- [x] 7.1 Add a `prefers-reduced-motion: reduce` block dropping the `.part-labels button` `transition` and hover `translateY`, keeping the box-shadow as a static state change
- [x] 7.2 Add a `forced-colors: active` block hiding `.url-input-mirror` and setting `.url-input-textarea { color: CanvasText }` so the URL renders exactly once
- [x] 7.3 Verify control boundaries and focus indicators survive forced-colors (Pico's borders, the chip borders, the `.part-absent` dashed border)

## 8. Contrast audit

- [x] 8.1 Measure all eight `--part-*` tokens against the page background in light and dark themes; record the ratios
- [x] 8.2 Measure chip text (`--chip-fg`) against each filled chip background, and `.part-absent` text and dashed border against the page background
- [x] 8.3 Measure `.browser-line` at 0.85 opacity and `.query-table .no-value` at 0.6 opacity against their effective backgrounds
- [x] 8.4 Adjust only the tokens or opacities that fall below 4.5:1 text / 3:1 non-text; leave passing values alone

## 9. Automated coverage

- [x] 9.1 `bun add -d axe-core happy-dom`
- [x] 9.2 Add `src/a11y.test.ts`: register the happy-dom globals, `render(<App/>)` into the document, run `axe.run()`, assert zero violations
- [x] 9.3 Seed the test with a URL exercising every part plus a multi-parameter query, including a duplicate key and a flag parameter, so the query table's names are actually covered
- [x] 9.4 Confirm `bun test` still passes `src/privacy.test.ts` and that `dist/` contains neither new dependency

## 10. Manual verification

- [x] 10.1 Keyboard-only pass: Tab from the input through every control and back with Shift+Tab; no focus trap, visible indicator throughout
- [x] 10.2 Keyboard-only pass on the query table: add, edit, decode-toggle, reorder to both boundaries, and remove rows including the last one — focus is never lost to `body`
- [ ] 10.3 VoiceOver pass: part labels announce pressed state and absence; every query control has a distinct name; the invalid-URL line and copy result are announced
- [x] 10.4 Forced-colors pass (Windows High Contrast or `forced-colors` emulation in devtools): URL text appears exactly once and is legible
- [x] 10.5 Reduced-motion pass with the OS setting on: no chip movement, state still distinguishable
- [x] 10.6 400px viewport pass: query table with long keys and values remains usable and the page does not scroll horizontally
- [x] 10.7 `bun run check` and `bun test` clean
