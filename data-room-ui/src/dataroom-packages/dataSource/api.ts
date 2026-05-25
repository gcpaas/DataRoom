import request from '@/dataroom-packages/_common/_request.ts'

/**
 * 关系型数据源配置
 */
export interface RelationalDataSource {
  driverName: string
  dataSourceType: 'mysql' | 'postgresql' | 'oracle' | 'doris' | 'dameng' | 'sqlserver'
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
 * 数据源实体
 * dataSource 字段根据 dataSourceType 不同而具有不同的结构:
 * - 关系型(mysql/postgresql/oracle/doris/dameng/sqlserver): RelationalDataSource
 * - excel: ExcelDataSource
 */
export interface DataSourceEntity {
  id?: string
  name: string
  code?: string
  dataSourceType: 'mysql' | 'postgresql' | 'oracle' | 'doris' | 'dameng' | 'sqlserver' | 'excel'
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
}
