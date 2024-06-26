import { commonConfig, displayOption } from 'data-room-ui/js/config'
import Icon from 'data-room-ui/assets/images/bigScreenIcon/export'
import cloneDeep from 'lodash/cloneDeep'

export const settingConfig = {
  padding: [0, 30, 50, 80],
  legend: false,
  isGroup: true,
  data: [],
  color: '',
  theme: 'dark',
  displayOption: {
    ...displayOption,
    params: {
      enable: true
    },
    headerField: {
      enable: false
    }
  }
}
const customConfig = {
  type: 'candlestick',
  root: {
    version: '2023071001',
    contribution: false,
    // 绕x轴旋转角度
    rotateX: 0,
    // 绕y轴旋转角度
    rotateY: 0,
    // 绕z轴旋转角度
    rotateZ: 0,
    // 透视距离
    perspective: 0,
    skewX: 0,
    skewY: 0
  },
  customize: {
    // 自定义样式
    highColor: '#c23531',
    lowColor: '#314656',
    gridShow: true,
    gridColor: '#314656',
    gridWidth: 1,
    left: 50,
    right: 20,
    top: 20,
    bottom: 60,
    xAxis: {
      name: '',
      nameGap: 30,
      nameColor: '#fff',
      nameSize: 16,
      position: 'end',
      tickWidth: 1,
      tickColor: '#fff',
      labelColor: '#fff',
      labelSize: 12,
      lineColor: '#fff',
      lineWidth: 1
    },
    yAxis: {
      name: '',
      nameGap: 10,
      nameColor: '#fff',
      nameSize: 16,
      position: 'end',
      tickWidth: 1,
      tickColor: '#fff',
      labelColor: '#fff',
      labelSize: 12,
      lineColor: '#fff',
      lineWidth: 1
    }
  }
}

export const dataConfig = {
  ...commonConfig(customConfig)
}

export const candlestickData = {
  name: 'K线图',
  title: 'K线图',
  icon: Icon.getNameList()[34],
  border: { type: '', titleHeight: 60, fontSize: 16, isTitle: true, padding: [0, 0, 0, 0] },
  className:
    'com.gccloud.dataroom.core.module.chart.components.ScreenCandlestickChart',
  w: 450,
  h: 320,
  x: 0,
  y: 0,
  type: 'candlestick',
  option: {
    ...cloneDeep(settingConfig)
  },
  setting: undefined, // 右侧面板自定义配置
  dataHandler: {}, // 数据自定义处理js脚本
  ...cloneDeep(dataConfig),
  dataSource: {
    ...cloneDeep(dataConfig.dataSource),
    xfield: '',
    openField: '',
    closeField: '',
    lowField: '',
    highField: ''
  }
}
