import { createHash } from 'node:crypto'
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { FunctionComponent } from 'preact'
import { renderToString } from 'preact-render-to-string'
import { App } from '@/app'
import { Faq } from '@/faq'
import { buildFaqJsonLd } from '@/faq-content'
import { NotFound } from '@/not-found'

const distDir = 'dist'
const appMarker = '<div id="app"></div>'
const appVersionMarker = '__APP_VERSION__'
const faqJsonLdMarker = '__FAQ_JSONLD__'
const openPanelOrigin = 'https://openpanel.themkvz.com'
// Hashed chunk names change with their content, so they can be cached forever.
const immutableMaxAgeSeconds = 31536000
const { version: appVersion } = JSON.parse(readFileSync('package.json', 'utf8')) as {
  version?: unknown
}

if (typeof appVersion !== 'string') throw new Error('Missing package version')

// One entry per top-level page. Adding a page means adding one entry here (and the matching
// .html/component files) rather than a second build pass. `jsonLd` is only present for pages
// that carry a build-time-generated structured-data marker (currently just the FAQ page).
const PAGES: {
  file: string
  Component: FunctionComponent
  jsonLd?: () => unknown
}[] = [
  { file: 'index.html', Component: App },
  { file: 'faq.html', Component: Faq, jsonLd: buildFaqJsonLd },
  { file: '404.html', Component: NotFound },
]

// Start clean so chunks from earlier builds are not deployed alongside the new ones.
rmSync(distDir, { recursive: true, force: true })

const result = await Bun.build({
  entrypoints: PAGES.map((page) => page.file),
  outdir: distDir,
  minify: true,
  // Root-relative asset URLs, so 404.html still loads its styles when served at a nested path.
  publicPath: '/',
  // Icons and the manifest keep their plain names: og:image, the manifest, and the crawl files
  // must live at fixed URLs, and public/ is copied over them below.
  naming: { asset: '[name].[ext]' },
})
if (!result.success) throw new Error('Build failed')

// CSP hashes of the inline analytics bootstrap, taken from the final HTML so they follow its edits.
const scriptHashes = new Set<string>()

for (const { file, Component, jsonLd } of PAGES) {
  const path = join(distDir, file)
  let html = readFileSync(path, 'utf8')
  if (!html.includes(appMarker)) throw new Error(`${file}: missing prerender marker: ${appMarker}`)
  if (!html.includes(appVersionMarker))
    throw new Error(`${file}: missing app version marker: ${appVersionMarker}`)

  html = html
    .replace(appMarker, `<div id="app">${renderToString(<Component />)}</div>`)
    .replace(appVersionMarker, appVersion)

  if (jsonLd) {
    if (!html.includes(faqJsonLdMarker))
      throw new Error(`${file}: missing JSON-LD marker: ${faqJsonLdMarker}`)
    html = html.replace(faqJsonLdMarker, JSON.stringify(jsonLd()))
  }

  for (const [, body = ''] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    scriptHashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`)
  }

  writeFileSync(path, html)
}
cpSync('public', distDir, { recursive: true })

const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...scriptHashes].join(' ')} ${openPanelOrigin}`,
  // Prerendered markup carries inline style attributes (part colors).
  "style-src 'self' 'unsafe-inline'",
  // Pico draws its form and accordion icons as data: SVGs.
  "img-src 'self' data:",
  `connect-src 'self' ${openPanelOrigin}`,
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ')

// Cloudflare Pages response headers: https://developers.cloudflare.com/pages/configuration/headers/
writeFileSync(
  join(distDir, '_headers'),
  `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/chunk-*
  Cache-Control: public, max-age=${immutableMaxAgeSeconds}, immutable
`,
)
