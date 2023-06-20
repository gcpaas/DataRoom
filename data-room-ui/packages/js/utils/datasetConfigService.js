/*!
 * 数据集管理
 */
import { get, post } from 'packages/js/utils/http'

/**
 * 数据集分页查询
 * @param params
 * @param flag
 * @returns {*}
 */
const datasetPage = (params = {}, flag = false) => get('/dataset/page', params, flag)

/**
 * 数据集名称校验
 * @param params
 * @param flag
 * @returns {*}
 */
const nameCheckRepeat = (params = {}, flag = false) => post('/dataset/checkRepeat', params, flag)

/**
 * 数据集新增
 * @param params
 * @param flag
 * @returns {*}
 */
const datasetAdd = (params = {}, flag = false) => post('/dataset/add', params, flag)

/**
 * 数据集修改
 * @param params
 * @param flag
 * @returns {*}
 */
const datasetUpdate = (params = {}, flag = false) => post('/dataset/update', params, flag)

/**
 * 删除数据集
 * @param id
 * @param flag
 * @returns {*}
 */
const datasetRemove = (id = '-1', flag = false) => post(`/dataset/delete/${id}`, {}, flag)


/**
 * 数据集执行
 * @param params
 * @param flag
 * @returns {*}
 */
const datasetExecuteTest = (params = {}, flag = false) => post('/dataset/execute/test', params, flag)

/**
 * 获取数据集详情
 * @param id
 * @param flag
 * @returns {*}
 */

const getDataset = (id = '-1', flag = false) => get(`/dataset/info/${id}`, {}, flag)



/**
 * 获取数据集分类
 * @param r_dataset
 * @param flag
 * @returns {*}
 */
const getCategoryTree = (params = {}, flag = false) => get('/category/queryTreeList', params, flag)

/**
 * 新增分类树节点
 * @param params
 * @param flag
 * @returns {*}
 */
const categoryAdd = (params = {}, flag = false) => post('/category/add', params, flag)

/**
 * 编辑分类树节点
 * @param params
 * @param flag
 * @returns {*}
 */
const categoryUpdate = (params = {}, flag = false) => post('/category/update', params, flag)

/**
 * 删除分类树节点
 * @param id
 * @param flag
 * @returns {*}
 */
const categoryRemove = (id = '-1', flag = false) => post(`/category/delete/${id}`, {}, flag)


export {
  datasetPage,
  datasetAdd,
  datasetUpdate,
  datasetRemove,
  nameCheckRepeat,
  datasetExecuteTest,
  getDataset,

  getCategoryTree,
  categoryAdd,
  categoryUpdate,
  categoryRemove
}
