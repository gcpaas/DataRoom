import request from '@/dataroom-packages/_common/_request.ts'

/**
 * 入参
 */
export interface DatasetInputParam {
  name: string
  desc?: string
  type: string
  required?: boolean
  defaultVal?: any
  testVal?: any
}

/**
 * 出参
 */
export interface DatasetOutputParam {
  name: string
  type: string
  desc?: string
}

/**
 * 基础数据集配置
 */
export interface BaseDataset {
  datasetType: 'json' | 'http' | 'relational'
}

/**
 * JSON数据集
 */
export interface JsonDataset extends BaseDataset {
  datasetType: 'json'
  json: string
}

/**
 * HTTP数据集
 */
export interface HttpDataset extends BaseDataset {
  datasetType: 'http'
  url: string
  method: string
  headerList?: Array<{ key: string; val: string }>
  body?: string
  respJsonPath?: string
}

/**
 * 关系型数据集
 */
export interface RelationalDataset extends BaseDataset {
  datasetType: 'relational'
  sql: string
}

/**
 * 数据集实体
 */
export interface DatasetEntity {
  id?: string
  name: string
  code?: string
  dataSourceCode?: string
  datasetType: 'directory' | 'json' | 'http' | 'relational'
  parentCode?: string
  dataset?: JsonDataset | HttpDataset | RelationalDataset
  inputList?: DatasetInputParam[]
  outputList?: DatasetOutputParam[]
  createDate?: string
  updateDate?: string
  createUser?: string
  updateUser?: string
  tenantCode?: string
  delFlag?: string
}

export class DirectoryDataset{

}



/**
 * 树节点数据
 */
export interface DatasetTreeNode {
  id?: string
  label: string
  code?: string
  datasetType: 'directory' | 'json' | 'http' | 'relational'
  children?: DatasetTreeNode[]
  parentCode?: string
}

/**
 * 数据集执行请求
 */
export interface DatasetRunRequest {
  datasetCode: string
  paramMap?: Record<string, any>
}

/**
 * 数据集执行请求
 */
export interface DatasetRun4ChartRequest {
  datasetCode: string
  paramMap?: Record<string, any>
}


/**
 * 数据集测试请求
 */
export interface DatasetTestRequest {
  dataset: DatasetEntity
  inputParam?: Record<string, any>
}

/**
 * 数据集执行响应
 */
export interface DatasetRunResponse {
  data?: any
  outputList?: DatasetOutputParam[]
}


/**
 * 数据集API
 */
export const datasetApi = {
  /**
   * 查询列表
   */
  list(params?: { name?: string; parentCode?: string }) {
    return request.get<DatasetEntity[]>('/dataRoom/dataset/list', {params})
  },

  /**
   * 查询详情
   */
  detail(code: string) {
    return request.get<DatasetEntity>(`/dataRoom/dataset/detail/${code}`)
  },

  /**
   * 新增
   */
  insert(data: DatasetEntity) {
    return request.post<string>('/dataRoom/dataset/insert', data)
  },

  /**
   * 更新
   */
  update(data: DatasetEntity) {
    return request.post<string>('/dataRoom/dataset/update', data)
  },

  /**
   * 删除
   */
  delete(code: string) {
    return request.post<void>(`/dataRoom/dataset/delete/${code}`)
  },

  /**
   * 执行数据集
   */
  run(data: DatasetRunRequest) {
    return request.post<DatasetRunResponse>('/dataRoom/dataset/run', data)
  },
  /**
   * 执行数据集、转为图表需要的数据
   * @param data
   */
  run4Chart(req: DatasetRun4ChartRequest) {
    return request.post<DatasetRunResponse>('/dataRoom/dataset/run', req).then((res) => {
      res.data = res.data ?? []
      res.data = res.data instanceof Array ? res.data : [res.data]
      return res
    })
  },

  /**
   * 测试数据集
   */
  test(data: DatasetTestRequest) {
    return request.post<DatasetRunResponse>('/dataRoom/dataset/run/test', data)
  }
}
