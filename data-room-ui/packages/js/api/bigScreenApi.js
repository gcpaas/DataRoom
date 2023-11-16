import Vue from 'vue'
// 大屏详情
export function getScreenInfo (code) {
  return Vue.prototype.$dataRoomAxios.get(`/bigScreen/design/info/code/${code}`)
}

// 保存更新大屏
export function saveScreen(data) {
  data.chartList.forEach((item) => {
    if (item.type == 'customComponent') {
      const a = JSON.parse(item.option)
      if (a.data) {
        a.data = []
      }
      item.option=JSON.stringify(a)
      item.setting=item.setting.map((x) => {
        const {field,value,...obj}=x
	        return {field,value}
      })
    }
  })
  return Vue.prototype.$dataRoomAxios.post('/bigScreen/design/update', data)
}

// 根据数据集获取数据集详情
export function getDataSetDetails (id) {
  return Vue.prototype.$dataRoomAxios.get('/dataset/datasetInfo/' + id)
}

// 根据数据集id获取数据
export function getDataByDataSetId (dataSetId) {
  return Vue.prototype.$dataRoomAxios.post('/dataset/execute', {
    dataSetId,
    params: []
  })
}

// 得到图表详情
export function getChatInfo (params) {
  return Vue.prototype.$dataRoomAxios.post('/bigScreen/chart/data/list', params)
}
// 得到图表的更新数据
export function getUpdateChartInfo (params) {
  return Vue.prototype.$dataRoomAxios.post('/bigScreen/chart/data/chart', params)
}

// 业务组件列表
export function getBizComponentPage (params) {
  return Vue.prototype.$dataRoomAxios.get('/bigScreen/bizComponent/page', params)
}

// 根据code获得业务组件的信息
export function getBizComponentInfo (code) {
  return Vue.prototype.$dataRoomAxios.get(`/bigScreen/bizComponent/info/${code}`)
}

// 更新业务组件
export function updateBizComponent (params) {
  return Vue.prototype.$dataRoomAxios.post('/bigScreen/bizComponent/update', params)
}
