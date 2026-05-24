import type { App, Plugin } from 'vue'
import PercentPond from './src/index.vue'

export const PercentPondPlugin: Plugin = {
  install(app: App) {
    app.component('DvPercentPond', PercentPond)
  },
}

export {
  PercentPond,
}
