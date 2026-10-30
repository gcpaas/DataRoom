<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { ScrollbarInstance } from 'element-plus'
import { Top, CircleCloseFilled, Plus } from '@element-plus/icons-vue'
import userAvatar from '@/dataRoom/assets/xc.png'
import type { ChatMessage } from '../types'
import MessageItem from './MessageItem.vue'

const props = defineProps<{
  messages: ChatMessage[]
  running: boolean
  /** 后端配置的大模型名称，展示在输入框底部 */
  modelName?: string
}>()

const emit = defineEmits<{
  (e: 'send', text: string): void
  (e: 'abort'): void
}>()

const inputText = ref('')
const listRef = ref<ScrollbarInstance>()
const textareaRef = ref<HTMLTextAreaElement>()

/**
 * 编辑区高度随内容伸缩：超出输入盒高度时由外层 el-scrollbar 滚动（替换原生滚动条）
 */
const syncTextareaHeight = async () => {
  await nextTick()
  const textarea = textareaRef.value
  if (!textarea) {
    return
  }
  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
}

const focusTextarea = () => {
  textareaRef.value?.focus()
}

/** 输入框高度（px）：拖拽调整，限制在最小/最大值之间 */
const MIN_INPUT_HEIGHT = 96
const MAX_INPUT_HEIGHT = 320
const inputHeight = ref(120)

let dragStartY = 0
let dragStartHeight = 0

const handleDragging = (event: MouseEvent) => {
  // 向上拖拽（clientY 减小）时增大输入框高度
  const nextHeight = dragStartHeight + (dragStartY - event.clientY)
  inputHeight.value = Math.min(MAX_INPUT_HEIGHT, Math.max(MIN_INPUT_HEIGHT, nextHeight))
}

const handleDragEnd = () => {
  document.removeEventListener('mousemove', handleDragging)
  document.removeEventListener('mouseup', handleDragEnd)
  // 拖拽前已停留在底部时，结束后回吸到底部，避免输入框变高遮挡最新消息
  const wrap = listRef.value?.wrapRef
  if (wrap && wrap.scrollHeight - wrap.scrollTop - wrap.clientHeight < 40) {
    scrollToBottom()
  }
}

const handleDragStart = (event: MouseEvent) => {
  dragStartY = event.clientY
  dragStartHeight = inputHeight.value
  document.addEventListener('mousemove', handleDragging)
  document.addEventListener('mouseup', handleDragEnd)
  event.preventDefault()
}

// 组件卸载时兜底移除拖拽监听，避免全局事件泄漏
onBeforeUnmount(handleDragEnd)

const scrollToBottom = async () => {
  await nextTick()
  const scrollbar = listRef.value
  if (scrollbar?.wrapRef) {
    scrollbar.update()
    scrollbar.setScrollTop(scrollbar.wrapRef.scrollHeight)
  }
}

watch(
  () => props.messages,
  () => scrollToBottom(),
  { deep: true },
)

const handleSend = () => {
  const text = inputText.value.trim()
  if (!text || props.running) {
    return
  }
  inputText.value = ''
  // 清空后重置编辑区为单行高度
  syncTextareaHeight()
  emit('send', text)
}

const handleKeydown = (event: Event | KeyboardEvent) => {
  const keyboardEvent = event as KeyboardEvent
  // Enter 发送，Shift+Enter 换行
  if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey && !keyboardEvent.isComposing) {
    event.preventDefault()
    handleSend()
  }
}

/**
 * 回合头部（Agent 名称）显示判定：当前是 user 消息且其后存在本回合回复内容时显示。
 * 名称是回合级标识，不依附于具体消息，保证始终位于回合内容第一行。
 */
const shouldShowAgentHeader = (index: number): boolean => {
  const current = props.messages[index]
  if (!current || current.role !== 'user') {
    return false
  }
  const next = props.messages[index + 1]
  return !!next && next.role !== 'user'
}
</script>

