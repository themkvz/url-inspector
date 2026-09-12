import { diagnostics, raw } from './store'

export function BrowserLine() {
  const d = diagnostics.value
  const empty = raw.value === ''

  return (
    <>
      {/* Only the fixed rejection sentence is live. The normalized form is deliberately left out
          of the status region: it recomputes on every keystroke, so announcing it would re-read
          the whole URL character by character — the same reason the summary is not live. */}
      <p role="status" class="browser-line invalid">
        {empty || d.valid ? '' : 'A browser rejects this URL.'}
      </p>
      {!empty && d.valid && d.browserForm ? (
        <p class="browser-line">Browser sends: {d.browserForm}</p>
      ) : null}
    </>
  )
}
