// 组件配置转化
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import { setModules, dataModules } from 'data-room-ui/js/utils/configImport'
import { getScreenInfo, getDataSetDetails, getDataByDataSetId } from '../api/bigScreenApi'
import { stringToFunction } from '../utils/evalFunctions'
import { EventBus } from '../utils/eventBus'
import plotList from 'data-room-ui/G2Plots/plotList'
import { settingToTheme, themeToSetting } from 'data-room-ui/js/utils/themeFormatting'

export default {
  // 初始化页面数据
  initLayout ({ commit, dispatch }, code) {
    return new Promise(resolve => {
      getScreenInfo(code).then(data => {
        const pageInfo = handleResData(data)
        // 改变页面数据
        commit('changePageInfo', pageInfo)
        commit('changeZIndex', pageInfo.chartList)
        // 初始化缓存数据集数据
        // eslint-disable-next-line no-unused-expressions
        pageInfo.pageConfig.cacheDataSets?.map((cacheDataSet) => {
          dispatch('getCacheDataSetData', { dataSetId: cacheDataSet.dataSetId })
          dispatch('getCacheDataFields', { dataSetId: cacheDataSet.dataSetId })
        })
        // 页面加载成功
        resolve(true)
        commit('saveTimeLine', '初始化')
      })
    })
  },
  // 初始化缓存数据集数据
  getCacheDataSetData ({ commit, dispatch }, { dataSetId }) {
    getDataByDataSetId(dataSetId).then(res => {
      const data = res.data
      commit('changeCacheDataSetData', { dataSetId, data })
      // 推送数据到各个组件
      emitDataToChart(dataSetId, data)
    })
  },
  // 初始化缓存数据集字段
  getCacheDataFields ({ commit, dispatch }, { dataSetId }) {
    getDataSetDetails(dataSetId).then(data => {
      commit('changeCacheDataFields', { dataSetId, data })
      commit('changeCacheDataParams', { dataSetId, data })
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
  // 如果pageConfig中的cacheDataSets为null，赋值[]
  pageInfo.pageConfig.cacheDataSets = pageInfo.pageConfig.cacheDataSets || []
  pageInfo.pageConfig.refreshConfig = pageInfo.pageConfig.refreshConfig || []
  let originalConfig = {}
  pageInfo.chartList.forEach((chart) => {
    if (!['customComponent', 'remoteComponent'].includes(chart.type)) {
      originalConfig = { option: { ...setModules[chart.type] }, ...dataModules[chart.type] }
      // 如果没有版本号，或者版本号修改了则需要进行旧数据兼容
      if ((!chart.version) || chart.version !== originalConfig.version) {
        chart = compatibility(chart, originalConfig)
      } else {
        chart.option = cloneDeep(setModules[chart.type])
      }
    } else {
      originalConfig = plotList?.find(plot => plot.name === chart.name)
      chart.option = stringToFunction(chart.option)
      // 如果是自定义组件，且没配数据集，就给前端的模拟数据
      if (!chart?.dataSource?.businessKey) {
        chart.option.data = plotList?.find(plot => plot.name === chart.name)?.option?.data
      }
      // 如果没有版本号，或者版本号修改了则需要进行旧数据兼容
      if ((!chart.version) || (originalConfig && chart.version !== originalConfig?.version)) {
        // TODO 远程组件需要重新写处理函数
        if (chart.type === 'customComponent') {
          chart = compatibility(chart, originalConfig)
        }
      }
    }
    // 初始化时应该判断，是否存在theme配置，没有的话添加默认的两套主题，这是为了兼容旧组件
    if (!chart.theme) {
      chart.theme = settingToTheme(chart, 'dark')
      chart.theme = settingToTheme(chart, 'light')
    }
    chart.key = chart.code
  })
  // 主题兼容
  pageInfo.chartList = themeToSetting(pageInfo.chartList, pageInfo.pageConfig.customTheme)
  // 存储修改后的配置
  localStorage.setItem('pageInfo', JSON.stringify(pageInfo))
  return pageInfo
}
// 组件属性兼容
function compatibility (config, originalConfig) {
  const newConfig = config
  newConfig.version = originalConfig.version
  newConfig.dataSource = objCompare(newConfig.dataSource, originalConfig.dataSource)
  newConfig.customize = objCompare(newConfig.customize, originalConfig.customize)
  newConfig.option = { ...objCompare(newConfig.option, originalConfig.option), displayOption: originalConfig.option.displayOption }
  newConfig.setting = arrCompare(newConfig.setting, originalConfig.setting)
  return newConfig
}
// 对象比较
function objCompare (obj1, obj2) {
  const keys1 = obj1 ? Object.keys(obj1) : []
  const keys2 = obj2 ? Object.keys(obj2) : []
  // 交集
  const intersection = keys1?.filter(function (v) { return keys2.indexOf(v) > -1 }) || []
  // 差集
  const differenceSet = keys2?.filter(function (v) { return keys1.indexOf(v) === -1 }) || []
  const obj = {}
  for (const item of intersection) {
    obj[item] = obj1[item]
  }
  for (const item of differenceSet) {
    obj[item] = obj2[item]
  }
  return obj
}
// 数组比较
function arrCompare (list1, list2) {
  const fieldList = list1?.map(item => item.field) || []
  const list = list2?.map(item => {
    let value = null
    // 如果存在交集
    if (fieldList.includes(item.field)) {
      // 保留旧数据的value
      value = (list1.filter(j => {
        return j.field === item.field
      }))[0].value
    } else {
      // 不存在交集，直接覆盖
      value = item.value
    }
    return {
      ...item,
      value
    }
  }) || []
  return list
}
// 推送数据到各个组件
function emitDataToChart (dataSetId, data) {
  if (data && data.length) {
    EventBus.$emit('cacheDataInit',
      {
        success: true,
        data: data
      },
      dataSetId
    )
  }
}
