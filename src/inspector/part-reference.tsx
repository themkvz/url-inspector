import { PARTS } from './parts'
import { activePart } from './store'

export function PartReference() {
  const name = activePart.value

  if (name === null) return null

  const info = PARTS[name]

  return (
    <div class="part-reference">
      <p>{info.explanation}</p>
      <table>
        <thead>
          <tr>
            <th>Char</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {info.delimiters.map((d) => (
            <tr key={d.char}>
              <td>
                <code>{d.char}</code>
              </td>
              <td>{d.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p class="spec-links">
        <a href={info.rfc} target="_blank" rel="noreferrer noopener">
          RFC 3986
        </a>{' '}
        defines the syntax.{' '}
        <a href={info.whatwg} target="_blank" rel="noreferrer noopener">
          WHATWG URL Standard
        </a>{' '}
        defines what browsers actually do.
        {info.whatwgExtra && (
          <>
            {' '}
            See also{' '}
            <a href={info.whatwgExtra.href} target="_blank" rel="noreferrer noopener">
              {info.whatwgExtra.label}
            </a>
            .
          </>
        )}
      </p>
    </div>
  )
}
