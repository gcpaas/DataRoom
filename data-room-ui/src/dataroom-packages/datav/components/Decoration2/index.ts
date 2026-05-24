import type { App, Plugin } from 'vue'
import Decoration2 from './src/index.vue'

export const Decoration2Plugin: Plugin = {
  install(app: App) {
    app.component('DvDecoration2', Decoration2)
  },
}

export {
  Decoration2,
}
