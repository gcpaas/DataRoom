import request from '@/dataroom-packages/_common/_request'

/**
 * 资源实体接口
 */
export interface ResourceEntity {
  id?: string
  name: string
  originalName?: string
  resourceType: string
  parentCode?: string
  path?: string
  url?: string
  thumbnail?: string
  size?: number
  remark?: string
  createDate?: string
  updateDate?: string
}

/**
 * 资源管理 API
 */
export const resourceApi = {
  /**
   * 获取资源列表
   */
  list(params?: { name?: string; parentCode?: string }) {
    return request.get<ResourceEntity[]>('/dataRoom/resource/list', params)
  },

  /**
   * 获取资源详情
   */
  detail(id: string) {
    return request.get<ResourceEntity>(`/dataRoom/resource/detail/${id}`)
  },

  /**
   * 上传资源
   */
  upload(formData: FormData) {
    return request.post<ResourceEntity>('/dataRoom/resource/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 新增资源
   */
  insert(data: ResourceEntity) {
    return request.post<string>('/dataRoom/resource/insert', data)
  },

  /**
   * 更新资源
   */
  update(data: ResourceEntity) {
    return request.post<string>('/dataRoom/resource/update', data)
  },

  /**
   * 删除资源
   */
  delete(id: string) {
    return request.post<void>(`/dataRoom/resource/delete/${id}`)
  },
}
