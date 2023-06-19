import { commonConfig, displayOption } from 'packages/js/config'
import Icon from 'packages/assets/images/bigScreenIcon/export'
import _ from 'lodash'

export const settingConfig = {
  padding: [30, 30, 50, 80],
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
    },
    mapField: {
      enable: true
    },
    metricField: {
      // 指标
      label: '维度',
      enable: false,
      multiple: false // 是否多选
    },
    dimensionField: {
      // 表格列
      label: '展示字段', // 维度/查询字段
      enable: false,
      multiple: false // 是否多选
    }
  }
}
const customConfig = {
  type: 'map',
  root: {
    contribution: false
  },
  customize: {
    // 是否显示文字
    mapName: true,
    // 地图背景色
    backgroundColor: '#404a59',
    // 是否打点
    scatter: true,
    // 悬浮框背景色
    tooltipBackgroundColor: '#0C121C',
    // 悬浮框边框色
    borderColor: 'rgba(0, 0, 0, 0.16)',
    // 打点图背景颜色
    scatterBackgroundColor: 'rgba(255,0,0,.7)',
    // 打点图文字颜色
    scatterColor: '#fff',
    // 分割线颜色
    mapLineColor: 'rgba(147, 235, 248, 1)',
    // 地图级别
    level: 'country',
    // 范围
    scope: '中国',
    // 地图区域颜色
    areaColor: '#007aff',
    // 是否开启筛选
    visual: false,
    // 筛选范围
    range: [0, 6000],
    // 从上到下的颜色
    rangeColor: ['#007aff', '#A5CC82'],
    // 地图数据
    dataMap: '中华人民共和国.json',
    // 展示字段
    value: '',
    // 横坐标
    xaxis: '',
    // 纵坐标
    yaxis: '',
    // 名称
    name: ''

  }
}

export const dataConfig = {
  ...commonConfig(customConfig)
}

export const mapData = {
  name: '地图',
  title: '地图',
  icon: Icon.getNameList()[5],
  className:
    'com.gccloud.bigscreen.core.module.chart.components.ScreenMapChart',
  w: 800,
  h: 700,
  x: 0,
  y: 0,
  type: 'map',
  option: {
    ..._.cloneDeep(settingConfig)
  },
  setting: undefined, // 右侧面板自定义配置
  dataHandler: {}, // 数据自定义处理js脚本
  ..._.cloneDeep(dataConfig)
}
