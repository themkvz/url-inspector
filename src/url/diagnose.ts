export type Diagnostics = {
  valid: boolean
  // Set only for http(s) URLs whose browser-normalized form differs from the raw input.
  browserForm: string | null
}

export function diagnose(raw: string): Diagnostics {
  try {
    const url = new URL(raw)
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:'
    return { valid: true, browserForm: isHttp && url.href !== raw ? url.href : null }
  } catch {
    return { valid: false, browserForm: null }
  }
}
