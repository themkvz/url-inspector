## Context

See proposal.md — Why. Constraints that shape the approach:

- The URL input is a transparent `<textarea>` stacked over an `aria-hidden` colored mirror
  (`src/inspector/url-input.tsx`, `src/styles/app.css:107-126`). The accessibility tree therefore
  already sees exactly one text field with the exact raw value — that part is correct and must stay.
  It is only forced-colors mode that breaks it.
- The store is one-way: `raw` → `parts`/`ranges` → UI, edits → `update()` → `raw`
  (`src/inspector/store.ts`). Focus management must not become a second source of truth flowing
  back into that loop.
- `src/url/` is pure and framework-free, and its lossless round-trip is the core invariant. Nothing
  in this change touches it.
- Runtime dependencies must be bundled and self-hosted. The two new dependencies are dev-only and
  never reach `dist/`, so `src/privacy.test.ts` keeps passing unchanged.

## Goals / Non-Goals

**Goals:**

- Every gap in specs/ closed with the smallest change to existing components.
- Focus never lands on `document.body` as a result of a user action.
- Automated regression cover for the static parts of the a11y contract (names, roles, contrast).

**Non-Goals:**

- Arrow-key roving navigation between part labels. Explicitly rejected — see Decisions.
- A skip link. One `header` with no navigation and a single `main`; there is nothing to skip past.
- Reworking the mirror/textarea architecture. Forced-colors gets a CSS fallback, not a redesign.
- Internationalization or a manual theme toggle.
- Raising contrast beyond WCAG AA.

## Decisions

### Toggle buttons over a real tablist

`part-labels.tsx` currently emits `role="tablist"` + `role="tab"` + `aria-selected` with no
`aria-controls`, no `tabpanel`, and no roving tabindex. Screen readers announce "tab 3 of 8" and
users expect arrow keys that do nothing — the false promise is worse than no ARIA at all.

Chosen: `role="group" aria-label="URL parts"` with `aria-pressed` toggle buttons. This is a net
deletion (`role`/`aria-selected` → `aria-pressed`), every chip stays a Tab stop, and the semantics
match what the row actually is — a filter toolbar, not a tab strip.

Rejected: implementing the real tablist. It needs roving tabindex, Arrow/Home/End handling,
`aria-controls` into a `role="tabpanel"` that wraps both the editor and the reference, and
`tabindex={-1}` panel focus — roughly 30 lines of keyboard code to own and test, buying one Tab stop
instead of eight. Eight chips is a short row; Tab through it is fine.

### Absence in the accessible name, not a `title` or `aria-description`

`.part-absent` signals absence with a dashed border and hollow fill — fine for sighted users
(WCAG 1.4.1 is satisfied by the border), invisible to a screen reader. The fix is a visually-hidden
suffix inside the button, so the name becomes "Port (not present)". `aria-description` has patchier
support and `title` is not reliably announced.

This needs one utility class (the standard clip-rect visually-hidden pattern) in `app.css`. Pico
does not ship one.

### Row context via `aria-label`, not table semantics

