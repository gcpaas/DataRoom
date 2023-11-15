import { commonConfig, displayOption } from 'data-room-ui/js/config'
// import Icon from 'data-room-ui/assets/images/bigScreenIcon/export'
import cloneDeep from 'lodash/cloneDeep'
import Icon from 'data-room-ui/assets/images/bigScreenIcon/export'
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
      enable: false
    },
    flyMapField: {
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
  type: 'flyMap',
  root: {
    version: '2023071001',
    contribution: false,
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
    // 地图id
    mapId: '',
    // 是否显示文字
    mapName: false,
    // 文字颜色
    mapNameColor: '#fff',
    // 字体大小
    mapNameSize: 12,
    // 文字权重
    mapNameWeight: 500,
    // 悬浮框背景色
    tooltipBackgroundColor: '#0C121C',
    // 悬浮框边框色
    borderColor: 'rgba(0, 0, 0, 0.16)',
    // 悬浮框字体颜色
    fontColor:'#DADADA',
    // 打点图背景颜色
    scatterBackgroundColor: 'rgba(255,0,0,.7)',
    // 打点图文字颜色
    scatterColor: 'rgba(165, 108, 91, 1)',
    // 打点图中心点文字颜色
    scatterCenterColor:'rgba(205, 196, 110, 1)',
    // 分割线颜色
    mapLineColor: 'rgba(53, 86, 165, 1)',
    // 水印字体颜色
    fontGraphicColor: '#fff',
    fontSize:'30',
    // 是否开启下钻
    down: false,
    // 允许下钻的层级
    downLevel: 1,
    // 轨迹图像
    symbol: 'arrow',
    // 轨迹颜色
    symbolColor: '#01AAED',
    // 轨迹大小
    symbolSize:8,
    // 地图级别
    level: 1,
    // 范围
    scope: '中国',
    // 地图区域颜色
    areaColor: 'rgba(31, 50, 121, 1)',
    // 是否开启筛选
    visual: true,
    graphic:['中华人民共和国'],
    // 筛选范围
    range: [0, 100],
    scatterFormatter:'`<p style="text-align:center;font-size: 14px">${params.name}</p>`',
    // 格式化脚本
    lineFormatter:'`<p style="font-size: 16px">销售额</p><div>${params.data.msg.from}-->${params.data.msg.to} ${params.data.msg.value} </div>`',
    // 从上到下的颜色
    rangeColor: ['rgba(165, 108, 91, 1)', 'rgba(205, 196, 110, 1)'],
    // 地图数据
    dataMap: '中华人民共和国.json',
    // 展示字段
    value: '',
    // 横坐标
    xaxis: '',
    // 纵坐标
    yaxis: '',
    // 名称
    name: '',
    // 数据字段配置
    dataField: {
      // 起点名称
      fromName: '',
      // 起点经度
      fromLng: '',
      // 起点纬度
      fromLat: '',
      // 终点名称
      toName: '',
      // 终点经度
      toLng: '',
      // 终点纬度
      toLat: '',
      // 轨迹数据
      value: '',
    }
  }
}

export const dataConfig = {
  ...commonConfig(customConfig)
}

export const FlyMapData = {
  name: '飞线图',
  title: '飞线图',
  icon: Icon.getNameList()[18],
  border:{type:'',titleHeight:60,fontSize:16,isTitle:true,padding:[0,0,0,0]},
  className:
    'com.gccloud.dataroom.core.module.chart.components.ScreenFlyMapChart',
  w: 800,
  h: 700,
  x: 0,
  y: 0,
  type: 'flyMap',
  option: {
    ...cloneDeep(settingConfig)
  },
  setting: undefined, // 右侧面板自定义配置
  dataHandler: {}, // 数据自定义处理js脚本
  ...cloneDeep(dataConfig)
}
