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
const datasetPage = (params = {}, flag = false) => get('/bigScreen/dataset/page', params, flag)

/**
 * 删除数据集
 * @param id
 * @param flag
 * @returns {*}
 */
const datasetRemove = (id = '-1', flag = false) => get(`/bigScreen/dataset/remove/${id}`, {}, flag)

/**
 * 数据集名称校验
 * @param params
 * @param flag
 * @returns {*}
 */
const nameCheckRepeat = (params = {}, flag = false) => post('/bigScreen/dataset/nameCheckRepeat', params, flag)

/**
 * 数据集新增/修改【json/脚本/数据模型】
 * @param params
 * @param flag
 * @returns {*}
 */
const datasetAddorUpdate = (params = {}, flag = false) => post('/bigScreen/dataset/addOrUpdate', params, flag)

/**
 * 数据集执行【脚本】
 * @param params
 * @param flag
 * @returns {*}
 */
const datasetExecute = (params = {}, flag = false) => post('/bigScreen/dataset/execute', params, flag)

/**
 * 获取数据集信息【json/数据模型/脚本】
 * @param id
 * @param flag
 * @returns {*}
 */

const getDataset = (id = '-1', flag = false) => get(`/bigScreen/dataset/getDataSetDetailById?id=${id}`, {}, flag)

/**
 * 数据集加工测试
 * @param params
 * @param flag
 * @returns {*}
 */
const sqlTest = (params = {}, flag = false) => post('/bigScreen/datasetProcess/sqlTest', params, flag)

/**
 * 数据集新增
 * @param params
 * @param flag
 * @returns {*}
 */
const datasetAdd = (params = {}, flag = false) => post('/bigScreen/datasetProcess/add', params, flag)

/**
  * 数据集修改
  * @param params
  * @param flag
  * @returns {*}
  */
const datasetUpdate = (params = {}, flag = false) => post('/bigScreen/datasetProcess/update', params, flag)

/**
 * 获取自助数据集信息
 * @param id
 * @param flag
 * @returns {*}
 */
const getDatasetInfo = (id = '-1', flag = false) => get(`/bigScreen/datasetProcess/getDatasetInfo/${id}`, {}, flag)

/**
 * 获取数据集分类
 * @param r_dataset
 * @param flag
 * @returns {*}
 */
const getDatasetTypeList = (params = {}, flag = false) => get('/bigScreen/category/queryTreeList', params, flag)

/**
 * 获取原始表信息，数据列表
 * @param params
 * @param flag
 * @returns {*}
 */
const getOriginalTableDetail = (params = {}, flag = false) => post('/bigScreen/original/getOriginalTableDetail', params, flag)

/**
 * 新增/修改原始数据集
 * @param params
 * @param flag
 * @returns {*}
 */
const addOrUpdateOriginal = (params = {}, flag = false) => post('/bigScreen/original/addOrUpdate', params, flag)
/**
 * 获取原始数据集字段信息
 * @param params
 * @param flag
 * @returns {*}
 */
const getOriginalTableFieldInfo = (params = {}, flag = false) => post('/bigScreen/original/getOriginalTableFieldInfo', params, flag)

/**
 * 获取数据集详细信息
 * @param id
 * @param flag
 * @returns {*}
 */
const getOriginalTableDetailsById = (id = '-1', flag = false) => get(`/bigScreen/original/getOriginalTableDetailsById/${id}`, {}, flag)
/**
 * 删除菜单树节点
 * @param id
 * @param flag
 * @returns {*}
 */
const categoryRemove = (id = '-1', flag = false) => get(`/bigScreen/category/remove/${id}`, {}, flag)

/**
 * 新增/编辑菜单树节点
 * @param params
 * @param flag
 * @returns {*}
 */
const addOrUpdateTree = (params = {}, flag = false) => post('/bigScreen/category/addOrUpdateTree', params, flag)

export {
  datasetPage,
  datasetRemove,
  nameCheckRepeat,
  sqlTest,
  datasetAdd,
  datasetUpdate,
  getDatasetInfo,
  getDatasetTypeList,
  datasetAddorUpdate,
  datasetExecute,
  getDataset,
  getOriginalTableDetail,
  addOrUpdateOriginal,
  getOriginalTableFieldInfo,
  getOriginalTableDetailsById,
  categoryRemove,
  addOrUpdateTree
}
