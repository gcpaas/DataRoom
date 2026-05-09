import request from '@/dataroom-packages/_common/_request.ts'

/**
 * 地图实体
 */
export interface MapEntity {
  id?: string
  name: string
  code?: string
  parentCode?: string
  level?: number
  geoJson?: string
  uploadedGeoJson?: number
  createDate?: string
  updateDate?: string
  createUser?: string
  updateUser?: string
  tenantCode?: string
  delFlag?: string
}

/**
 * GeoJSON中的Feature属性
 */
export interface GeoFeatureProperties {
  name: string
  center?: [number, number]
  centroid?: [number, number]
  cp?: [number, number]
  [key: string]: unknown
}

/**
 * 从GeoJSON中解析出的区域信息
 */
export interface RegionInfo {
  name: string
  longitude: number
  latitude: number
}

/**
 * 地图API
 */
export const mapApi = {
  /**
   * 查询列表（不含geoJson大字段）
   */
  list(params?: { name?: string }) {
    return request.get<MapEntity[]>('/dataRoom/map/list', params)
  },

  /**
   * 查询详情（含geoJson）
   */
  detail(code: string) {
    return request.get<MapEntity>(`/dataRoom/map/detail/${code}`)
  },

  /**
   * 新增
   */
  insert(data: MapEntity) {
    return request.post<string>('/dataRoom/map/insert', data)
  },

  /**
   * 更新
   */
  update(data: MapEntity) {
    return request.post<string>('/dataRoom/map/update', data)
  },

  /**
   * 删除
   */
  delete(code: string) {
    return request.post<void>(`/dataRoom/map/delete/${code}`)
  },
}
