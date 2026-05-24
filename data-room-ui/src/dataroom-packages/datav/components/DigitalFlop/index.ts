import type { App, Plugin } from 'vue'
import DigitalFlop from './src/index.vue'

export const DigitalFlopPlugin: Plugin = {
  install(app: App) {
    app.component('DvDigitalFlop', DigitalFlop)
  },
}

export {
  DigitalFlop,
}
