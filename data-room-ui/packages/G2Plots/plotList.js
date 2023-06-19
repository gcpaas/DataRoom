/*
 * @description: webpack读取当前文件夹下的所有 图表的js文件配置, 生成g2Plot配置列表
 * @Date: 2023-03-28 10:40:22
 * @Author: xing.heng
 */
import { dataConfig, settingConfig } from '../PlotRender/settingConfig'
import { mapData } from 'packages/BasicComponents/Map/settingConfig'
import _ from 'lodash'
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
      category: configMapKey,
      name: config.name,
      title: config.title,
      icon: null,
      img: require(`packages/G2Plots/images/componentLogo/${config.title}.png`),
      className:
        'com.gccloud.bigscreen.core.module.chart.components.CustomComponentChart',
      w: config?.option?.width || 450,
      h: config?.option?.height || 320,
      x: 0,
      y: 0,
      type: 'customComponent',
      chartType: config.chartType,
      option: {
        ...config.option,
        ..._.cloneDeep(settingConfig)
      },
      setting: config.setting, // 右侧面板自定义配置
      dataHandler: config.dataHandler, // 数据自定义处理js脚本
      optionHandler: config.optionHandler, // 配置自定义处理js脚本
      ..._.cloneDeep(dataConfig)
    }
  }
  return plotList
}
export function getCustomPlots () {
  const customList = window.BS_CONFIG?.customPlots || []

  const list = []
  customList.forEach((config) => {
    list.push({
      category: config.category,
      name: config.name,
      title: config.title,
      icon: null,
      img: config.img,
      className:
        'com.gccloud.bigscreen.core.module.chart.components.CustomComponentChart',
      w: 450,
      h: 320,
      x: 0,
      y: 0,
      type: 'customComponent',
      chartType: config.chartType,
      option: {
        ...config.option,
        ..._.cloneDeep(settingConfig)
      },
      setting: config.setting, // 右侧面板自定义配置
      dataHandler: config.dataHandler, // 数据自定义处理js脚本
      optionHandler: config.optionHandler, // 配置自定义处理js脚本
      ..._.cloneDeep(dataConfig)
    })
  })
  return list
}

const plots = [...plotList, ...customPlots, mapData]
export default plots
