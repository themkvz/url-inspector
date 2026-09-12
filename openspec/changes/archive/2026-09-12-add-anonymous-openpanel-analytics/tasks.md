## 1. Analytics Integration

- [x] 1.1 Add the queued OpenPanel initializer and self-hosted SDK tag to `index.html`; verify the
  production build contains the approved client, API URL, SDK URL, and enabled anonymous options.
- [x] 1.2 Update the build-output privacy test to allow only `openpanel.themkvz.com` for analytics and
  assert the exact SDK/API paths; verify `bun test src/privacy.test.ts` passes.

## 2. Privacy Contract

- [x] 2.1 Update `CLAUDE.md`, `openspec/config.yaml`, and `README.md` so their privacy and network
  guidance matches anonymous OpenPanel tracking; verify no remaining same-origin-only or no-analytics
  claims describe current behavior.
- [x] 2.2 Run `bun test` and `bun run check` and fix failures introduced by this change.
