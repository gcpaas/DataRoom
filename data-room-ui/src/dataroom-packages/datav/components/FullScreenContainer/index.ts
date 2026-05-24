import type { App, Plugin } from 'vue'
import FullScreenContainer from './src/index.vue'

export const FullScreenContainerPlugin: Plugin = {
  install(app: App) {
    app.component('DvFullScreenContainer', FullScreenContainer)
  },
}

export {
  FullScreenContainer,
}
