import { diagnostics, raw } from './store'

export function BrowserLine() {
  if (raw.value === '') return null
  const d = diagnostics.value
  if (!d.valid) return <p class="browser-line invalid">A browser rejects this URL.</p>
  if (d.browserForm) return <p class="browser-line">Browser sends: {d.browserForm}</p>
  return null
}
