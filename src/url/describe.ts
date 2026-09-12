import type { Parts } from './types'

export function describe(parts: Parts): string {
  const bits: string[] = []
  const schemeLabel = parts.scheme ? parts.scheme.toUpperCase() : null

  if (parts.host !== null) {
    bits.push(schemeLabel ? `${schemeLabel} request to ${parts.host}` : `Request to ${parts.host}`)
    if (parts.port !== null) bits.push(`on port ${parts.port}`)
  } else if (schemeLabel) {
    bits.push(`${schemeLabel} URL`)
  }

  if (parts.path) bits.push(`path ${parts.path}`)

  if (parts.query !== null) {
    const count = parts.query.length
    bits.push(`${count} query parameter${count === 1 ? '' : 's'}`)
  }

  if (parts.fragment !== null) bits.push(`fragment ${parts.fragment}`)

  return bits.length ? `${bits.join(', ')}.` : ''
}
