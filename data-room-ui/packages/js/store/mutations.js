/*
 * @description: vuex mutations 事件
 * @Date: 2023-03-13 10:04:59
 * @Author: xing.heng
 * @LastEditors: xing.heng
 * @LastEditTime: 2023-06-08 15:24:01
 */

import Vue from 'vue'
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'
import { defaultData } from './state'
import moment from 'moment'
import { randomString } from 'data-room-ui/js/utils'
import { EventBus } from 'data-room-ui/js/utils/eventBus'
export default {
  // 改变页面基本信息，后端请求的页面信息存储到此处
  changePageInfo (state, pageInfo) {
    state.pageInfo = pageInfo
  },
  // 改变组件列表
  changeLayout (state, layout) {
    state.pageInfo.chartList = layout
  },
  //
  changeIframeDialog  (state, dialogVisible) {
    state.iframeDialog = dialogVisible
  },
  // 改变当前选择组件id
  changeActiveCode (state, code) {
    state.activeCode = code
    state.hoverCode = code

    const activeItem = cloneDeep(state.pageInfo.chartList?.find(
      item => item.code === code
    ))
    changeGroup(code, state)
    state.activeItemConfig = cloneDeep(activeItem)
  },
  changeActiveCodes (state, codes) {
    // 传入codes，将codes中的组件的group改为tempGroup，不传入或者传入空数组，将所有组件的group改为''，即取消组合
    if (codes.length !== 0) {
      state.activeCodes = codes
      state.pageInfo.chartList = state.pageInfo.chartList?.map(chart => {
        return {
          ...chart,
          group: (codes.includes(chart.code) && !chart.group) ? 'tempGroup' : chart.group
        }
      })
    } else {
      state.activeCodes = codes
      state.pageInfo.chartList = state.pageInfo.chartList?.map(chart => {
        return {
          ...chart,
          group: ''
        }
      })
    }
  },
  // 改变当前hover组件id
  changeHoverCode (state, code) {
    state.hoverCode = code
  },
  changePageLoading (state, booleanValue) {
    state.pageLoading = booleanValue
  },
  // 改变当前组件配置
  changeChartConfig (state, itemConfig) {
    const index = state.pageInfo.chartList.findIndex(
      item => item.code === itemConfig.code
    )
    Vue.set(state.pageInfo.chartList, index, {
      ...state.pageInfo.chartList[index],
      ...itemConfig
    })
    // 对比之前的config和当前的itemConfig的xywh，如果有变化，就改变卡尺对齐线
    const oldConfig = state.pageInfo.chartList[index]
    if (
      oldConfig.x !== itemConfig.x ||
      oldConfig.y !== itemConfig.y ||
      oldConfig.w !== itemConfig.w ||
      oldConfig.h !== itemConfig.h
    ) {
      // 改变当前组件的卡尺对齐线
      changePresetLine(state, itemConfig)
    }
  },
  setPresetLine (state, { x, y, w, h }) {
    state.presetLine = [
      { type: 'h', site: y || 0 },
      { type: 'v', site: x || 0 }
    ]
  },
  changeActiveItemConfig (state, config) {
    state.activeItemConfig = cloneDeep(config)
  },
  // 新增一个组件
  addItem (state, itemConfig) {
    // 放到第一项
    state.pageInfo.chartList.unshift(itemConfig)
    changeZIndexFuc(state, state.pageInfo.chartList)
    saveTimeLineFunc(state, '新增组件' + itemConfig?.title)
  },
  // 删除组件/批量删除组件
  delItem (state, codes) {
    if (Array.isArray(codes)) {
      state.pageInfo.chartList = state.pageInfo.chartList.filter(chart => !codes.includes(chart.code))
    } else {
      state.pageInfo.chartList = state.pageInfo.chartList.filter(chart => codes !== chart.code)
    }
    // 存储删除后的状态
    saveTimeLineFunc(state, '删除组件')
    // 删除后，清空当前选中组件
    state.activeItemConfig = null
    state.activeCode = null
    // 发送事件，关闭配置面板
    EventBus.$emit('closeRightPanel')
  },
  changePageConfig (state, pageConfig) {
    Vue.set(state.pageInfo, 'pageConfig', cloneDeep(pageConfig))
    state.updateKey = new Date().getTime()
  },
  changeActiveItem (state, activeItem) {
    state.activeItem = cloneDeep(activeItem)
    state.activeId = activeItem.code
    // state.settingJson = cloneDeep(activeItem.settingConfig) || {}
  },
  // 改变当前组件的xywh
  changeActiveItemWH (state, chart) {
    if (chart.code === state.activeItemConfig.code) {
      state.activeItemConfig = {
        ...state.activeItemConfig,
        ...chart
      }
    }
  },
  // 清空卡尺对齐线
  resetPresetLine (state) {
    state.presetLine = []
  },
  // 改变组件的层级
  changeZIndex (state, list) {
    changeZIndexFuc(state, list)
  },
  // 改变锁定状态
  changeLocked (state, config) {
    const index = state.pageInfo.chartList.findIndex(
      item => item.code === config.code
    )
    Vue.set(state.pageInfo.chartList[index], 'locked', !config.locked)
    saveTimeLineFunc(state, !config.locked ? `解锁${config?.title}` : `锁定${config?.title}`)
  },
  // 改变网格显示状态
  changeGridShow (state, isShow) {
    state.hasGrid = isShow
  },
  // 改变组件的key
  changeChartKey (state, code) {
    const index = state.pageInfo.chartList.findIndex(
      item => item.code === code
    )
    if (index < 0) {
      return
    }
    const config = state.pageInfo.chartList[index]
    Vue.set(config, 'key', config.code + new Date().getTime())
  },
  // 改变缓存数据集中的字段列表
  changeCacheDataFields (state, { dataSetId, data }) {
    // 将 state.pageInfo.pageConfig.cacheDataSets 中的 dataSetId 对应fields字段数据替换为 data
    const index = state.pageInfo.pageConfig.cacheDataSets.findIndex(cacheData => cacheData.dataSetId === dataSetId)
    if (index < 0) {
      return
    }
    Vue.set(state.pageInfo.pageConfig.cacheDataSets[index], 'fields', data?.fields || [])
  },
  // 改变缓存数据集中的数据参数
  changeCacheDataParams (state, { dataSetId, data }) {
    // 将 state.pageInfo.pageConfig.cacheDataSets 中的 dataSetId 对应fields字段数据替换为 data
    const index = state.pageInfo.pageConfig.cacheDataSets.findIndex(cacheData => cacheData.dataSetId === dataSetId)
    if (index < 0) {
      return
    }
    Vue.set(state.pageInfo.pageConfig.cacheDataSets[index], 'params', data?.params || [])
  },
  // 改变缓存数据集中的数据
  changeCacheDataSetData (state, { dataSetId, data }) {
    const index = state.pageInfo.pageConfig.cacheDataSets.findIndex(cacheData => cacheData.dataSetId === dataSetId)
    if (index < 0) {
      return
    }
    state.pageInfo.pageConfig.cacheDataSets[index].data = data || []
  },
  // 改变shift是否被按下
  changeCtrlOrCommandDown (state, isDown) {
    state.shiftKeyDown = isDown
  },
  // 初始化store中的数据，防止污染
  resetStoreData (state) {
    for (const stateKey in state) {
      state[stateKey] = cloneDeep(defaultData[stateKey])
    }
  },
  changeZoom (state, zoom) {
    state.zoom = zoom
  },
  changeFitZoom (state, zoom) {
    state.fitZoom = zoom
  },
  changeActivePos (state, { diffX, diffY }) {
    const activeCodes = state.activeCodes
    activeCodes?.forEach(code => {
      const chart = state.pageInfo.chartList.find(item => item.code === code)
      if (chart) {
        chart.x += diffX
        chart.y += diffY
      }
      const index = state.pageInfo.chartList.findIndex(
        item => item.code === chart.code
      )
      if (index < 0) {
        return
      }
      Vue.set(state.pageInfo.chartList, index, {
        ...state.pageInfo.chartList[index],
        ...chart
      })
      changePresetLine(state, chart)
    })
  },
  // 保存当前状态
  saveTimeLine (state, title) {
    const date = new Date()
    const time = moment(date).format('HH:mm:ss')
    // title默认获取当前时间，时分秒
    if (!title) {
      const date = new Date()
      title = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    }
    saveTimeLineFunc(state, title, time)
  },
  // 撤回/反撤回当前事件线 （undo和redo放到一个函数中，用isUndo区分）
  undoTimeLine (state, isUndo = true) {
    let currentStore = {}
    // 撤回
    if (isUndo) {
      if (state.timelineStore.length > 0 && state.currentTimeLine > 1) {
        // 时间线往前推一个
        state.currentTimeLine = state.currentTimeLine - 1
        currentStore = state.timelineStore[state.currentTimeLine - 1]
        if (currentStore?.chartList) {
          state.pageInfo.chartList = cloneDeep(currentStore?.chartList)
        }
      }
    }
    // 反撤回 redo
    if (!isUndo) {
      if (state.currentTimeLine < state.timelineStore.length) {
        // 时间线往后推一个
        state.currentTimeLine = state.currentTimeLine + 1
        currentStore = state.timelineStore[state.currentTimeLine - 1]
        state.pageInfo.chartList = cloneDeep(currentStore?.chartList || [])
      }
    }
    state.pageInfo.chartList = state.pageInfo.chartList.map(chart => {
      return {
        ...chart,
        key: chart.code + new Date().getTime()
      }
    })
  },
  clearTimeline (state) {
    // 最后一个状态
    const lastStore = state.timelineStore[state.timelineStore.length - 1]
    // 将最后一个状态作为初始状态，否则下次拖拽后无法回到之前
    state.timelineStore = [
      {
        ...lastStore,
        timelineTitle: '初始状态',
        updateTime: moment(new Date()).format('HH:mm:ss')
      }
    ]
    state.currentTimeLine = 1
  },
  // 回退到指定时间线
  rollbackTimeline (state, index) {
    state.pageInfo.chartList = cloneDeep(state.timelineStore[index]?.chartList || [])
    state.currentTimeLine = index + 1
  },
  // 复制组件
  copyCharts (state) {
    state.copyChartCodes = cloneDeep(state.activeCodes)
  },
  // 粘贴组件
  pasteCharts (state) {
    const copyChartCodes = state.copyChartCodes
    const chartList = state.pageInfo.chartList
    // 将选中的组件复制一份， code加上 随机后缀, key 也加上随机后缀， x, y 各增加50
    const additionCode = randomString(5)
    const copyCharts = copyChartCodes.map(code => {
      const chart = chartList.find(item => item.code === code)
      const copyChart = cloneDeep(chart)
      copyChart.code = `${copyChart.code}_${additionCode}`
      copyChart.key = `${copyChart.key}_${additionCode}`
      copyChart.group = (copyChart.group && copyChart.group !== 'tempGroup') ? `${copyChart.group}_${additionCode}` : ''
      copyChart.x += 50
      copyChart.y += 50
      return copyChart
    })
    // 将复制的组件添加到chartList中
    state.pageInfo.chartList = [...copyCharts, ...state.pageInfo.chartList]
  }
}
function changeZIndexFuc (state, list) {
  const len = list?.length - 1 || 0
  list.forEach((item, i) => {
    const index = state.pageInfo.chartList.findIndex(
      _item => _item.code === item.code
    )
    Vue.set(state.pageInfo.chartList[len - index], 'z', i)
  })
}

