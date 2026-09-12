## Context

See proposal.md — Why. Relevant current state:

- `scripts/build.tsx` runs `Bun.build({ entrypoints: ['index.html'] })`, then does one marker
  replacement pass on `dist/index.html`: injects `renderToString(<App />)` into `<div id="app"></div>`
  and the package version into `__APP_VERSION__`.
- `src/app.tsx` renders the `header` (h1 + tagline) and `main` (the inspector) in one component;
  `src/main.tsx` hydrates it into `#app`.
- `index.html`'s head metadata (title, description, canonical, OG/Twitter, JSON-LD, icons, manifest) is
  hand-authored once, for the one page that exists.
- `public/sitemap.xml` and `public/robots.txt` are hand-authored static files, copied verbatim into
  `dist/` — no programmatic sitemap generation.
- Confirmed with Cloudflare's docs: Pages' default `html_handling` (`auto-trailing-slash`) serves a
  standalone `dist/faq.html` at `/faq` (no trailing slash, redirecting `/faq.html` → `/faq`), the same
  pattern the existing `index.html` → `/` already relies on for a folder index. `wrangler.jsonc` sets no
  override, so this default applies.

## Goals / Non-Goals

**Goals:**
- Adding the FAQ page (or a third page later) is a small, symmetric addition to the build script and the
  shared shell, not a new mechanism.
- The FAQ page's visible Q&A and its `FAQPage` JSON-LD are generated from one array, so they cannot drift
  independently of each other.
- Each page ships only the component code it needs (no FAQ code in the home bundle or vice versa).

**Non-Goals:**
- A client-side router or history-based navigation. Each page stays a fully static HTML entry; "routing"
  between them is plain `<a href>` navigation, matching how the site already has exactly one page per
  static file.
- A CMS or markdown pipeline for FAQ content. The Q&A array is a literal TypeScript module, same as
  `src/inspector/parts.ts`.
- Generated/dynamic sitemap tooling. `public/sitemap.xml` stays hand-authored with one more `<url>` entry.

## Decisions

### Multi-page build: a small `PAGES` array, not per-page duplicated build code

