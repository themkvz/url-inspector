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
// Hosts that only ever appear as identifiers and are never fetched: XML namespaces and the
// JSON-LD @context vocabulary.
const IDENTIFIER_HOSTS = ['www.w3.org', 'schema.org']
const ALLOWED_HOSTS = new Set([...DOCUMENTATION_HOSTS, OWN_HOST, ...IDENTIFIER_HOSTS])

const ABSOLUTE_URL = /\bhttps?:\/\/([^/"'\s)<>]+)/g
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
        if (ALLOWED_HOSTS.has(host)) continue
        violations.push(`${file}: ${match[0]}`)
      }
    }

    expect(violations).toEqual([])
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
