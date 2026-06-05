import type { App, Plugin } from 'vue'
import Decoration12 from './src/index.vue'

export const Decoration12Plugin: Plugin = {
  install(app: App) {
    app.component('DvDecoration12', Decoration12)
  },
}

export {
  Decoration12,
}
