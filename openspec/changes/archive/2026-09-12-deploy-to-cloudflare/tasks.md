## 1. Deployment tooling

- [x] 1.1 Add `wrangler` as a development dependency with Bun; verify `package.json` and `bun.lock`
  pin it without adding a runtime dependency.
- [x] 1.2 Add `wrangler.jsonc` with the local schema, project name `url-inspector`, output directory
  `./dist`, and compatibility date; verify it contains no bindings, variables, or credentials.
- [x] 1.3 Add `deploy: wrangler pages deploy` to `package.json`; verify `bun run deploy --help` resolves
  the local CLI and its Pages configuration without inline project or output parameters.

## 2. Project documentation

- [x] 2.1 Update `README.md` for the pinned Wrangler/Node prerequisite and the revised local commands;
  verify every documented command matches `package.json` and the checked-in configuration.
- [x] 2.2 Update the first-deployment runbook for local Wrangler authentication, project creation with
  production branch `main`, and `bun run deploy`; verify it warns that Direct Upload cannot later switch
  to Git integration.
- [x] 2.3 Replace inline deployment arguments with `bun run deploy` from `main`; verify only the locally
  checked `dist/` artifact is deployed through `wrangler.jsonc`.
- [x] 2.4 Document dashboard custom-domain setup for `url.themkvz.com`, active-status waiting, and the
  production smoke checks; verify the domain matches the canonical URL in `index.html`, `robots.txt`,
  and `sitemap.xml`.
- [x] 2.5 Update later-release and rollback instructions; verify they require rebuilding, running checks,
  and deploying from `main` before each release.

## 3. Verification

- [x] 3.1 Run `bun test`, `bun run check`, and `bun run build`; verify all pass and the documented
  `dist/index.html`, `dist/robots.txt`, `dist/sitemap.xml`, and icon assets exist.
- [x] 3.2 Review the README from a clean-checkout operator's perspective; verify it needs no unlisted
  dependency, committed secret, server runtime, or Cloudflare feature beyond Pages and DNS.
