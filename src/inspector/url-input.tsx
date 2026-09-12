import { useRef } from 'preact/hooks'
import type { PartName, Range, Ranges } from '@/url/types'
import { partColor } from './parts'
import { activePart, hoverPart, inputEl, ranges, raw } from './store'

function rangeEntries(r: Ranges): [PartName, Range][] {
  return Object.entries(r) as [PartName, Range][]
}

function segments(text: string, r: Ranges): { text: string; part: PartName | null }[] {
  const entries = rangeEntries(r).sort((a, b) => a[1][0] - b[1][0])
  const out: { text: string; part: PartName | null }[] = []

  let cursor = 0

  for (const [name, [start, end]] of entries) {
    if (start > cursor) out.push({ text: text.slice(cursor, start), part: null })
    out.push({ text: text.slice(start, end), part: name })
    cursor = end
  }

  if (cursor < text.length) out.push({ text: text.slice(cursor), part: null })

  return out
}

function partAt(pos: number, r: Ranges): PartName | null {
  for (const [name, range] of rangeEntries(r)) {
    if (pos >= range[0] && pos <= range[1]) return name
  }

  return null
}

function setInputEl(el: HTMLTextAreaElement | null) {
  inputEl.current = el
}

export function UrlInput() {
  const mirrorEl = useRef<HTMLDivElement | null>(null)

  function syncCaret(e: Event) {
    const el = e.target as HTMLTextAreaElement
    activePart.value = partAt(el.selectionStart ?? 0, ranges.value)
  }

  function syncScroll(e: Event) {
    const el = e.target as HTMLTextAreaElement
    if (mirrorEl.current) {
      mirrorEl.current.scrollTop = el.scrollTop
      mirrorEl.current.scrollLeft = el.scrollLeft
    }
  }

  const highlighted = hoverPart.value ?? activePart.value

  return (
    <div class="url-input">
      <div class="url-input-mirror" ref={mirrorEl} aria-hidden="true">
        {segments(raw.value, ranges.value).map((seg, i) => (
          <span
            key={i}
            data-part={seg.part ?? undefined}
            class={seg.part && seg.part === highlighted ? 'active' : undefined}
            style={seg.part ? { color: partColor(seg.part) } : undefined}
          >
            {seg.text}
          </span>
        ))}
      </div>

      <textarea
        ref={setInputEl}
        class="url-input-textarea"
        value={raw.value}
        onInput={(e) => {
          raw.value = (e.target as HTMLTextAreaElement).value
          syncCaret(e)
        }}
        onClick={syncCaret}
        onKeyUp={syncCaret}
        onSelect={syncCaret}
        onScroll={syncScroll}
        spellcheck={false}
        autocorrect="off"
        autocapitalize="off"
        placeholder="Paste a URL…"
        aria-label="URL"
      />
    </div>
  )
}
