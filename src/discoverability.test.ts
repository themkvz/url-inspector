import { beforeAll, describe, expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { $ } from 'bun'
import { Window } from 'happy-dom'

const CANONICAL_URL = 'https://url.themkvz.com/'
const rootDir = join(import.meta.dir, '..')
const distDir = join(rootDir, 'dist')
let document: Window['document']

beforeAll(async () => {
  await $`bun run build`.cwd(rootDir).quiet()
  const window = new Window()
  window.document.write(readFileSync(join(distDir, 'index.html'), 'utf8'))
  document = window.document
})

function meta(selector: string) {
  return document.querySelector(selector)?.getAttribute('content') ?? undefined
}

describe('discoverability', () => {
  test('prerenders the app shell', () => {
    expect(document.querySelectorAll('h1')).toHaveLength(1)
    expect(document.querySelector('h1')?.textContent).toBe('URL Inspector')
    expect(document.querySelector('.tagline')?.textContent).toBe(
      'Break down, edit, and rebuild URLs without losing detail.',
    )
    expect(document.querySelector('#app')?.innerHTML).not.toBe('')
    expect(document.querySelector('textarea[aria-label="URL"]')).not.toBeNull()
    expect(document.querySelector('button[type="button"]')).not.toBeNull()
  })

  test('declares consistent index and sharing metadata', () => {
    const description = meta('meta[name="description"]')
    expect(document.querySelectorAll('title')).toHaveLength(1)
    expect(document.title).toBe('URL Inspector')
    expect(description?.length).toBeGreaterThanOrEqual(50)
    expect(description?.length).toBeLessThanOrEqual(160)
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      CANONICAL_URL,
    )
    expect(meta('meta[name="robots"]')).toBe('index, follow')
    expect(meta('meta[name="theme-color"]')).toBe('#ffffff')

    expect(meta('meta[property="og:type"]')).toBe('website')
    expect(meta('meta[property="og:title"]')).toBe(document.title)
    expect(meta('meta[property="og:description"]')).toBe(description)
    expect(meta('meta[property="og:site_name"]')).toBe(document.title)
    expect(meta('meta[property="og:url"]')).toBe(CANONICAL_URL)
    expect(meta('meta[property="og:image"]')).toBe(`${CANONICAL_URL}og.png`)
    expect(meta('meta[property="og:image:width"]')).toBe('1200')
    expect(meta('meta[property="og:image:height"]')).toBe('630')
    expect(meta('meta[property="og:image:alt"]')).toBe(document.title)

    expect(meta('meta[name="twitter:card"]')).toBe('summary_large_image')
    expect(meta('meta[name="twitter:title"]')).toBe(document.title)
    expect(meta('meta[name="twitter:description"]')).toBe(description)
    expect(meta('meta[name="twitter:image"]')).toBe(meta('meta[property="og:image"]'))
  })

  test('includes truthful structured data and matching crawl directives', () => {
    const description = meta('meta[name="description"]')
    const structuredData = JSON.parse(
      document.querySelector('script[type="application/ld+json"]')?.textContent ?? '',
    )
    expect(structuredData).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: document.title,
      description,
      url: CANONICAL_URL,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    })
    expect(structuredData).not.toHaveProperty('aggregateRating')
    expect(structuredData).not.toHaveProperty('review')

    expect(readFileSync(join(distDir, 'sitemap.xml'), 'utf8')).toContain(
      `<loc>${CANONICAL_URL}</loc>`,
    )
    expect(readFileSync(join(distDir, 'robots.txt'), 'utf8')).toContain(
      'Sitemap: https://url.themkvz.com/sitemap.xml',
    )
  })

  test('ships every referenced self-hosted asset', () => {
    for (const selector of [
      'link[rel="icon"][type="image/svg+xml"]',
      'link[rel="icon"][sizes="any"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="manifest"]',
    ]) {
      const href = document.querySelector(selector)?.getAttribute('href') ?? ''
      expect(href).not.toMatch(/^(https?:)?\/\//)
      expect(existsSync(join(distDir, href))).toBe(true)
    }

    const manifest = JSON.parse(readFileSync(join(distDir, 'site.webmanifest'), 'utf8'))
    expect(manifest).toMatchObject({
      name: document.title,
      short_name: 'URL Inspector',
      start_url: '/',
      display: 'standalone',
      theme_color: meta('meta[name="theme-color"]'),
      background_color: '#ffffff',
    })
    for (const icon of manifest.icons) expect(existsSync(join(distDir, icon.src))).toBe(true)

    const ogImage = readFileSync(join(distDir, 'og.png'))
    expect(ogImage.readUInt32BE(16)).toBe(1200)
    expect(ogImage.readUInt32BE(20)).toBe(630)
  })
})
