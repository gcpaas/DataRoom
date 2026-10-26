<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import request from '@/dataRoom/utils/request'
import {
  aiGenerationActions,
  formatMcpConfig,
  resolveMcpServerUrl,
  resolveMcpTokenExpiry,
  toMcpTokenRecord,
  type McpTokenCreateRequest,
  type McpTokenCreateResponse,
  type McpTokenEntity,
  type McpTokenValidity,
} from './ai-generation-content'

const mcpTokenApi = {
  list: () => request.get<McpTokenEntity[]>('/dataRoom/mcpToken/list'),
  add: (data: McpTokenCreateRequest) => request.post<McpTokenCreateResponse>('/dataRoom/mcpToken/add', data),
  delete: (id: string) => request.post<void>(`/dataRoom/mcpToken/delete/${encodeURIComponent(id)}`),
}

const tokens = ref<McpTokenEntity[]>([])
const loading = ref(false)
const loadFailed = ref(false)
const creating = ref(false)
const deletingId = ref<string | null>(null)
const createDialogVisible = ref(false)
const createdToken = ref('')
const form = reactive<{ name: string; validity: McpTokenValidity; customDate: Date | null }>({ name: '', validity: 30, customDate: null })
let disposed = false

const loadTokens = async () => {
  if (loading.value || creating.value || deletingId.value !== null) return
  loading.value = true
  loadFailed.value = false
  try {
    tokens.value = (await mcpTokenApi.list()).map(toMcpTokenRecord)
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  form.name = ''
  form.validity = 30
  form.customDate = null
  createdToken.value = ''
  createDialogVisible.value = true
}

const closeCreateDialog = () => {
  if (creating.value) return
  createdToken.value = ''
  createDialogVisible.value = false
}

const createToken = async () => {
  if (creating.value || createdToken.value || loading.value || deletingId.value !== null) return
  const name = form.name.trim()
  if (!name) {
    ElMessage.warning('请输入令牌名称')
    return
  }
  let expireTime: string
  try {
    expireTime = resolveMcpTokenExpiry(form.validity, form.customDate)
  } catch {
    ElMessage.warning('请选择未来的有效期')
    return
  }
  creating.value = true
  try {
    const result = await mcpTokenApi.add({ name, expireTime })
    if (disposed) return
    createdToken.value = result.token
    tokens.value = [toMcpTokenRecord(result), ...tokens.value]
    ElMessage.success('令牌已创建，请立即复制保存')
  } catch {
    // 请求封装统一提示错误；不要记录可能包含令牌的响应。
  } finally {
    creating.value = false
  }
}

const deleteToken = async (id: string, name: string) => {
  if (deletingId.value !== null || loading.value || creating.value) return
  deletingId.value = id
  try {
    await ElMessageBox.confirm(`删除令牌「${name}」后，使用它的 MCP 客户端将无法继续访问。是否删除？`, '删除 MCP令牌', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await mcpTokenApi.delete(id)
    tokens.value = tokens.value.filter((item) => item.id !== id)
    ElMessage.success('令牌已删除')
  } catch {
    // 取消删除无需提示，接口错误由请求封装处理。
  } finally {
    deletingId.value = null
  }
}

const disablePastDate = (date: Date) => date.getTime() < new Date().setHours(0, 0, 0, 0)

onMounted(loadTokens)
onBeforeUnmount(() => {
  disposed = true
  createdToken.value = ''
})

const mcpServerUrl = computed(() => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
  return resolveMcpServerUrl(apiBaseUrl, window.location.origin)
})

const formattedMcpConfig = computed(() => (createdToken.value ? formatMcpConfig(mcpServerUrl.value, createdToken.value) : ''))

const actions = computed(() =>
  aiGenerationActions.map((action) => ({
    ...action,
    content: action.title === '配置 MCP Server' ? formatMcpConfig(mcpServerUrl.value, '<MCP令牌>') : action.content,
  })),
)

const copyToken = () => copyText(createdToken.value)

const formatDate = (value: string) => new Date(value).toLocaleString()

const tokenStatus = (expireTime: string) => (new Date(expireTime).getTime() > Date.now() ? '有效' : '已过期')

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败,请手动复制')
  }
}
</script>

