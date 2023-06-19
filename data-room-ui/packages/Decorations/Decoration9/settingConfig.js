import { commonConfig } from '../../js/config'

export const settingConfig = {
  padding: [30, 30, 30, 60],
  legend: false,
  isGroup: true,
  data: [],
  // 设置面板属性的显隐
  displayOption: {
    dataAllocation: {
      // 是否存在数据配置
      enable: false
    }
  }
}
const customConfig = {
  type: 'decoration9',
  root: {
    contribution: false
  },
  customize: {
    decorationColor1: null,
    decorationColor2: null,
    reverse: false,
    dur: 3,
    scanDur: 3,
    haloDur: 2
    // title:'66%',
    // fontSize: 20,
    // fontWeight: 700,
    // color: '#36474f'
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
