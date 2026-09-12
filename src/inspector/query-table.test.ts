import { afterAll, beforeAll, expect, test } from 'bun:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'

// As in src/a11y.test.ts, preact/DOM modules are imported dynamically so they load after
// GlobalRegistrator has installed happy-dom's globals.

beforeAll(async () => {
  await GlobalRegistrator.register()
})

afterAll(async () => {
  await GlobalRegistrator.unregister()
})

// Preact batches state updates; let them flush before asserting on the DOM.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

function labelled(root: Element, label: string): HTMLElement {
  const el = root.querySelector(`[aria-label="${label}"]`)
  if (!el) throw new Error(`no element labelled "${label}"`)
  return el as HTMLElement
}

function fieldValue(root: Element, label: string): string {
  return (labelled(root, label) as HTMLInputElement).value
}

async function mount(url: string) {
  const { h, render } = await import('preact')
  const { QueryTable } = await import('./query-table')
  const { raw } = await import('./store')

  raw.value = url
  const container = document.createElement('div')
  document.body.appendChild(container)
  render(h(QueryTable, null), container)

  return container
}

test('removing a row does not leave its decoded view on the row that takes its index', async () => {
  const container = await mount('?a=%41&b=x%20y')

  labelled(container, 'Show decoded value for a').click()
  await flush()
  expect(fieldValue(container, 'Value for a')).toBe('A')

  labelled(container, 'Remove a').click()
  await flush()
  expect(fieldValue(container, 'Value for b')).toBe('x%20y')
  expect(labelled(container, 'Show decoded value for b').getAttribute('aria-pressed')).toBe('false')
})

test('reordering carries the decoded view with its own row', async () => {
  const container = await mount('?a=%41&b=x%20y')

  labelled(container, 'Show decoded value for b').click()
  await flush()
  expect(fieldValue(container, 'Value for b')).toBe('x y')

  labelled(container, 'Move b up').click()
  await flush()
  expect(fieldValue(container, 'Value for b')).toBe('x y')
  expect(labelled(container, 'Show raw value for b').getAttribute('aria-pressed')).toBe('true')
  expect(fieldValue(container, 'Value for a')).toBe('%41')
  expect(labelled(container, 'Show decoded value for a').getAttribute('aria-pressed')).toBe('false')
})
