import type { App, Plugin } from 'vue'
import Decoration10 from './src/index.vue'

export const Decoration10Plugin: Plugin = {
  install(app: App) {
    app.component('DvDecoration10', Decoration10)
  },
}

export {
  Decoration10,
}
