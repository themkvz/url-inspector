import { Shell } from '@/shell'

// Static, not hydrated: Cloudflare Pages serves 404.html for every unknown path.
export function NotFound() {
  return (
    <Shell>
      <h2>Page not found</h2>
      <p>
        This page does not exist. <a href="/">Open the inspector</a>.
      </p>
    </Shell>
  )
}
