## 1. FAQ content

- [x] 1.1 Add `src/faq-content.ts` exporting `FAQ_ITEMS: { question: string; answer: string }[]` with the
      8 draft Q&A from design.md, and verify it type-checks with `bun run typecheck`
- [x] 1.2 Add `buildFaqJsonLd(items)` (in `src/faq-content.ts` or `src/faq-jsonld.ts`) that maps
      `FAQ_ITEMS` to a `FAQPage`/`Question`/`Answer` JSON-LD object, and verify with a unit test that it
      produces one `Question` per item in order, each with the item's exact question and answer text

## 2. Shared shell and navigation

- [x] 2.1 Extract the `header` (`hgroup` with `h1`/tagline) from `src/app.tsx` into
      `src/shell.tsx` exporting `Shell({ current: 'home' | 'faq', children })`
- [x] 2.2 Add a `nav` landmark inside `Shell` with links to Home (`/`) and FAQ (`/faq`), marking the link
      matching `current` with `aria-current="page"`, and verify by rendering `Shell` with each `current`
      value and asserting exactly one link carries `aria-current="page"`
- [x] 2.3 Update `src/app.tsx` to render `<Shell current="home"><Inspector /></Shell>` and verify
      `bun run dev` still mounts the inspector with no visible change besides the new nav

## 3. FAQ page component and build wiring

- [x] 3.1 Add `src/faq.tsx` exporting `Faq`, rendering `<Shell current="faq">` with an `h2` ("Frequently
      Asked Questions") and one `<details><summary>{question}</summary><p>{answer}</p></details>` per
      `FAQ_ITEMS` entry
- [x] 3.2 Add `src/main-faq.tsx` hydrating `<Faq />` into `#app`, parallel to `src/main.tsx`
- [x] 3.3 Add `faq.html`: head metadata matching `index.html`'s field set (own title, description,
      `link rel="canonical"` for `https://url.themkvz.com/faq`, robots, theme-color, OG/Twitter tags
      reusing `og.png`, shared icons/manifest links) plus a `__FAQ_JSONLD__` marker script and a
      `<script type="module" src="./src/main-faq.tsx"></script>`
- [x] 3.4 Update `scripts/build.tsx`: add `faq.html` to the `Bun.build` entrypoints, replace the single
      marker-replacement pass with a loop over `[{ file: 'index.html', Component: App }, { file:
      'faq.html', Component: Faq }]` that injects the prerendered markup and app version into each and
      throws if either marker is missing on either file
- [x] 3.5 In the same loop, replace `faq.html`'s `__FAQ_JSONLD__` marker with
      `JSON.stringify(buildFaqJsonLd(FAQ_ITEMS))`, throwing if the marker is missing
- [x] 3.6 Run `bun run build` and confirm `dist/faq.html` exists, contains the rendered questions and
      answers, and its `application/ld+json` block parses

## 4. Sitemap

- [x] 4.1 Add `<url><loc>https://url.themkvz.com/faq</loc></url>` to `public/sitemap.xml`

## 5. Tests

- [x] 5.1 Extend `src/discoverability.test.ts` to also load `dist/faq.html` and assert: the FAQ heading
      and every `FAQ_ITEMS` question/answer are present in the static HTML; title/description/canonical
      are present, distinct from the home page's, and canonical matches `https://url.themkvz.com/faq`;
      OG/Twitter tags are present and consistent with the FAQ page's own title/description; the
      `application/ld+json` block parses as `FAQPage` with one `Question`/`acceptedAnswer` per
      `FAQ_ITEMS` entry, in order, with no extra or missing entries in either direction
- [x] 5.2 Extend the existing sitemap assertion in `src/discoverability.test.ts` to check
      `dist/sitemap.xml` contains both canonical URLs and no others
- [x] 5.3 Extend `src/discoverability.test.ts`'s nav assertions (or add a new test) to confirm each
      page's header has a `nav` with Home and FAQ links and `aria-current="page"` on the right one
- [x] 5.4 Add an axe-core check in `src/a11y.test.ts` rendering `<Faq />` directly (mirroring the existing
      `<App />` check) and assert zero violations, covering the `details`/`summary` and `nav` markup
- [x] 5.5 Confirm `src/privacy.test.ts` passes unmodified against the two-page `dist/` output (it already
      walks the whole directory)

## 6. Verification

- [x] 6.1 Run `bun test` and `bun run check`; both pass
- [x] 6.2 Load `dist/faq.html` directly in a browser with JavaScript disabled and confirm the heading,
      nav, and every question/answer are visible and expandable via native `details` behavior
- [x] 6.3 With JavaScript enabled, confirm both pages hydrate without a flash or duplicated content, and
      that the nav link on each page correctly navigates to the other
