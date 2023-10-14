import fontList from 'data-room-ui/js/utils/fontList'
// 配置版本号
const version = '2023101401'
// 分类
const category = 'Gauge'
// 标题
const title = '仪表盘'
// 类别， new Gauge()
const chartType = 'Gauge'
// 用于标识，唯一，和文件夹名称一致
const name = 'YiBiaoPan'

// 右侧配置项
const setting = [
  {
    label: '指标',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'percent',
    // 对应options中的字段
    optionField: 'percent',
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  /** 样式配置 **/
  // 图表 graph
  {
    label: '表盘类型',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'type',
    // 对应options中的字段
    optionField: 'type',
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'custom',
    options: [
      {
        label: '默认',
        value: ''
      },
      {
        label: '米轨',
        value: 'meter'
      }
    ],
    groupName: 'graph'
  },
  {
    label: '表盘颜色',
    // 设置组件类型
    type: 'gradual',
    // 字段
    field: 'range_color',
    // 对应options中的字段
    optionField: 'range.color',
    value: 'l(0) 0:#6b74e4 1:#4391f4',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '指标颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'statistic_title_style_color',
    // 对应options中的字段
    optionField: 'statistic.title.style.color',
    value: '#d0d0d0',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '指标大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_title_style_fontSize',
    // 对应options中的字段
    optionField: 'statistic.title.style.fontSize',
    value: 20,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '指标字体类型',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'statistic_title_style_fontFamily',
    // 对应options中的字段
    optionField: 'statistic.title.style.fontFamily',
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'custom',
    options: fontList,
    groupName: 'graph'
  },
  {
    label: '标签内容',
    // 设置组件类型
    type: 'input',
    // 字段
    field: 'statistic_content_content',
    // 对应options中的字段
    optionField: 'statistic.content.content',
    value: '占比',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'statistic_content_style_color',
    // 对应options中的字段
    optionField: 'statistic.content.style.color',
    value: '#d0d0d0',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_content_style_fontSize',
    // 对应options中的字段
    optionField: 'statistic.content.style.fontSize',
    value: 20,
    tabName: 'custom',
    groupName: 'graph'
  },
  // 图例 legend
  // 边距 padding
]
const data = [
  {
    percent: 0.75
  }
]
// 数据处理脚本
const dataHandler = '// 取返回数据列表的第一项指标值\noption.percent = data[0][setting.filter(settingItem=>settingItem.field === \'percent\')[0].value]'

// 图表配置 new Gauge('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'percent',
  data,
  percent: 0.75,
  range: {
    color: 'l(0) 0:#6b74e4 1:#4391f4'
  },
  indicator: {
    pointer: {
      style: {
        stroke: '#D0D0D0'
      }
    },
    pin: {
      style: {
        stroke: '#D0D0D0'
      }
    }
  },
  axis: {
    label: {
      formatter (v) {
        return Number(v) * 100
      }
    },
    subTickLine: {
      count: 3
    }
  },
  // shapeStyle: {
  //   fill: 'rgba(208,208,208,0)'
  // },
  statistic: {
    title: {
      offsetY: -20,
      style: {
        fontSize: 20,
        lineHeight: 2,
        fontFamily: '',
        color: '#d0d0d0'
      },
      formatter: ({ percent }) => `${(percent * 100).toFixed(0)}%`
    },
    content: {
      content: '占比',
      style: {
        fontSize: 20,
        lineHeight: 2,
        color: '#d0d0d0'
      }
    }
  }
}
export default {
  category,
  version,
  title,
  chartType,
  name,
  option,
  setting,
  dataHandler
}
