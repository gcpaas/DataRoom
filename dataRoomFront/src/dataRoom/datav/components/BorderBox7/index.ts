import type { App, Plugin } from 'vue'
import BorderBox7 from './src/BorderBox7'

export const BorderBox7Plugin: Plugin = {
  install(app: App) {
    app.component('DvBorderBox7', BorderBox7)
  },
}

export {
  BorderBox7,
}
