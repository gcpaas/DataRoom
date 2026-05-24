import type { App, Plugin } from 'vue'
import FlylineChartEnhanced from './src/index.vue'

export const FlylineChartEnhancedPlugin: Plugin = {
  install(app: App) {
    app.component('DvFlylineChartEnhanced', FlylineChartEnhanced)
  },
}

export {
  FlylineChartEnhanced,
}
