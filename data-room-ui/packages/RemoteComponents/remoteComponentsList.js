// 得到用户自定义的远程组件列表
import { dataConfig, settingConfig } from './settingConfig'
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'

const files = require.context('./innerComponents/', true, /index.vue$/)
const innerRemoteComponents = []

files.keys().forEach(key => {
  const title = key.split('/')[1].replace('.vue', '')
  let img = null
  let config = {}
  try {
    img = require(`./innerComponents/${title}/component.png`)
  } catch (error) {
    console.log(error)
  }
  try {
    config = require(`./innerComponents/${title}/config.js`).default
  } catch (error) {

  }
  innerRemoteComponents.push({
    title: config.title || title,
    vueSysComponentDirName: 'inner_' + title,
    vueFile: files(key).default,
    ...config,
    img
  })
})
// 抛出内置系统组件
export default getRemoteComponents(innerRemoteComponents)

// 抛出外部的用户系统组件
export function getRemoteComponents (comList) {
  const customList = (comList || window.BS_CONFIG?.remoteComponents) || []

  const list = []
  customList.forEach((config) => {
    list.push({
      name: config.name,
      title: config.title,
      icon: null,
      img: config.img,
      border: { type: '', titleHeight: 60, fontSize: 16, isTitle: true, padding: [16, 16, 16, 16] },
      className:
        'com.gccloud.dataroom.core.module.chart.components.RemoteComponentChart',
      w: 450,
      h: 320,
      x: 0,
      y: 0,
      rotateX: config.rotateX || 0,
      rotateY: config.rotateY || 0,
      rotateZ: config.rotateZ || 0,
      perspective: config.perspective || 500,
      skewX: config.skewX || 0,
      skewY: config.skewY || 0,
      type: 'remoteComponent',
      option: {
        ...cloneDeep(settingConfig),
        ...config.option
      },
      // 右侧面板自定义配置
      setting: config.setting,
      ...cloneDeep(dataConfig),
      // 自定义配置
      customize: {
        ...config.customize,
        vueSysComponentDirName: config.vueSysComponentDirName,
        vueFile: config.vueFile
      }
    })
  })
  return list
}

export function getRemoteComponentConfig (code, name) {
  const config = {
    name,
    title: name,
    icon: null,
    img: null,
    border: { type: '', titleHeight: 60, fontSize: 16, isTitle: true, padding: [16, 16, 16, 16] },
    className:
      'com.gccloud.dataroom.core.module.chart.components.RemoteComponentChart',
    w: 450,
    h: 320,
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    perspective: 0,
    skewX: 0,
    skewY: 0,
    type: 'remoteComponent',
    option: {
      ...cloneDeep(settingConfig)
    },
    // 右侧面板自定义配置
    setting: [],
    ...cloneDeep(dataConfig),
    // 自定义配置
    customize: {
      // 文件路径
      vueSysComponentDirName: null,
      // 用户上传的vue文件编码，根据此编码获取文件内容
      vueBizComponentCode: code,
      // vue文本内容
      vueFileContent: null
    }
  }
  return config
}
