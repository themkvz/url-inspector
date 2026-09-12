import type { Param, Parts } from './types'

export function serializeQuery(params: Param[]): string {
  return params.map((p) => (p.value === null ? p.key : `${p.key}=${p.value}`)).join('&')
}

export function serializeAuthority(parts: Parts): string {
  if (parts.host === null) return ''
  let userinfo = ''
  if (parts.username !== null) {
    userinfo = parts.username + (parts.password !== null ? `:${parts.password}` : '')
    userinfo += '@'
  }
  const port = parts.port !== null ? `:${parts.port}` : ''
  return `${userinfo}${parts.host}${port}`
}

export function serialize(parts: Parts): string {
  const scheme = parts.scheme !== null ? `${parts.scheme}:` : ''
  const authority = parts.host !== null ? `//${serializeAuthority(parts)}` : ''
  const query = parts.query !== null ? `?${serializeQuery(parts.query)}` : ''
  const fragment = parts.fragment !== null ? `#${parts.fragment}` : ''
  return `${scheme}${authority}${parts.path}${query}${fragment}`
}
