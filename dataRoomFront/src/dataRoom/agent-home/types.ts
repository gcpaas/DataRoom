/**
 * Agent 对话首页类型定义
 */

/** 任务列表项（对应后端 dr_agent_task） */
export interface AgentTask {
  id?: string
  threadId: string
  title: string
  transcript?: string
  createDate?: string
  updateDate?: string
}

/** 大屏操作结果（结果卡片数据） */
export interface PageResult {
  /** created=新建 updated=修改 */
  action: 'created' | 'updated'
  pageCode: string
  pageName?: string
  pageType?: string
}

/** 对话消息（UI 层，独立于 AG-UI 协议消息，用于渲染与持久化） */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  /** 思考过程（可折叠展示） */
  reasoning?: string
  /** 工具名称（role=tool 时存在） */
  toolName?: string
  /** 工具执行状态 */
  toolStatus?: 'running' | 'success' | 'error'
  /** 关联的大屏结果卡片 */
  pageResult?: PageResult
}
