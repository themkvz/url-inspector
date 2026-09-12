## Why

URL Inspector is a single page today: `https://url.themkvz.com/` and nothing else. That caps its SEO
surface to whatever a single title/description pair can rank for, and gives search engines no long-tail
content about the URL syntax questions people actually search ("what is a query parameter", "what does
%20 mean", "why does my URL have a fragment"). A second, content-rich page dedicated to those questions
adds indexable text and internal links without touching the inspector itself.

## What Changes

- Add a static FAQ page at `/faq` (built as `dist/faq.html`, prerendered the same way `index.html` is)
  answering common questions about URL syntax, encoding, and how URL Inspector works — each question a
  native `<details>/<summary>` disclosure so the content ships in the HTML and needs no JavaScript to
  read.
- Add a shared site navigation landmark in the header (Home ↔ FAQ) present on both pages, so crawlers
  and users can reach the new page from every page and the current page is identifiable.
- Add `FAQPage` JSON-LD structured data on the FAQ page, mirroring the visible questions and answers
  exactly (no structured data without matching visible content).
- Generalize the build's prerendering, head-metadata, and crawl-directive handling from "one page" to
  "each top-level page": `scripts/build.tsx` prerenders every entry page, `sitemap.xml` lists both
  canonical URLs, and each page gets its own title, description, canonical link, and Open Graph/Twitter
  tags while sharing the same icons, manifest, and `og:image`.
- Extend the privacy/discoverability build tests to cover the new page and the generalized sitemap.

Non-goals: a general templating/routing system for arbitrary future pages (this change generalizes the
build for exactly two static pages; a third page is a small extension, not a rewrite), a client-side
router (each page is its own static HTML entry, matching how Cloudflare Pages already serves `foo.html`
at `/foo`), and any change to URL parsing/editing behavior.

## Capabilities

### New Capabilities
- `faq-page`: the FAQ page's own content and behavior — its route, the question/answer content
  requirements, the native disclosure presentation, and its `FAQPage` structured data.

### Modified Capabilities
- `discoverability`: the requirements that assumed a single `index.html` (indexable prerendered markup,
  canonical identity metadata, social preview tags, structured data, and the sitemap) generalize to
  "each top-level page", and the sitemap requirement changes from listing exactly one URL to listing
  every top-level page's canonical URL.
- `app-shell`: the shell gains a shared site-navigation landmark linking the pages, present in the header
  on every page.

## Impact

- `scripts/build.tsx` — loop over multiple HTML entrypoints/components instead of one.
- `index.html` — add nav markup; per-page title/description/canonical values move from being singular
  facts to per-page facts.
- New: `faq.html`, `src/faq.tsx` (or equivalent page component), FAQ content, `FAQPage` JSON-LD.
- `src/app.tsx` / a new shared shell component — extract the header so both pages render the same nav.
- `public/sitemap.xml` — add the FAQ page's canonical URL.
- `src/discoverability.test.ts`, `src/a11y.test.ts` — extend to cover the new page. `src/privacy.test.ts`
  already walks all of `dist/`, so it covers the new page's output without changes.
- No change to `src/url/`, `src/inspector/`, or the lossless round-trip core.