A screen reader in forms mode reads the query table's inputs without their column headers, so eight
rows currently present as eight unnamed text fields and three repeated "Move parameter up" buttons.
Composing the name from the row's own key — `Key for parameter 1`, `Move q up`, `Remove parameter
page` — is a template-literal change per control with no structural churn.

Falls back to the 1-based row index when the key is empty (a freshly added parameter), so names stay
unique. Duplicate keys are legal in this app, so the index is appended whenever the key is not unique
within the query.

Rejected: `<th scope="row">` per row. It would make the key a row header, but the key is itself an
editable field, and header cells containing inputs are read inconsistently.

### `aria-disabled` over `disabled` for reorder buttons

A `disabled` button is removed from the tab order, so moving a row to position 0 disables the button
the user just pressed and drops focus to `body` — the classic disabled-button focus trap. Switching
to `aria-disabled={...}` plus an early return in the handler keeps the button focusable, keeps focus
exactly where the user left it, and correctly announces "dimmed"/"unavailable". Pico styles off
`[disabled]`, so `[aria-disabled="true"]` needs the same visual treatment added in `app.css`.

### Post-remove focus via a ref-per-row, matching the existing `inputEl` pattern

Removal genuinely destroys the focused element, so a target must be chosen. Rule: focus the remove
button of the row that took the removed row's index; if the removed row was last, focus the
"Add parameter" button.

Implementation: an imperative ref object in `query-table.tsx` (a `Map<number, HTMLButtonElement>`
populated by `ref` callbacks) plus a `useLayoutEffect` that runs when a pending focus target is set.
This mirrors `store.ts`'s existing `inputEl` escape hatch rather than inventing a new mechanism, and
deliberately keeps focus state local to the component instead of adding a signal — focus is not
application state and must not enter the `raw` → `parts` loop.

### Forced colors: hide the mirror, reveal the textarea

Under `forced-colors: active` the UA overrides `color: transparent` on the textarea to a real system
color, so the URL renders twice — once in system ink, once through the mirror — visibly doubled and
misaligned. The mirror's per-part colors are overridden to system colors anyway, so it carries no
information in that mode.

```css
@media (forced-colors: active) {
  .url-input-mirror { display: none; }
  .url-input-textarea { color: CanvasText; }
}
```

Part identity is still available in that mode through the part labels and the editor, so nothing is
lost beyond the coloring that forced-colors deliberately discards.

### Reduced motion scoped to the decorative rules only

`.part-labels button` animates `box-shadow` and `transform` on hover (`app.css:145-153`). Under
`prefers-reduced-motion: reduce`, drop the `transition` and the `translateY` and keep the box-shadow
as a static state change, so the hover affordance survives without movement.

### Status regions: `role="status"` on a stable wrapper

`browser-line.tsx` returns `null` when there is nothing to say, so the live region would be created
and destroyed rather than updated — most screen readers do not announce a region that appears at the
same moment its content does. The wrapper element must render unconditionally with
`role="status"` and hold the message as its text, empty when silent.

The line derives from `diagnostics`, which recomputes on every keystroke, so this region will speak
during typing. Politeness (`role="status"` is implicitly `aria-live="polite"`) means it is queued
and interrupted by the next keystroke's update, which is the intended behavior for a
continuously-updating status. The plain-language `summary` is deliberately **not** a live region —
it changes on literally every character and would be unusable noise; it is reachable as ordinary
text above the input.

Copy feedback reuses the same pattern: the button's own label change is announced because the button
is focused, so the separate status region only needs to carry the fallback instruction.

### `axe-core` + `happy-dom`, dev-only

`bun test` has no DOM. `happy-dom`'s global registrator installs one into the Bun test process, and
`preact`'s `render()` then mounts `<App/>` into it for `axe.run()` to walk.

Scope of what this actually buys: axe catches the unnamed inputs, the broken tab roles, duplicate
names, and color-contrast on rendered nodes. It cannot see focus loss, forced-colors behavior, live
regions firing, or reduced motion — those stay manual, per the checklist in tasks.md. The test is
regression cover for future changes, not the verification of this one.

Both land in `devDependencies`. `bun build` never sees them, so `dist/` and `src/privacy.test.ts`
are untouched.

### Contrast: measure first, change only misses

The eight part colors already look close to the 4.5:1 line in light mode (e.g. `--part-host #0d6e2e`
on white ≈ 4.6:1). The opacity-dimmed rules — `.browser-line` at 0.85 and `.no-value` at 0.6 — are
the likelier failures, and `.no-value` is also carrying meaning through italics + opacity alone.
Measure all of them against their real effective backgrounds in both themes, then adjust only the
tokens that miss. Re-tuning the whole palette would compress the hues that make parts
distinguishable.

## Risks / Trade-offs

- **`aria-disabled` buttons look enabled** → Pico's dimming is keyed to `[disabled]`; add the
  matching `[aria-disabled="true"]` rule in the same commit, or boundary rows silently look active.
- **The status region speaks on every keystroke while typing an invalid URL** → politeness queues and
  supersedes, so only the latest message is heard; verified in the manual VoiceOver pass. If it
  still proves noisy, debounce is the escape hatch, but do not add it speculatively.
- **`happy-dom` diverges from a real browser** → its computed styles and layout are approximations,
  so axe's contrast check may report differently than a browser. Treat the automated contrast result
  as a signal and confirm the palette numbers manually; the checklist covers it.
- **Two new dev dependencies on a deliberately minimal project** → both are dev-only and the
  `dist/` privacy scan pins that guarantee. If the DOM shim becomes a maintenance cost, the test
  can be deleted without touching application code.
- **Composed `aria-label`s drift from visible text** → the names are derived from the parameter key
  that is already visible in the row, so they cannot go stale independently.
- **Post-remove focus is imperative and easy to break silently** → covered by an explicit item in the
  manual checklist, since axe cannot see it.

## Migration Plan

Not applicable — a static client-only app with no persisted state, no API, and no stored user data.
Rollback is reverting the commit.
