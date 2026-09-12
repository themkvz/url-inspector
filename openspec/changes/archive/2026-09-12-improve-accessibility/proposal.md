## Why

The MVP shipped a keyboard-accessibility requirement it does not actually meet. The part labels
declare `role="tablist"`/`role="tab"` while implementing none of that pattern, the query table's key
and value fields have no accessible names, and reordering or removing a parameter drops keyboard
focus onto `<body>` — a keyboard-only user loses their place mid-edit. Several states (absent part,
browser-rejects-this-URL, copy result) are conveyed only visually.

## What Changes

- **BREAKING (ARIA contract only)**: the part labels stop claiming tab semantics. They become
  `aria-pressed` toggle buttons inside a labelled `role="group"`. Every chip stays its own Tab stop;
  no arrow-key roving is added.
- Absent parts gain a non-visual cue in the accessible name, so the dashed-border/color treatment is
  no longer the only signal.
- Every query-table control gets a unique accessible name carrying its row context, so eight
  identically-named "Move parameter up" buttons become distinguishable.
- Reorder buttons switch from `disabled` to `aria-disabled`, keeping them focusable at the list
  boundaries; removing a parameter moves focus to a defined neighbour instead of losing it.
- The raw ⇄ decoded toggle exposes its state via `aria-pressed`.
- The validity / browser-normalized line becomes a polite status region, and the Copy button's
  result is announced.
- The editor and reference panels become named regions, so they are reachable by landmark/region
  navigation instead of only by tabbing past everything above them.
- Presentation honours `prefers-reduced-motion` (chip hover lift/transition) and
  `forced-colors: active` (the transparent-textarea + `aria-hidden` mirror renders the URL twice
  under forced colors).
- Text and UI contrast is measured across both themes; only tokens that miss WCAG AA are adjusted.
- The clipboard fallback stops hardcoding `Ctrl+C`.
- Automated a11y regression coverage: `axe-core` + `happy-dom` as **dev-only** dependencies and a
  new `src/a11y.test.ts`. Neither enters `dist/`, so the bundled/self-hosted constraint and the
  existing `dist/` privacy scan are unaffected.

## Capabilities

### New Capabilities

None. This change tightens existing behavior rather than introducing a new capability.

### Modified Capabilities

- `inspector-ui`: part selection loses tab semantics and gains an absent-part cue; the part editor
  gains per-control accessible names, focus retention across reorder/remove, and a pressed state on
  the decode toggle; the browser/validity line and copy result become announced status; editor and
  reference become named regions; the keyboard requirement is sharpened into testable criteria.
- `app-shell`: base presentation additionally honours `prefers-reduced-motion` and
  `forced-colors: active`, and commits to WCAG AA contrast minimums in both themes.

## Impact

- **Code**: `src/inspector/part-labels.tsx`, `query-table.tsx`, `browser-line.tsx`, `inspector.tsx`,
  `part-editor.tsx`, `part-reference.tsx`, `src/styles/app.css`.
- **Store**: `src/inspector/store.ts` may need a focus-target handle for post-remove focus, in the
  same spirit as the existing `inputEl` ref. `src/url/` is untouched — the lossless round-trip core
  is out of scope.
- **Dependencies**: two new **devDependencies** (`axe-core`, `happy-dom`). No runtime dependency is
  added; the production bundle is unchanged in size and origin set.
- **Tests**: new `src/a11y.test.ts`; `src/privacy.test.ts` and `src/url/url.test.ts` unaffected.
