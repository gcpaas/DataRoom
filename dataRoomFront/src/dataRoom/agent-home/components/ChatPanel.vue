<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { ScrollbarInstance } from 'element-plus'
import { Promotion, CircleClose } from '@element-plus/icons-vue'
import userAvatar from '@/dataRoom/layout/assets/image/user.png'
import type { ChatMessage } from '../types'
import MessageItem from './MessageItem.vue'

const props = defineProps<{
  messages: ChatMessage[]
  running: boolean
}>()

const emit = defineEmits<{
  (e: 'send', text: string): void
  (e: 'abort'): void
}>()

const inputText = ref('')
const listRef = ref<ScrollbarInstance>()

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
        <div class="chat-panel__messages-content">
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
              <img class="chat-panel__agent-avatar" :src="userAvatar" alt="小创" />
              <span>小创</span>
            </div>
          </template>
          <div v-if="running" class="chat-panel__running">正在执行…</div>
        </div>
      </el-scrollbar>
    </div>

    <div class="chat-panel__input-area">
      <el-input v-model="inputText" type="textarea" :rows="3" resize="none" placeholder="描述你的大屏需求，Enter 发送，Shift+Enter 换行" @keydown="handleKeydown" />
      <div class="chat-panel__input-actions">
        <el-button v-if="running" :icon="CircleClose" @click="emit('abort')">停止</el-button>
        <el-button type="primary" :icon="Promotion" :disabled="running || !inputText.trim()" @click="handleSend"> 发送 </el-button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.chat-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-width: 0;
  background: var(--el-bg-color);

  &__messages {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  &__messages-content {
    padding: 24px 100px;
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
    object-fit: cover;
    flex-shrink: 0;
  }

  &__input-area {
    padding: 12px 100px 16px;
    background: var(--el-bg-color);
  }

  &__input-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
}
</style>
