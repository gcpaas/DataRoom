import type { App, Plugin } from 'vue'
import BorderBox4 from './src/BorderBox4'

export const BorderBox4Plugin: Plugin = {
  install(app: App) {
    app.component('DvBorderBox4', BorderBox4)
  },
}

export {
  BorderBox4,
}
