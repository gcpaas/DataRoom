import type { App, Plugin } from 'vue'
import BorderBox3 from './src/BorderBox3'

export const BorderBox3Plugin: Plugin = {
  install(app: App) {
    app.component('DvBorderBox3', BorderBox3)
  },
}

export {
  BorderBox3,
}
