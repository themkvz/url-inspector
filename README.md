# URL Inspector

Break down, edit, and rebuild URLs without losing detail. All inspection happens in the browser; entered
URLs never leave the device. Anonymous screen-view, outgoing-link, and declarative attribute analytics
are sent to the self-hosted OpenPanel instance at `openpanel.themkvz.com` without session replay.

## Requirements

- [Bun](https://bun.sh/) for development, checks, and builds
- Node.js 22+ with npm/npx for Wrangler, which does not support the Bun runtime

## Local development

```sh
bun install --frozen-lockfile
bun run dev
```

## Verify and build

```sh
bun test
bun run check
bun run build
```

The production artifact is `dist/`.

## Deploy to Cloudflare Pages

This uses [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
with the pinned `wrangler` dev dependency. `wrangler.jsonc` supplies the Pages project name and `dist/`
output directory; it contains no credentials, bindings, or variables.

### First deployment

After verifying and building the intended revision:

```sh
npx wrangler login
npx wrangler pages project create
```

Complete the browser login, then enter `url-inspector` as the project name and `main` as the production
branch when prompted. Publish the build:

```sh
git switch main
bun run deploy
```

Open the assigned `*.pages.dev` URL and confirm the page renders and a URL can be edited.

> Cloudflare Direct Upload projects cannot be converted to Git integration. If automated Git deployments
> are needed later, create a new Pages project and move the custom domain.

### Custom domain

In Cloudflare **Workers & Pages**, open `url-inspector` → **Custom domains** → **Set up a domain** and
add `url.themkvz.com`. Follow Cloudflare's DNS instructions, then wait until the domain is active before
announcing it. The configured domain must remain `https://url.themkvz.com/`, which is the canonical URL
in the app's metadata, `robots.txt`, and sitemap.

### Later releases and rollback

For every production release, rerun the checks and build, then deploy the newly created `dist/`:

```sh
bun test
bun run check
bun run build
git switch main
bun run deploy
```

Smoke-test `https://url.themkvz.com/`: it should return successfully, show the `URL Inspector` heading
before interaction, load its static assets, and edit a URL normally. Browser network activity should be
same-origin except for `https://openpanel.themkvz.com/op1.js` and its `/api` event requests.

To roll back, open the Pages deployment history, restore the last verified production deployment, and
repeat the same smoke test.

See Cloudflare's [custom-domain](https://developers.cloudflare.com/pages/configuration/custom-domains/)
and [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) documentation.
