import { setPart } from '@/url/edit'
import { PARTS } from './parts'
import { activePart, parts, update } from './store'

export function PartEditor() {
  const name = activePart.value
  if (name === null || name === 'query') return null
  const info = PARTS[name]
  const p = parts.value
  const value = name === 'path' ? p.path : (p[name] ?? '')

  const onInput = (e: Event) => {
    const next = (e.target as HTMLInputElement).value

    update((current) => {
      if (name === 'path') return setPart(current, 'path', next)
      return setPart(current, name, next === '' ? null : next)
    })
  }

  return (
    <div class="part-editor">
      <label>
        {info.label}
        <input
          type="text"
          value={value}
          onInput={onInput}
          placeholder={`(no ${info.label.toLowerCase()})`}
        />
      </label>
    </div>
  )
}
