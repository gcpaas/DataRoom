/*
 * @description: 基础的bigScreen展示组件
 * @Date: 2023-03-13 10:04:59
 * @Author: xing.heng
 * @LastEditors: wujian
 * @LastEditTime: 2023-06-01 15:55:48
 */

// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import getComponentConfig from 'data-room-ui/js/utils/getComponentConfig'
// 批量引入配置文件
import { setModules, dataModules } from 'data-room-ui/js/utils/configImport'
const typeList = [
  'texts',
  'numbers',
  'linkChart',
  'horizontalLine', // 横线
  'verticalLine', // 竖线
  'picture',
  'timeCountDown',
  'currentTime',
  'customHtml',
  'iframeChart',
  'digitalFlop',
  'tables',
  'screenScrollRanking',
  'screenScrollBoard',
  'video',
  'input',
  // 'button',
  'marquee',
  'chartTab',
  // 'themeSwitcher',
  'themeSelect',
  'select',
  'timePicker',
  'dateTimePicker',
  'indicatorCard',
  'indicatorCard2',
  'indexCard',
  'indexCard2'

]
let basicConfigList = []
basicConfigList = typeList.map((type) => {
  return getComponentConfig(type)
})
basicConfigList = basicConfigList.map((item) => {
  return basicComponentsConfig(item)
})
// 生成基本配置
export function basicComponentsConfig (item) {
  return {
    ...item,
    border: { type: '', titleHeight: 60, fontSize: 30, isTitle: true, padding: [0, 0, 0, 0] },
    option: cloneDeep(setModules[item.type]),
    ...cloneDeep(dataModules[item.type])
  }
}
export default basicConfigList
