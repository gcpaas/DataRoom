import type { App, Plugin } from 'vue'
import BorderBox6 from './src/BorderBox6'

export const BorderBox6Plugin: Plugin = {
  install(app: App) {
    app.component('DvBorderBox6', BorderBox6)
  },
}

export {
  BorderBox6,
}
