/*
 * @description: webpack读取当前文件夹下的所有 图表的js文件配置, 生成g2Plot配置列表
 * @Date: 2023-03-28 10:40:22
 * @Author: xing.heng
 */
import { dataConfig, settingConfig } from './settingConfig'
import _ from 'lodash'
import icon from './export'
const iconList = icon.getIconList()
const svgList = getSvgList(iconList)

// 获取svg配置
function getSvgList (iconList) {
  const svgList = []
  iconList.forEach((svg, index) => {
    svgList[index] = {
      title: svg + '图标',
      name: svg,
      icon: svg,
      className: 'com.gccloud.bigscreen.core.module.chart.components.ScreenSvgsChart',
      w: 100,
      h: 100,
      x: 0,
      y: 0,
      type: 'svgs',
      chartType: 'svg',
      option: {
        ..._.cloneDeep(settingConfig)
      },
      setting: {}, // 右侧面板自定义配置
      dataHandler: {}, // 数据自定义处理js脚本
      ..._.cloneDeep(dataConfig)
    }
  })
  return svgList
}

export default svgList
