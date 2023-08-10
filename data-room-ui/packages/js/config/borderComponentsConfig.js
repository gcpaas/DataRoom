// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import getComponentConfig from 'data-room-ui/js/utils/getBorderComponentsConfig'
// 批量引入配置文件
import { setModules, dataModules } from 'data-room-ui/js/utils/configImport'
const typeLIst = [
  'border1',
  'border2',
  'border3',
  'border4',
  'border5',
  'border6',
  'border7',
  'border8',
  'border9',
  'border10',
  'border11',
  'border12',
  'border13',
  'border14',
  'border15'
]
let basicConfigList = []
basicConfigList = typeLIst.map((type) => {
  // 装饰组件的className保持一致
  return getComponentConfig(type, 'ScreenBorder')
})
basicConfigList = basicConfigList.map((item) => {
  return basicComponentsConfig(item)
})
// 生成基本配置
export function basicComponentsConfig (item) {
  // let type = `${upperFirst(item.type)}`
  return {
    ...item,
    option: cloneDeep(setModules[item.type]),
    ...cloneDeep(dataModules[item.type])
  }
}
export default basicConfigList
