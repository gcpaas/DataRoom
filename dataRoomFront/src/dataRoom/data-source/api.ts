import request from '@/dataRoom/utils/request.ts'

/**
 * 关系型数据源配置
 */
export interface RelationalDataSource {
  driverName: string
  dataSourceType:
    | 'mysql'
    | 'postgresql'
    | 'oracle'
    | 'doris'
    | 'dameng'
    | 'db2'
    | 'gbase'
    | 'goldendb'
    | 'greatdb'
    | 'sqlserver'
    | 'mongodb'
    | 'kingbase'
    | 'clickhouse'
    | 'mariadb'
    | 'oceanbase'
    | 'h2'
    | 'polardb'
    | 'hive'
    | 'tdengine'
    | 'druid'
  username: string
  password: string
  url: string
}

/**
 * Excel列定义
 */
export interface ExcelColumn {
  name: string
  type: 'VARCHAR' | 'INTEGER' | 'DECIMAL' | 'DATE'
  primaryKey: boolean
  originalHeader: string
}

/**
 * Excel数据源配置
 */
export interface ExcelDataSource {
  dataSourceType: 'excel'
  tableName: string
  columns: ExcelColumn[]
  originalFileName: string
  rowCount: number
  importMode: string
}

/**
 * Elasticsearch API数据源配置
 */
export interface EsDataSource {
  dataSourceType: 'es'
  baseUrl: string
  authType: 'none' | 'basic' | 'bearer' | 'apiKey'
  username?: string
  password?: string
  bearerToken?: string
  apiKey?: string
}

/**
 * MQTT数据源配置
 */
export interface MqttDataSource {
  dataSourceType: 'mqtt'
  protocol: 'tcp' | 'tls' | 'ws' | 'wss'
  host: string
  port: number
  clientId?: string
  caCertificate?: string
  path?: string
  authMode: 'none' | 'usernamePassword'
  username?: string
  password?: string
  defaultTopic?: string
  connectionTimeoutSeconds?: number
}

/**
 * 数据源实体
 * dataSource 字段根据 dataSourceType 不同而具有不同的结构:
 * - 关系型(mysql/postgresql/oracle/doris/dameng/db2/gbase/goldendb/greatdb/sqlserver/mongodb/kingbase/clickhouse/mariadb/oceanbase/h2/polardb/hive/tdengine/druid): RelationalDataSource
 * - excel: ExcelDataSource
 * - es: EsDataSource
 * - mqtt: MqttDataSource
 */
export interface DataSourceEntity {
  id?: string
  name: string
  code?: string
  dataSourceType:
    | 'mysql'
    | 'postgresql'
    | 'oracle'
    | 'doris'
    | 'dameng'
    | 'db2'
    | 'gbase'
    | 'goldendb'
    | 'greatdb'
    | 'sqlserver'
    | 'mongodb'
    | 'kingbase'
    | 'clickhouse'
    | 'mariadb'
    | 'oceanbase'
    | 'h2'
    | 'polardb'
    | 'hive'
    | 'tdengine'
    | 'druid'
    | 'es'
    | 'excel'
    | 'mqtt'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataSource: any
  createDate?: string
  updateDate?: string
  createUser?: string
  updateUser?: string
  tenantCode?: string
  delFlag?: string
}

/**
 * Excel上传解析结果
 */
export interface ExcelUploadResponse {
  uploadId: string
  columns: ExcelColumn[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previewData: Record<string, any>[]
  totalRows: number
}

/**
 * Excel查看数据响应
 */
export interface ExcelViewDataResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[]
  total: number
  page: number
  pageSize: number
}

/**
 * 数据源表元数据
 */
export interface DataSourceTableMeta {
  name: string
  type?: string
  comment?: string
}

/**
 * 数据源字段元数据
 */
export interface DataSourceColumnMeta {
  name: string
  type?: string
  comment?: string
}

/**
 * Excel创建请求
 */
export interface ExcelCreateRequest {
  name: string
  tableName: string
  uploadId: string
  columns: ExcelColumn[]
  originalFileName: string
}

/**
 * Excel创建响应
 */
export interface ExcelCreateResponse {
  id: string
  code: string
  tableName: string
}

/**
 * MQTT连接测试结果
 */
export interface MqttConnectionTestResult {
  success: boolean
  status: 'success' | 'timeout' | 'authFailed' | 'topicDenied' | 'configInvalid' | 'unreachable'
  message: string
  testedAt?: string
}

/**
 * 数据源API
 */
export const dataSourceApi = {
  /**
   * 查询列表
   */
  list(params?: { name?: string }) {
    return request.get<DataSourceEntity[]>('/dataRoom/dataSource/list', params)
  },

  /**
   * 查询详情
   */
  detail(code: string) {
    return request.get<DataSourceEntity>(`/dataRoom/dataSource/detail/${code}`)
  },

  /**
   * 新增
   */
  insert(data: DataSourceEntity) {
    return request.post<string>('/dataRoom/dataSource/insert', data)
  },

  /**
   * 更新
   */
  update(data: DataSourceEntity) {
    return request.post<string>('/dataRoom/dataSource/update', data)
  },

  /**
   * 删除
   */
  delete(code: string) {
    return request.post<void>(`/dataRoom/dataSource/delete/${code}`)
  },

  /**
   * 连接测试
   */
  test(data: DataSourceEntity) {
    return request.post<MqttConnectionTestResult>('/dataRoom/dataSource/test', data)
  },

  /**
   * 查询数据源表信息
   */
  listTables(code: string) {
    return request.get<DataSourceTableMeta[]>(`/dataRoom/dataSource/${code}/tables`)
  },

  /**
   * 查询数据源字段信息
   */
  listColumns(code: string, tableName: string) {
    return request.get<DataSourceColumnMeta[]>(
      `/dataRoom/dataSource/${code}/tables/${encodeURIComponent(tableName)}/columns`
    )
  },

  /**
   * Excel: 上传并解析文件
   */
  excelUpload(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<ExcelUploadResponse>('/dataRoom/dataSource/excel/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /**
   * Excel: 创建表并导入数据
   */
  excelCreateAndImport(data: ExcelCreateRequest) {
    return request.post<ExcelCreateResponse>('/dataRoom/dataSource/excel/createAndImport', data)
  },

  /**
   * Excel: 重新导入数据
   */
  excelReimport(code: string, file: File, importMode: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('code', code)
    formData.append('importMode', importMode)
    return request.post<{ rowCount: number }>('/dataRoom/dataSource/excel/reimport', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /**
   * Excel: 分页查看数据
   */
  excelViewData(code: string, page: number = 1, pageSize: number = 100) {
    return request.get<ExcelViewDataResponse>('/dataRoom/dataSource/excel/viewData', {
      code,
      page,
      pageSize,
    })
  },

  /**
   * Excel: 查询应用数据库中excel_开头的表信息
   */
  excelListTables() {
    return request.get<DataSourceTableMeta[]>('/dataRoom/dataSource/excel/tables')
  },

  /**
   * Excel: 查询应用数据库中excel_开头表的字段信息
   */
  excelListColumns(tableName: string) {
    return request.get<DataSourceColumnMeta[]>(
      `/dataRoom/dataSource/excel/tables/${encodeURIComponent(tableName)}/columns`
    )
  },
}
