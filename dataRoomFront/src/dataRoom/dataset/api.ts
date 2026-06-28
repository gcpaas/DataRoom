import request from '@/dataRoom/utils/request.ts'

/**
 * 入参
 */
export interface DatasetInputParam {
  name: string
  desc?: string
  type: string
  required?: boolean
  defaultVal?: unknown
  testVal?: unknown
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
  datasetType: DatasetType
}

export type DatasetType = '' | 'directory' | 'json' | 'http' | 'sql' | 'excel' | 'es' | 'websocket' | 'mqtt'

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
  headerList?: Array<{ key: string; val: string; encrypted?: boolean }>
  body?: string
  respJsonPath?: string
}

/**
 * SQL数据集
 */
export interface SqlDataset extends BaseDataset {
  datasetType: 'sql'
  sql: string
}

/**
 * Excel数据集
 */
export interface ExcelDataset extends BaseDataset {
  datasetType: 'excel'
  sql: string
}

/**
 * ES数据集
 */
export interface EsDataset extends BaseDataset {
  datasetType: 'es'
  path: string
  method: string
  body?: string
  respJsonPath?: string
}

/**
 * WebSocket数据集
 */
export interface WebSocketDataset extends BaseDataset {
  datasetType: 'websocket'
  url: string
  script: string
  sampleData: string
}

/**
 * MQTT数据集
 */
export interface MqttDataset extends BaseDataset {
  datasetType: 'mqtt'
  topic: string
  cacheSize: number
  jsonFieldMappings: Array<{ field: string; jsonPath: string; type: string }>
  emptyDataStrategy: string
  sampleData?: string
}

/**
 * 数据集实体
 */
export interface DatasetEntity {
  id?: string
  name: string
  code?: string
  dataSourceCode?: string
  datasetType: DatasetType
  parentCode?: string
  dataset?: JsonDataset | HttpDataset | SqlDataset | ExcelDataset | EsDataset | WebSocketDataset | MqttDataset
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
  datasetType: DatasetType
  children?: DatasetTreeNode[]
  parentCode?: string
}

/**
 * 数据集执行请求
 */
export interface DatasetRunRequest {
  datasetCode: string
  paramMap?: Record<string, unknown>
}

/**
 * 数据集执行请求
 */
export interface DatasetRun4ChartRequest {
  datasetCode: string
  paramMap?: Record<string, unknown>
}


/**
 * 数据集测试请求
 */
export interface DatasetTestRequest {
  dataset: DatasetEntity
  inputParam?: Record<string, unknown>
}

/**
 * 数据集执行响应
 */
export interface DatasetRunResponse {
  data?: unknown
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
