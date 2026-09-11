import { beforeAll, describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { $ } from 'bun'

const rootDir = join(import.meta.dir, '..')
const distDir = join(rootDir, 'dist')

beforeAll(async () => {
  await $`bun build ./index.html --outdir dist --minify`.cwd(rootDir).quiet()
})

// Matches src=/href=/url()/import() referencing an absolute or protocol-relative
// URL, e.g. src="https://..." or url(//cdn...). Excludes XML namespace URIs
// (e.g. xmlns="http://www.w3.org/2000/svg"), which are not network requests.
const EXTERNAL_REFERENCE =
  /\b(?:src|href)\s*=\s*["'](https?:)?\/\/[^"']+["']|url\(\s*["']?(https?:)?\/\/[^)"']+["']?\s*\)|\bimport\(\s*["'](https?:)?\/\/[^"']+["']\s*\)/g
const XML_NAMESPACE = /xmlns(:\w+)?\s*=\s*["'](https?:)?\/\//

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

describe('privacy: no external references in build output', () => {
  test('dist contains no absolute or protocol-relative resource URLs', () => {
    const files = walk(distDir).filter((f) => /\.(html|js|css)$/.test(f))
    expect(files.length).toBeGreaterThan(0)

    const violations: string[] = []
    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      for (const match of content.matchAll(EXTERNAL_REFERENCE)) {
        if (XML_NAMESPACE.test(match[0])) continue
        violations.push(`${file}: ${match[0]}`)
      }
    }

    expect(violations).toEqual([])
  })
})
