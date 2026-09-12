import type { PartName } from '@/url/types'

const RFC = (section: string) => `https://datatracker.ietf.org/doc/html/rfc3986#section-${section}`
const WHATWG = (anchor: string) => `https://url.spec.whatwg.org/#${anchor}`

export type Delimiter = { char: string; meaning: string }

export type PartInfo = {
  name: PartName
  label: string
  colorVar: string
  explanation: string
  delimiters: Delimiter[]
  rfc: string
  whatwg: string
  whatwgExtra?: { label: string; href: string }
}

export const PART_ORDER: PartName[] = [
  'scheme',
  'username',
  'password',
  'host',
  'port',
  'path',
  'query',
  'fragment',
]

export const PARTS: Record<PartName, PartInfo> = {
  scheme: {
    name: 'scheme',
    label: 'Scheme',
    colorVar: '--part-scheme',
    explanation: 'The protocol, e.g. https, mailto, myapp. Followed by a colon.',
    delimiters: [{ char: ':', meaning: 'separates the scheme from the rest of the URL' }],
    rfc: RFC('3.1'),
    whatwg: WHATWG('concept-url-scheme'),
  },
  username: {
    name: 'username',
    label: 'Username',
    colorVar: '--part-username',
    explanation: 'The first part of userinfo, before an optional password.',
    delimiters: [
      { char: ':', meaning: 'separates username from password' },
      { char: '@', meaning: 'separates userinfo from the host' },
    ],
    rfc: RFC('3.2.1'),
    whatwg: WHATWG('concept-url-username'),
  },
  password: {
    name: 'password',
    label: 'Password',
    colorVar: '--part-password',
    explanation: 'The second part of userinfo, after the colon. Sent in cleartext; avoid it.',
    delimiters: [{ char: '@', meaning: 'separates userinfo from the host' }],
    rfc: RFC('3.2.1'),
    whatwg: WHATWG('concept-url-password'),
  },
  host: {
    name: 'host',
    label: 'Host',
    colorVar: '--part-host',
    explanation: 'A registered name or IP address. IPv6 addresses are wrapped in brackets.',
    delimiters: [
      { char: '[...]', meaning: 'wraps an IPv6 address' },
      { char: ':', meaning: 'separates host from port' },
    ],
    rfc: RFC('3.2.2'),
    whatwg: WHATWG('concept-url-host'),
  },
  port: {
    name: 'port',
    label: 'Port',
    colorVar: '--part-port',
    explanation: 'A decimal TCP port number, after the host.',
    delimiters: [{ char: ':', meaning: 'separates host from port' }],
    rfc: RFC('3.2.3'),
    whatwg: WHATWG('concept-url-port'),
  },
  path: {
    name: 'path',
    label: 'Path',
    colorVar: '--part-path',
    explanation: 'A sequence of segments separated by /. May be empty or relative.',
    delimiters: [{ char: '/', meaning: 'separates path segments' }],
    rfc: RFC('3.3'),
    whatwg: WHATWG('concept-url-path'),
  },
  query: {
    name: 'query',
    label: 'Query',
    colorVar: '--part-query',
    explanation:
      'Ordered key/value parameters, conventionally encoded as application/x-www-form-urlencoded.',
    delimiters: [
      { char: '?', meaning: 'starts the query' },
      { char: '&', meaning: 'separates parameters' },
      { char: '=', meaning: 'separates a key from its value' },
      { char: '+', meaning: 'a space, in form-encoded values' },
      { char: '%XX', meaning: 'a percent-encoded byte' },
    ],
    rfc: RFC('3.4'),
    whatwg: WHATWG('concept-url-query'),
    whatwgExtra: {
      label: 'application/x-www-form-urlencoded',
      href: WHATWG('application/x-www-form-urlencoded'),
    },
  },
  fragment: {
    name: 'fragment',
    label: 'Fragment',
    colorVar: '--part-fragment',
    explanation: 'A client-side reference, e.g. a page anchor. Never sent to the server.',
    delimiters: [{ char: '#', meaning: 'starts the fragment' }],
    rfc: RFC('3.5'),
    whatwg: WHATWG('concept-url-fragment'),
  },
}

export function partColor(name: PartName): string {
  return `var(${PARTS[name].colorVar})`
}
