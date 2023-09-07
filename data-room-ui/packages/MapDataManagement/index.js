import MapDataManagement from './src/index.vue'

MapDataManagement.install = function (Vue) {
  Vue.component(MapDataManagement.name, MapDataManagement)
}

export default MapDataManagement
