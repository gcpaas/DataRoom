/*
 * @description: 基础的bigScreen展示组件
 * @Date: 2023-03-13 10:04:59
 * @Author: xing.heng
 * @LastEditors: wujian
 * @LastEditTime: 2023-06-01 15:55:48
 */

import _ from 'lodash'
import getComponentConfig from 'packages/js/utils/getComponentConfig'
// 批量引入配置文件
import { setModules, dataModules } from 'packages/js/utils/configImport'
const typeList = [
  'texts',
  'linkChart',
  'horizontalLine', // 横线
  'verticalLine', // 竖线
  'picture',
  'timeCountDown',
  'currentTime',
  'iframeChart',
  'digitalFlop',
  'tables',
  'screenScrollRanking',
  'screenScrollBoard',
  'video',
  'input',
  'button'
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
    option: _.cloneDeep(setModules[item.type]),
    ..._.cloneDeep(dataModules[item.type])
  }
}
export default basicConfigList
