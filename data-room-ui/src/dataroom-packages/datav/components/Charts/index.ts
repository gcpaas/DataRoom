import type { App, Plugin } from 'vue'
import Charts from './src/index.vue'

export const ChartsPlugin: Plugin = {
  install(app: App) {
    app.component('DvCharts', Charts)
  },
}

export {
  Charts,
}
