<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import TaskSidebar from './components/TaskSidebar.vue'
import ChatPanel from './components/ChatPanel.vue'
import { AgentChatClient, extractPageResult } from './chat/AgentChatClient'
import { agentTaskApi } from './api'
import { pageApi } from '@/dataRoom/page/api'
import type { AgentTask, ChatMessage, PageResult } from './types'

const router = useRouter()

const tasks = ref<AgentTask[]>([])
const sidebarLoading = ref(false)
const currentThreadId = ref('')
const messages = ref<ChatMessage[]>([])
const running = ref(false)

let chatClient: AgentChatClient | null = null
/** 本次运行各工具调用的入参（toolCallId -> args） */
let pendingToolArgs = new Map<string, { toolName: string; args: Record<string, unknown> }>()

const loadTasks = async () => {
  sidebarLoading.value = true
  try {
    tasks.value = await agentTaskApi.list()
  } catch (error) {
    console.error('加载任务列表失败:', error)
  } finally {
    sidebarLoading.value = false
  }
}

onMounted(loadTasks)

const handleNewTask = () => {
  if (running.value) {
    ElMessage.warning('当前任务正在执行，请先停止')
    return
  }
  currentThreadId.value = ''
  messages.value = []
}

const handleSelectTask = async (task: AgentTask) => {
  if (running.value) {
    ElMessage.warning('当前任务正在执行，请先停止')
    return
  }
  try {
    const detail = await agentTaskApi.detail(task.threadId)
    currentThreadId.value = detail.threadId
    messages.value = parseTranscript(detail.transcript)
  } catch (error) {
    console.error('加载任务详情失败:', error)
  }
}

const handleRenameTask = async (task: AgentTask) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入任务名称', '重命名任务', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: task.title,
      inputPattern: /\S+/,
      inputErrorMessage: '名称不能为空',
    })
    await agentTaskApi.rename(task.threadId, value)
    ElMessage.success('已重命名')
    await loadTasks()
  } catch (error) {
    if (!isMessageBoxCancel(error)) {
      console.error('重命名失败:', error)
    }
  }
}

