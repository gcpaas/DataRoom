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

const defaultScript = `// message 为当前收到的原始消息字符串
// payload 为自动解析后的JSON对象；非JSON消息时 payload 等于 message
// 返回对象或对象数组，作为组件最终消费的数据
return payload instanceof List ? payload : [payload]`

const defaultSampleData = `{
  "time": "2026-06-23 10:00:00",
  "value": 100
}`

const formRef = ref<FormInstance>()
const previewData = ref<unknown>([])
const groovyExtensions = [StreamLanguage.define(groovy), eclipse]
const jsonExtensions = [json(), eclipse]

const formData = reactive<DatasetEntity>({
  name: '',
  datasetType: 'websocket',
  parentCode: 'root',
  dataset: {
    datasetType: 'websocket',
    url: '',
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
      script: defaultScript,
      sampleData: defaultSampleData,
    }
    return
  }

  const dataset = formData.dataset as WebSocketDataset
  dataset.url = dataset.url || ''
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

const test = async () => {
  try {
    ensureWebSocketDataset()
    const dataset = formData.dataset as WebSocketDataset
    if (!dataset.url.trim()) {
      ElMessage.error('请先输入WebSocket地址')
      return
    }
    if (!dataset.script.trim()) {
      ElMessage.error('请先输入消息处理脚本')
      return
    }
    if (!dataset.sampleData.trim()) {
      ElMessage.error('请先输入测试样本')
      return
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
      ElMessage.warning('测试样本处理结果无法推断字段')
    }
  } catch (error) {
    console.error('WebSocket测试样本处理失败:', error)
    ElMessage.error('测试样本处理失败')
  }
}

const testAndSave = async () => {
  try {
    await validate()
    await test()
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
})
</script>

<template>
  <DatasetEditorLayout :preview-data="previewData">
    <el-form class="dataset-editor-form" ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="数据集名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入数据集名称" clearable />
      </el-form-item>

      <template v-if="formData.dataset && formData.dataset.datasetType === 'websocket'">
        <el-form-item label="WebSocket地址">
          <el-input v-model="formData.dataset.url" placeholder="ws://localhost:8080/example" clearable />
        </el-form-item>

        <el-form-item label="消息处理脚本">
          <div class="codemirror-wrapper codemirror-wrapper--script">
            <Codemirror
              v-model="formData.dataset.script"
              :extensions="groovyExtensions"
              placeholder="请输入Groovy消息处理脚本"
            />
          </div>
        </el-form-item>

        <el-form-item label="测试样本">
          <div class="codemirror-wrapper codemirror-wrapper--sample">
            <Codemirror
              v-model="formData.dataset.sampleData"
              :extensions="jsonExtensions"
              placeholder="请输入用于测试脚本的样本消息"
            />
          </div>
        </el-form-item>
      </template>

      <el-form-item label="字段列表">
        <div class="dataset-form-section">
          <div class="dataset-form-toolbar">
            <el-button type="primary" size="small" @click="test">解析测试样本</el-button>
          </div>
          <el-table class="dataset-form-table" :data="formData.outputList" border>
            <el-table-column prop="name" label="字段名" width="200" />
            <el-table-column label="类型" width="150">
              <template #default="{ row }">
                <el-select v-model="row.type" size="small" placeholder="类型">
                  <el-option label="String" value="String" />
                  <el-option label="Number" value="Number" />
                  <el-option label="Boolean" value="Boolean" />
                  <el-option label="Object" value="Object" />
                  <el-option label="Array" value="Array" />
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
            description="请点击「解析测试样本」按钮执行脚本并自动解析字段列表"
            :image-size="100"
          />
        </div>
      </el-form-item>
    </el-form>
  </DatasetEditorLayout>
</template>

<style scoped lang="scss">
.dataset-editor-form {
  min-width: 0;
}

.dataset-form-section {
  width: 100%;
}

.dataset-form-toolbar {
  margin-bottom: 8px;
}

.dataset-form-table {
  width: 100%;
  font-feature-settings: 'tnum';
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
