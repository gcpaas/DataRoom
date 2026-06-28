<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageApi, type PageEntity, type PageShareSaveDto, type PageShareVo } from '@/dataRoom/page/api'

const props = defineProps<{
  modelValue: boolean
  page?: PageEntity | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const loading = ref(false)
const saving = ref(false)
const detail = ref<PageShareVo>()

const form = reactive<PageShareSaveDto>({
  pageCode: '',
  enabled: true,
  expireTime: null,
  ipWhitelist: '',
  refreshToken: false,
})

const hasShareLink = computed(() => !!detail.value?.shareUrl)
const hasToken = computed(() => !!detail.value?.token)

const padNumber = (value: number) => value.toString().padStart(2, '0')

const formatDateTime = (date: Date) => {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}:${padNumber(date.getSeconds())}`
}

const resetForm = () => {
  form.pageCode = props.page?.code || ''
  form.enabled = true
  form.expireTime = null
  form.ipWhitelist = ''
  form.refreshToken = false
  detail.value = undefined
}

const applyDetail = (share: PageShareVo) => {
  detail.value = share
  form.pageCode = share.pageCode || props.page?.code || ''
  form.enabled = share.enabled
  form.expireTime = share.expireTime || null
  form.ipWhitelist = share.ipWhitelist || ''
  form.refreshToken = false
}

const loadDetail = async () => {
  if (!props.page?.code) {
    resetForm()
    return
  }

  loading.value = true
  try {
    const response = await pageApi.shareDetail(props.page.code)
    applyDetail(response)
  } catch (error) {
    console.error('加载分享配置失败:', error)
    ElMessage.error('加载分享配置失败')
  } finally {
    loading.value = false
  }
}

const setExpireTime = (type: 'never' | 'month' | 'week' | 'day') => {
  if (type === 'never') {
    form.expireTime = null
    return
  }

  const date = new Date()
  if (type === 'month') {
    date.setMonth(date.getMonth() + 1)
  } else if (type === 'week') {
    date.setDate(date.getDate() + 7)
  } else {
    date.setDate(date.getDate() + 1)
  }
  form.expireTime = formatDateTime(date)
}

const confirmRefreshToken = async () => {
  if (!hasToken.value) {
    return true
  }

  try {
    await ElMessageBox.confirm(
      '该页面已存在分享链接，是否让历史分享链接失效？',
      '生成分享链接',
      {
        confirmButtonText: '是',
        cancelButtonText: '否',
        distinguishCancelAndClose: true,
        type: 'warning',
      },
    )
    return true
  } catch (action) {
    if (action === 'cancel') {
      return false
    }
    throw action
  }
}

const saveShare = async () => {
  if (!form.pageCode) {
    ElMessage.error('页面信息缺失，无法生成分享链接')
    return
  }

  let refreshToken: boolean
  try {
    refreshToken = await confirmRefreshToken()
  } catch {
    return
  }

  saving.value = true
  try {
    const response = await pageApi.shareSave({
      pageCode: form.pageCode,
      enabled: form.enabled,
      expireTime: form.expireTime || null,
      ipWhitelist: form.ipWhitelist,
      refreshToken,
    })
    applyDetail(response)
    ElMessage.success('分享链接已生成')
  } catch (error) {
    console.error('生成分享链接失败:', error)
  } finally {
    saving.value = false
  }
}

const copyShareLink = async () => {
  const shareUrl = detail.value?.shareUrl
  if (!shareUrl) {
    return
  }
  try {
    await navigator.clipboard.writeText(shareUrl)
    ElMessage.success('已复制')
  } catch (error) {
    console.error('复制分享链接失败:', error)
    ElMessage.error('复制失败')
  }
}

const handleClosed = () => {
  resetForm()
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      resetForm()
      void loadDetail()
    }
  },
)
</script>

<template>
  <el-dialog
    v-model="visible"
    title="分享页面"
    width="640px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form v-loading="loading" label-width="110px" :model="form">
      <el-form-item label="启用分享">
        <el-switch v-model="form.enabled" />
      </el-form-item>

      <el-form-item label="过期时间">
        <div class="share-expire">
          <el-button-group>
            <el-button @click="setExpireTime('never')">永不过期</el-button>
            <el-button @click="setExpireTime('month')">一个月</el-button>
            <el-button @click="setExpireTime('week')">一周</el-button>
            <el-button @click="setExpireTime('day')">一天</el-button>
          </el-button-group>
          <el-date-picker
            v-model="form.expireTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择过期时间"
            clearable
          />
        </div>
      </el-form-item>

      <el-form-item label="IP 白名单">
        <el-input
          v-model="form.ipWhitelist"
          type="textarea"
          :rows="5"
          placeholder="一行一个精确 IP 或 CIDR，留空表示不限制"
        />
      </el-form-item>

      <el-form-item label="分享链接">
        <div class="share-link">
          <el-input :model-value="detail?.shareUrl || ''" readonly placeholder="生成后显示分享链接" />
          <el-button :disabled="!hasShareLink" @click="copyShareLink">复制</el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="saveShare">生成分享链接</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.share-expire {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.share-link {
  display: flex;
  width: 100%;
  gap: 8px;
}
</style>
