import { commonConfig } from '../../js/config'

export const settingConfig = {
  time: '',
  theme: 'dark',
  // 设置面板属性的显隐
  displayOption: {
    dataAllocation: {
      // 是否存在数据配置
      enable: false
    }
  }
}
const customConfig = {

  type: 'chartTab',
  root: {
    version: '2023071001'
  },
  customize: {
    tabList: [],
    fontSize: 14,
    fontWeight: 700,
    position: 'left',
    color: 'rgb(155 159 172)',
    lineColor: '#d0d2d6'
  }

}
export const dataConfig = {
  ...commonConfig(customConfig)
}
