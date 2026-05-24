import type { App, Plugin } from 'vue'
import CapsuleChart from './src/index.vue'

export const CapsuleChartPlugin: Plugin = {
  install(app: App) {
    app.component('DvCapsuleChart', CapsuleChart)
  },
}

export {
  CapsuleChart,
}
