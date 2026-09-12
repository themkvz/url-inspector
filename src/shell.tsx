import type { ComponentChildren } from 'preact'

type ShellProps = {
  current: 'home' | 'faq'
  children: ComponentChildren
}

// The shared header, main landmark, and footer nav rendered on every top-level page, so each
// page keeps exactly one h1 and the same navigation. See openspec/specs/app-shell/spec.md.
export function Shell({ current, children }: ShellProps) {
  return (
    <>
      <header class={'container'}>
        <hgroup>
          <h1>URL Inspector</h1>
          <p class="tagline">Break down, edit, and rebuild URLs without losing detail.</p>
        </hgroup>
      </header>

      <main class={'container'}>{children}</main>

      <footer class={'container'}>
        <nav aria-label="Site">
          <ul>
            <li>
              <a href="/" aria-current={current === 'home' ? 'page' : undefined}>
                Inspector
              </a>
            </li>
            <li>
              <a href="/faq" aria-current={current === 'faq' ? 'page' : undefined}>
                FAQ
              </a>
            </li>
          </ul>
        </nav>
      </footer>
    </>
  )
}
