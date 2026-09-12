## Why

The app already produces a self-contained static `dist/` build for its canonical origin, but the
repository does not document how to publish that build. A short Cloudflare Pages runbook will make the
first deployment, later releases, verification, and rollback repeatable without adding application
infrastructure.

## What Changes

- Add a project README with prerequisites, local verification, and Cloudflare Pages deployment steps.
- Document one-time Wrangler authentication and Direct Upload Pages project creation for
  `url-inspector`, plus custom-domain setup for `url.themkvz.com`.
- Document repeat CLI deployments of `dist/`, post-deploy checks, and rollback through Pages deployment
  history.
- Keep deployment manually initiated because this repository has no Git remote; note Git integration as
  a future option once a remote and continuous deployment are wanted.
- Add Wrangler as a development dependency, a checked-in `wrangler.jsonc`, and a `bun run deploy`
  package script so releases do not repeat project or output-directory arguments.
- Do not add Workers, Pages Functions, environment variables, tracking, or runtime dependencies.

## Capabilities

### New Capabilities

None. This is an operator-documentation change; it does not add product behavior.

### Modified Capabilities

None. The existing `app-shell` capability already requires a portable, static, client-only build.

## Impact

- New `README.md` deployment documentation.
- `package.json` and `bun.lock` — pinned development-only Wrangler CLI and deploy script.
- New `wrangler.jsonc` — Pages project name and static output directory only.
- Cloudflare Pages account/project and DNS configuration performed by the operator with Wrangler and the
  dashboard from the runbook.
- No application code, runtime dependency, API, data, or production behavior changes.
