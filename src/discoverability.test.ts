import { beforeAll, describe, expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { $ } from 'bun'
import { Window } from 'happy-dom'
import { FAQ_ITEMS, FAQ_URL } from '@/faq-content'

const HOME_URL = 'https://url.themkvz.com/'
const SITE_NAME = 'URL Inspector'
const rootDir = join(import.meta.dir, '..')
const distDir = join(rootDir, 'dist')

type Page = { file: string; canonical: string }
const PAGES: Page[] = [
  { file: 'index.html', canonical: HOME_URL },
  { file: 'faq.html', canonical: FAQ_URL },
]

const documents = new Map<string, Window['document']>()

beforeAll(async () => {
  await $`bun run build`.cwd(rootDir).quiet()
  for (const { file } of PAGES) {
    const window = new Window()
    window.document.write(readFileSync(join(distDir, file), 'utf8'))
    documents.set(file, window.document)
  }
})

function doc(file: string): Window['document'] {
  const document = documents.get(file)
  if (!document) throw new Error(`no document loaded for ${file}`)
  return document
}

function meta(document: Window['document'], selector: string) {
  return document.querySelector(selector)?.getAttribute('content') ?? undefined
}

describe('discoverability', () => {
  test('prerenders the home page shell', () => {
    const document = doc('index.html')
    expect(document.querySelectorAll('h1')).toHaveLength(1)
    expect(document.querySelector('h1')?.textContent).toBe(SITE_NAME)
    expect(document.querySelector('.tagline')?.textContent).toBe(
      'Break down, edit, and rebuild URLs without losing detail.',
    )
    expect(document.querySelector('#app')?.innerHTML).not.toBe('')
    expect(document.querySelector('textarea[aria-label="URL"]')).not.toBeNull()
    expect(document.querySelector('button[type="button"]')).not.toBeNull()
  })

  test('serves a noindex 404 page with a way back to the inspector', () => {
    const window = new Window()
    window.document.write(readFileSync(join(distDir, '404.html'), 'utf8'))
    const document = window.document
    expect(document.querySelectorAll('h1')).toHaveLength(1)
    expect(document.querySelector('h2')?.textContent).toBe('Page not found')
    expect(meta(document, 'meta[name="robots"]')).toBe('noindex')
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
    expect(document.querySelector('main a[href="/"]')).not.toBeNull()
    for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
      expect(link.getAttribute('href')).toMatch(/^\/[^/]/)
    }
  })

  test('prerenders the FAQ page with every question and answer', () => {
    const document = doc('faq.html')
    expect(document.querySelectorAll('h1')).toHaveLength(1)
    expect(document.querySelector('h1')?.textContent).toBe(SITE_NAME)
    expect(document.querySelector('#app')?.innerHTML).not.toBe('')
    expect(document.querySelector('h2')?.textContent).toBe('Frequently Asked Questions')

    const details = [...document.querySelectorAll('details')]
    expect(details).toHaveLength(FAQ_ITEMS.length)
    FAQ_ITEMS.forEach((item, index) => {
      expect(details[index]?.querySelector('summary')?.textContent).toBe(item.question)
      expect(details[index]?.querySelector('p')?.textContent).toBe(item.answer)
    })
  })

  test('every page has a shared nav landmark with the current page marked', () => {
    for (const { file } of PAGES) {
      const document = doc(file)
      const nav = document.querySelector('footer nav')
      expect(nav).not.toBeNull()
      const links = [...(nav?.querySelectorAll('a') ?? [])]
      expect(links).toHaveLength(2)
      const current = links.filter((a) => a.getAttribute('aria-current') === 'page')
      expect(current).toHaveLength(1)
    }
    expect(
      doc('index.html').querySelector('footer nav a[href="/"]')?.getAttribute('aria-current'),
    ).toBe('page')
    expect(
      doc('faq.html').querySelector('footer nav a[href="/faq"]')?.getAttribute('aria-current'),
    ).toBe('page')
  })

  test('every page declares its own consistent identity and sharing metadata', () => {
    for (const { file, canonical } of PAGES) {
      const document = doc(file)
      const description = meta(document, 'meta[name="description"]')
      expect(document.querySelectorAll('title')).toHaveLength(1)
      expect(document.title.length).toBeGreaterThan(0)
      expect(description?.length).toBeGreaterThanOrEqual(50)
      expect(description?.length).toBeLessThanOrEqual(160)
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(canonical)
      expect(meta(document, 'meta[name="robots"]')).toBe('index, follow')
      expect(meta(document, 'meta[name="theme-color"]')).toBe('#ffffff')

      expect(meta(document, 'meta[property="og:type"]')).toBe('website')
      expect(meta(document, 'meta[property="og:title"]')).toBe(document.title)
      expect(meta(document, 'meta[property="og:description"]')).toBe(description)
      expect(meta(document, 'meta[property="og:site_name"]')).toBe(SITE_NAME)
      expect(meta(document, 'meta[property="og:url"]')).toBe(canonical)
      expect(meta(document, 'meta[property="og:image"]')).toBe(`${HOME_URL}og.png`)
      expect(meta(document, 'meta[property="og:image:width"]')).toBe('1200')
      expect(meta(document, 'meta[property="og:image:height"]')).toBe('630')
      expect(meta(document, 'meta[property="og:image:alt"]')).toBe(SITE_NAME)

      expect(meta(document, 'meta[name="twitter:card"]')).toBe('summary_large_image')
      expect(meta(document, 'meta[name="twitter:title"]')).toBe(document.title)
      expect(meta(document, 'meta[name="twitter:description"]')).toBe(description)
      expect(meta(document, 'meta[name="twitter:image"]')).toBe(
        meta(document, 'meta[property="og:image"]'),
      )
    }

    expect(doc('index.html').title).not.toBe(doc('faq.html').title)
  })

  test('home page declares truthful WebApplication structured data', () => {
    const document = doc('index.html')
    const description = meta(document, 'meta[name="description"]')
    const structuredData = JSON.parse(
      document.querySelector('script[type="application/ld+json"]')?.textContent ?? '',
    )
    expect(structuredData).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: document.title,
      description,
      url: HOME_URL,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    })
    expect(structuredData).not.toHaveProperty('aggregateRating')
    expect(structuredData).not.toHaveProperty('review')
  })

  test('FAQ page structured data mirrors its visible questions and answers exactly', () => {
    const document = doc('faq.html')
    const structuredData = JSON.parse(
      document.querySelector('script[type="application/ld+json"]')?.textContent ?? '',
    )
    expect(structuredData['@context']).toBe('https://schema.org')
    expect(structuredData['@type']).toBe('FAQPage')
    expect(structuredData.url).toBe(FAQ_URL)
    expect(structuredData).not.toHaveProperty('aggregateRating')
    expect(structuredData).not.toHaveProperty('review')

    expect(structuredData.mainEntity).toHaveLength(FAQ_ITEMS.length)
    FAQ_ITEMS.forEach((item, index) => {
      expect(structuredData.mainEntity[index]).toEqual({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })
    })

    const visibleQuestions = [...document.querySelectorAll('details summary')].map(
      (el) => el.textContent,
    )
    expect(structuredData.mainEntity.map((q: { name: string }) => q.name)).toEqual(visibleQuestions)
  })

  test('sitemap and robots.txt list every top-level page and only those pages', () => {
    const sitemap = readFileSync(join(distDir, 'sitemap.xml'), 'utf8')
    for (const { canonical } of PAGES) expect(sitemap).toContain(`<loc>${canonical}</loc>`)
    expect(sitemap.match(/<loc>/g)).toHaveLength(PAGES.length)

    expect(readFileSync(join(distDir, 'robots.txt'), 'utf8')).toContain(
      'Sitemap: https://url.themkvz.com/sitemap.xml',
    )
  })

  test('ships every referenced self-hosted asset, on every page', () => {
    for (const { file } of PAGES) {
      const document = doc(file)
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
    }

    const homeDocument = doc('index.html')
    const manifest = JSON.parse(readFileSync(join(distDir, 'site.webmanifest'), 'utf8'))
    expect(manifest).toMatchObject({
      name: SITE_NAME,
      short_name: 'URL Inspector',
      start_url: '/',
      display: 'standalone',
      theme_color: meta(homeDocument, 'meta[name="theme-color"]'),
      background_color: '#ffffff',
    })
    for (const icon of manifest.icons) expect(existsSync(join(distDir, icon.src))).toBe(true)

    const ogImage = readFileSync(join(distDir, 'og.png'))
    expect(ogImage.readUInt32BE(16)).toBe(1200)
    expect(ogImage.readUInt32BE(20)).toBe(630)
  })
})
