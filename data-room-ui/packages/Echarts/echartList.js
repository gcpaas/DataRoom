import { dataConfig, settingConfig } from '../EchartsRender/settingConfig'
import cloneDeep from 'lodash/cloneDeep'
import sortList from './echartListSort'
// 遍历 当前文件夹下的所有文件，找到中文.js文件，然后导出
const files = require.context('./', true, /[\u4e00-\u9fa5]+.js$/)
const echartsList = getEchartsList(files)
// 获取echarts配置
function getEchartsList (files) {
  const configMapList = {}
  files.keys().forEach((key) => {
    // 取到 "基础折线图"
    const configName = key.split('/')[2].replace('.js', '')
    configMapList[configName] = files(key).default
  })
  const echartsList = []
  for (const configMapKey in configMapList) {
    const index = sortList.findIndex((item) => item === configMapKey)
    const config = configMapList[configMapKey]

    echartsList[index] = {
      version: config.version,
      category: configMapKey,
      name: config.name,
      title: config.title,
      border: { type: '', titleHeight: 60, fontSize: 30, color: ['#5B8FF9', '#61DDAA', '#5D7092', '#F6BD16', '#6F5EF9'], padding: [16, 16, 16, 16] },
      icon: null,
      img: require(`../Echarts/images/${config.title}.png`),
      className:
        'com.gccloud.dataroom.core.module.chart.components.CustomComponentChart',
      w: config?.option?.width || 450,
      h: config?.option?.height || 320,
      x: 0,
      y: 0,
      rotateX: config.rotateX || 0,
      rotateY: config.rotateY || 0,
      rotateZ: config.rotateZ || 0,
      perspective: config.perspective || 0,
      skewX: config.skewX || 0,
      skewY: config.skewY || 0,
      type: 'echartsComponent',
      loading: false,
      // 把默认右侧配置与自定义右侧配置集合
      option: {
        ...config.option,
        ...cloneDeep(settingConfig)
      },
      setting: config.setting, // 右侧面板自定义配置
      dataHandler: config.dataHandler, // 数据自定义处理js脚本
      optionHandler: config.optionHandler, // 配置自定义处理js脚本
      ...cloneDeep(dataConfig)
    }
  }
  return echartsList
}
export default echartsList
