## 1. OpenPanel Context

- [x] 1.1 Queue the `app` and hostname-derived `environment` global properties after SDK initialization;
  verify the built HTML includes both values and no fabricated app version.

## 2. Declarative Interaction Events

- [x] 2.1 Add data attributes for copying a URL, loading the example, and opening a URL part; verify
  the rendered build contains the expected event names and only the `part` structural property.
- [x] 2.2 Add data attributes for adding, removing, and moving query parameters; verify they contain
  only event names and move direction, never query keys or values.
- [x] 2.3 Extend the build-output privacy test for global properties and all interaction events, then
  run `bun test` and `bun run check`.
