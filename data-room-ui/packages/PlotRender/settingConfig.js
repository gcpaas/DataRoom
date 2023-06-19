import { commonConfig, displayOption } from 'packages/js/config'
export const settingConfig = {
  displayOption: { ...displayOption }
}
const customConfig = {
  root: {
    contribution: false
  },
  customize: {
    theme: 'dark', // 'light'、'dark'
    colorScheme: [],
    legend: null,
    legendColor: '', // 图例颜色
    xaxisColor: '', // x轴标签颜色
    xaxisFontSize: 14, // x轴标签字体大小
    yaxisColor: '', // y轴标签颜色
    yaxisFontSize: 14, // y轴标签字体大小
    labelColor: ''// 标签颜色
  }
}
export const dataConfig = {
  ...commonConfig(customConfig)
}
