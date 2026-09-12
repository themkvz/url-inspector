import type { Param, Parts, Range, Ranges, Tokenized } from './types'

// RFC 3986 Appendix B generic syntax splitting regex, with match indices.
const APPENDIX_B = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/d

function parseQuery(raw: string): Param[] {
  return raw.split('&').map((segment) => {
    const eq = segment.indexOf('=')
    return eq === -1
      ? { key: segment, value: null }
      : { key: segment.slice(0, eq), value: segment.slice(eq + 1) }
  })
}

function splitAuthority(
  authority: string,
  offset: number,
): {
  username: string | null
  password: string | null
  host: string
  port: string | null
  ranges: Ranges
} {
  const ranges: Ranges = {}
  let username: string | null = null
  let password: string | null = null
  let hostport = authority
  let hostOffset = offset

  const atIdx = authority.lastIndexOf('@')
  if (atIdx !== -1) {
    const userinfo = authority.slice(0, atIdx)
    hostport = authority.slice(atIdx + 1)
    hostOffset = offset + atIdx + 1

    const colonIdx = userinfo.indexOf(':')
    if (colonIdx === -1) {
      username = userinfo
      ranges.username = [offset, offset + atIdx]
    } else {
      username = userinfo.slice(0, colonIdx)
      password = userinfo.slice(colonIdx + 1)
      ranges.username = [offset, offset + colonIdx]
      ranges.password = [offset + colonIdx + 1, offset + atIdx]
    }
  }

  let host = hostport
  let port: string | null = null
  let hostRange: Range = [hostOffset, hostOffset + hostport.length]

  if (hostport.startsWith('[')) {
    const closeIdx = hostport.indexOf(']')
    if (closeIdx !== -1) {
      host = hostport.slice(0, closeIdx + 1)
      const remainder = hostport.slice(closeIdx + 1)
      hostRange = [hostOffset, hostOffset + host.length]
      if (remainder.startsWith(':')) {
        port = remainder.slice(1)
        ranges.port = [hostOffset + closeIdx + 2, hostOffset + hostport.length]
      }
    }
  } else {
    const colonIdx = hostport.lastIndexOf(':')
    if (colonIdx !== -1) {
      host = hostport.slice(0, colonIdx)
      port = hostport.slice(colonIdx + 1)
      hostRange = [hostOffset, hostOffset + colonIdx]
      ranges.port = [hostOffset + colonIdx + 1, hostOffset + hostport.length]
    }
  }

  ranges.host = hostRange
  return { username, password, host, port, ranges }
}

export function tokenize(raw: string): Tokenized {
  const match = APPENDIX_B.exec(raw) as
    | (RegExpExecArray & { indices: Array<Range | undefined> })
    | null
  if (!match?.indices) throw new Error('tokenize: regex did not match')

  const indices = match.indices
  const ranges: Ranges = {}

  const scheme = match[2] ?? null
  if (scheme !== null && indices[2]) ranges.scheme = indices[2]

  const authority = match[4] ?? null
  let username: string | null = null
  let password: string | null = null
  let host: string | null = null
  let port: string | null = null
  if (authority !== null && indices[4]) {
    const split = splitAuthority(authority, indices[4][0])
    username = split.username
    password = split.password
    host = split.host
    port = split.port
    Object.assign(ranges, split.ranges)
  }

  const path = match[5] ?? ''
  if (indices[5]) ranges.path = indices[5]

  const queryRaw = match[7] ?? null
  if (queryRaw !== null && indices[7]) ranges.query = indices[7]
  const query = queryRaw === null ? null : parseQuery(queryRaw)

  const fragment = match[9] ?? null
  if (fragment !== null && indices[9]) ranges.fragment = indices[9]

  const parts: Parts = { scheme, username, password, host, port, path, query, fragment }
  return { parts, ranges }
}
