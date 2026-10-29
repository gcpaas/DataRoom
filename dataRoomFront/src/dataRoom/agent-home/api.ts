import request from '@/dataRoom/utils/request'
import type { AgentTask } from './types'

/**
 * Agent 对话任务 API
 */
export const agentTaskApi = {
  /**
   * 当前用户的任务列表
   */
  list() {
    return request.get<AgentTask[]>('/dataRoom/agent/task/list')
  },

  /**
   * 新建任务
   */
  create(data: { threadId: string; title: string }) {
    return request.post<AgentTask>('/dataRoom/agent/task/create', data)
  },

  /**
   * 任务详情（含对话记录）
   */
  detail(threadId: string) {
    return request.get<AgentTask>(`/dataRoom/agent/task/detail/${threadId}`)
  },

  /**
   * 保存任务元信息与整段对话记录
   */
  save(data: Partial<AgentTask> & { threadId: string }) {
    return request.post<boolean>('/dataRoom/agent/task/save', data)
  },

  /**
   * 重命名任务
   */
  rename(threadId: string, title: string) {
    return request.post<boolean>('/dataRoom/agent/task/rename', { threadId, title })
  },

  /**
   * 删除任务
   */
  delete(threadId: string) {
    return request.post<boolean>(`/dataRoom/agent/task/delete/${threadId}`)
  },
}
