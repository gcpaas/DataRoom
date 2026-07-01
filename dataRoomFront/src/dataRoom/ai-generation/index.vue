<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import { getCookie } from '@/dataRoom/utils/cookie'
import { aiGenerationActions, formatMcpConfig } from './ai-generation-content'

const mcpServerUrl = computed(() => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
  return `${apiBaseUrl.replace(/\/$/, '')}/mcp/sse`
})

const formattedMcpConfig = computed(() => formatMcpConfig(mcpServerUrl.value, getCookie() || '登录后的Token'))

const actions = computed(() =>
  aiGenerationActions.map((action) => ({
    ...action,
    content: action.title === '配置 MCP Server' ? formattedMcpConfig.value : action.content,
  })),
)

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败,请手动复制')
  }
}
</script>

<template>
  <div class="dr-ai-generation">
    <header class="dr-ai-generation__header">
      <h2 class="dr-ai-generation__title">AI生成接入</h2>
      <p class="dr-ai-generation__desc">按以下配置安装 DataRoom 页面生成 Skill，并把当前服务接入到 MCP Server</p>
    </header>

    <section v-for="action in actions" :key="action.title" class="dr-ai-generation__section">
      <div class="dr-ai-generation__section-header">
        <div>
          <h3 class="dr-ai-generation__section-title">{{ action.title }}</h3>
          <p class="dr-ai-generation__section-desc">{{ action.desc }}</p>
        </div>
        <el-button :icon="CopyDocument" @click="copyText(action.content)">复制</el-button>
      </div>
      <pre class="dr-ai-generation__code"><code>{{ action.content }}</code></pre>
    </section>
  </div>
</template>

<style scoped lang="scss">
.dr-ai-generation {
  min-height: 100%;
  box-sizing: border-box;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 24px;

  &__header {
    padding-bottom: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__title {
    margin: 0 0 8px;
    font-size: 24px;
    line-height: 1.25;
    font-weight: 600;
    color: var(--el-text-color-primary);
    letter-spacing: 0;
  }

  &__desc {
    margin: 0;
    font-size: 14px;
    line-height: 1.57;
    font-weight: 400;
    color: var(--el-text-color-secondary);
    letter-spacing: 0;
  }

  &__section {
    padding: 24px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }
  }

  &__section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }

  &__section-title {
    margin: 0 0 4px;
    font-size: 20px;
    line-height: 1.3;
    font-weight: 600;
    color: var(--el-text-color-primary);
    letter-spacing: 0;
  }

  &__section-desc {
    margin: 0;
    font-size: 14px;
    line-height: 1.57;
    font-weight: 400;
    color: var(--el-text-color-secondary);
    letter-spacing: 0;
  }

  &__code {
    margin: 0;
    overflow: auto;
    padding: 16px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    color: var(--el-text-color-primary);
    font-family: 'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
    font-size: 13px;
    line-height: 1.5;
    letter-spacing: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
