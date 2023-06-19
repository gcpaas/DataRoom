import _ from 'lodash'
import getComponentConfig from 'packages/js/utils/getDecorationComponentsConfig'
// 批量引入配置文件
import { setModules, dataModules } from 'packages/js/utils/configImport'
const typeLIst = ['decoration1', 'decoration3', 'decoration2', 'decoration2Reverse', 'decoration4', 'decoration4Reverse', 'decoration5', 'decoration6', 'decoration8', 'decoration8Reverse', 'decoration9', 'decoration10', 'decoration11']
let basicConfigList = []
basicConfigList = typeLIst.map(type => {
  // 装饰组件的className保持一致
  return getComponentConfig(type, 'ScreenDecoration')
})
basicConfigList = basicConfigList.map(item => {
  return basicComponentsConfig(item)
})
// 生成基本配置
export function basicComponentsConfig (item) {
  // let type = `lcdp${_.upperFirst(item.type)}`
  return {
    ...item,
    option: _.cloneDeep(setModules[item.type]),
    ..._.cloneDeep(dataModules[item.type])
  }
}
export default basicConfigList
