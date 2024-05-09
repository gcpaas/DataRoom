// 事件与动作定义
export default [
  // 事件列表
  {
    name: '点击柱子',
    code: 'click', // click等
    desc: '点击柱子',
    event: true,
    paramsList: [
      {
        name: 'month',
        desc: '月份',
        type: 'string',
        required: 'false',
        defaultValue: 'Jan',
        explain: 'x轴字段'
      },
      {
        name: 'rainfall',
        desc: '产量',
        type: 'number',
        required: 'false',
        defaultValue: 18.9,
        explain: 'y轴字段'
      },
      {
        name: 'city',
        desc: '城市',
        type: 'string',
        required: 'false',
        defaultValue: 'London',
        explain: '分组字段'
      }
    ],
    paramsExample: {
      month: 'Jan',
      rainfall: 18.9,
      city: 'London'
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
        name: 'month',
        desc: '月份',
        type: 'string',
        required: 'false',
        defaultValue: 'Jan',
        explain: 'x轴字段'
      }
    ],
    paramsExample: {
      month: 'Jan'
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
    paramsExample: [{
      city: 'London',
      month: 'Jan',
      rainfall: 18.9
    },
    {
      city: 'London',
      month: 'Feb',
      rainfall: 28.8
    }
    ]
  }
]