<template>
  <section class="chat-panel">
    <div class="chat-panel__messages">
      <el-scrollbar ref="listRef" height="100%">
        <!-- 底部内边距随悬浮输入框高度联动，保证最后一条消息不被遮挡 -->
        <div class="chat-panel__messages-content" :style="{ paddingBottom: `${inputHeight + 36}px` }">
          <div v-if="messages.length === 0" class="chat-panel__welcome">
            <div class="chat-panel__welcome-title">你好，我是 DataRoom 设计助手</div>
            <div class="chat-panel__welcome-desc">描述你想要的数据大屏或仪表盘，我会帮你创建并配置页面；也可以让我修改已有的大屏或创建数据集。</div>
            <div class="chat-panel__welcome-tips">
              <div class="chat-panel__welcome-tip" @click="emit('send', '帮我创建一个销售数据大屏')">帮我创建一个销售数据大屏</div>
              <div class="chat-panel__welcome-tip" @click="emit('send', '帮我创建一个设备监控大屏')">帮我创建一个设备监控大屏</div>
              <div class="chat-panel__welcome-tip" @click="emit('send', '帮我生成10条电子产品销售额JSON数据集')">帮我生成10条电子产品销售额JSON数据集</div>
            </div>
          </div>
          <template v-for="(message, index) in messages" :key="message.id">
            <MessageItem :message="message" />
            <!-- 回合头部：紧跟用户消息之后、回合内容（文本/工具行）之前，固定显示 Agent 头像与名称 -->
            <div v-if="shouldShowAgentHeader(index)" class="chat-panel__agent-header">
              <img class="chat-panel__agent-avatar" :src="userAvatar" alt="DataRoom" />
              <span>DataRoom</span>
            </div>
          </template>
          <div v-if="running" class="chat-panel__running">正在执行…</div>
        </div>
      </el-scrollbar>
    </div>

    <div class="chat-panel__composer">
      <div class="chat-panel__drag-handle" title="拖拽调整输入框高度" @mousedown="handleDragStart">
        <span class="chat-panel__drag-bar"></span>
      </div>
      <div class="chat-panel__input-box" :style="{ height: `${inputHeight}px` }">
        <!-- 编辑区高度随内容伸缩，超出输入盒时由 el-scrollbar 滚动；点击空白区聚焦 -->
        <div class="chat-panel__editor" @click="focusTextarea">
          <el-scrollbar height="100%">
            <textarea
              ref="textareaRef"
              v-model="inputText"
              rows="1"
              class="chat-panel__textarea"
              placeholder="描述你的大屏需求，Enter 发送，Shift+Enter 换行"
              @keydown="handleKeydown"
              @input="syncTextareaHeight"
            ></textarea>
          </el-scrollbar>
        </div>
        <div class="chat-panel__input-actions">
          <!-- 上传文件入口：功能未开放，暂为禁用态 -->
          <el-tooltip content="文件上传，暂不支持" placement="top">
            <button type="button" class="chat-panel__icon-button chat-panel__upload" aria-label="文件上传，暂不支持" aria-disabled="true">
              <el-icon><Plus /></el-icon>
            </button>
          </el-tooltip>
          <div class="chat-panel__actions-right">
            <span v-if="modelName" class="chat-panel__model-name">{{ modelName }}</span>
            <button v-if="running" type="button" class="chat-panel__icon-button chat-panel__stop" title="停止" aria-label="停止" @click="emit('abort')">
              <el-icon><CircleCloseFilled /></el-icon>
            </button>
            <button v-else type="button" class="chat-panel__icon-button chat-panel__send" :disabled="!inputText.trim()" title="发送" aria-label="发送" @click="handleSend">
              <el-icon><Top /></el-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.chat-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  // 必须为 0：flex item 默认 min-height: auto，长对话的 min-content 高度会阻止收缩，
  // 导致面板被头部顶出可视区、悬浮输入框底部被 .agent-home 的 overflow:hidden 裁掉
  min-height: 0;
  min-width: 0;
  background: var(--el-bg-color);

  &__messages {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  // 两侧间距各 15%；底部内边距由内联样式按输入框高度动态覆盖
  &__messages-content {
    padding: 24px 15%;
  }

  &__welcome {
    margin: 80px auto 0;
    text-align: center;
  }

  &__welcome-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 32px;
  }

  &__welcome-desc {
    margin-top: 12px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    line-height: 24px;
  }

  &__welcome-tips {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 24px;
  }

  &__welcome-tip {
    padding: 8px 16px;
    border: 1px solid var(--el-border-color);
    border-radius: 16px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary-light-5);
      background: var(--el-color-primary-light-9);
    }
  }

  &__running {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    padding: 4px 0;
  }

  &__agent-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 22px;
  }

  &__agent-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    object-fit: fill;
    flex-shrink: 0;
  }

  // 输入区悬浮于消息区上方：容器让出两侧事件，仅拖拽条与输入盒可交互；
  // 顶部 12px（拖拽条高度）渐隐遮罩，之下完全不透明——消息滚入输入区后不再从输入框周边透出
  &__composer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0 15% 16px;
    pointer-events: none;
    background: linear-gradient(to bottom, transparent, var(--el-bg-color) 12px);
  }

  // 顶部拖拽条：上下拖拽调整输入框高度，消息区底部内边距随之联动
  &__drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 12px;
    cursor: ns-resize;
    pointer-events: auto;
  }

  &__drag-bar {
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: var(--el-border-color);
  }

  &__drag-handle:hover &__drag-bar {
    background: var(--el-border-color-darker);
  }

  // 悬浮输入盒：阴影浮起，内容滚动时从其下方穿过
  &__input-box {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color);
    border-radius: 28px;
    background: var(--el-bg-color);
    box-shadow: var(--el-box-shadow-light);
    overflow: hidden;
    pointer-events: auto;

    &:focus-within {
      border-color: var(--el-color-primary);
    }
  }

  // 编辑区滚动容器：占满输入盒剩余空间，超高时 el-scrollbar 接管滚动
  &__editor {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    cursor: text;
  }

  // 复合输入框内部编辑区：原生 textarea，高度由 JS 按内容行数驱动，自身不产生滚动条
  &__textarea {
    display: block;
    width: 100%;
    padding: 16px 16px 4px;
    border: none;
    outline: none;
    resize: none;
    overflow: hidden;
    background: transparent;
    color: var(--el-text-color-primary);
    font-family: inherit;
    font-size: 14px;
    line-height: 22px;
    box-sizing: border-box;

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }
  }

  // 底部按钮行：左侧上传入口，右侧模型名与发送/停止按钮，固定在输入盒内底部
  &__input-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding: 4px 16px 10px;
  }

  // 自定义操作按钮，不覆盖 Element Plus 内部样式
  &__icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--el-color-black);
    font-size: 18px;
    letter-spacing: 0;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;

    &:focus-visible {
      outline: 2px solid var(--el-color-primary);
      outline-offset: 2px;
    }
  }

  // 上传功能暂未开放，保留提示与悬停反馈
  &__upload {
    color: var(--el-text-color-primary);
    cursor: not-allowed;

    &:hover {
      background: var(--el-fill-color);
    }
  }

  &__send,
  &__stop {
    background: var(--el-fill-color);
  }

  &__send {
    &:not(:disabled) {
      background: var(--el-color-primary);
      color: var(--el-color-white);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__actions-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__model-name {
    padding: 5px 8px;
    border-radius: 8px;
    font-size: 14px;
    color: var(--el-text-color-primary);
    line-height: 22px;
    letter-spacing: 0;
    transition: background-color 0.2s;

    &:hover {
      background: var(--el-fill-color);
    }
  }
}
</style>
