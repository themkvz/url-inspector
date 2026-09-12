## Context

The self-hosted OpenPanel script already supports declarative button attributes and queued global
properties. The app has no package version or build-time environment configuration.

## Goals / Non-Goals

**Goals:**

- Capture the smallest useful interaction funnel with no user-entered values.
- Add stable app and runtime context to every event.

**Non-Goals:**

- Installing the Web SDK, inventing a version value, custom event handlers, or tracking field edits.

## Decisions

- Keep the script integration. Declarative attributes cover the requested events without a dependency.
- Set `app` to `url-inspector` and derive `environment` from the hostname; omit `app_version` until a
  release-version source exists.
- Track only control actions and structural properties (`part` or `direction`), never UI labels or URL
  values.

## Risks / Trade-offs

- Event names become dashboard contracts → cover the rendered attributes and global properties in the
  build-output privacy test.
