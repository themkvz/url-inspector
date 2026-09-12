## Purpose

Defines how the production build presents URL Inspector to search engines, social crawlers, and the
browser chrome: indexable markup delivered before JavaScript runs, canonical identity and description
metadata, structured data, icons, a manifest, and crawl directives — all self-hosted and consistent
with the app's canonical origin.

## Requirements

### Requirement: Indexable markup without JavaScript
The production `index.html` SHALL contain the application's initial rendered markup — the heading, the
description line, and the inspector UI in its empty state — as static HTML, so a crawler that does not
execute JavaScript sees the page content. The client bundle SHALL attach to that existing markup rather
than discarding and re-creating it.

#### Scenario: Build output contains rendered content
- **WHEN** the production `index.html` is inspected as text
- **THEN** it contains the `h1` text, the description sentence, and the inspector's controls, and the
  application mount element is not empty

#### Scenario: Page renders with scripting disabled
- **WHEN** the built page is loaded in a browser with JavaScript disabled
- **THEN** the heading, description, and inspector UI are visible

#### Scenario: Client attaches to prerendered markup
- **WHEN** the page loads with JavaScript enabled
- **THEN** the content is not duplicated, the visible markup does not flash or change on mount, and the
  application is interactive

### Requirement: Canonical identity metadata
The document SHALL declare its language, a descriptive `title` and `meta description`, a canonical link
pointing at `https://url.themkvz.com/`, and crawler directives permitting indexing and link following.

#### Scenario: Head metadata present
- **WHEN** the production `index.html` head is inspected
- **THEN** the `html` element has `lang="en"`, there is exactly one non-empty `title`, exactly one
  `meta name="description"` whose content is between 50 and 160 characters, and exactly one
  `link rel="canonical"` with `href="https://url.themkvz.com/"`

#### Scenario: Indexing permitted
- **WHEN** the robots directives are inspected
- **THEN** they permit indexing and link following, and no directive forbids indexing

### Requirement: Social sharing preview
The document SHALL provide Open Graph and Twitter card metadata so shared links render a titled,
described preview with an image.

#### Scenario: Open Graph tags present
- **WHEN** the production `index.html` head is inspected
- **THEN** it declares `og:type`, `og:title`, `og:description`, `og:site_name`, `og:url` equal to the
  canonical URL, and `og:image` as an absolute URL on the canonical origin, with `og:image:width`,
  `og:image:height`, and `og:image:alt`

#### Scenario: Twitter card tags present
- **WHEN** the Twitter metadata is inspected
- **THEN** `twitter:card` is `summary_large_image` and the card's title, description, and image are
  present and consistent with the Open Graph values

#### Scenario: Preview image exists at the declared path
- **WHEN** the path referenced by `og:image` is resolved against the build output
- **THEN** a 1200×630 image file exists there

### Requirement: Structured data
The document SHALL embed JSON-LD structured data describing the tool as a `WebApplication`, consistent
with the page's title, description, and canonical URL.

#### Scenario: JSON-LD block is valid and consistent
- **WHEN** the `application/ld+json` block in the production `index.html` is parsed
- **THEN** it is valid JSON declaring `@context` `https://schema.org`, `@type` `WebApplication`, and a
  `name`, `description`, and `url` matching the page's title, meta description, and canonical URL

#### Scenario: No fabricated claims
- **WHEN** the structured data is inspected
- **THEN** it contains no ratings, review counts, or other claims that are not true of the shipped app

### Requirement: Crawl directives
The build output SHALL include a `robots.txt` that allows crawling and points at a `sitemap.xml`, and a
`sitemap.xml` listing the site's canonical URL.

#### Scenario: robots.txt served
- **WHEN** `/robots.txt` is requested from the build output
- **THEN** it allows all user agents and declares `Sitemap: https://url.themkvz.com/sitemap.xml`

#### Scenario: sitemap.xml served
- **WHEN** `/sitemap.xml` is requested from the build output
- **THEN** it is a valid urlset containing exactly the canonical URL `https://url.themkvz.com/`

### Requirement: Icons and installability metadata
The build output SHALL provide self-hosted icons for browser and mobile surfaces and a web app manifest,
all referenced from the document head.

#### Scenario: Icons present and referenced
- **WHEN** the production `index.html` head and build output are inspected
- **THEN** an SVG icon, a `favicon.ico`, and an apple-touch-icon are each referenced by a `link` element
  and exist in the build output

#### Scenario: Manifest present and referenced
- **WHEN** the manifest referenced by `link rel="manifest"` is parsed
- **THEN** it is valid JSON with `name`, `short_name`, `start_url`, `display`, `theme_color`,
  `background_color`, and at least one icon, and every icon it lists exists in the build output

#### Scenario: Theme color declared
- **WHEN** the head is inspected
- **THEN** a `meta name="theme-color"` is present and matches the manifest's `theme_color`

### Requirement: Discoverability assets are self-hosted
Every icon, image, manifest, and stylesheet referenced by the discoverability metadata MUST be served
from the application's own origin. Absolute URLs in metadata MUST only ever name the canonical origin
`https://url.themkvz.com`, and MUST NOT cause the browser to fetch from any other origin.

#### Scenario: No third-party asset hosts
- **WHEN** the metadata added by this capability is scanned for absolute URLs
- **THEN** every one has the host `url.themkvz.com`

#### Scenario: Loading the page fetches only same-origin resources
- **WHEN** the built page is loaded with network inspection enabled
- **THEN** every request, including icon and manifest requests, goes to the serving origin
