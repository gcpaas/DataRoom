import 'babel-polyfill'
import promise from 'es6-promise'

import Vue from 'vue'
import ElementUI from 'element-ui'

import App from './App'
import store from './store'
import router from './router'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/styles/index.scss'
import * as $dataRoomAxios from 'data-room-ui/js/utils/http.js'
import { registerConfig } from '@gcpaas/data-room-ui'
import remoteComponents from '@/remoteComponents/exports.js'
import customDatasetComponents from '@/customDatasetComponents/exports.js'
import { Column } from '@antv/g2plot';
// import customPlots from '@/customPlots/exports'
Vue.use(ElementUI, { size: 'mini' })
Vue.prototype.Column = Column
registerConfig(
  {
    routers: {
      // 大屏设计路由
      designUrl: '/bigscreen/design',
      // 预览路由
      previewUrl: '/bigscreen/preview',
      // 页面管理路由（带头部跳转路由）
      pageManagementUrl: '/',
      // 页面列表路由
      pageListUrl: '/big-screen-list',
      // 模版列表
      templateListUrl: '/big-screen-template',
      // 数据源管理
      dataSourceUrl: '/big-screen-dataSource',
      // 数据集管理
      dataSetUrl: '/big-screen-dataSet',
      // 资源管理
      sourceUrl: '/big-screen-source',
      // 组件库
      componentUrl: '/big-screen-components'
    },
    httpConfigs: {
      baseURL: window.CONFIG?.baseUrl,
      // 现在文件路径保存的是相对路径，所以需要加上前缀,这个值一般和后端的gc.starter.file.urlPrefix一致
      fileUrlPrefix: window.CONFIG.fileUrlPrefix ? window.CONFIG.fileUrlPrefix : window.CONFIG?.baseUrl + '/static',
    },
    customTheme: {
      '--bs-background-1': '#151a26', // 整体背景色
      '--bs-background-2': '#232832', // 布局背景色
      '--bs-el-background-1': '#151A26', // 组件背景色，输入框...
      '--bs-el-background-2': '#35393F', // 组件背景色，按钮、分页、加载...
      '--bs-el-background-3': '#303640', // 组件背景色，表格头部、下拉框hover...
      '--bs-el-title': '#ffffff', // 标题字体颜色
      '--bs-el-text': '#ffffff', // 一般字体颜色
      '--bs-el-color-primary': '#409EFF', // 样式主题色
      '--bs-el-color-primary-active': '64, 158, 255', // 主要激活 => rgba(64, 158, 255, 1) = #409EFF
      '--bs-el-border': 'transparent' // 边框颜色
    },
    // 允许上传的资源库文件类型
    sourceExtends: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'xls', 'xlsx', 'csv'],
    // datasetAuth: ['unAdd', 'unEdit', 'unDelete'], // 数据集按钮权限 新增 编辑 删除
    // datasetTypeList: ['original', 'custom', 'http'],
    // sourceTypeList: [
    //   { label: 'Mysql', code: 'mysql', name: 'com.mysql.jdbc.Driver', url: 'jdbc:mysql://localhost:3306/db_name?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf-8&useSSL=false&useOldAliasMetadataBehavior=true' },
    //   { label: 'ClickHouse', code: 'clickhouse', name: 'ru.yandex.clickhouse.ClickHouseDriver', url: 'jdbc:clickhouse://localhost:8123/db_name' },
    //   { label: 'test', code: 'test', name: 'test', url: 'test' }
    // ],
    // customPlots: [],
    // 远程组件列表
    remoteComponents,
    customDatasetComponents
  },
  router
)

promise.polyfill()
// 自定义指令
Vue.use(ElementUI, { size: 'mini' })
Vue.config.productionTip = false
Vue.prototype.$dataRoomAxios = $dataRoomAxios
// 兼容ie下双向绑定事件
Vue.prototype.inputChange = function (e) {
  return e.target.value
}
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App)
})
