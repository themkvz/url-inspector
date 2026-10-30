## ADDED Requirements

### Requirement: Not-found page excluded from indexing
The not-found page SHALL declare `noindex`, SHALL NOT declare a canonical link, and SHALL NOT be listed
in `sitemap.xml`.

#### Scenario: Not-found page metadata
- **WHEN** the built not-found page's head is inspected
- **THEN** it has `meta name="robots"` with content `noindex` and no `link rel="canonical"`

#### Scenario: Sitemap unchanged
- **WHEN** `sitemap.xml` is inspected
- **THEN** it lists only the top-level pages and no not-found URL
