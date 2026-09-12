import { diagnostics, raw } from './store'

export function BrowserLine() {
  const d = diagnostics.value
  const invalid = raw.value !== '' && !d.valid
  const message =
    raw.value === ''
      ? ''
      : !d.valid
        ? 'A browser rejects this URL.'
        : d.browserForm
          ? `Browser sends: ${d.browserForm}`
          : ''

  return (
    <p role="status" class={invalid ? 'browser-line invalid' : 'browser-line'}>
      {message}
    </p>
  )
}
