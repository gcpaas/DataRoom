import fontList from 'data-room-ui/js/utils/fontList'
// 配置版本号
const version = '2023111401'
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
    field: 'color1',
    // 对应options中的字段
    optionField: 'color1',
    value: 'l(0) 0:#BEE8FF 1:#1DAEFF',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '表盘背景颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'color2',
    // 对应options中的字段
    optionField: 'color2',
    value: '#FFFFFF',
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
    value: '#FFFFFF',
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
    value: 40,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '指标小数位',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_fixed',
    // 对应options中的字段
    optionField: 'statisticFixed',
    value: 0,
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
    value: 'ds-digitalbold',
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
    value: '',
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
    value: '#FFFFFF',
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
  {
    label: '标签间距大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_content_offsetY',
    // 对应options中的字段
    optionField: 'statistic.content.offsetY',
    value: -45,
    min: -100,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '指标间距大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_title_offsetY',
    // 对应options中的字段
    optionField: 'statistic.title.offsetY',
    value: -10,
    min: -100,
    tabName: 'custom',
    groupName: 'graph'
  },
  // 图例 legend,
  // 内边距 appendPadding
  {
    label: '',
    type: 'appendPadding',
    field: 'appendPadding',
    optionField: 'appendPadding',
    value: [0, 0, 0, 0],
    tabName: 'custom',
    groupName: 'appendPadding'
  }
]
const data = [
  {
    percent: 0.75
  }
]
// 配置处理脚本
const optionHandler = 'option.range.color = [option.color1, option.color2]\n' +
  '  let fix = option.statisticFixed\n' +
  '  option.statistic.title.formatter = ({ percent }) => `${(percent * 100).toFixed(fix)}%`'

// 数据处理脚本
const dataHandler = '// 取返回数据列表的第一项指标值\noption.percent = data[0][setting.filter(settingItem=>settingItem.field === \'percent\')[0].value]'

// 图表配置 new Gauge('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'percent',
  // 图表内边距
  appendPadding: [0, 0, 0, 0],
  data,
  percent: 0.75,
  color1: 'l(0) 0:#BEE8FF 1:#1DAEFF',
  color2: '#FFFFFF',
  range: {
    color: ['l(0) 0:#6b74e4 1:#4391f4', '#d0d0d0']
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
  statisticFixed: 0,
  statistic: {
    title: {
      offsetY: -10,
      style: {
        fontSize: 40,
        lineHeight: 2,
        fontFamily: 'ds-digitalbold',
        color: '#FFFFFF'
      },
      formatter: ({ percent }) => `${(percent * 100).toFixed(0)}%`
    },
    content: {
      offsetY: -45,
      content: '',
      style: {
        fontSize: 20,
        lineHeight: 2,
        color: '#FFFFFF'
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
  dataHandler,
  optionHandler
}
