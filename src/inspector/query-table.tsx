import { useLayoutEffect, useRef, useState } from 'preact/hooks'
import { decode, encodeLike } from '@/url/codec'
import { addParam, moveParam, removeParam, setParam } from '@/url/edit'
import { parts, update } from './store'

type PendingFocus =
  | { kind: 'remove'; index: number }
  | { kind: 'add' }
  | { kind: 'move'; index: number; dir: 'up' | 'down' }

export function QueryTable() {
  const query = parts.value.query ?? []
  const [decodedRows, setDecodedRows] = useState<Set<number>>(new Set())
  const [pendingFocus, setPendingFocus] = useState<PendingFocus | null>(null)
  const removeButtonRefs = useRef(new Map<number, HTMLButtonElement>())
  const upButtonRefs = useRef(new Map<number, HTMLButtonElement>())
  const downButtonRefs = useRef(new Map<number, HTMLButtonElement>())
  const addButtonRef = useRef<HTMLButtonElement | null>(null)

  useLayoutEffect(() => {
    if (pendingFocus === null) return
    if (pendingFocus.kind === 'add') addButtonRef.current?.focus()
    else if (pendingFocus.kind === 'remove')
      removeButtonRefs.current.get(pendingFocus.index)?.focus()
    else {
      const refs = pendingFocus.dir === 'up' ? upButtonRefs : downButtonRefs
      refs.current.get(pendingFocus.index)?.focus()
    }
    setPendingFocus(null)
  }, [pendingFocus])

  function toggleDecoded(i: number) {
    setDecodedRows((prev) => {
      const next = new Set(prev)

      if (next.has(i)) next.delete(i)
      else next.add(i)

      return next
    })
  }

  // decodedRows keys on row index, so any edit that shifts indices has to carry the flags with
  // their rows — otherwise a neighbour inherits a decoded view the user never asked for, and
  // typing into it re-encodes from the wrong baseline. `null` drops the flag.
  function remapDecoded(move: (i: number) => number | null) {
    setDecodedRows((prev) => {
      const next = new Set<number>()

      for (const i of prev) {
        const to = move(i)
        if (to !== null) next.add(to)
      }

      return next
    })
  }

  function handleRemoveParam(i: number) {
    const wasLast = i === query.length - 1
    update((p) => removeParam(p, i))
    remapDecoded((j) => (j === i ? null : j > i ? j - 1 : j))
    setPendingFocus(wasLast ? { kind: 'add' } : { kind: 'remove', index: i })
  }

  function handleMoveParam(i: number, dir: 'up' | 'down') {
    const target = dir === 'up' ? i - 1 : i + 1
    if (target < 0 || target >= query.length) return
    update((p) => moveParam(p, i, dir))
    remapDecoded((j) => (j === i ? target : j === target ? i : j))
    setPendingFocus({ kind: 'move', index: target, dir })
  }

  function paramName(i: number): string {
    const key = query[i].key
    if (key === '') return `parameter ${i + 1}`
    const isDuplicate = query.filter((p) => p.key === key).length > 1
    return isDuplicate ? `${key} (${i + 1})` : key
  }

  return (
    <section class="query-editor" aria-label="Query editor">
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
            const name = paramName(i)
            const isDecoded = decodedRows.has(i)
            const displayValue =
              param.value === null ? '' : isDecoded ? decode(param.value, true) : param.value
            const toggleLabel = isDecoded ? 'Show raw value' : 'Show decoded value'
            const isFirst = i === 0
            const isLast = i === query.length - 1

            return (
              <tr key={i}>
                <td>
                  {/* biome-ignore lint/a11y/noRedundantRoles: see the fieldset above*/}
                  <fieldset role="group">
                    <input
                      type="text"
                      value={param.key}
                      aria-label={`Key for ${name}`}
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
                        aria-label={`No value for ${name}`}
                        class="no-value"
                      />

                      <button
                        type="button"
                        class="outline secondary"
                        aria-label={`Add value for ${name}`}
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
                        aria-label={`Value for ${name}`}
                        onInput={(e) => {
                          const next = (e.target as HTMLInputElement).value
                          const raw = isDecoded ? encodeLike(param.value ?? '', next, true) : next
                          update((p) => setParam(p, i, { value: raw }))
                        }}
                      />
                      <button
                        type="button"
                        class="outline secondary"
                        aria-pressed={isDecoded}
                        aria-label={`${toggleLabel} for ${name}`}
                        data-tooltip={toggleLabel}
                        onClick={() => toggleDecoded(i)}
                      >
                        ⇄
                      </button>
                      <button
                        type="button"
                        class="outline secondary danger"
                        aria-label={`Remove value for ${name}`}
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
                      ref={(el) => {
                        if (el) upButtonRefs.current.set(i, el)
                        else upButtonRefs.current.delete(i)
                      }}
                      onClick={() => handleMoveParam(i, 'up')}
                      aria-disabled={isFirst}
                      aria-label={`Move ${name} up`}
                      data-tooltip="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      class="outline secondary"
                      ref={(el) => {
                        if (el) downButtonRefs.current.set(i, el)
                        else downButtonRefs.current.delete(i)
                      }}
                      onClick={() => handleMoveParam(i, 'down')}
                      aria-disabled={isLast}
                      aria-label={`Move ${name} down`}
                      data-tooltip="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      class="outline secondary danger"
                      ref={(el) => {
                        if (el) removeButtonRefs.current.set(i, el)
                        else removeButtonRefs.current.delete(i)
                      }}
                      onClick={() => handleRemoveParam(i)}
                      aria-label={`Remove ${name}`}
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
              <button
                type="button"
                class="outline"
                ref={addButtonRef}
                onClick={() => update((p) => addParam(p))}
              >
                <span aria-hidden="true">+</span> Add parameter
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  )
}
