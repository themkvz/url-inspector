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
        <h1>URL Inspector</h1>
      </header>

      <main class={'container'}>
        <Inspector />
      </main>
    </>
  )
}
