import type { App, Plugin } from 'vue'
import Decoration1 from './src/index.vue'

export const Decoration1Plugin: Plugin = {
  install(app: App) {
    app.component('DvDecoration1', Decoration1)
  },
}

export {
  Decoration1,
}
