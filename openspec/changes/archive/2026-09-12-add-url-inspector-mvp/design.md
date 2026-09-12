## Context

`src/app.tsx` is a placeholder. The stack is fixed (see config/CLAUDE.md): Preact + signals, classless Pico, and Bun for build and test. Motivation: see proposal.md. Behavior: see specs/url-core, specs/inspector-ui, specs/app-shell.

## Goals / Non-Goals

**Goals:**
- A pure, fully tested `url/` core, with the round-trip invariant as the main test.
- One source of truth for state, so the input and the editors can't drift apart or loop.
- A crontab.guru-style focus: a single screen, one part active at a time.

**Non-Goals:**
- Manual theme switcher (planned next; part colors are CSS variables, so a switcher only toggles `data-theme`).
- Per-scheme parsing beyond the generic syntax, share links, undo, diffing two URLs, tracking-param removal.
- Punycode/IDNA display beyond what `new URL()` reports in the browser form.

## Decisions

**Tokenize with the RFC 3986 Appendix B regex, then split the authority by hand.**
`^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?` is the RFC's own splitting regex. It matches every string, and its capture groups are raw substrings. Then:
- userinfo is everything before the last `@` in the authority, and the password is what follows the first `:` in the userinfo;
- the port is what follows the last `:` after the host, unless it's inside `[...]` (IPv6).

Presence is modeled with `null` vs `""` (e.g. `query: null` = no `?`, `""` = `?` with nothing after it). This makes the round-trip an identity by construction.
- Alternative: build on `new URL()`. Rejected because it normalizes and so can't round-trip.
- Alternative: a hand-written character state machine. Rejected as more code with no gain over the RFC regex.

**Model.**
```ts
type Param = { key: string; value: string | null }   // null = "x", "" = "x="
type Parts = {
  scheme: string | null; username: string | null; password: string | null
  host: string | null; port: string | null; path: string
  query: Param[] | null; fragment: string | null
}
```
`host !== null` means `//` is present. All strings are raw. Pure functions: `tokenize`, `serialize`, `setPart`, `setParam`, `addParam`, `removeParam`, `moveParam`, and `decode`/`encodeLike(original, decoded)`. Every update is immutable.

**The raw string is the single source of truth.**
```
raw: signal<string> ──computed──▶ parts = tokenize(raw)
                                ▶ diagnostics = diagnose(raw)
                                ▶ summary = describe(parts)
editor edit ─▶ raw.value = serialize(update(parts))
input typing ─▶ raw.value = event.target.value
activePart: signal<PartName>
```
No two-way syncing and no loops. Because `serialize(tokenize(x)) === x`, a field edit rewrites only its own substring, and typing is never overwritten. The signals live in `src/inspector/store.ts` as an ES module, which acts as the Observer + Singleton in native form; there are no classes.

**Colored input: transparent `<textarea>` over a mirror `<div>`.**
- The textarea carries the text, caret, selection, IME, and native undo. Its text color is transparent and `caret-color` is visible.
- A `<div aria-hidden>` behind it renders the same text as `<span>`s per part, colored with CSS variables.
- Both layers share the font, padding, `white-space: pre-wrap`, `word-break: break-all`, and scroll position.
- The caret offset maps to a part via the part's character ranges, which `tokenize` can return as offsets.
- Alternative: `contenteditable`. Rejected because the caret jumps on re-render, paste brings in rich HTML, and undo breaks.
- Alternative: the CSS Custom Highlight API. Rejected because it doesn't reach inside form controls.

**Diagnostics use `new URL(raw)` purely as an oracle.** It runs in a try/catch: a thrown error means rejected; otherwise `href !== raw` means normalization happened. For non-http(s) schemes, only validity is reported (per spec), because browser serialization of arbitrary schemes varies.

**Reference content is data.** A `const PARTS` record maps each part name to its label, color token, summary text, delimiter rows, and `{ rfc, whatwg }` links. The labels row, reference table, and spec links are all rendered by mapping over it. Adding a part means adding a row, not new markup.

| part | RFC 3986 | WHATWG anchor (verify during implementation) |
|---|---|---|
| scheme | §3.1 | #concept-url-scheme |
| username/password | §3.2.1 | #concept-url-username / -password |
| host | §3.2.2 | #concept-url-host |
| port | §3.2.3 | #concept-url-port |
| path | §3.3 | #concept-url-path |
| query | §3.4 | #concept-url-query, #application/x-www-form-urlencoded |
| fragment | §3.5 | #concept-url-fragment |
| (all) percent-encoding | §2.1 | #percent-encoded-bytes |

RFC links use `https://datatracker.ietf.org/doc/html/rfc3986#section-3.4`.

**Styling: classless Pico + a few semantic hooks.** Only Pico CSS variables are overridden. Everything uses a monospace stack (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`), with no web fonts. Part colors are `--part-scheme` … `--part-fragment`: fixed hues defined for light, overridden under `prefers-color-scheme: dark`, and each checked for ≥4.5:1 contrast against the Pico background. Custom CSS is limited to the overlay input and the part spans, using element and attribute selectors (`[data-part=host]`) rather than a class system.

**Layout.**
```
src/url/        tokenize.ts serialize.ts edit.ts codec.ts diagnose.ts describe.ts url.test.ts
src/inspector/  store.ts parts.ts (PARTS data) url-input.tsx part-labels.tsx
                part-editor.tsx query-table.tsx part-reference.tsx browser-line.tsx
src/app.tsx     header + <Inspector/>
```

**Privacy test becomes a host allowlist.** Extract every `https?://host` from `dist/` and assert each host is in {`datatracker.ietf.org`, `www.rfc-editor.org`, `url.spec.whatwg.org`, `www.w3.org` (xmlns)}. Also forbid protocol-relative `//` in resource positions. This is simpler and stronger than the current resource-position regex, which misses JSX-compiled `href:"…"`.

## Risks / Trade-offs

- [Overlay layers drift apart (font metrics, wrapping, scroll)] → Share one CSS rule for both layers and sync `scrollTop` on scroll. Test manually with long, wrapping URLs in Chrome, Firefox, and Safari.
- [Regex tokenization of weird authorities, e.g. `@` in the password or `[` without `]`] → Round-trip holds regardless. Where the part split is ambiguous, follow the last-`@` rule and cover it with test cases.
- [WHATWG anchors change] → Verify them during implementation. RFC section links are permanent.
- [The browser form differs across browsers for edge cases] → The label says "Browser sends", describing the current browser's view, not a universal truth.
- [Clipboard API is unavailable in insecure contexts] → The app is served over https or localhost. If `navigator.clipboard` fails, select the input text and show "Press Ctrl+C to copy".
