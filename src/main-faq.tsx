import '@picocss/pico/css/pico.blue.min.css'
import '@/styles/app.css'
import { hydrate } from 'preact'
import { Faq } from '@/faq'

// biome-ignore lint/style/noNonNullAssertion: faq.html always has #app
hydrate(<Faq />, document.getElementById('app')!)
