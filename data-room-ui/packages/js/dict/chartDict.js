/**
 * 聚合函数
 * @type {string[]}
 */
export const aggregateList = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'COUNT_DISTINCT']

/**
 * 过滤条件
 * @type {string[]}
 */
export const operatorList = [
  {
    label: '等于',
    value: '='
  },
  {
    label: '不等于',
    value: '!='
  },
  {
    label: '大于',
    value: '>'
  },
  {
    label: '小于',
    value: '<'
  },
  {
    label: '大于等于',
    value: '>='
  },
  {
    label: '小于等于',
    value: '<='
  },
  {
    label: '包含',
    value: 'IN'
  },
  {
    label: '不包含',
    value: 'NOT IN'
  },
  {
    label: '相似',
    value: 'LIKE'
  },
  {
    label: '为空',
    value: 'IS NULL'
  },
  {
    label: '不为空',
    value: 'IS NOT NULL'
  }
]
/**
 * 分页条数
 * @type {number[]}
 */
export const rowLimits = [10, 50, 100, 250, 500, 1000, 5000, 10000]

/**
 * 最近类型的时间范围
 * @type {[{label: string, value: string}]}
 */
export const lastTimeRangeType = [
  {
    label: '最近一天',
    value: 'lastDay'
  },
  {
    label: '最近一周',
    value: 'lastWeek'
  },
  {
    label: '最近一月',
    value: 'lastMonth'
  },
  {
    label: '最近一季度',
    value: 'lastQuarter'
  },
  {
    label: '最近一年',
    value: 'lastYear'
  }
]

/**
 * 周期时间范围
 * @type {[{label: string, value: string}]}
 */
export const previousTimeRangeType = [
  {
    label: '上一周',
    value: 'previousWeek'
  },
  {
    label: '上一月',
    value: 'previousMonth'
  },
  {
    label: '上一年',
    value: 'previousYear'
  }
]

/**
 * 时间粒度
 * @type {[{label: string, value: string}]}
 */
export const timeGrain = [
  {
    label: '原始值',
    value: 'original'
  },
  {
    label: '秒',
    value: 'second'
  },
  {
    label: '分钟',
    value: 'minute'
  },
  {
    label: '小时',
    value: 'hour'
  }, { label: '天', value: 'day' }, { label: '周', value: 'week' }, { label: '月', value: 'month' }, { label: '季度', value: 'quarter' }, { label: '年', value: 'year' }
]
