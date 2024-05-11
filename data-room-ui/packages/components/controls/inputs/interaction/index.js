// 事件与动作定义
export default [
  // 事件列表
  {
    name: '点击文本',
    code: 'click', // click等
    desc: '点击文本',
    event: true,
    paramsList: [
      {
        name: 'date',
        desc: '日期',
        type: 'string',
        required: 'false',
        defaultValue: '2020-01-01',
        explain: '文本内容'
      }
    ],
    paramsExample: {
      date: '2020-01-01'
    }
  },
  // 动作列表
  {
    name: '重新获取数据',
    code: 'updateChartData', // 与组件的内部的方法名保持一致
    desc: '重新获取数据',
    event: false,
    paramsList: [
      {
        name: 'date',
        desc: '日期',
        type: 'string',
        required: 'false',
        defaultValue: '2020-01-01',
        explain: 'x轴字段'
      }
    ],
    paramsExample: {
      date: '2020-01-01'
    }
  },
  {
    name: '更新数据',
    code: 'updateChartDataWithData', // 与组件的内部的方法名保持一致
    desc: '重新获取数据',
    event: false,
    paramsList: [
      {
        name: 'date',
        desc: '数据',
        type: 'Array',
        required: 'false',
        defaultValue: '[]',
        explain: '组件所需数据'
      }
    ],
    paramsExample: [
      { date: '2018年', value: 300 },
      { date: '2019年', value: 200 }
    ]

  }
]
