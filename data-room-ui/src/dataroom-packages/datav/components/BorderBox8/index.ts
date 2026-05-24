import type { App, Plugin } from 'vue'
import BorderBox8 from './src/BorderBox8'

export const BorderBox8Plugin: Plugin = {
  install(app: App) {
    app.component('DvBorderBox8', BorderBox8)
  },
}

export {
  BorderBox8,
}
