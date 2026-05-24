import type { App, Plugin } from 'vue'
import ScrollRankingBoard from './src/index.vue'

export const ScrollRankingBoardPlugin: Plugin = {
  install(app: App) {
    app.component('DvScrollRankingBoard', ScrollRankingBoard)
  },
}

export {
  ScrollRankingBoard,
}
