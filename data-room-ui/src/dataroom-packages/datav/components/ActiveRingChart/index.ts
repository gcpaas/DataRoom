import type { App, Plugin } from 'vue'
import ActiveRingChart from './src/index.vue'

export const ActiveRingChartPlugin: Plugin = {
  install(app: App) {
    app.component('DvActiveRingChart', ActiveRingChart)
  },
}

export {
  ActiveRingChart,
}