<template>
  <div class="dr-ai-generation">
    <header class="dr-ai-generation__header">
      <div>
        <h2 class="dr-ai-generation__title">AI生成接入</h2>
        <p class="dr-ai-generation__desc">按以下配置安装 DataRoom 页面生成 Skill，并把当前服务接入到 MCP Server</p>
      </div>
    </header>

    <section class="dr-ai-generation__token-section">
      <div class="dr-ai-generation__section-header">
        <div>
          <h3 class="dr-ai-generation__section-title">MCP令牌</h3>
          <p class="dr-ai-generation__section-desc">令牌只在创建成功后展示一次</p>
        </div>
        <el-button type="primary" @click="openCreateDialog">创建令牌</el-button>
      </div>
      <el-alert v-if="loadFailed" title="令牌列表加载失败，请稍后重试" type="error" :closable="false" show-icon />
      <el-table v-else v-loading="loading" :data="tokens" empty-text="暂无 MCP令牌">
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="tokenPrefix" label="MCP令牌" min-width="180">
          <template #default="{ row }">{{ row.tokenPrefix }}***</template>
        </el-table-column>
        <el-table-column label="有效期" min-width="180">
          <template #default="{ row }">{{ formatDate(row.expireTime) }}</template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="180">
          <template #default="{ row }">{{ formatDate(row.createDate) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="tokenStatus(row.expireTime) === '有效' ? 'success' : 'info'">{{ tokenStatus(row.expireTime) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" :loading="deletingId === row.id" @click="deleteToken(row.id, row.name)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

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

    <el-dialog
      v-model="createDialogVisible"
      title="创建令牌"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="!creating"
      :show-close="!creating"
      :before-close="closeCreateDialog"
      destroy-on-close
      @close="createdToken = ''"
    >
      <template v-if="!createdToken">
        <el-form label-position="top" @submit.prevent="createToken">
          <el-form-item label="令牌名称" required>
            <el-input v-model="form.name" maxlength="50" placeholder="例如：Claude Desktop" @keyup.enter="createToken" />
          </el-form-item>
          <el-form-item label="有效期" required>
            <el-radio-group v-model="form.validity">
              <el-radio-button :value="7">7天</el-radio-button>
              <el-radio-button :value="30">30天</el-radio-button>
              <el-radio-button :value="90">90天</el-radio-button>
              <el-radio-button :value="180">180天</el-radio-button>
              <el-radio-button :value="365">一年</el-radio-button>
              <el-radio-button value="custom">自定义</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-date-picker
            v-if="form.validity === 'custom'"
            v-model="form.customDate"
            type="datetime"
            placeholder="选择过期时间"
            :disabled-date="disablePastDate"
            style="width: 100%"
          />
        </el-form>
      </template>
      <template v-else>
        <el-alert title="请立即复制并保存明文令牌，关闭窗口后将无法再次查看。" type="warning" :closable="false" show-icon />
        <div class="dr-ai-generation__created-fields">
          <div class="dr-ai-generation__created-field">
            <label for="created-mcp-token" class="dr-ai-generation__field-label">令牌</label>
            <el-input id="created-mcp-token" v-model="createdToken" readonly />
          </div>
          <div class="dr-ai-generation__created-field">
            <div id="created-mcp-config-label" class="dr-ai-generation__field-label">MCP Server 配置</div>
            <pre aria-labelledby="created-mcp-config-label" class="dr-ai-generation__code"><code>{{ formattedMcpConfig }}</code></pre>
          </div>
        </div>
      </template>
      <template #footer>
        <template v-if="!createdToken">
          <el-button @click="closeCreateDialog">取消</el-button>
          <el-button type="primary" :loading="creating" @click="createToken">创建</el-button>
        </template>
        <template v-else>
          <el-button :icon="CopyDocument" @click="copyToken">复制令牌</el-button>
          <el-button :icon="CopyDocument" @click="copyText(formattedMcpConfig)">复制配置</el-button>
          <el-button type="primary" @click="closeCreateDialog">完成</el-button>
        </template>
      </template>
    </el-dialog>
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
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__token-section {
    padding: 24px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__created-fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
  }

  &__created-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__field-label {
    color: var(--el-text-color-regular);
    font-size: 14px;
    letter-spacing: 0;
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
