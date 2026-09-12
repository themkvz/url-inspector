import { useState } from 'preact/hooks'
import { BrowserLine } from './browser-line'
import { PartEditor } from './part-editor'
import { PartLabels } from './part-labels'
import { PartReference } from './part-reference'
import { QueryTable } from './query-table'
import { activePart, inputEl, raw, summary } from './store'
import { UrlInput } from './url-input'

// A non-http(s) scheme keeps this sample data out of the build's http(s)-URL host allowlist scan
// (src/privacy.test.ts) — it's example content, never a network reference.
const EXAMPLE_URL = 'example://user:pw@example.com:8443/path/to/page?key=value&flag#section'

function Summary() {
  if (raw.value === '') return <p class="summary">Paste a URL to see its parts.</p>
  return <p class="summary">{summary.value}</p>
}

function CopyButton() {
  const [label, setLabel] = useState('Copy')
  const [fallback, setFallback] = useState('')

  async function onClick() {
    try {
      await navigator.clipboard.writeText(raw.value)
      setLabel('Copied')
    } catch {
      inputEl.current?.select()
      setFallback(
        'Clipboard access is unavailable. The URL is selected — copy it with your keyboard.',
      )
    }
    setTimeout(() => {
      setLabel('Copy')
      setFallback('')
    }, 1500)
  }

  return (
    <>
      <button type="button" onClick={onClick}>
        {label}
      </button>
      <p role="status" class="visually-hidden">
        {fallback}
      </p>
    </>
  )
}

function ExampleButton() {
  return (
    <button
      type="button"
      onClick={() => {
        raw.value = EXAMPLE_URL
        activePart.value = null
      }}
    >
      Example
    </button>
  )
}

export function Inspector() {
  const active = activePart.value

  return (
    <>
      <Summary />
      <BrowserLine />
      <div class="input-row">
        <UrlInput />
        <CopyButton />
        <ExampleButton />
      </div>
      <PartLabels />
      {active === 'query' ? <QueryTable /> : active !== null ? <PartEditor /> : null}
      <PartReference />
    </>
  )
}
