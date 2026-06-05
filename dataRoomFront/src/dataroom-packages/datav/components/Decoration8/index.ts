import type { App, Plugin } from 'vue'
import Decoration8 from './src/index.vue'

export const Decoration8Plugin: Plugin = {
  install(app: App) {
    app.component('DvDecoration8', Decoration8)
  },
}

export {
  Decoration8,
}
