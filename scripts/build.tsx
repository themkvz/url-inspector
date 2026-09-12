import { cpSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { FunctionComponent } from 'preact'
import { renderToString } from 'preact-render-to-string'
import { App } from '@/app'
import { Faq } from '@/faq'
import { buildFaqJsonLd } from '@/faq-content'

const distDir = 'dist'
const appMarker = '<div id="app"></div>'
const appVersionMarker = '__APP_VERSION__'
const faqJsonLdMarker = '__FAQ_JSONLD__'
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
]

const result = await Bun.build({
  entrypoints: PAGES.map((page) => page.file),
  outdir: distDir,
  minify: true,
  // Icons and the manifest keep their plain names: og:image, the manifest, and the crawl files
  // must live at fixed URLs, and public/ is copied over them below.
  naming: { asset: '[name].[ext]' },
})
if (!result.success) throw new Error('Build failed')

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

  writeFileSync(path, html)
}
cpSync('public', distDir, { recursive: true })
