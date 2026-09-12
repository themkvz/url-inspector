## Context

See proposal.md — Why. The repository has no Git remote or deployment configuration. Its existing
`bun run build` command emits the complete static site to ignored `dist/`, and production metadata
already names `https://url.themkvz.com/` as the canonical origin.

Cloudflare Pages accepts a prebuilt directory through
[Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) and attaches a
subdomain through its
[custom-domain flow](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Goals / Non-Goals

**Goals:**

- Give an operator one short path from a clean checkout to a verified production deployment.
- Cover initial setup, later production releases, custom-domain activation, smoke checks, and rollback.
- Preserve the existing client-only and no-third-party-runtime guarantees.

**Non-Goals:**

- Deploy from this planning change or store Cloudflare credentials in the repository.
- Add CI/CD, preview automation, Pages Functions, Workers, analytics, or environment variables.
- Add a deployment abstraction beyond a one-command package script.

## Decisions

### Publish `dist/` with Wrangler Direct Upload

The README will use Cloudflare's documented Wrangler Direct Upload flow: authenticate with
`npx wrangler login`, create a Pages project with `npx wrangler pages project create`, then publish the
tested build with `bun run deploy`. This directly hosts the artifact the current tests inspect and gives
a lockfile-pinned release command without adding a server runtime.

- *Alternative — Cloudflare Workers with static assets*: rejected because the app has no server logic.
- *Alternative — Pages Git integration*: deferred because this checkout has no Git remote. Cloudflare
  does not allow an existing Direct Upload project to switch to Git integration; adopting it later means
  creating a replacement Pages project and moving the custom domain.
- *Alternative — dashboard drag-and-drop*: rejected for releases because a CLI command is easier to
  repeat accurately. The dashboard remains the smallest path for one-time custom-domain setup and
  rollback.

### Pin Wrangler and declare Pages settings in `wrangler.jsonc`

Add `wrangler` with `bun add -d wrangler`. `wrangler.jsonc` will contain the local schema reference,
`name: "url-inspector"`, `pages_build_output_dir: "./dist"`, and compatibility date `2026-09-12`. It
will contain no bindings, variables, credentials, or secrets.

Add `"deploy": "wrangler pages deploy"` to `package.json`. The project name and output directory then
come from the config rather than inline flags. Run `bun run deploy` only from `main`, the Pages project's
configured production branch.

Wrangler remains a development-only tool. It runs on Node.js; `bun run` resolves the local package script
but must not force Wrangler into the Bun runtime.

- *Alternative — leave the CLI on demand with `npx` and inline arguments*: rejected because it does not
  pin releases in `bun.lock` and repeats deployment metadata at every invocation.

### Use `url-inspector` and `url.themkvz.com` as the documented identities

The Pages project name will be `url-inspector`, subject to Cloudflare availability, and its production
custom domain will be `url.themkvz.com`. The domain already appears in canonical metadata, Open Graph,
JSON-LD, `robots.txt`, `sitemap.xml`, and tests, so making deployment configuration match it avoids a
second source of truth in code.

### Keep deployment instructions in the root README

`README.md` is currently absent. It will briefly document install, development, checks, build output,
deployment, verification, and rollback. A separate operations directory or generated runbook would add
nothing for this single static site.

## Risks / Trade-offs

- Direct Upload cannot later become a Git-integrated Pages project → document that migration requires a
  replacement project before moving the custom domain.
- An operator may deploy a stale build or the wrong branch → instruct them to run checks and build
  immediately before `bun run deploy`, and only run it from `main`.
- Wrangler requires Node.js rather than the Bun runtime → document the Node prerequisite and verify the
  local CLI through the package script.
- DNS or TLS activation may not be immediate → wait until the Pages custom-domain status is active before
  production verification or announcing the URL.
- A successful upload may still have broken content → run existing tests before upload, then verify the
  canonical URL, prerendered heading, static assets, and interactive URL inspection after deployment.
- A bad release replaces production → keep Pages deployment history and roll back to the last verified
  production deployment from the dashboard.

## Migration Plan

### First deployment

1. From a clean checkout, run `bun install --frozen-lockfile`, `bun test`, `bun run check`, then
   `bun run build`.
2. Confirm `dist/index.html`, `dist/robots.txt`, `dist/sitemap.xml`, and the referenced icons exist.
3. Run `npx wrangler login` and complete Cloudflare authentication in the browser.
4. Run `npx wrangler pages project create`; choose project name `url-inspector` and production branch
   `main` when prompted.
5. From `main`, run `bun run deploy`.
6. Open the assigned `*.pages.dev` URL and smoke-test page rendering and one URL edit.
7. In the Pages project, open **Custom domains**, choose **Set up a domain**, and add
   `url.themkvz.com`. Complete or confirm the CNAME Cloudflare requests and wait for active status.
8. Verify `https://url.themkvz.com/` returns success, its HTML contains the prerendered
   `URL Inspector` heading, its static assets load, and browser network activity remains same-origin.

### Later production deployment

1. Run the same install, test, check, and build commands against the intended revision.
2. From `main`, run `bun run deploy`.
3. Repeat the production smoke checks before treating the deployment as released.

### Rollback

Use the Pages deployment history to restore the last verified production deployment, then repeat the
canonical-domain smoke checks. No data rollback is required because the application stores no server-side
or browser-persisted user data.
