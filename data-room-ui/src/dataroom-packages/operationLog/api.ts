import request from '@/dataroom-packages/_common/_request'

export type OperationLogResultStatus = 'SUCCESS' | 'FAILURE'

export interface OperationLogEntity {
  id?: string
  operatorId?: string
  operatorName?: string
  operatorRole?: string
  targetType?: string
  targetId?: string
  targetName?: string
  actionType?: string
  actionDesc?: string
  businessType?: string
  businessName?: string
  requestUri?: string
  requestMethod?: string
  clientIp?: string
  resultStatus?: OperationLogResultStatus | string
  responseCode?: number
  responseMessage?: string
  requestTime?: string
  durationMs?: number
  createDate?: string
}

export interface OperationLogQueryDTO {
  keyword?: string
  resultStatus?: OperationLogResultStatus | ''
  current?: number
  size?: number
}

export interface PageVo<T> {
  total: number
  size: number
  current: number
  data: T[]
}

export const operationLogApi = {
  page(params?: OperationLogQueryDTO) {
    return request.get<PageVo<OperationLogEntity>>('/dataRoom/operationLog/page', params)
  },
}
