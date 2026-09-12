import { expect, describe as suite, test } from 'bun:test'
import { decode, encodeLike } from './codec'
import { describe } from './describe'
import { diagnose } from './diagnose'
import { addParam, moveParam, removeParam, setParam, setPart } from './edit'
import { serialize } from './serialize'
import { tokenize } from './tokenize'

suite('tokenize', () => {
  test('full http URL', () => {
    const { parts } = tokenize('https://user:pw@api.example.com:8443/v1/items?q=a+b#top')
    expect(parts.scheme).toBe('https')
    expect(parts.username).toBe('user')
    expect(parts.password).toBe('pw')
    expect(parts.host).toBe('api.example.com')
    expect(parts.port).toBe('8443')
    expect(parts.path).toBe('/v1/items')
    expect(parts.query).toEqual([{ key: 'q', value: 'a+b' }])
    expect(parts.fragment).toBe('top')
  })

  test('custom scheme', () => {
    const { parts } = tokenize('myapp://open/settings?tab=2')
    expect(parts.scheme).toBe('myapp')
    expect(parts.host).toBe('open')
    expect(parts.path).toBe('/settings')
    expect(parts.query).toEqual([{ key: 'tab', value: '2' }])
  })

  test('opaque scheme without authority', () => {
    const { parts } = tokenize('mailto:a@b.c')
    expect(parts.scheme).toBe('mailto')
    expect(parts.host).toBeNull()
    expect(parts.path).toBe('a@b.c')
  })

  test('IPv6 host with port', () => {
    const { parts } = tokenize('http://[::1]:8080/')
    expect(parts.host).toBe('[::1]')
    expect(parts.port).toBe('8080')
  })

  test('empty delimiter parts differ from absent ones', () => {
    const present = tokenize('https://a.com/?#').parts
    expect(present.query).toEqual([{ key: '', value: null }])
    expect(present.fragment).toBe('')

    const absent = tokenize('https://a.com/').parts
    expect(absent.query).toBeNull()
    expect(absent.fragment).toBeNull()
  })

  test('query: duplicates, flags, and empty values', () => {
    const { parts } = tokenize('http://a/?q=1&x&y=&q=2')
    expect(parts.query).toEqual([
      { key: 'q', value: '1' },
      { key: 'x', value: null },
      { key: 'y', value: '' },
      { key: 'q', value: '2' },
    ])
  })
})

suite('round-trip', () => {
  const cases = [
    'https://user:pw@api.example.com:8443/v1/items?q=a+b#top',
    'myapp://open/settings?tab=2',
    'mailto:a@b.c',
    'http://[::1]:8080/',
    'https://a.com/?#',
    'https://a.com/',
    'HTTP://Example.COM:80/a/./b/../c?q=a+b&x&y=&q=2#Frag',
    'ht!tp://a b/%zz?%',
    'a=1&&b=2',
    '',
    '/relative/path',
    '//protocol-relative/host/path',
    'http://a.com:8080/',
  ]

  for (const raw of cases) {
    test(`serialize(tokenize(${JSON.stringify(raw)})) === input`, () => {
      const { parts } = tokenize(raw)
      expect(serialize(parts)).toBe(raw)
    })
  }
})

suite('editing changes only the target substring', () => {
  test('edit host only', () => {
    const { parts } = tokenize('HTTP://Example.COM:80/a?q=a+b')
    const edited = setPart(parts, 'host', 'test.local')
    expect(serialize(edited)).toBe('HTTP://test.local:80/a?q=a+b')
  })

  test('remove a query parameter', () => {
    const { parts } = tokenize('http://a/?q=1&x&q=2')
    const edited = removeParam(parts, 1)
    expect(serialize(edited)).toBe('http://a/?q=1&q=2')
  })

  test('removing the last query parameter drops the query mark entirely', () => {
    const { parts } = tokenize('http://a.com/?x=1')
    const edited = removeParam(parts, 0)
    expect(edited.query).toBeNull()
    expect(serialize(edited)).toBe('http://a.com/')

    // The result must be stable: re-tokenizing it should not resurrect a phantom empty param.
    const { parts: reparsed } = tokenize(serialize(edited))
    expect(reparsed.query).toBeNull()
  })

  test('setting an authority sub-part with no host gives it an empty host', () => {
    const { parts } = tokenize('mailto:a@b.c')
    const edited = setPart(parts, 'port', '8080')
    expect(serialize(edited)).toBe('mailto://:8080a@b.c')
    expect(edited.host).toBe('')
  })

  test('remove the port', () => {
    const { parts } = tokenize('http://a.com:8080/')
    const edited = setPart(parts, 'port', null)
    expect(serialize(edited)).toBe('http://a.com/')
  })

  test('add an absent fragment', () => {
    const { parts } = tokenize('https://a.com/x')
    const edited = setPart(parts, 'fragment', 'top')
    expect(serialize(edited)).toBe('https://a.com/x#top')
  })

  test('reorder parameters', () => {
    const { parts } = tokenize('http://a/?a=1&b=2&c=3')
    const edited = moveParam(parts, 1, 'up')
    expect(serialize(edited)).toBe('http://a/?b=2&a=1&c=3')
  })

  test('add parameter', () => {
    const { parts } = tokenize('http://a/')
    const edited = addParam(parts, { key: 'x', value: '1' })
    expect(serialize(edited)).toBe('http://a/?x=1')
  })

  test('setParam updates one param', () => {
    const { parts } = tokenize('http://a/?x=1&y=2')
    const edited = setParam(parts, 0, { value: '9' })
    expect(serialize(edited)).toBe('http://a/?x=9&y=2')
  })
})

suite('codec', () => {
  test('plus style preserved on edit', () => {
    const decoded = decode('a+b', true)
    expect(decoded).toBe('a b')
    const reencoded = encodeLike('a+b', 'a b c', true)
    expect(reencoded).toBe('a+b+c')
  })

  test('new parameter uses percent style', () => {
    const reencoded = encodeLike('', 'hello world', true)
    expect(reencoded).toBe('hello%20world')
  })

  test('invalid percent sequence kept literally', () => {
    expect(decode('%zz')).toBe('%zz')
  })
})

suite('diagnose', () => {
  test('normalized form differs', () => {
    const result = diagnose('HTTP://Example.COM:80/a/./b')
    expect(result.valid).toBe(true)
    expect(result.browserForm).toBe('http://example.com/a/b')
  })

  test('browser rejects URL', () => {
    const result = diagnose('http://exa mple.com/')
    expect(result.valid).toBe(false)
  })

  test('no difference', () => {
    const result = diagnose('http://example.com/a/b')
    expect(result.valid).toBe(true)
    expect(result.browserForm).toBeNull()
  })
})

suite('describe', () => {
  test('names scheme, host, port, path, query count, fragment', () => {
    const { parts } = tokenize('https://api.example.com:8443/v1/items?q=a&x&q=2#top')
    const summary = describe(parts)
    expect(summary).toContain('HTTPS')
    expect(summary).toContain('api.example.com')
    expect(summary).toContain('8443')
    expect(summary).toContain('/v1/items')
    expect(summary).toContain('3 query parameters')
    expect(summary).toContain('top')
  })
})
