/**
* @Description: 大屏、仪表盘等模块的公共接口
* @author liu.shiyi
* @date 2024/3/12 13:40
*/
import { get, post } from '@gcpaas/data-room-ui/packages/js/utils/http'
// 获取页面列表
export function getPageList (params) {
  return get('/dataroom/design/page', params)
}
// 新增页面
export function addPage (params) {
  return post('/dataroom/design/add', params)
}
// 更新页面
export function updatePage (params) {
  return post('/dataroom/design/update', params)
}
// 删除页面
export function delPage (code) {
  return post(`/dataroom/design/delete/${code}`)
}
// 复制页面
export function copyPage (code) {
  return post(`/dataroom/design/copy/${code}`)
}
// 获取编辑页面信息的信息回调
export function getPageEditInfo (code) {
  return get(`/dataroom/design/info/code/${code}`)
}
// 获取大屏/仪表盘页面信息
export function getPageInfo (code) {
  return get(`/dataroom/design/info/code/${code}`)
}
// 校验页面名称是否重复

export function checkPageName (params) {
  return post('/dataroom/design/name/repeat', params)
}

// 保存更新大屏/仪表盘
export function saveScreen (data) {
  return post('/dataroom/design/update', data)
}
// 获取组件的数据
export function getDataByChart (params) {
  return post('/dataroom/chart/data/chart', params)
}
export function getDataByList (params) {
  return post('/dataroom/chart/data/list', params)
}
// 获取数据集信息
export function getDatasetInfo (code) {
  return get(`/dataset/datasetInfo/${code}`)
}
