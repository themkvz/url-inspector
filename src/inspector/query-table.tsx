import { useState } from 'preact/hooks'
import { decode, encodeLike } from '@/url/codec'
import { addParam, moveParam, removeParam, setParam } from '@/url/edit'
import { parts, update } from './store'

export function QueryTable() {
  const query = parts.value.query ?? []
  const [decodedRows, setDecodedRows] = useState<Set<number>>(new Set())

  function toggleDecoded(i: number) {
    setDecodedRows((prev) => {
      const next = new Set(prev)

      if (next.has(i)) next.delete(i)
      else next.add(i)

      return next
    })
  }

  return (
    <table class="query-table">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {query.map((param, i) => {
          const isDecoded = decodedRows.has(i)
          const displayValue =
            param.value === null ? '' : isDecoded ? decode(param.value, true) : param.value
          const toggleLabel = isDecoded ? 'Show raw value' : 'Show decoded value'

          return (
            <tr key={i}>
              <td>
                {/* biome-ignore lint/a11y/noRedundantRoles: see the fieldset above*/}
                <fieldset role="group">
                  <input
                    type="text"
                    value={param.key}
                    onInput={(e) =>
                      update((p) => setParam(p, i, { key: (e.target as HTMLInputElement).value }))
                    }
                  />
                </fieldset>
              </td>
              <td>
                {param.value === null ? (
                  /* biome-ignore lint/a11y/noRedundantRoles: see the fieldset above */
                  <fieldset role="group">
                    <input
                      type="text"
                      readOnly
                      placeholder="(no value)"
                      aria-label="No value"
                      class="no-value"
                    />

                    <button
                      type="button"
                      class="outline secondary"
                      aria-label="Add value"
                      data-tooltip="Add value"
                      onClick={() => update((p) => setParam(p, i, { value: '' }))}
                    >
                      +
                    </button>
                  </fieldset>
                ) : (
                  // biome-ignore lint/a11y/noRedundantRoles: Pico's group CSS keys off the literal role attribute
                  <fieldset role="group">
                    <input
                      type="text"
                      value={displayValue}
                      onInput={(e) => {
                        const next = (e.target as HTMLInputElement).value
                        const raw = isDecoded ? encodeLike(param.value ?? '', next, true) : next
                        update((p) => setParam(p, i, { value: raw }))
                      }}
                    />
                    <button
                      type="button"
                      class="outline secondary"
                      aria-label={toggleLabel}
                      data-tooltip={toggleLabel}
                      onClick={() => toggleDecoded(i)}
                    >
                      ⇄
                    </button>
                    <button
                      type="button"
                      class="outline secondary danger"
                      aria-label="Remove value"
                      data-tooltip="Remove value"
                      onClick={() => update((p) => setParam(p, i, { value: null }))}
                    >
                      ✕
                    </button>
                  </fieldset>
                )}
              </td>
              <td>
                {/* biome-ignore lint/a11y/noRedundantRoles: see the fieldset above */}
                <fieldset role="group">
                  <button
                    type="button"
                    class="outline secondary"
                    onClick={() => update((p) => moveParam(p, i, 'up'))}
                    disabled={i === 0}
                    aria-label="Move parameter up"
                    data-tooltip="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    class="outline secondary"
                    onClick={() => update((p) => moveParam(p, i, 'down'))}
                    disabled={i === query.length - 1}
                    aria-label="Move parameter down"
                    data-tooltip="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    class="outline secondary danger"
                    onClick={() => update((p) => removeParam(p, i))}
                    aria-label="Remove parameter"
                    data-tooltip="Remove parameter"
                  >
                    ✕
                  </button>
                </fieldset>
              </td>
            </tr>
          )
        })}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3}>
            <button type="button" class="outline" onClick={() => update((p) => addParam(p))}>
              <span aria-hidden="true">+</span> Add parameter
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  )
}
