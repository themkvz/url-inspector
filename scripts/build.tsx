import { cpSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToString } from 'preact-render-to-string'
import { App } from '@/app'

const distDir = 'dist'
const appMarker = '<div id="app"></div>'
const appVersionMarker = '__APP_VERSION__'
const { version: appVersion } = JSON.parse(readFileSync('package.json', 'utf8')) as {
  version?: unknown
}

if (typeof appVersion !== 'string') throw new Error('Missing package version')

const result = await Bun.build({
  entrypoints: ['index.html'],
  outdir: distDir,
  minify: true,
  // Icons and the manifest keep their plain names: og:image, the manifest, and the crawl files
  // must live at fixed URLs, and public/ is copied over them below.
  naming: { asset: '[name].[ext]' },
})
if (!result.success) throw new Error('Build failed')

const indexPath = join(distDir, 'index.html')
const index = readFileSync(indexPath, 'utf8')
if (!index.includes(appMarker)) throw new Error(`Missing prerender marker: ${appMarker}`)
if (!index.includes(appVersionMarker))
  throw new Error(`Missing app version marker: ${appVersionMarker}`)

writeFileSync(
  indexPath,
  index
    .replace(appMarker, `<div id="app">${renderToString(<App />)}</div>`)
    .replace(appVersionMarker, appVersion),
)
cpSync('public', distDir, { recursive: true })
