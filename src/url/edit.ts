import type { Param, Parts } from './types'

type ScalarNullable = 'scheme' | 'username' | 'password' | 'host' | 'port' | 'fragment'

// These parts serialize only inside the authority (`//host`); setting one with no host would
// otherwise be silently dropped, so setting it also gives the authority a (possibly empty) host.
const AUTHORITY_SUBPART = new Set(['username', 'password', 'port'])

export function setPart(parts: Parts, name: ScalarNullable, value: string | null): Parts
export function setPart(parts: Parts, name: 'path', value: string): Parts
export function setPart(parts: Parts, name: ScalarNullable | 'path', value: string | null): Parts {
  const result = { ...parts, [name]: value }
  if (AUTHORITY_SUBPART.has(name) && value !== null && result.host === null) {
    result.host = ''
  }
  return result
}

export function setParam(parts: Parts, index: number, patch: Partial<Param>): Parts {
  if (parts.query === null) return parts
  const query = parts.query.map((p, i) => (i === index ? { ...p, ...patch } : p))
  return { ...parts, query }
}

export function addParam(
  parts: Parts,
  param: Param = { key: '', value: null },
  atIndex?: number,
): Parts {
  const existing = parts.query ?? []
  const index = atIndex ?? existing.length
  const query = [...existing.slice(0, index), param, ...existing.slice(index)]
  return { ...parts, query }
}

export function removeParam(parts: Parts, index: number): Parts {
  if (parts.query === null) return parts

  const query = parts.query.filter((_, i) => i !== index)

  return { ...parts, query }
}

export function moveParam(parts: Parts, index: number, direction: 'up' | 'down'): Parts {
  if (parts.query === null) return parts
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= parts.query.length) return parts
  const query = [...parts.query]
  const tmp = query[index]
  query[index] = query[target]
  query[target] = tmp
  return { ...parts, query }
}
