import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'

// Modules touching preact/the DOM are imported dynamically, after GlobalRegistrator has
// installed happy-dom's globals — importing them statically would run their module-level code
// against Bun's real (DOM-less) globals instead.

beforeAll(async () => {
  await GlobalRegistrator.register()
})

afterAll(async () => {
  await GlobalRegistrator.unregister()
})

// Each test mounts its own page component into a fresh container appended to <body>. Axe's
// landmark-uniqueness rules are page-scoped (they look at the whole document, not just the
// container passed to axe.run), so a previous test's container must be gone before the next
// one mounts, or the second page's header/main appear duplicated.
afterEach(() => {
  document.body.innerHTML = ''
})

describe('accessibility', () => {
  test('the app renders with zero axe violations', async () => {
    const axe = await import('axe-core')
    const { h, render } = await import('preact')
    const { App } = await import('@/app')
    const { raw } = await import('@/inspector/store')

    // Exercises every part, plus a duplicate key (q) and a flag parameter with no value (flag),
    // so the query table's per-row accessible names are actually covered.
    raw.value = 'https://user:pass@example.com:8443/path/to/page?q=a&q=b&flag&empty=#section'

    const container = document.createElement('div')
    document.body.appendChild(container)
    render(h(App, null), container)

    const results = await axe.default.run(container)
    expect(results.violations).toEqual([])
  })

  test('the FAQ page renders with zero axe violations', async () => {
    const axe = await import('axe-core')
    const { h, render } = await import('preact')
    const { Faq } = await import('@/faq')

    const container = document.createElement('div')
    document.body.appendChild(container)
    render(h(Faq, null), container)

    const results = await axe.default.run(container)
    expect(results.violations).toEqual([])
  })
})
