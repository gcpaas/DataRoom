import type { App, Plugin } from 'vue'
import BorderBox5 from './src/BorderBox5'

export const BorderBox5Plugin: Plugin = {
  install(app: App) {
    app.component('DvBorderBox5', BorderBox5)
  },
}

export {
  BorderBox5,
}
