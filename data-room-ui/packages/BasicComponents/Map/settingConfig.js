import { commonConfig, displayOption } from 'data-room-ui/js/config'
import Icon from 'data-room-ui/assets/images/bigScreenIcon/export'
import cloneDeep from 'lodash/cloneDeep'

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
    mapId: '667',
    // 缩放尺寸
    zoom: 1,
    center1: 50,
    center2: 50,
    // 是否显示文字
    mapName: true,
    // 文字颜色
    mapNameColor: '#fff',
    // 文字大小
    mapNameSize: 8,
    // 文字权重
    mapNameWeight: 500,
    // 地图背景色
    backgroundColor: 'rgb(0,0,0,0)',
    // 是否打点
    scatter: true,
    // 悬浮框背景色
    tooltipBackgroundColor: '#0C121C',
    // 悬浮框边框色
    borderColor: 'rgba(0, 0, 0, 0.16)',
    // 悬浮框数值标题
    tooltipTitle: 'GDP',
    // 点颜色
    scatterBackgroundColor: 'rgba(255,0,0,.7)',
    // 显示点文字
    showScatterValue: true,
    // 点文字颜色
    scatterColor: '#fff',
    // 点形状
    scatterSymbol: 'circle',
    // 点大小
    scatterSize: 40,
    // 分割线颜色
    mapLineColor: 'rgba(53, 86, 165, 1)',
    fontGraphicColor: '#fff',
    fontSize: '30',
    // 是否开启下钻
    down: true,
    // 允许下钻的层级
    downLevel: 1,
    // 地图级别
    level: '2',
    // 范围
    scope: '中国',
    // 地图区域颜色
    areaColor: 'rgba(31, 50, 121, 1)',
    // 地图区域悬浮颜色
    emphasisColor: '#389BB7',
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
  border: { type: '', titleHeight: 60, fontSize: 16, isTitle: true, padding: [0, 0, 0, 0] },
  className:
    'com.gccloud.dataroom.core.module.chart.components.ScreenMapChart',
  w: 800,
  h: 700,
  x: 0,
  y: 0,
  type: 'map',
  option: {
    ...cloneDeep(settingConfig)
  },
  setting: undefined, // 右侧面板自定义配置
  dataHandler: {}, // 数据自定义处理js脚本
  ...cloneDeep(dataConfig)
}
