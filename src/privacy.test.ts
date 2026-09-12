import { beforeAll, describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { $ } from 'bun'

const rootDir = join(import.meta.dir, '..')
const distDir = join(rootDir, 'dist')

beforeAll(async () => {
  await $`bun run build`.cwd(rootDir).quiet()
})

// Documentation hosts allowed for user-initiated navigation links, per the app-shell spec.
const DOCUMENTATION_HOSTS = ['datatracker.ietf.org', 'www.rfc-editor.org', 'url.spec.whatwg.org']
// The app's own canonical origin, named by self-referential discoverability metadata.
const OWN_HOST = 'url.themkvz.com'
const OPENPANEL_HOST = 'openpanel.themkvz.com'
const OPENPANEL_API_URL = `https://${OPENPANEL_HOST}/api`
const OPENPANEL_SCRIPT_URL = `https://${OPENPANEL_HOST}/op1.js`
const OPENPANEL_CLIENT_ID = '2e6568f4-b5bc-46b9-bf0b-64c63e9f7263'
const OPENPANEL_EVENTS = [
  'url_copied',
  'example_loaded',
  'url_part_opened',
  'query_parameter_added',
  'query_parameter_removed',
  'query_parameter_moved',
]
// Hosts that only ever appear as identifiers and are never fetched: XML namespaces and the
// JSON-LD @context vocabulary.
const IDENTIFIER_HOSTS = ['www.w3.org', 'schema.org']
const ALLOWED_HOSTS = new Set([
  ...DOCUMENTATION_HOSTS,
  OWN_HOST,
  OPENPANEL_HOST,
  ...IDENTIFIER_HOSTS,
])
const ANALYTICS_URLS = new Set([OPENPANEL_API_URL, OPENPANEL_SCRIPT_URL])

const ABSOLUTE_URL = /\bhttps?:\/\/([^/"'\s)<>]+)(?:\/[^"'\s)<>]*)?/g
// Resource-loading positions only: src=/href=/href:/url()/import(), including JSX-compiled
// object-property form (href:"...") that plain attribute regexes miss.
const PROTOCOL_RELATIVE_RESOURCE =
  /\b(?:src|href)\s*[:=]\s*["']\/\/[^"']+["']|url\(\s*["']?\/\/[^)"']+["']?\s*\)|\bimport\(\s*["']\/\/[^"']+["']\s*\)/g

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

describe('privacy: build output references only allowlisted hosts', () => {
  test('every absolute http(s) URL points at an allowlisted host or an xmlns', () => {
    const files = walk(distDir).filter((f) => /\.(html|js|css)$/.test(f))
    expect(files.length).toBeGreaterThan(0)

    const violations: string[] = []
    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      for (const match of content.matchAll(ABSOLUTE_URL)) {
        const host = match[1]
        if (host === OPENPANEL_HOST && !ANALYTICS_URLS.has(match[0])) {
          violations.push(`${file}: ${match[0]}`)
          continue
        }
        if (ALLOWED_HOSTS.has(host)) continue
        violations.push(`${file}: ${match[0]}`)
      }
    }

    expect(violations).toEqual([])
  })

  test('includes the configured self-hosted OpenPanel integration and safe event context', () => {
    const index = readFileSync(join(distDir, 'index.html'), 'utf8')
    const build = walk(distDir)
      .filter((file) => /\.(html|js)$/.test(file))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n')

    expect(index).toContain(`apiUrl: '${OPENPANEL_API_URL}'`)
    expect(index).toContain(`clientId: '${OPENPANEL_CLIENT_ID}'`)
    expect(index).toContain('trackScreenViews: true')
    expect(index).toContain('trackOutgoingLinks: true')
    expect(index).toContain('trackAttributes: true')
    expect(index).toContain(`<script src="${OPENPANEL_SCRIPT_URL}" defer async></script>`)
    expect(index).toContain("window.op('setGlobalProperties'")
    expect(index).toContain("app: 'url-inspector'")
    expect(index).toContain("? 'production' : 'development'")
    expect(index).not.toContain('app_version')

    for (const event of OPENPANEL_EVENTS) {
      expect(build).toContain(event)
    }
    expect(build).toContain('data-part')
    expect(build).toContain('data-direction')
    expect(build).not.toMatch(/data-(?:key|value|query-key|query-value)/)
  })

  test('no protocol-relative resource references', () => {
    const files = walk(distDir).filter((f) => /\.(html|js|css)$/.test(f))
    const violations: string[] = []
    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      for (const match of content.matchAll(PROTOCOL_RELATIVE_RESOURCE)) {
        violations.push(`${file}: ${match[0]}`)
      }
    }

    expect(violations).toEqual([])
  })
})
