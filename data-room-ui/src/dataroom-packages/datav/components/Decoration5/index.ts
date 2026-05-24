import type { App, Plugin } from 'vue'
import Decoration5 from './src/index.vue'

export const Decoration5Plugin: Plugin = {
  install(app: App) {
    app.component('DvDecoration5', Decoration5)
  },
}

export {
  Decoration5,
}
