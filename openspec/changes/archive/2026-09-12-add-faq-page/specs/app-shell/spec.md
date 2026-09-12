## ADDED Requirements

### Requirement: Shared site navigation
A `footer` after the main content SHALL include a `nav` landmark listing a link to every top-level
page (currently Home and FAQ), rendered identically on every page. The link to the page currently
being viewed SHALL be marked `aria-current="page"`.

#### Scenario: Navigate between pages
- **WHEN** a user on the home page activates the FAQ link in the navigation
- **THEN** they arrive at the FAQ page, and its navigation marks the FAQ link `aria-current="page"`

#### Scenario: Navigation present on every page, after the content
- **WHEN** any top-level page is inspected
- **THEN** a `footer` landmark follows the `main` content and contains a `nav` landmark with a link to
  each top-level page
