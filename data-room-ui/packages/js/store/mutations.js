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
import CloneDeep from 'lodash-es/cloneDeep'
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
    let activeItem = {}
    // let activeItem = cloneDeep(state.pageInfo.chartList?.find(
    //   item => item.code === code
    // ))
    for (const item of state.pageInfo.chartList) {
      // 检查当前项的 code 是否与 currentCode 匹配
      if (item.code === code) {
        activeItem = item
        break // 找到匹配的项后，退出循环
      }
      // 如果当前项的 type 为 'chartTab'，则进一步检查其 tabList
      if (item.type === 'chartTab') {
        for (const tabItem of item.customize.tabList) {
          // 检查 tabList 中的每一项的 code 是否与 currentCode 匹配
          if (tabItem.chartCode === code) {
            activeItem = tabItem.chart
            break // 找到匹配的项后，退出循环
          }
        }
      }
    }
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
          // 确保取消高亮状态时不会使得原本设置过的组合被取消
          group: chart.group === 'tempGroup' ? '' : chart.group
        }
      })
    }
  },
  // 情况页面选中的组件
  clearActiveCodes (state) {
    state.activeCodes = []
  },
  // 改变当前hover组件id
  changeHoverCode (state, code) {
    state.hoverCode = code
  },
  // 改变当前选中组件id
  changePageLoading (state, booleanValue) {
    // 改变loading状态
    state.pageLoading = booleanValue
  },
  // 改变当前组件的加载状态
  changeChartLoading (state, itemConfig) {
    // 改变loading状态
    state.pageInfo.chartList.forEach((chart, index) => {
      if (chart.code === itemConfig.code) {
        chart.loading = itemConfig.loading
      }
    })
  },
  // 改变当前组件配置
  changeChartConfig (state, itemConfig) {
    // 如果存在parentCode的组件，则是tab中的组件
    if (itemConfig?.parentCode) {
      state.pageInfo.chartList.forEach((chart, index) => {
        if (chart.code === itemConfig.parentCode) {
          chart.customize.tabList.forEach((tabItem, i) => {
            if (tabItem.chartCode === itemConfig.code) {
              Vue.set(state.pageInfo.chartList[index].customize.tabList[i], 'chart', {
                ...state.pageInfo.chartList[index].customize.tabList[i].chart,
                ...itemConfig
              })
            }
          })
        }
      })
    } else {
      // 如果是一般的组件
      let index = null
      index = state.pageInfo.chartList.findIndex(
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
      const delCharts = state.pageInfo.chartList.filter(chart => codes.includes(chart.code))
      // 如果删除的组件中有跑马灯，需要删除将跑马灯组件的音频实例销毁
      delCharts.some(item => { item.type === 'marquee' && EventBus.$emit('deleteComponent', item.code) })
      state.pageInfo.chartList = state.pageInfo.chartList.filter(chart => !codes.includes(chart.code))
    } else {
      // 如果删除的组件是跑马灯，需要删除将跑马灯组件的音频实例销毁
      const delChart = state.pageInfo.chartList.find(chart => codes === chart.code)
      if (delChart && delChart.type === 'marquee') {
        EventBus.$emit('deleteComponent', codes)
      }
      state.pageInfo.chartList = state.pageInfo.chartList.filter(chart => codes !== chart.code)
      // 删除组件时，将该组件的缓存数据库中的数据也删除
      deldataset(state, 'dataset', codes)
      deldataset(state, 'computedDatas', codes)
    }
    // 存储删除后的状态
    saveTimeLineFunc(state, '删除组件')
    if (state.pageInfo.chartList.findIndex(item => item.code === state.activeCode) == -1) {
      state.activeItemConfig = null
      state.activeCode = null
      EventBus.$emit('closeRightPanel')
    }
    // 发送事件，关闭配置面板
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
    // 如果是多选，则改变框选中的所有组件的锁定状态
    if (state.activeCodes && state.activeCodes.length > 1) {
      state.pageInfo.chartList = state.pageInfo.chartList?.map(chart => {
        return {
          ...chart,
          locked: state.activeCodes.includes(chart.code) ? !config.locked : chart.locked
        }
      })
      saveTimeLineFunc(state, config.locked ? '解锁选中组件' : '锁定选中组件')
    } else {
      // 如果不是多选，则只改变当前一个
      const index = state.pageInfo.chartList.findIndex(
        item => item.code === config.code
      )
      Vue.set(state.pageInfo.chartList[index], 'locked', !config.locked)
      saveTimeLineFunc(state, !config.locked ? `解锁${config?.title}` : `锁定${config?.title}`)
    }
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
          state.activeItemConfig = cloneDeep(currentStore?.chartList?.find(item => item.code === state.activeCode) || {})
          EventBus.$emit('operationRollback', true)
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
  },
  // 更新数据集库中的内容
  updateDataset (state, res) {
    // 如果只是更新了组件的标题
    if (res.isChangeTitle) {
      if (state.dataset.hasOwnProperty(res.oldTitle + '_' + res.code)) {
        const _dataset = CloneDeep(state.dataset)
        _dataset[res.title + '_' + res.code] = _dataset[res.oldTitle + '_' + res.code]
        delete _dataset[res.oldTitle + '_' + res.code]
        state.dataset = CloneDeep(_dataset)
      }
    } else {
      Vue.set(state.dataset, res.title + '_' + res.code, res.data)
    }
  },
  // 更新数据集库中的内容
  updateComputedDatas (state, res) {
    // 如果只是更新了组件的标题
    if (res.isChangeTitle) {
      if ((!res.isExpression) && state.computedDatas.hasOwnProperty(res.oldTitle + '_' + res.code)) {
        const _computedDatas = CloneDeep(state.computedDatas)
        _computedDatas[res.title + '_' + res.code] = _computedDatas[res.oldTitle + '_' + res.code]
        delete _computedDatas[res.oldTitle + '_' + res.code]
        state.computedDatas = CloneDeep(_computedDatas)
      }
    } else {
      Vue.set(state.computedDatas, res.title + '_' + res.code, res.data)
    }
  },
  // 清空数据集库
  emptyDataset (state) {
    state.dataset = {}
  },
  // 清空数据集库
  emptyComputedDatas (state) {
    state.computedDatas = {}
  },
  // 修改磁吸状态
  snapChange (state, snap) {
    state.snapTolerance = snap
  }
}
function deldataset (state, type, codes) {
  const datasets = state[type]
  for (const code of codes) {
    for (const key in datasets) {
      if (key.endsWith(code)) {
        delete state[type][key]
        break // 找到匹配的属性后，退出内层循环
      }
    }
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
