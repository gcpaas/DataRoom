import type { App, Plugin } from 'vue'
import Decoration11 from './src/index.vue'

export const Decoration11Plugin: Plugin = {
  install(app: App) {
    app.component('DvDecoration11', Decoration11)
  },
}

export {
  Decoration11,
}
