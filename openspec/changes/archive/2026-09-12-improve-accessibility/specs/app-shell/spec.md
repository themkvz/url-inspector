## MODIFIED Requirements

### Requirement: Base presentation follows system theme
The application shell SHALL use semantic HTML landmarks (`header`, `main`) and SHALL render in light
or dark mode to match the user's system color-scheme preference. It SHALL also respect the user's
motion and contrast preferences: when reduced motion is preferred, decorative transitions and
transforms SHALL be suppressed; when a forced-colors mode is active, the URL text SHALL render
exactly once and legibly in the system-assigned colors.

#### Scenario: Dark system preference
- **WHEN** the user's system prefers a dark color scheme
- **THEN** the application renders with a dark theme and no manual toggle is needed

#### Scenario: Shell landmarks present
- **WHEN** the application loads
- **THEN** the document contains a `header` with the product name "URL Inspector" and a `main` region

#### Scenario: Reduced motion preference
- **WHEN** the user's system prefers reduced motion and they hover or focus a part label
- **THEN** the label changes state without a movement or transition animation, and the state remains
  visually distinguishable

#### Scenario: Forced colors mode
- **WHEN** the user's system has a forced-colors mode active and the input contains a URL
- **THEN** the URL text is shown once, in system colors, with no duplicated or invisible copy, and
  every control keeps a visible boundary and focus indicator

## ADDED Requirements

### Requirement: Legible contrast in both themes
All text and meaningful non-text presentation SHALL meet WCAG 2.1 AA contrast against the background
it is drawn on, in both the light and dark themes: at least 4.5:1 for body text, at least 3:1 for
large text, and at least 3:1 for control boundaries, state indicators, and focus indicators. This
applies to the per-part colors used in the input and on the part labels, to labels for absent parts,
and to any text rendered at reduced opacity.

#### Scenario: Part colors in both themes
- **WHEN** each part color is measured against the page background in the light theme and again in
  the dark theme
- **THEN** every one meets at least 4.5:1

#### Scenario: Part label chips
- **WHEN** a part label's text is measured against its filled chip background, and an absent part's
  label text and dashed border are measured against the page background
- **THEN** the text meets at least 4.5:1 and the border meets at least 3:1

#### Scenario: Dimmed text
- **WHEN** text rendered at reduced opacity, such as the browser-form line and the "no value"
  placeholder, is measured against its effective background
- **THEN** it meets at least 4.5:1, or the opacity is raised until it does
