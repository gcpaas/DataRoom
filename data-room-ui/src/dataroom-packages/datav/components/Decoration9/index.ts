import type { App, Plugin } from 'vue'
import Decoration9 from './src/index.vue'

export const Decoration9Plugin: Plugin = {
  install(app: App) {
    app.component('DvDecoration9', Decoration9)
  },
}

export {
  Decoration9,
}
