import { expect, test } from 'bun:test'
import { buildFaqJsonLd, FAQ_ITEMS, FAQ_URL } from '@/faq-content'

test('buildFaqJsonLd mirrors FAQ_ITEMS exactly, in order', () => {
  const jsonLd = buildFaqJsonLd()

  expect(jsonLd['@context']).toBe('https://schema.org')
  expect(jsonLd['@type']).toBe('FAQPage')
  expect(jsonLd.url).toBe(FAQ_URL)
  expect(jsonLd.mainEntity).toHaveLength(FAQ_ITEMS.length)
  jsonLd.mainEntity.forEach((entry, index) => {
    expect(entry).toEqual({
      '@type': 'Question',
      name: FAQ_ITEMS[index].question,
      acceptedAnswer: { '@type': 'Answer', text: FAQ_ITEMS[index].answer },
    })
  })
})

test('there are at least six questions, per the faq-page spec minimum', () => {
  expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(6)
})
