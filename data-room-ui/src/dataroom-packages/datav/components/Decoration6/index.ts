import type { App, Plugin } from 'vue'
import Decoration6 from './src/index.vue'

export const Decoration6Plugin: Plugin = {
  install(app: App) {
    app.component('DvDecoration6', Decoration6)
  },
}

export {
  Decoration6,
}
