import Vue from 'vue'
import Vuex from 'vuex'
import bigScreen from 'data-room-ui/js/store/index.js'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    bigScreen
  }
})

export default store
