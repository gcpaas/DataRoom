import type { App, Plugin } from 'vue'
import Decoration7 from './src/index.vue'

export const Decoration7Plugin: Plugin = {
  install(app: App) {
    app.component('DvDecoration7', Decoration7)
  },
}

export {
  Decoration7,
}
