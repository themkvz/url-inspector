## 1. Build pipeline

- [x] 1.1 Add `preact-render-to-string` as a devDependency with Bun
- [x] 1.2 Write `scripts/build.ts`: run `Bun.build` over `index.html` into `dist/` with minify, then
      inject `renderToString(<App />)` into the `<div id="app"></div>` marker in `dist/index.html`,
      throwing if the marker is absent
- [x] 1.3 Extend the script to copy `public/` verbatim into `dist/`
- [x] 1.4 Point `package.json` `build` at `bun run scripts/build.ts`, and update `src/privacy.test.ts`
      to build via `bun run build`
- [x] 1.5 Switch `src/main.tsx` from `render` to `hydrate`; confirm `bun run dev` still mounts

## 2. On-page content

- [x] 2.1 Add a one-sentence description under the `h1` in `src/app.tsx`, styled in `src/styles/app.css`
- [x] 2.2 Confirm the page still has exactly one `h1` and the description precedes `main` content

## 3. Head metadata

- [x] 3.1 Add to `index.html`: `meta description` (50–160 chars), `link rel="canonical"`
      `https://url.themkvz.com/`, `meta robots` allowing index/follow, and `meta theme-color`
- [x] 3.2 Add Open Graph tags: `og:type`, `og:title`, `og:description`, `og:site_name`, `og:url`,
      `og:image` (absolute), `og:image:width`, `og:image:height`, `og:image:alt`
- [x] 3.3 Add Twitter card tags: `twitter:card=summary_large_image`, title, description, image
- [x] 3.4 Add the `WebApplication` JSON-LD block (name, description, url, applicationCategory,
      operatingSystem, free offer) consistent with the title, description, and canonical URL
- [x] 3.5 Add `link` elements for `/icon.svg`, `/favicon.ico`, `/apple-touch-icon.png`, and
      `/site.webmanifest`, all root-relative

## 4. Static assets

- [x] 4.1 Author `public/icon.svg`
- [x] 4.2 Generate and commit `public/apple-touch-icon.png` (180×180) and `public/favicon.ico`
- [x] 4.3 Generate and commit `public/og.png` (1200×630) showing the product name and tagline
- [x] 4.4 Write `public/site.webmanifest` (name, short_name, start_url, display, theme_color,
      background_color, icons) with `theme_color` matching the `meta theme-color`
- [x] 4.5 Write `public/robots.txt` allowing all agents with
      `Sitemap: https://url.themkvz.com/sitemap.xml`
- [x] 4.6 Write `public/sitemap.xml` with the single canonical URL

## 5. Verification

- [x] 5.1 Add `src/discoverability.test.ts`: build, parse `dist/index.html` with happy-dom, assert
      prerendered content (`h1` text, description, inspector controls) is present and `#app` is not empty
- [x] 5.2 Extend it to assert head metadata: single `title`, description length, canonical, robots
      directives, Open Graph and Twitter sets, `theme-color`
- [x] 5.3 Extend it to assert the JSON-LD parses and its `name`/`description`/`url` match the page, and
      that it declares no ratings or reviews
- [x] 5.4 Extend it to assert origin consistency across canonical, `og:url`, JSON-LD `url`,
      `sitemap.xml`, and the `robots.txt` sitemap line
- [x] 5.5 Extend it to assert every referenced asset path (`icon.svg`, `favicon.ico`,
      `apple-touch-icon.png`, `og.png`, `site.webmanifest`) exists in `dist/` and the manifest parses
- [x] 5.6 Update `src/privacy.test.ts` to allow `url.themkvz.com` in build output while every other
      non-allowlisted host still fails
- [x] 5.7 Run `bun test` and `bun run check`; load `dist/index.html` with JavaScript disabled and
      confirm the heading, description, and inspector render, then re-enable and confirm no flash,
      no duplicated content, and a working interaction
