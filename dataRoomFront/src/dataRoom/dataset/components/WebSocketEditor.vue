<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { StreamLanguage } from '@codemirror/language'
import { groovy } from '@codemirror/legacy-modes/mode/groovy'
import { json } from '@codemirror/lang-json'
import { eclipse } from '@uiw/codemirror-theme-eclipse'
import { Codemirror } from 'vue-codemirror'
import type { DatasetEntity, WebSocketDataset } from '../api'
import { datasetApi } from '../api'
import DatasetEditorLayout from './DatasetEditorLayout.vue'

const props = defineProps<{
  modelValue: DatasetEntity
  dataSourceList?: unknown[]
  onSave?: () => Promise<void>
  onClose?: () => void
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DatasetEntity]
}>()

const defaultScript = 'return payload instanceof List ? payload : [payload]'

const defaultSampleData = `{
  "time": "2026-06-23 10:00:00",
  "value": 100
}`

const formRef = ref<FormInstance>()
const previewData = ref<unknown>([])
const layoutRef = ref<{ revealPreview: () => Promise<void> }>()
const groovyExtensions = [StreamLanguage.define(groovy), eclipse]
const jsonExtensions = [json(), eclipse]

type WebSocketFormData = DatasetEntity & { dataset: WebSocketDataset }

const formData = reactive<WebSocketFormData>({
  name: '',
  datasetType: 'websocket',
  parentCode: 'root',
  dataset: {
    datasetType: 'websocket',
    url: '',
    processingMode: 'json',
    jsonPath: '',
    script: defaultScript,
    sampleData: defaultSampleData,
  },
  inputList: [],
  outputList: [],
})

const ensureWebSocketDataset = () => {
  if (!formData.dataset || formData.dataset.datasetType !== 'websocket') {
    formData.dataset = {
      datasetType: 'websocket',
      url: '',
      processingMode: 'json',
      jsonPath: '',
      script: defaultScript,
      sampleData: defaultSampleData,
    }
    return
  }

  const dataset = formData.dataset as WebSocketDataset
  dataset.url = dataset.url || ''
  // 必须在补齐默认脚本前推断旧配置的模式。
  dataset.processingMode = dataset.processingMode || (dataset.script?.trim() ? 'script' : 'json')
  dataset.jsonPath = dataset.jsonPath || ''
  dataset.script = dataset.script || defaultScript
  dataset.sampleData = dataset.sampleData || defaultSampleData
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, newVal)
      ensureWebSocketDataset()
    }
  },
  { immediate: true, deep: true }
)

watch(
  formData,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true }
)

const rules = reactive<FormRules<DatasetEntity>>({
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
})

const validate = () => {
  return formRef.value?.validate()
}

const resetFields = () => {
  formRef.value?.resetFields()
}

const getData = (): DatasetEntity => {
  return { ...formData }
}

const resetProcessingResult = () => {
  previewData.value = []
  formData.outputList = []
}

const test = async () => {
  try {
    ensureWebSocketDataset()
    const dataset = formData.dataset as WebSocketDataset
    if (!dataset.url.trim()) {
      ElMessage.error('请先输入WebSocket地址')
      return false
    }
    if (dataset.processingMode === 'script' && !dataset.script.trim()) {
      ElMessage.error('请先输入消息处理脚本')
      return false
    }
    if (!dataset.sampleData.trim()) {
      ElMessage.error('请先输入测试样本')
      return false
    }

    const res = await datasetApi.test({ dataset: formData })
    previewData.value = res.data
    if (res.outputList && res.outputList.length > 0) {
      const existingConfig = new Map(
        (formData.outputList || []).map(item => [item.name, { type: item.type, desc: item.desc }])
      )
      formData.outputList = res.outputList.map(field => ({
        name: field.name,
        type: existingConfig.get(field.name)?.type || field.type || 'String',
        desc: existingConfig.get(field.name)?.desc || field.desc || '',
      }))
      ElMessage.success('测试样本处理成功，字段列表已更新')
    } else {
      formData.outputList = []
      ElMessage.warning('测试样本处理结果无法推断字段')
    }
    return true
  } catch (error) {
    console.error('WebSocket测试样本处理失败:', error)
    // 请求封装已展示后端错误，保留 JSON/JSONPath 或脚本禁用的具体原因。
    return false
  }
}

const testAndSave = async () => {
  try {
    await validate()
    const tested = await test()
    if (!tested) {
      return
    }
    if (props.onSave) {
      await props.onSave()
    }
  } catch (error) {
    console.error('测试并保存失败:', error)
  }
}

