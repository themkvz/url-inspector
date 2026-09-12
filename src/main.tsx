import '@picocss/pico/css/pico.blue.min.css'
import '@/styles/app.css'
import { hydrate } from 'preact'
import { App } from '@/app'

// biome-ignore lint/style/noNonNullAssertion: index.html always has #app
hydrate(<App />, document.getElementById('app')!)
