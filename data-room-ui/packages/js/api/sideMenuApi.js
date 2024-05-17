/**
* @Description: 大屏、仪表盘等模块的公共接口
* @author liu.shiyi
* @date 2024/3/12 13:40
*/
import Vue from 'vue'

// 获取目录列表
export function getCatalogList (pageType) {
  return Vue.prototype.$dataRoomAxios.get(`/dataroom/type/list/${pageType}Catalog`)
}
// 新增目录
export function addCatalog (params) {
  return Vue.prototype.$dataRoomAxios.post('/dataroom/type/add', params)
}
// 更新目录
export function updateCatalog (params) {
  return Vue.prototype.$dataRoomAxios.post('/dataroom/type/update', params)
}
// 删除目录
export function delCatalog (id) {
  return Vue.prototype.$dataRoomAxios.post(`/dataroom/type/delete/${id}`)
}
// 校验目录名称是否重复
export function checkCatalogName (params) {
  return Vue.prototype.$dataRoomAxios.post('/dataroom/type/nameRepeat', params)
}
