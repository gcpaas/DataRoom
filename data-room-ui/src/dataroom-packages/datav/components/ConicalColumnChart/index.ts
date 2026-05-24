import type { App, Plugin } from 'vue'
import ConicalColumnChart from './src/index.vue'

export const ConicalColumnChartPlugin: Plugin = {
  install(app: App) {
    app.component('DvConicalColumnChart', ConicalColumnChart)
  },
}

export {
  ConicalColumnChart,
}
