// 组件配置转化
import _ from 'lodash'
import { setModules } from 'packages/js/utils/configImport'
import { getScreenInfo } from '../api/bigScreenApi'
import { stringToFunction } from '../utils/evalFunctions'
import plotList from 'packages/G2Plots/plotList'
export default {
  // 初始化页面数据
  initLayout ({ commit, dispatch }, code) {
    return new Promise(resolve => {
      getScreenInfo(code).then(data => {
        const pageInfo = handleResData(data)
        // 改变页面数据
        commit('changePageInfo', pageInfo)
        commit('changeZIndex', pageInfo.chartList)
        // 页面加载成功
        resolve(true)
        commit('saveTimeLine', '初始化')
      })
    })
  }
}

// 处理后端返回的数据
export function handleResData (data) {
  let pageInfo = {}
  if (data.pageConfig) {
    pageInfo = data
  } else {
    pageInfo = {
      ...data,
      pageConfig: {
        w: 1920,
        h: 1080,
        bgColor: '#151a26', // 背景色
        bg: '', // 背景图
        customTheme: 'auto',
        opacity: 100
      }
    }
  }
  pageInfo.pageConfig.refreshConfig = pageInfo.pageConfig.refreshConfig || []
  pageInfo.chartList.forEach((chart) => {
    if (!['customComponent', 'remoteComponent'].includes(chart.type)) {
      chart.option = _.cloneDeep(setModules[chart.type])
    } else {
      chart.option = stringToFunction(chart.option)
      // 如果是自定义组件，且没配数据集，就给前端的模拟数据
      if (!chart?.dataSource?.businessKey) {
        chart.option.data = plotList?.find(plot => plot.name === chart.name)?.option?.data
      }
    }
    chart.key = chart.code
  })
  return pageInfo
}
