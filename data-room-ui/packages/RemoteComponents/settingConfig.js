import { commonConfig, displayOption } from 'packages/js/config'
export const settingConfig = {
  displayOption: { ...displayOption }
}
const customConfig = {
  root: {
    contribution: false
  },
  customize: {
    // 文件路径
    vueSysComponentDirName: null,
    // 用户上传的vue文件编码，根据此编码获取文件内容
    vueBizComponentCode: null,
    // vue文本内容
    vueFileContent: null
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
