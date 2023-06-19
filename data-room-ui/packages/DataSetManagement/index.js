import DataSetManagement from './src/index.vue'

DataSetManagement.install = function (Vue) {
  Vue.component(DataSetManagement.name, DataSetManagement)
}

export default DataSetManagement
