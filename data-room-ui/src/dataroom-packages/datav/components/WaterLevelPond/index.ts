import type { App, Plugin } from 'vue'
import WaterLevelPond from './src/index.vue'

export const WaterLevelPondPlugin: Plugin = {
  install(app: App) {
    app.component('DvWaterLevelPond', WaterLevelPond)
  },
}

export {
  WaterLevelPond,
}
