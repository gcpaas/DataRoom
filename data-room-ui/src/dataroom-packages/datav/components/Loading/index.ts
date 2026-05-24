import type { App, Plugin } from 'vue'
import Loading from './src/index.vue'

export const LoadingPlugin: Plugin = {
  install(app: App) {
    app.component('DvLoading', Loading)
  },
}

export {
  Loading,
}
