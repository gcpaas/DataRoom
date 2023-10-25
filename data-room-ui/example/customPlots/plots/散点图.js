
// 配置版本号
const version = '2023092201'
// 分类
const category = '散点图'
// 标题
const title = '散点图'
// 类别， new Line()
const chartType = 'Scatter'
// 用于标识，唯一，和文件夹名称一致
const name = 'SanDianTu'

// 右侧配置项
const setting = [
  {
    label: '维度',
    type: 'select', // 设置组件类型
    field: 'size', // 字段
    optionField: 'size', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  {
    label: '指标',
    type: 'select', // 设置组件类型
    field: 'sets', // 字段
    optionField: 'sets', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  {
    label: '颜色',
    type: 'select', // 设置组件类型
    field: 'colorField', // 字段
    optionField: 'colorField', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  {
    label: '颜色配置',
    // 设置组件类型
    type: 'colorSelect',
    // 字段
    field: 'color',
    // 对应options中的字段
    optionField: 'color',
    value: ['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'],
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据点形状',
    type: 'select', // 设置组件类型
    field: 'shape', // 字段
    optionField: 'shape', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: 'circle',
    tabName: 'custom',
    options: [
      {
        label: '无',
        value: false
      },
      {
        label: '空心圆',
        value: 'hollow-circle'
      },
      {
        label: '圆形',
        value: 'circle'
      },
      {
        label: '正方形',
        value: 'square'
      },
      {
        label: '菱形',
        value: 'diamond'
      },
      {
        label: '三角形',
        value: 'triangle'
      },
      {
        label: '六边形',
        value: 'hexagon'
      },
      {
        label: '菱形交叉',
        value: 'bowtie'
      },
      {
        label: '十字形',
        value: 'cross'
      },
      {
        label: 'I形',
        value: 'tick'
      },
      {
        label: '加号',
        value: 'plus'
      },
      {
        label: '连字号',
        value: 'hyphen'
      }
    ],
    groupName: 'graph'
  },
  {
    label: '透明度',
    type: 'inputNumber', // 设置组件类型
    field: 'pointStyle_fillOpacity', // 字段
    optionField: 'pointStyle.fillOpacity', // 对应options中的字段
    value: 0.8,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '图表边距',
    type: 'padding', // 设置组件类型
    field: 'appendPadding', //
    optionField: 'appendPadding', // 对应options中的字段
    value: [20, 20, 20, 20],
    tabName: 'custom',
    groupName: 'padding'
  }
]

// 模拟数据
const data = [
  {
    Title: 'Guardians of the Galaxy',
    Genre: 'Action',
    'Revenue (Millions)': 333.13,
    Rating: 8.1
  },
  {
    Title: 'Prometheus',
    Genre: 'Adventure',
    'Revenue (Millions)': 126.46,
    Rating: 7
  },
  {
    Title: 'Split',
    Genre: 'Horror',
    'Revenue (Millions)': 138.12,
    Rating: 7.3
  },
  {
    Title: 'Sing',
    Genre: 'Animation',
    'Revenue (Millions)': 270.32,
    Rating: 7.2
  },
  {
    Title: 'Suicide Squad',
    Genre: 'Action',
    'Revenue (Millions)': 325.02,
    Rating: 6.2
  },
  {
    Title: 'The Great Wall',
    Genre: 'Action',
    'Revenue (Millions)': 45.13,
    Rating: 6.1
  },
  {
    Title: 'La La Land',
    Genre: 'Comedy',
    'Revenue (Millions)': 151.06,
    Rating: 8.3
  },
  {
    Title: 'Mindhorn',
    Genre: 'Comedy',
    'Revenue (Millions)': null,
    Rating: 6.4
  },
  {
    Title: 'The Lost City of Z',
    Genre: 'Action',
    'Revenue (Millions)': 8.01,
    Rating: 7.1
  },
  {
    Title: 'Passengers',
    Genre: 'Adventure',
    'Revenue (Millions)': 100.01,
    Rating: 7
  },
  {
    Title: 'Fantastic Beasts and Where to Find Them',
    Genre: 'Adventure',
    'Revenue (Millions)': 234.02,
    Rating: 7.5
  },
  {
    Title: 'Hidden Figures',
    Genre: 'Other',
    'Revenue (Millions)': 169.27,
    Rating: 7.8
  },
  {
    Title: 'Rogue One',
    Genre: 'Action',
    'Revenue (Millions)': 532.17,
    Rating: 7.9
  },
  {
    Title: 'Moana',
    Genre: 'Animation',
    'Revenue (Millions)': 248.75,
    Rating: 7.7
  },
  {
    Title: 'Colossal',
    Genre: 'Action',
    'Revenue (Millions)': 2.87,
    Rating: 6.4
  },
  {
    Title: 'The Secret Life of Pets',
    Genre: 'Animation',
    'Revenue (Millions)': 368.31,
    Rating: 6.6
  },
  {
    Title: 'Hacksaw Ridge',
    Genre: 'Other',
    'Revenue (Millions)': 67.12,
    Rating: 8.2
  },
  {
    Title: 'Jason Bourne',
    Genre: 'Action',
    'Revenue (Millions)': 162.16,
    Rating: 6.7
  },
  {
    Title: 'Lion',
    Genre: 'Other',
    'Revenue (Millions)': 51.69,
    Rating: 8.1
  },
  {
    Title: 'Gold',
    Genre: 'Adventure',
    'Revenue (Millions)': 7.22,
    Rating: 6.7
  }
]
// 配置处理脚本
const optionHandler = ''

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Line('domName', option)
const option = {
  appendPadding: 10,
  data,
  xField: 'Revenue (Millions)',
  yField: 'Rating',
  colorField: 'Genre',
  shape: 'diamond',
  pointStyle: {
    fillOpacity: 0.8
  },
  color: ['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'],
  size: 4,
  yAxis: {
    nice: true,
    line: {
      style: {
        stroke: '#aaa'
      }
    }
  },
  xAxis: {
    min: -100,
    grid: {
      line: {
        style: {
          stroke: '#eee'
        }
      }
    },
    line: {
      style: {
        stroke: '#aaa'
      }
    }
  }
}
export default {
  version,
  category,
  title,
  chartType,
  name,
  option,
  setting,
  optionHandler,
  dataHandler
}
