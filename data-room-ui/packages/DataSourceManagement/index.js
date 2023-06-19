import DataSource from './src/index.vue'

DataSource.install = function (Vue) {
  Vue.component(DataSource.name, DataSource)
}

export default DataSource
