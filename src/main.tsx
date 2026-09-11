import '@picocss/pico/css/pico.classless.blue.min.css'
import { render } from 'preact'
import { App } from '@/app'

// biome-ignore lint/style/noNonNullAssertion: index.html always has #app
render(<App />, document.getElementById('app')!)
