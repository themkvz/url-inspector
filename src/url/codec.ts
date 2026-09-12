const PERCENT_RUN = /(?:%[0-9a-fA-F]{2})+/g

export function decode(raw: string, plusAsSpace = false): string {
  const withSpaces = plusAsSpace ? raw.replace(/\+/g, ' ') : raw
  return withSpaces.replace(PERCENT_RUN, (run) => {
    try {
      return decodeURIComponent(run)
    } catch {
      return run
    }
  })
}

export function encodeLike(originalRaw: string, decoded: string, plusAsSpace = false): string {
  const spaceStyle = plusAsSpace && originalRaw.includes('+') ? '+' : '%20'
  return [...decoded]
    .map((ch) => {
      if (ch === ' ') return spaceStyle
      if (ch === '+' && plusAsSpace) return '%2B'
      return encodeURIComponent(ch)
    })
    .join('')
}