const handleDeleteTask = async (task: AgentTask) => {
  try {
    await ElMessageBox.confirm(`确定删除任务「${task.title}」吗？对话记录将一并删除。`, '删除任务', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await agentTaskApi.delete(task.threadId)
    ElMessage.success('已删除')
    if (currentThreadId.value === task.threadId) {
      handleNewTask()
    }
    await loadTasks()
  } catch (error) {
    if (!isMessageBoxCancel(error)) {
      console.error('删除失败:', error)
    }
  }
}

const handleOpenConsole = () => {
  // 新窗口打开设计器，保留当前 Agent 会话页（Hash 路由下 router.resolve 会生成完整 # 路径）
  const { href } = router.resolve('/dataRoom/page/index')
  window.open(href, '_blank')
}

const isMessageBoxCancel = (error: unknown) => error === 'cancel' || error === 'close'

const parseTranscript = (transcript?: string): ChatMessage[] => {
  if (!transcript) {
    return []
  }
  try {
    const parsed = JSON.parse(transcript)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const handleSend = async (text: string) => {
  const isNewTask = !currentThreadId.value
  if (isNewTask) {
    currentThreadId.value = uuidv4()
  }
  const threadId = currentThreadId.value
  messages.value.push({ id: uuidv4(), role: 'user', content: text })
  // 立即创建回复占位消息：Agent 名称头部与执行状态即时可见，不等首个文本增量
  messages.value.push({ id: uuidv4(), role: 'assistant', content: '' })
  const placeholderIndex = messages.value.length - 1
  let placeholderUsed = false
  running.value = true
  pendingToolArgs = new Map()

  /** AG-UI messageId -> 消息下标：一次运行可能产生多条 assistant 消息（推理-工具-再推理），必须按 messageId 分流 */
  const assistantIndexes = new Map<string, number>()
  /** toolCallId -> 消息在 messages 中的下标（通过响应式代理更新，保证流式渲染） */
  const toolMessageIndexes = new Map<string, number>()
  /** 进行中的页面元信息补全请求，持久化前需等待完成 */
  const pendingFills: Promise<void>[] = []

  /** 按 messageId 定位 assistant 消息：首个文本/思考增量复用占位消息，其余新建，返回其下标 */
  const ensureAssistantIndex = (messageId: string): number => {
    let index = assistantIndexes.get(messageId)
    if (index === undefined) {
      if (!placeholderUsed) {
        index = placeholderIndex
        placeholderUsed = true
      } else {
        messages.value.push({ id: uuidv4(), role: 'assistant', content: '' })
        index = messages.value.length - 1
      }
      assistantIndexes.set(messageId, index)
    }
    return index
  }

  chatClient = new AgentChatClient(threadId)
  try {
    await chatClient.run(text, {
      onTextDelta: (messageId, delta) => {
        messages.value[ensureAssistantIndex(messageId)]!.content += delta
      },
      onReasoningDelta: (messageId, delta) => {
        const current = messages.value[ensureAssistantIndex(messageId)]!
        current.reasoning = (current.reasoning || '') + delta
      },
      onToolCallStart: (toolCallId, toolName) => {
        messages.value.push({
          id: uuidv4(),
          role: 'tool',
          content: '',
          toolName,
          toolStatus: 'running',
        })
        toolMessageIndexes.set(toolCallId, messages.value.length - 1)
      },
      onToolCallEnd: (toolCallId, toolName, args) => {
        pendingToolArgs.set(toolCallId, { toolName, args })
      },
      onToolCallResult: (toolCallId, content) => {
        const messageIndex = toolMessageIndexes.get(toolCallId)
        if (messageIndex === undefined) {
          return
        }
        const toolMessage = messages.value[messageIndex]
        if (!toolMessage) {
          return
        }
        toolMessage.toolStatus = 'success'
        const pending = pendingToolArgs.get(toolCallId)
        if (!pending) {
          return
        }
        const pageResult = extractPageResult(pending.toolName, pending.args, content)
        if (!pageResult) {
          return
        }
        // 先补全页面名称/类型再挂载卡片，避免异步回写丢失响应式
        pendingFills.push(
          fillPageMeta(pageResult).then(() => {
            toolMessage.pageResult = pageResult
          }),
        )
      },
      onError: (message) => {
        // 错误文本复用占位消息（本回合尚无文本输出时），保持回合内容聚合
        const index = ensureAssistantIndex('run-error')
        const current = messages.value[index]!
        current.content = current.content
          ? `${current.content}\n执行出错：${message}`
          : `执行出错：${message}`
      },
    })
  } catch (error) {
    // 用户主动停止或网络异常
    const message = error instanceof Error ? error.message : String(error)
    if (!message.toLowerCase().includes('abort')) {
      const index = ensureAssistantIndex('run-failed')
      messages.value[index]!.content = `请求失败：${message}`
    }
  } finally {
    running.value = false
    for (const index of toolMessageIndexes.values()) {
      const toolMessage = messages.value[index]
      if (toolMessage && toolMessage.toolStatus === 'running') {
        toolMessage.toolStatus = 'error'
      }
    }
    await Promise.allSettled(pendingFills)
    await persistTask(threadId, text, isNewTask)
    await loadTasks()
  }
}

const handleAbort = () => {
  chatClient?.abort()
}

/**
 * 补全结果卡片的页面名称与类型（updatePageConfig 入参只有 pageCode）
 */
const fillPageMeta = async (pageResult: PageResult) => {
  if (pageResult.pageName && pageResult.pageType) {
    return
  }
  try {
    const detail = await pageApi.detail(pageResult.pageCode)
    pageResult.pageName = pageResult.pageName || detail.name
    pageResult.pageType = pageResult.pageType || detail.pageType
  } catch (error) {
    console.error('查询页面详情失败:', error)
  }
}

/**
 * 持久化任务：新建任务先建档，再保存对话记录（包含工具结果卡片）
 */
const persistTask = async (threadId: string, firstText: string, isNewTask: boolean) => {
  try {
    if (isNewTask) {
      await agentTaskApi.create({ threadId, title: firstText.slice(0, 30) })
    }
    await agentTaskApi.save({
      threadId,
      transcript: JSON.stringify(messages.value),
    })
  } catch (error) {
    console.error('保存任务失败:', error)
  }
}
</script>

<template>
  <div class="agent-home">
    <TaskSidebar
      :tasks="tasks"
      :current-thread-id="currentThreadId"
      :loading="sidebarLoading"
      @new-task="handleNewTask"
      @select="handleSelectTask"
      @rename="handleRenameTask"
      @delete="handleDeleteTask"
      @open-console="handleOpenConsole"
    />
    <ChatPanel :messages="messages" :running="running" @send="handleSend" @abort="handleAbort" />
  </div>
</template>

<style scoped lang="scss">
.agent-home {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: var(--el-bg-color-page);
}
</style>
