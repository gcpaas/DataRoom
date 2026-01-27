import request from '@/dataroom-packages/_common/_request'
import type {PageStageEntity} from "@/dataroom-packages/page/type/PageStageEntity.ts";

/**
 * 页面实体接口
 */
export interface PageEntity {
  id?: string
  code: string
  name: string
  pageType: string
  pageStatus?: string
  thumbnail?: string
  parentCode?: string
  createDate?: string
  updateDate?: string
  remark?: string
}

/**
 * 发布参数
 */
export interface PagePublishDto {
  pageCode: string
  remark: string
}

/**
 * 取消发布参数
 */
export interface PageOfflineDto {
  code: string
  remark: string
}

/**
 * 页面管理 API
 */
export const pageApi = {
  /**
   * 获取页面列表
   */
  list(params?: { name?: string; parentCode?: string }) {
    return request.get<PageEntity[]>('/dataRoom/page/list', params)
  },

  /**
   * 获取页面详情
   */
  detail(code: string) {
    return request.get<PageEntity>(`/dataRoom/page/detail/${code}`)
  },

  /**
   * 新增页面
   */
  insert(data: PageEntity) {
    return request.post<string>('/dataRoom/page/insert', data)
  },

  /**
   * 更新页面
   */
  update(data: PageEntity) {
    return request.post<string>('/dataRoom/page/update', data)
  },

  /**
   * 发布页面
   */
  publish(data: PagePublishDto) {
    return request.post<string>('/dataRoom/page/publish', data)
  },

  /**
   * 取消发布
   */
  offline(data: PageOfflineDto) {
    return request.post<void>('/dataRoom/page/offline', data)
  },

  /**
   * 删除页面
   */
  delete(code: string) {
    return request.post<void>(`/dataRoom/page/delete/${code}`)
  },

  /**
   * 获取页面详情
   */
  getPageConfig(code: string, pageStatus: string) {
    return request.get<PageStageEntity>(`/dataRoom/page/getPageConfig/${code}/${pageStatus}`)
  },
  /**
   * 更新页面配置
   * @param data
   */
  updatePageConfig(data: PageStageEntity) {
    return request.post<boolean>('/dataRoom/page/updatePageConfig', data)
  },
  /**
   * 更新页面配置，用于预览
   * @param data
   */
  updatePageConfig4Preview(data: PageStageEntity) {
    return request.post<boolean>('/dataRoom/page/updatePageConfig4Preview', data)
  },
}
