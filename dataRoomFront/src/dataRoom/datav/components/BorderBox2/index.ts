import type { App, Plugin } from 'vue'
import BorderBox2 from './src/BorderBox2'

export const BorderBox2Plugin: Plugin = {
  install(app: App) {
    app.component('DvBorderBox2', BorderBox2)
  },
}

export {
  BorderBox2,
}
