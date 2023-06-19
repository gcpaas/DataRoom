const title = '高德地图'
// 右侧配置项
const setting = [
  {
    label: '语言类型',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    // 字段
    field: 'customize_lang',
    optionField: 'customize.lang', // 对应options中的字段
    // 是否多选
    multiple: false,
    options: [
      {
        label: '中文简称',
        value: 'zh_cn'
      },
      {
        label: '英文',
        value: 'en'
      },
      {
        label: '中英文对照',
        value: 'zh_en'
      }
    ],
    // 绑定的值
    value: 'zh_cn',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: 'Key',
    // 设置组件类型， select / input / colorPicker
    type: 'input',
    // 字段
    field: 'customize_mapKey',
    // 高德地图的key
    optionField: 'customize.mapKey', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '1b0a1423b70bbcbc20c9c87327e5e94e',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '主题',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    // 字段
    field: 'customize_mapStyle',
    optionField: 'customize.mapStyle', // 对应options中的字段
    options: [
      {
        label: '标准',
        value: 'normal'
      },
      {
        label: '幻影黑',
        value: 'dark'
      },
      {
        label: '月光银',
        value: 'light'
      },
      {
        label: '远山黛',
        value: 'whitesmoke'
      },
      {
        label: '草色青',
        value: 'fresh'
      },
      {
        label: '雅士灰',
        value: 'grey'
      },
      {
        label: '涂鸦',
        value: 'graffiti'
      },
      {
        label: '马卡龙',
        value: 'macaron'
      },
      {
        label: '靛青蓝',
        value: 'blue'
      },
      {
        label: '极夜黑',
        value: 'darkblue'
      },
      {
        label: '酱籽',
        value: 'wine'
      }
    ],
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 'normal',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '内容',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    // 字段
    field: 'customize_features',
    optionField: 'customize.features', // 对应options中的字段
    options: [
      {
        label: '区域面',
        value: 'bg'
      },
      {
        label: '道路',
        value: 'road'
      },
      {
        label: '建筑物',
        value: 'building'
      },
      {
        label: '标注',
        value: 'point'
      }
    ],
    // 是否多选
    multiple: true,
    // 绑定的值
    value: ['bg', 'road', 'building', 'point'],
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '经度',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    min: 0,
    // 字段
    field: 'customize_lng',
    optionField: 'customize.lng', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 117.13872961838531,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '维度',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 范围
    min: 0,
    // 字段
    field: 'customize_lat',
    optionField: 'customize.lat', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 31.826653302438004,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '缩放',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 范围
    min: 3,
    max: 18,
    // 字段
    field: 'customize_zoom',
    optionField: 'customize.zoom', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 16,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '模式',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    options: [
      {
        label: '2D',
        value: '2D'
      },
      {
        label: '3D',
        value: '3D'
      }
    ],
    // 字段
    field: 'customize_viewMode',
    optionField: 'customize.viewMode', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '2D',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '标记内容',
    // 设置组件类型， select / input / colorPicker
    type: 'input',
    // 字段
    field: 'customize_markerSpan',
    optionField: 'customize.markerSpan', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '科大国创软件股份有限公司',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '标记点经度',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    min: 0,
    // 字段
    field: 'customize_markerLng',
    optionField: 'customize.markerLng', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 117.13872961838531,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '标记点维度',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_markerLat',
    optionField: 'customize.markerLat', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 31.826653302438004,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  }
]

// 模拟数据

const option = {
  // 自定义组件其他属性
  customize: {
    lang: 'zh_cn',
    mapKey: '1b0a1423b70bbcbc20c9c87327e5e94e',
    mapStyle: 'normal',
    features: ['bg', 'road', 'building', 'point'],
    lng: 117.13872961838531,
    lat: 31.826653302438004,
    zoom: 17,
    markerSpan: '科大国创软件股份有限公司',
    markerLng: 117.13872961838531,
    markerLat: 31.826653302438004
  }
}

export default {
  title,
  setting,
  option: {
    ...option,
    displayOption: {
      dataAllocation: {
        enable: false
      }
    }
  }
}
