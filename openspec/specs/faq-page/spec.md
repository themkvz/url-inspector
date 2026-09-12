## Purpose

Defines the FAQ page: a second static page that answers common questions about URL syntax, encoding,
and how URL Inspector works, published to grow the site's indexable, search-relevant content.

## Requirements

### Requirement: FAQ page route and prerendering
The build SHALL produce a static page at canonical URL `https://url.themkvz.com/faq`, prerendered the
same way the home page is, so its content is present in the served HTML before JavaScript runs.

#### Scenario: FAQ page contains rendered content
- **WHEN** the production `faq.html` is inspected as text
- **THEN** it contains the FAQ heading and every question and answer as static HTML, and the
  application mount element is not empty

#### Scenario: FAQ page renders with scripting disabled
- **WHEN** the built FAQ page is loaded in a browser with JavaScript disabled
- **THEN** the heading, site navigation, and every question and answer are visible

### Requirement: Question-and-answer content
The FAQ page SHALL present at least six questions and answers about URL syntax, encoding, or how URL
Inspector's own features and privacy model work. Every answer SHALL be accurate and SHALL NOT claim a
feature, rating, or fact that is not true of the shipped app. Each question-and-answer pair SHALL be a
native `<details>` element with a `<summary>` holding the question, so the content is readable and the
disclosure is operable without any JavaScript or added script.

#### Scenario: Content is native and always in the DOM
- **WHEN** a question is inspected in the markup
- **THEN** it is a `<summary>` inside a `<details>` element, and the answer text is present in the DOM
  whether or not the `details` element is open

#### Scenario: Disclosure is keyboard operable
- **WHEN** a keyboard user tabs to a question and presses Enter or Space
- **THEN** the `details` element toggles open or closed and the answer becomes visible or hidden
  accordingly

#### Scenario: No fabricated claims
- **WHEN** the FAQ answers are inspected
- **THEN** none of them describes a feature, rating, or guarantee that the shipped app does not have

### Requirement: Structured data matches visible content
The FAQ page SHALL embed `FAQPage` JSON-LD structured data whose questions and accepted answers
correspond exactly to the page's visible questions and answers, in the same order, with no question or
answer present in one place and not the other.

#### Scenario: Structured data mirrors visible Q&A
- **WHEN** the `application/ld+json` block on the FAQ page is parsed and compared against the page's
  `details` elements
- **THEN** every question and its answer text appear in both, and neither list contains an entry that
  is missing from the other
