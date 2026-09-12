import { useEffect } from 'preact/hooks'
import { Inspector } from '@/inspector/inspector'
import { inputEl } from '@/inspector/store'

export function App() {
  useEffect(() => {
    inputEl.current?.focus()
  }, [])

  return (
    <>
      <header class={'container'}>
        <hgroup>
          <h1>URL Inspector</h1>
          <p class="tagline">Break down, edit, and rebuild URLs without losing detail.</p>
        </hgroup>
      </header>

      <main class={'container'}>
        <Inspector />
      </main>
    </>
  )
}
