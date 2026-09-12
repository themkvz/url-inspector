## Why

The site owner needs anonymous usage analytics while keeping inspected URL values local and avoiding
cookies or persistent visitor identifiers.

## What Changes

- Load the OpenPanel browser SDK and send analytics to the self-hosted
  `openpanel.themkvz.com` instance.
- Enable screen-view, outgoing-link, and declarative attribute tracking without session replay.
- Replace the no-analytics guarantee with an explicit anonymous-analytics exception while preserving
  the guarantee that inspected URL values are never transmitted or persisted.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: Allow the approved self-hosted OpenPanel SDK and API endpoints and define the remaining
  privacy guarantees.
- `discoverability`: Limit its self-hosting guarantee to discoverability resources now that analytics
  adds an approved external request.

## Impact

Affected areas are `index.html`, the build-output privacy test, project privacy documentation, and the
`app-shell` and `discoverability` specifications. No package dependency or backend is added.
