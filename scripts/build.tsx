import { cpSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToString } from 'preact-render-to-string'
import { App } from '@/app'

const distDir = 'dist'
const appMarker = '<div id="app"></div>'

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

writeFileSync(indexPath, index.replace(appMarker, `<div id="app">${renderToString(<App />)}</div>`))
cpSync('public', distDir, { recursive: true })
