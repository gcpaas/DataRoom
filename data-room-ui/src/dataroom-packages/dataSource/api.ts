import request from '@/dataroom-packages/_common/_request.ts'

/**
 * 关系型数据源配置
 */
export interface RelationalDataSource {
  driverName: string
  dataSourceType: 'mysql' | 'postgresql' | 'oracle'
  username: string
  password: string
  url: string
}

/**
 * 数据源实体
 */
export interface DataSourceEntity {
  id?: string
  name: string
  code?: string
  dataSourceType: 'mysql' | 'postgresql' | 'oracle'
  dataSource: RelationalDataSource
  createDate?: string
  updateDate?: string
  createUser?: string
  updateUser?: string
  tenantCode?: string
  delFlag?: string
}

/**
 * 数据源API
 */
export const dataSourceApi = {
  /**
   * 查询列表
   */
  list(params?: { name?: string }) {
    return request.get<DataSourceEntity[]>('/dataRoom/dataSource/list', { params })
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
  }
}
