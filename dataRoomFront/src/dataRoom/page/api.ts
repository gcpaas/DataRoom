import request from '@/dataRoom/utils/request'
import type { PageHistoryRemark } from '@/dataRoom/designer/utils/page-history-remark.ts'
import type {PageStageEntity} from "@/dataRoom/page/type/PageStageEntity.ts";

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

export interface PageThumbnailUpdateDto {
  code: string
  thumbnail: string
}

export interface PageVo<T> {
  total: number
  size: number
  current: number
  data: T[]
}

export interface PageHistoryBackupDto {
  pageCode: string
  remark: PageHistoryRemark | string
  pageType: PageStageEntity['pageType']
  pageConfig: PageStageEntity['pageConfig']
}

export interface PageHistoryRemarkDto {
  id: string
  remark: string
}

export interface PageHistoryListParams {
  code: string
  pageStatus?: PageStageEntity['pageStatus']
  startDate?: string
  endDate?: string
  current?: number
  size?: number
}

export type PageHistoryItem = Omit<PageStageEntity, 'pageConfig'> & {
  pageConfig?: PageStageEntity['pageConfig']
}

export interface PageShareVo {
  pageCode: string
  pageType?: string
  enabled: boolean
  expireTime?: string | null
  ipWhitelist?: string
  token?: string
  shareUrl?: string
  created?: boolean
}

export interface PageShareSaveDto {
  pageCode: string
  enabled: boolean
  expireTime?: string | null
  ipWhitelist?: string
  refreshToken: boolean
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
  /**
   * 修改页面名称
   * @param code 页面编码
   * @param name 新名称
   */
  updateName(code: string, name: string) {
    return request.post<boolean>('/dataRoom/page/updateName', { code, name })
  },

  updateThumbnail(data: PageThumbnailUpdateDto) {
    return request.post<boolean>('/dataRoom/page/updateThumbnail', data)
  },

  historyBackup(data: PageHistoryBackupDto) {
    return request.post<string>('/dataRoom/page/history/backup', data)
  },

  historyList(params: PageHistoryListParams) {
    return request.get<PageVo<PageHistoryItem>>('/dataRoom/page/stage/list', params)
  },

  historyRollback(id: string) {
    return request.post<string>(`/dataRoom/page/history/rollback/${id}`)
  },

  historyDelete(id: string) {
    return request.post<string>(`/dataRoom/page/history/delete/${id}`)
  },

  historyRemark(data: PageHistoryRemarkDto) {
    return request.post<string>('/dataRoom/page/history/remark', data)
  },

  shareDetail(pageCode: string) {
    return request.get<PageShareVo>(`/dataRoom/page/share/detail/${encodeURIComponent(pageCode)}`)
  },

  shareSave(data: PageShareSaveDto) {
    return request.post<PageShareVo>('/dataRoom/page/share/save', data)
  },
}
