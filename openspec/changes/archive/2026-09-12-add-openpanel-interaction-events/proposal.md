## Why

Anonymous page views alone do not show which URL Inspector workflows visitors find useful. The owner
needs privacy-preserving interaction signals without collecting inspected URL contents.

## What Changes

- Add OpenPanel global properties identifying URL Inspector and its production or development runtime.
- Track copying a URL, loading the example, opening a URL part, and adding, removing, or moving query
  parameters through declarative attributes.
- Keep the existing self-hosted script integration; do not add the Web SDK package or track URL values.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: Define the anonymous interaction events and global properties permitted for OpenPanel.

## Impact

Affected areas are the OpenPanel initializer, relevant inspector controls, the privacy test, and the
app-shell privacy contract. No dependency or new analytics host is added.
