import { useEffect } from 'preact/hooks'
import { Inspector } from '@/inspector/inspector'
import { inputEl } from '@/inspector/store'
import { Shell } from '@/shell'

export function App() {
  useEffect(() => {
    inputEl.current?.focus()
  }, [])

  return (
    <Shell current="home">
      <Inspector />
    </Shell>
  )
}