defineExpose({
  validate,
  resetFields,
  getData,
  test,
  testAndSave,
  revealPreview: () => layoutRef.value?.revealPreview(),
})
</script>

<template>
  <DatasetEditorLayout ref="layoutRef" :preview-data="previewData">
    <el-form class="dataset-editor-form dataset-editor-form-grid" ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="数据集名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入数据集名称" clearable />
      </el-form-item>

      <template v-if="formData.dataset && formData.dataset.datasetType === 'websocket'">
        <el-form-item label="WebSocket地址">
          <el-input v-model="formData.dataset.url" placeholder="ws://localhost:8080/example" clearable />
        </el-form-item>

        <el-form-item class="dataset-editor-form-grid__full" label="数据处理方式">
          <el-radio-group v-model="formData.dataset.processingMode" @change="resetProcessingResult">
            <el-radio value="json">JSON</el-radio>
            <el-radio value="script">自定义脚本</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.dataset.processingMode === 'json'"
          class="dataset-editor-form-grid__full"
          label="JSONPath"
        >
          <el-input v-model="formData.dataset.jsonPath" placeholder="例如 $.data，留空使用完整 JSON" clearable />
          <div class="script-hint">
            <el-text tag="p" type="info" size="small">直接解析 JSON 消息，JSONPath 支持提取嵌套对象或数组，例如 $.data 或 $.data[0]</el-text>
          </div>
        </el-form-item>

        <el-form-item v-else class="dataset-editor-form-grid__full" label="消息处理脚本">
          <div class="codemirror-wrapper codemirror-wrapper--script">
            <Codemirror
              v-model="formData.dataset.script"
              :extensions="groovyExtensions"
              placeholder="请输入Groovy消息处理脚本"
            />
          </div>
          <div class="script-hint">
            <el-text tag="p" type="info" size="small">message 为当前收到的原始消息字符串。</el-text>
            <el-text tag="p" type="info" size="small">payload 为自动解析后的 JSON 对象；非 JSON 消息时 payload 等于 message。</el-text>
            <el-text tag="p" type="info" size="small">返回对象或对象数组，作为组件最终消费的数据。</el-text>
          </div>
        </el-form-item>

        <el-form-item class="dataset-editor-form-grid__full" label="测试样本">
          <div class="codemirror-wrapper codemirror-wrapper--sample">
            <Codemirror
              v-model="formData.dataset.sampleData"
              :extensions="jsonExtensions"
              placeholder="请输入用于测试脚本的样本消息"
            />
          </div>
        </el-form-item>
      </template>

    </el-form>
    <template #fields-actions>
      <el-button type="primary" size="small" @click="test">解析测试样本</el-button>
    </template>
    <template #fields>
      <div class="dataset-form-section">
        <el-table class="dataset-form-table" :data="formData.outputList" border>
          <el-table-column prop="name" label="字段名" width="200" />
          <el-table-column label="类型" width="150">
            <template #default="{ row }">
              <el-select v-model="row.type" size="small" placeholder="类型">
                <el-option label="字符串" value="String" />
                <el-option label="数值" value="Number" />
                <el-option label="布尔" value="Boolean" />
                <el-option label="对象" value="Object" />
                <el-option label="数组" value="Array" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="描述">
            <template #default="{ row }">
              <el-input v-model="row.desc" size="small" placeholder="描述" />
            </template>
          </el-table-column>
        </el-table>
        <el-empty
          v-if="!formData.outputList || formData.outputList.length === 0"
          description="请点击「解析测试样本」按钮，按所选方式处理消息并自动解析字段列表"
          :image-size="100"
        />
      </div>
    </template>
  </DatasetEditorLayout>
</template>

<style scoped lang="scss">
.dataset-editor-form {
  min-width: 0;
}

.script-hint {
  width: 100%;
  margin-top: 8px;
}

.codemirror-wrapper {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: var(--el-color-primary);
  }

  :deep(.cm-editor) {
    height: 240px;
    max-width: 100%;
    font-family: 'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
    font-size: 13px;
    letter-spacing: 0;

    .cm-scroller {
      overflow: auto;
    }

    .cm-gutters {
      background-color: var(--el-fill-color-extra-light);
      border-right: 1px solid var(--el-border-color-lighter);
      color: var(--el-text-color-secondary);
    }

    .cm-cursor,
    .cm-dropCursor {
      border-left-color: var(--el-text-color-primary);
    }

    .cm-activeLineGutter {
      color: var(--el-text-color-primary);
    }
  }
}

.codemirror-wrapper--script :deep(.cm-editor) {
  height: 320px;
}
</style>
