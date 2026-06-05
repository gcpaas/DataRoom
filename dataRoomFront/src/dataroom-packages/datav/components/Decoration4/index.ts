import type { App, Plugin } from 'vue'
import Decoration4 from './src/index.vue'

export const Decoration4Plugin: Plugin = {
  install(app: App) {
    app.component('DvDecoration4', Decoration4)
  },
}

export {
  Decoration4,
}
