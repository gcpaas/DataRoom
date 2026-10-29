<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, CircleCheck, CircleClose, Tools, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import type { ChatMessage } from '../types'
import PageResultCard from './PageResultCard.vue'
import { renderMarkdown } from '../chat/markdown'
import { toolDisplayName } from '../chat/tool-names'

const props = defineProps<{
  message: ChatMessage
}>()

const reasoningExpanded = ref(false)

/** assistant 消息内容按 Markdown 渲染（渲染器已禁用原始 HTML，防注入） */
const renderedContent = computed(() => renderMarkdown(props.message.content))

/** 复制代码块文本，使用事件委托兼容 v-html 生成的动态节点。 */
const copyCode = async (event: MouseEvent) => {
  const target = event.target
  if (!(target instanceof Element)) {
    return
  }
  const button = target.closest<HTMLButtonElement>('[data-copy-code]')
  if (!button) {
    return
  }
  const code = button.parentElement?.querySelector('pre code')?.textContent ?? ''
  if (!code) {
    return
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code)
    } else {
      // 内网 HTTP 页面可能没有 Clipboard API，兼容旧式复制并检查实际返回值。
      const activeElement = document.activeElement
      const textarea = document.createElement('textarea')
      textarea.value = code
      textarea.readOnly = true
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      try {
        textarea.select()
        if (!document.execCommand('copy')) {
          throw new Error('浏览器未允许复制')
        }
      } finally {
        textarea.remove()
        if (activeElement instanceof HTMLElement) {
          activeElement.focus({ preventScroll: true })
        }
      }
    }
    ElMessage.success('代码已复制')
  } catch (error) {
    console.error('复制代码失败', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

/** 工具行显示名（英文工具名映射为中文） */
const displayToolName = computed(() => toolDisplayName(props.message.toolName))
</script>

<template>
  <div class="message-item" :class="`message-item--${message.role}`">
    <!-- 用户消息 -->
    <template v-if="message.role === 'user'">
      <div class="message-item__bubble message-item__bubble--user">{{ message.content }}</div>
    </template>

    <!-- 工具调用 -->
    <template v-else-if="message.role === 'tool'">
      <div class="message-item__tool">
        <el-icon v-if="message.toolStatus === 'running'" class="is-loading"><Loading /></el-icon>
        <el-icon v-else-if="message.toolStatus === 'error'" class="tool-status--error">
          <CircleClose />
        </el-icon>
        <el-icon v-else class="message-item__tool-done"><CircleCheck /></el-icon>
        <el-icon><Tools /></el-icon>
        <span class="message-item__tool-name">{{ displayToolName }}</span>
        <span class="message-item__tool-status">
          {{ message.toolStatus === 'running' ? '执行中' : message.toolStatus === 'error' ? '失败' : '完成' }}
        </span>
      </div>
      <PageResultCard v-if="message.pageResult" :result="message.pageResult" />
    </template>

    <!-- 助手消息：纯文本流，无气泡；同一回合的多段文本在视觉上连成整体 -->
    <template v-else>
      <div v-if="message.reasoning" class="message-item__reasoning">
        <div class="message-item__reasoning-header" @click="reasoningExpanded = !reasoningExpanded">
          <span>思考过程</span>
          <el-icon><ArrowUp v-if="reasoningExpanded" /><ArrowDown v-else /></el-icon>
        </div>
        <div v-show="reasoningExpanded" class="message-item__reasoning-content">
          {{ message.reasoning }}
        </div>
      </div>
      <div v-if="message.content" class="message-item__text" @click="copyCode" v-html="renderedContent"></div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.message-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  &--user {
    align-items: flex-end;
  }

  &--assistant,
  &--tool {
    align-items: stretch;
  }

  // 同一回合内连续的 assistant 文本/工具行收紧间距，形成一个整体回复区
  &--assistant + &--assistant,
  &--assistant + &--tool,
  &--tool + &--assistant,
  &--tool + &--tool {
    margin-top: -8px;
  }

  &__bubble {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 22px;
    white-space: pre-wrap;
    word-break: break-word;

    &--user {
      color: var(--el-color-white);
      background: var(--el-color-primary);
      border-bottom-right-radius: 2px;
    }
  }

  &__text {
    font-size: 14px;
    line-height: 24px;
    color: var(--el-text-color-primary);
    word-break: break-word;

    // Markdown 渲染内容排版（仅针对渲染产物的原生标签，不涉及组件内部样式）
    :deep(p) {
      margin: 6px 0;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin: 12px 0 6px;
      font-weight: 600;
      line-height: 1.4;
      color: var(--el-text-color-primary);
    }

    :deep(h1) {
      font-size: 18px;
    }

    :deep(h2) {
      font-size: 16px;
    }

    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      font-size: 14px;
    }

    :deep(ul),
    :deep(ol) {
      margin: 6px 0;
      padding-left: 22px;
    }

    :deep(li) {
      margin: 2px 0;
    }

    :deep(code) {
      font-family: monospace;
      font-size: 13px;
      padding: 1px 5px;
      border-radius: 4px;
      background: var(--el-fill-color-light);
    }

    :deep(pre) {
      margin: 8px 0;
      padding: 10px 12px;
      border-radius: 6px;
      // 语法配色沿用 highlight.js 内置主题，容器背景由外层统一承载。
      overflow-x: auto;

      code {
        padding: 0;
        background: transparent;
      }
    }

    :deep(.markdown-code-block) {
      position: relative;
      margin: 8px 0;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
      background: var(--el-fill-color-light);
      overflow: hidden;

      pre {
        margin: 0;
        padding-top: 38px;
        background: transparent;
      }
    }

    :deep(.markdown-code-block__language) {
      position: absolute;
      top: 6px;
      left: 12px;
      right: 46px;
      height: 26px;
      line-height: 26px;
      font-size: 12px;
      font-weight: 500;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :deep(.markdown-code-block__copy) {
      position: absolute;
      top: 6px;
      right: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      padding: 5px;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 4px;
      background: var(--el-bg-color);
      color: var(--el-text-color-secondary);
      cursor: pointer;

      &:hover,
      &:focus-visible {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);
      }

      svg {
        width: 16px;
        height: 16px;
      }
    }

    :deep(blockquote) {
      margin: 8px 0;
      padding: 2px 12px;
      border-left: 3px solid var(--el-border-color);
      color: var(--el-text-color-secondary);
    }

    :deep(table) {
      margin: 8px 0;
      border-collapse: collapse;

      th,
      td {
        padding: 4px 10px;
        border: 1px solid var(--el-border-color-lighter);
      }

      th {
        background: var(--el-fill-color-light);
      }
    }

    :deep(a) {
      color: var(--el-color-primary);
      text-decoration: none;
    }

    :deep(hr) {
      margin: 10px 0;
      border: none;
      border-top: 1px solid var(--el-border-color-lighter);
    }

    :deep(> :first-child) {
      margin-top: 0;
    }

    :deep(> :last-child) {
      margin-bottom: 0;
    }
  }

  &__tool {
    display: flex;
    align-items: center;
    align-self: flex-start;
    gap: 6px;
    padding: 2px 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__tool-name {
    font-family: monospace;
  }

  &__tool-done {
    color: var(--el-color-success);
  }

  &__reasoning {
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__reasoning-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 2px 0;
    cursor: pointer;
  }

  &__reasoning-content {
    padding: 2px 0 4px;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.tool-status--error {
  color: var(--el-color-danger);
}
</style>
