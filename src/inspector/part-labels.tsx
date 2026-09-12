import type { PartName, Parts } from '@/url/types'
import { PART_ORDER, PARTS, partColor } from './parts'
import { activePart, hoverPart, parts } from './store'

function isPresent(name: PartName, p: Parts): boolean {
  if (name === 'path') return p.path.length > 0

  return p[name] !== null
}

export function PartLabels() {
  const p = parts.value

  return (
    <fieldset class="part-labels" aria-label="URL parts">
      {PART_ORDER.map((name) => {
        const info = PARTS[name]
        const present = isPresent(name, p)
        const onHover = () => {
          hoverPart.value = name
        }
        const onUnhover = () => {
          hoverPart.value = null
        }

        return (
          <button
            key={name}
            type="button"
            aria-pressed={activePart.value === name}
            data-part={name}
            class={present ? undefined : 'part-absent'}
            style={{ '--part-color': partColor(name) }}
            onClick={() => {
              activePart.value = name
            }}
            onFocus={onHover}
            onMouseEnter={onHover}
            onBlur={onUnhover}
            onMouseLeave={onUnhover}
          >
            {info.label}
            {!present && <span class="visually-hidden"> (not present)</span>}
          </button>
        )
      })}
    </fieldset>
  )
}
