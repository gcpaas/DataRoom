import type { App, Plugin } from 'vue'
import Decoration3 from './src/index.vue'

export const Decoration3Plugin: Plugin = {
  install(app: App) {
    app.component('DvDecoration3', Decoration3)
  },
}

export {
  Decoration3,
}
