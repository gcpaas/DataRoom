import { HttpAgent, type HttpAgentFetchFn } from '@ag-ui/client'
import type { ToolCallResultEvent } from '@ag-ui/core'
import { v4 as uuidv4 } from 'uuid'
import { getCookie, getCookieName } from '@/dataRoom/utils/cookie'
import type { PageResult } from '../types'

/**
 * Agent 对话运行回调
 */
export interface AgentRunCallbacks {
  /** 文本增量（assistant 消息，按 messageId 区分一次运行中的多条消息） */
  onTextDelta: (messageId: string, delta: string) => void
  /** 思考内容增量（按 messageId 区分） */
  onReasoningDelta: (messageId: string, delta: string) => void
  /** 工具调用开始 */
  onToolCallStart: (toolCallId: string, toolName: string) => void
  /** 工具调用参数就绪（可读取完整入参） */
  onToolCallEnd: (toolCallId: string, toolName: string, args: Record<string, unknown>) => void
  /** 工具执行结果 */
  onToolCallResult: (toolCallId: string, content: string) => void
  /** 运行失败 */
  onError: (message: string) => void
}

/**
 * AG-UI 服务端在 interrupt 上会序列化出 "expiresAt":null，客户端 schema 仅接受 string 或缺省，
 * 这里在 SSE 字节流进入解析前将其剔除（带跨块缓冲，避免片段被 chunk 边界切开）。
 */
const NULL_EXPIRES_PATTERN = /"expiresAt":null\s*,?\s*/g
const CARRY_LENGTH = 32

const sanitizingFetch: HttpAgentFetchFn = async (url, requestInit) => {
  const response = await fetch(url, requestInit)
  if (!response.body) {
    return response
  }
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let carry = ''
  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      const text = carry + decoder.decode(chunk, { stream: true })
      // 保留末尾一小段，处理跨块的关键字片段
      const safeLength = Math.max(0, text.length - CARRY_LENGTH)
      const safe = text.slice(0, safeLength)
      carry = text.slice(safeLength)
      if (safe) {
        controller.enqueue(encoder.encode(safe.replace(NULL_EXPIRES_PATTERN, '')))
      }
    },
    flush(controller) {
      if (carry) {
        controller.enqueue(encoder.encode(carry.replace(NULL_EXPIRES_PATTERN, '')))
        carry = ''
      }
    },
  })
  return new Response(response.body.pipeThrough(transform), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}

/**
 * AG-UI 客户端封装。
 * 每次运行创建新的 HttpAgent 实例，仅携带本轮用户消息；
 * 会话上下文由后端 server-side-memory 按 threadId 维持。
 */
export class AgentChatClient {
  private readonly threadId: string
  private activeAgent: HttpAgent | null = null

  constructor(threadId: string) {
    this.threadId = threadId
  }

  /**
   * 发起一轮对话
   * @param text 用户输入
   * @param callbacks 流式事件回调
   */
  async run(text: string, callbacks: AgentRunCallbacks): Promise<void> {
    const headers: Record<string, string> = {}
    const tokenValue = getCookie()
    if (tokenValue) {
      headers[getCookieName()] = tokenValue
    }
    const agent = new HttpAgent({
      url: `${import.meta.env.VITE_API_BASE_URL}/agui/run`,
      headers,
      threadId: this.threadId,
      fetch: sanitizingFetch,
    })
    this.activeAgent = agent
    agent.setMessages([{ id: uuidv4(), role: 'user', content: text }])

    const toolNames = new Map<string, string>()
    await agent.runAgent(
      { runId: uuidv4() },
      {
        onTextMessageContentEvent: ({ event }) => {
          if (event.delta) {
            callbacks.onTextDelta(event.messageId, event.delta)
          }
        },
        onReasoningMessageContentEvent: ({ event }) => {
          const delta = (event as { delta?: string }).delta
          if (delta) {
            callbacks.onReasoningDelta(event.messageId, delta)
          }
        },
        onToolCallStartEvent: ({ event }) => {
          toolNames.set(event.toolCallId, event.toolCallName)
          callbacks.onToolCallStart(event.toolCallId, event.toolCallName)
        },
        onToolCallEndEvent: ({ event, toolCallArgs }) => {
          const name = toolNames.get(event.toolCallId) || ''
          callbacks.onToolCallEnd(event.toolCallId, name, toolCallArgs || {})
        },
        onToolCallResultEvent: ({ event }) => {
          callbacks.onToolCallResult(event.toolCallId, extractToolResultText(event))
        },
        onRunErrorEvent: ({ event }) => {
          callbacks.onError(event.message || '运行失败')
        },
      },
    )
  }

  /**
   * 中断当前运行
   */
  abort() {
    this.activeAgent?.abortRun()
  }
}

/**
 * 从 TOOL_CALL_RESULT 事件中提取文本内容
 */
function extractToolResultText(event: ToolCallResultEvent): string {
  const content = event.content
  if (typeof content === 'string') {
    return content
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => (part && part.type === 'text' ? (part as { text?: string }).text || '' : ''))
      .join('')
  }
  return ''
}

/**  Resp 包装的工具结果 JSON */
interface ToolRespPayload<T> {
  code?: number
  data?: T
  message?: string
}

/**
 * 从工具调用中解析大屏操作结果。
 * newPage：结果 data 含 id/code，入参 pageEntity 含 name/pageType。
 * updatePageConfig：入参 pageStage 含 pageCode。
 */
export function extractPageResult(
  toolName: string,
  args: Record<string, unknown>,
  resultText: string,
): PageResult | null {
  if (toolName === 'newPage') {
    const resp = parseResp<{ id?: string; code?: string }>(resultText)
    const pageCode = resp?.data?.code
    if (!pageCode) {
      return null
    }
    const pageEntity = (args.pageEntity || {}) as { name?: string; pageType?: string }
    return {
      action: 'created',
      pageCode,
      pageName: pageEntity.name,
      pageType: pageEntity.pageType,
    }
  }
  if (toolName === 'updatePageConfig') {
    const resp = parseResp<boolean>(resultText)
    if (!resp || resp.code !== 200) {
      return null
    }
    const pageStage = (args.pageStage || {}) as { pageCode?: string }
    if (!pageStage.pageCode) {
      return null
    }
    return { action: 'updated', pageCode: pageStage.pageCode }
  }
  return null
}

function parseResp<T>(text: string): ToolRespPayload<T> | null {
  if (!text) {
    return null
  }
  try {
    const parsed = JSON.parse(text) as ToolRespPayload<T>
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}
