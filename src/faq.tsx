import { FAQ_ITEMS } from '@/faq-content'
import { Shell } from '@/shell'

export function Faq() {
  return (
    <Shell current="faq">
      <h2>Frequently Asked Questions</h2>
      {FAQ_ITEMS.map((item) => (
        <details key={item.question}>
          {/* biome-ignore lint/a11y/useSemanticElements: picocss flow */}
          <summary role="button" class="outline contrast">
            {item.question}
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </Shell>
  )
}
