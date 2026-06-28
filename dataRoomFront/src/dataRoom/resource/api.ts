import request from '@/dataRoom/utils/request'

/**
 * 模型格式
 */
export type ModelFormat = 'GLB' | 'GLTF' | 'OBJ' | 'STL'

/**
 * 材质配置
 */
export interface MaterialConfig {
  color: string
  roughness: number
  metalness: number
  opacity: number
  transparent: boolean
  wireframe: boolean
}

/**
 * 光照配置
 */
export interface LightingConfig {
  ambient: { enabled: boolean; color: string; intensity: number }
  directional: { enabled: boolean; color: string; intensity: number }
  point: { enabled: boolean; color: string; intensity: number }
}

/**
 * 背景配置
 */
export interface BackgroundConfig {
  type: 'color'
  value: string
}

/**
 * 模型完整配置
 */
export interface ModelConfig {
  format?: string
  material: MaterialConfig
  lighting: LightingConfig
  background: BackgroundConfig
}

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
  config?: string
}

/**
 * 系统素材分类
 */
export interface SystemResourceCategory {
  code: string
  name: string
}

/**
 * 资源管理 API
 */
export const resourceApi = {
  /**
   * 获取资源列表
   */
  list(params?: { name?: string; parentCode?: string; resourceType?: string }) {
    return request.get<ResourceEntity[]>('/dataRoom/resource/list', params)
  },

  /**
   * 获取系统素材列表
   */
  systemResourceList(params?: { category?: string }) {
    return request.get<ResourceEntity[]>('/dataRoom/resource/systemResource/list', params)
  },

  /**
   * 获取系统素材分类
   */
  systemResourceCategories() {
    return request.get<SystemResourceCategory[]>('/dataRoom/resource/systemResource/categories')
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

  /**
   * 更新模型配置
   */
  updateModelConfig(params: { id: string; config?: string; thumbnail?: string }) {
    return request.post<void>('/dataRoom/resource/updateModelConfig', null, { params })
  },

  /**
   * 上传模型封面
   */
  uploadModelCover(id: string, formData: FormData) {
    return request.post<ResourceEntity>(`/dataRoom/resource/uploadModelCover`, formData, {
      params: { id },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
}