// 改变当前组件的卡尺对齐线
function changePresetLine (state, { x, y, w, h }) {
  state.presetLine = [
    { type: 'h', site: y || 0 },
    { type: 'v', site: x || 0 }
  ]
}

function changeGroup (code, state) {
  if (code) {
    // 找到和此组件group相同的组件，并添加到activeCodes中
    const group = state.pageInfo.chartList?.find(item => item.code === code)?.group
    if (group) {
      state.activeCodes = state.pageInfo.chartList?.filter(chart => chart.group === group && chart.group).map(item => item.code)
    }
    if (state.shiftKeyDown) {
      state.activeCodes = uniq([...state.activeCodes, code])
      // eslint-disable-next-line no-unused-expressions
      state.pageInfo.chartList?.forEach(chart => {
        if (state.activeCodes.includes(chart.code)) {
          chart.group = 'tempGroup'
        }
      })
    } else {
      if (!group) {
        state.activeCodes = [code]
      }
    }
  } else {
    state.activeCodes = []
    state.pageInfo.chartList = state.pageInfo.chartList?.map(chart => ({
      ...chart,
      group: chart.group === 'tempGroup' ? '' : chart.group
    }))
  }
}

function saveTimeLineFunc (state, title, time) {
  // 最多保存10个状态
  const MAX_TIME_LINE = 10
  const stateCopy = cloneDeep(state.pageInfo)
  const date = new Date()
  time = time || moment(date).format('HH:mm:ss')
  stateCopy.timelineTitle = title
  stateCopy.updateTime = time

  if (!Array.isArray(state.timelineStore)) {
    state.timelineStore = []
  }
  if (!Number.isInteger(state.currentTimeLine)) {
    state.currentTimeLine = 0
  }
  if (state.timelineStore.length >= MAX_TIME_LINE) {
    // 去掉最早的一个
    state.timelineStore.shift()
  }
  state.timelineStore?.push(stateCopy)
  state.currentTimeLine = state.timelineStore?.length
}
