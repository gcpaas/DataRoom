import type { App, Plugin } from 'vue'
import ScrollBoard from './src/index.vue'

export const ScrollBoardPlugin: Plugin = {
  install(app: App) {
    app.component('DvScrollBoard', ScrollBoard)
  },
}

export {
  ScrollBoard,
}
