import type { App, Plugin } from 'vue'
import FlylineChart from './src/index.vue'

export const FlylineChartPlugin: Plugin = {
  install(app: App) {
    app.component('DvFlylineChart', FlylineChart)
  },
}

export {
  FlylineChart,
}
