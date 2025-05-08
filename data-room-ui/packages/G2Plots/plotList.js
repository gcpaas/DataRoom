/*
 * @description: webpack读取当前文件夹下的所有 图表的js文件配置, 生成g2Plot配置列表
 * @Date: 2023-03-28 10:40:22
 * @Author: xing.heng
 */
import { dataConfig, settingConfig } from '../PlotRender/settingConfig'
import { mapData } from 'data-room-ui/BasicComponents/Map/settingConfig'
import { FlyMapData } from 'data-room-ui/BasicComponents/FlyMap/settingConfig'
import { candlestickData } from 'data-room-ui/BasicComponents/Candlestick/settingConfig'
import { sankeyData } from 'data-room-ui/BasicComponents/Sankey/settingConfig'
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import sortList from './plotListSort'
// 遍历 当前文件夹下的所有文件，找到中文.js文件，然后导出
const files = require.context('./', true, /[\u4e00-\u9fa5]+.js$/)
const plotList = getPlotList(files)
const customPlots = getCustomPlots()
// 获取plot配置
function getPlotList (files) {
  const configMapList = {}
  files.keys().forEach((key) => {
    // ./折线图/基础折线图.js
    // 取到 "基础折线图"
    const configName = key.split('/')[2].replace('.js', '')
    configMapList[configName] = files(key).default
  })
  const plotList = []
  for (const configMapKey in configMapList) {
    const index = sortList.findIndex((item) => item === configMapKey)
    const config = configMapList[configMapKey]

    plotList[index] = {
      version: config.version,
      category: configMapKey,
      name: config.name,
      title: config.title,
      border: { type: '', titleHeight: 60, fontSize: 16, isTitle: true, padding: [16, 16, 16, 16] },
      icon: null,
      img: require(`../G2Plots/images/componentLogo/${config.title}.png`),
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
      type: 'customComponent',
      chartType: config.chartType,
      loading: false,
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
  return plotList
}
export function getCustomPlots () {
  const customList = window.BS_CONFIG?.customPlots || []

  const list = []
  customList.forEach((config) => {
    list.push({
      version: config.version,
      category: config.category,
      name: config.name,
      title: config.title,
      border: { type: '', titleHeight: 60, fontSize: 16, isTitle: true, padding: [16, 16, 16, 16] },
      icon: null,
      img: config.img,
      className:
        'com.gccloud.dataroom.core.module.chart.components.CustomComponentChart',
      w: 450,
      h: 320,
      x: 0,
      y: 0,
      type: 'customComponent',
      chartType: config.chartType,
      option: {
        ...config.option,
        ...cloneDeep(settingConfig)
      },
      setting: config.setting, // 右侧面板自定义配置
      dataHandler: config.dataHandler, // 数据自定义处理js脚本
      optionHandler: config.optionHandler, // 配置自定义处理js脚本
      ...cloneDeep(dataConfig)
    })
  })
  return list
}

const plots = [...plotList, ...customPlots, sankeyData, candlestickData, mapData, FlyMapData]
export default plots