`scripts/build.tsx` changes from one marker-replacement pass to a loop over a `PAGES` array, one entry per
top-level page: `{ file: 'index.html', Component: App }`, `{ file: 'faq.html', Component: Faq }`. The
existing `Bun.build` call gains `faq.html` as a second entrypoint (Bun's HTML bundler discovers each
page's own `<script type="module" src="...">` and bundles it separately). The loop does, per page, exactly
what the script already does once: throw if the `#app` marker or the version marker is missing, then
write back the prerendered markup and version.

The FAQ page additionally carries a `__FAQ_JSONLD__` marker in `faq.html`, replaced with
`JSON.stringify(buildFaqJsonLd(FAQ_ITEMS))` in the same pass — the same "literal marker, thrown error if
missing" pattern the version marker already uses, so a future page with its own build-time-generated block
can follow the same shape.

- *Alternative — keep two hand-written, near-duplicate blocks in the script*: rejected. Two pages already
  makes the duplication obvious; a third would make the drift (e.g. forgetting the marker-missing check on
  one page) a matter of when, not if.
- *Alternative — a generic static-site generator (glob `*.html`, convention-based component lookup)*:
  rejected as more machinery than two pages justify — the proposal's non-goal.

### Shared `Shell` component owns the header, main, and the footer nav landmark

`src/app.tsx`'s `header` (the `h1`/tagline `hgroup`) moves into a new `src/shell.tsx` exporting
`Shell({ current: 'home' | 'faq', children })`. `Shell` renders the header, then `children` inside
`main`, then a `footer` holding the `nav` landmark (Home / FAQ links, `aria-current="page"` on
`current`) — the nav sits after all page content, not in the header. `App` becomes
`<Shell current="home"><Inspector /></Shell>`; the new `Faq` component is
`<Shell current="faq">...</Shell>`. This is the same header and footer on every page (one `h1` naming
the product, per the existing app-shell requirement) with the nav added once, not per page.

### Two thin hydration entries, not one entry with runtime branching

`faq.html` gets its own `src/main-faq.tsx` (hydrate `<Faq />` into `#app`; no focus effect — there is no
input on that page), parallel to the existing `src/main.tsx`. Both import from `src/shell.tsx` and their
own page component only.

- *Alternative — one shared entry that branches on `location.pathname`*: rejected. It would statically
  import both `App` and `Faq` into every page's bundle to make the branch possible, shipping each page's
  unused component to the other — the opposite of the minimal-bundle goal, to save one three-line file.

### FAQ content: one array, rendered two ways

`src/faq-content.ts` exports `FAQ_ITEMS: { question: string; answer: string }[]`, the single source for
both the visible page and the structured data — the same shape `src/inspector/parts.ts`'s `PARTS` record
uses for the inspector's per-part copy. The `Faq` component maps it to `<details><summary>{question}
</summary><p>{answer}</p></details>` elements (native, no JS required to read or to expand/collapse).
`buildFaqJsonLd(items)` (a pure function, colocated or in `src/faq-jsonld.ts`) maps the same array to a
`FAQPage`/`Question`/`Answer` JSON-LD tree, called only from `scripts/build.tsx`. Because both outputs read
the same array, the two cannot list different questions or answers — the `faq-page` spec's "structured
data matches visible content" requirement is satisfied structurally, and the test in Verification below
is a regression guard rather than the only thing enforcing it.

Content (8 items, satisfies the spec's minimum of 6; wording is copy and can be revised without a
spec or design change). Kept deliberately short — one or two plain sentences per answer, not
explainer paragraphs, matching the project's "smallest implementation" ethos:
1. What is a URL, exactly?
2. What's the difference between raw and decoded?
3. Why do some query parameters have no `=`? (flag parameters)
4. Why do URLs show `%20` or `+` for a space?
5. What's the difference between the path and the fragment?
6. Why does my URL look different after I paste it? (browser normalization, referencing the
   browser-form line in the inspector)
7. Can I reorder or remove query parameters safely?
8. Does URL Inspector send my URL anywhere? (no — client-only, ties to the app-shell privacy guarantee)

### Per-page metadata: same fields, own values, same shared assets

`faq.html` is authored with its own `title`, `meta description`, canonical (`https://url.themkvz.com/faq`),
Open Graph/Twitter tags, and `FAQPage` JSON-LD, following the same field set `index.html` already has —
not a new metadata shape. It reuses the existing icons, manifest, and `og.png` (no new raster asset;
reusing one image across pages is explicitly allowed by the generalized discoverability spec).
`public/sitemap.xml` gets one more `<url><loc>https://url.themkvz.com/faq</loc></url>` entry.

## Risks / Trade-offs

- **Cloudflare's default HTML handling changes or gets overridden** → `/faq` would stop resolving as
  planned. `wrangler.jsonc` sets no `html_handling` override today; if one is ever added, it must keep
  `auto-trailing-slash` (or the equivalent) for both pages. Not testable from a static build, so this is a
  documented assumption rather than an asserted one.
- **FAQ content and its JSON-LD drift anyway** (someone edits the rendered JSX or the JSON-LD builder
  without touching the shared array) → mitigated by both reading `FAQ_ITEMS`, and
  `discoverability`/`faq-page` tests still assert the two match.
- **A third page later re-hardcodes page lists** (`PAGES` array, the manifest `start_url`, sitemap) →
  acceptable at two pages; if a third page arrives, revisit whether the per-page metadata fields
  (title/description/canonical) should move into the `PAGES` array too instead of living in each `.html`
  file, but that's a call for that change, not this one.

## Migration Plan

Not a data migration. Deploy order: build, verify `dist/faq.html` exists and contains the rendered Q&A,
`dist/sitemap.xml` lists both URLs, and `dist/index.html`'s nav links to `/faq`; then publish. Rollback is
redeploying the previous `dist/` — the home page and its URL are unchanged.
