## Context

The static HTML shell currently forbids all analytics and external script requests. The approved
OpenPanel deployment serves both its browser SDK and event API from `openpanel.themkvz.com`.

## Goals / Non-Goals

**Goals:**

- Initialize OpenPanel once without adding a package dependency.
- Keep inspected URL values out of analytics and browser storage.
- Keep the application functional when analytics is blocked.

**Non-Goals:**

- Session replay, user identification, custom events, consent UI, or analytics proxying.

## Decisions

- Put the dashboard-provided initializer and async SDK tag in `index.html`. This is the smallest
  integration and runs independently of Preact hydration.
- Load both the SDK and API from `openpanel.themkvz.com`. This avoids the `openpanel.dev` CDN and keeps
  the exception limited to an owner-controlled origin.
- Keep the inspected URL solely in application state. Automatic screen views can report the site's
  own location, but no inspector field receives a tracking attribute or custom event handler.

## Risks / Trade-offs

- SDK behavior can change independently → keep the allowed origin/path and initialized options covered
  by the build-output test.
- Analytics blockers can prevent loading → use the queued async snippet so failure cannot block the app.
