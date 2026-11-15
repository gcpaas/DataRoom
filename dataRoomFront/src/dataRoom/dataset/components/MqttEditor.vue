<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { StreamLanguage } from '@codemirror/language'
import { groovy } from '@codemirror/legacy-modes/mode/groovy'
import { json } from '@codemirror/lang-json'
import { eclipse } from '@uiw/codemirror-theme-eclipse'
import { Codemirror } from 'vue-codemirror'
import type { DatasetEntity, MqttDataset } from '../api'
import { datasetApi } from '../api'
import { dataSourceApi } from '../../data-source/api'
import type { DataSourceEntity } from '../../data-source/api'
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
const groovyExtensions = [StreamLanguage.define(groovy), eclipse]
const jsonExtensions = [json(), eclipse]

const formRef = ref<FormInstance>()
const previewData = ref<unknown>([])
const layoutRef = ref<{ revealPreview: () => Promise<void> }>()
const mqttDataSourceList = ref<DataSourceEntity[]>([])

const formData = reactive<DatasetEntity>({
  name: '',
  datasetType: 'mqtt',
  dataSourceCode: '',
  parentCode: 'root',
  dataset: {
    datasetType: 'mqtt',
    topic: '',
    processingMode: 'json',
    jsonPath: '',
    script: defaultScript,
    cacheSize: 5,
    jsonFieldMappings: [],
    emptyDataStrategy: 'emptyArray',
    sampleData: '',
  },
  inputList: [],
  outputList: [],
})

const mqttDataset = computed(() => formData.dataset as MqttDataset)

const loadMqttDataSources = async () => {
  try {
    const list = await dataSourceApi.list()
    mqttDataSourceList.value = (list || []).filter((ds: DataSourceEntity) => ds.dataSourceType === 'mqtt')
  } catch (e) {
    console.error('加载MQTT数据源失败', e)
  }
}

const ensureMqttDataset = () => {
  if (!formData.dataset || formData.dataset.datasetType !== 'mqtt') {
    formData.dataset = {
      datasetType: 'mqtt',
      topic: '',
      processingMode: 'json',
      jsonPath: '',
      script: defaultScript,
      cacheSize: 5,
      jsonFieldMappings: [],
      emptyDataStrategy: 'emptyArray',
      sampleData: '',
    }
  }
  mqttDataset.value.jsonFieldMappings ??= []
  mqttDataset.value.jsonPath ??= ''
  mqttDataset.value.script ??= defaultScript
  mqttDataset.value.sampleData ??= ''
}

// 未指定模式的旧配置继续使用字段映射，显式切换才采用新模式。
const processingMode = computed({
  get: () => mqttDataset.value.processingMode || '',
  set: (value: string) => {
    mqttDataset.value.processingMode = value === 'json' || value === 'script' ? value : undefined
  },
})

const resetProcessingResult = () => {
  previewData.value = []
  formData.outputList = []
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, newVal)
      ensureMqttDataset()
    }
  },
  { immediate: true, deep: true },
)

watch(
  formData,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true },
)

loadMqttDataSources()

const rules = reactive<FormRules<DatasetEntity>>({
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
  dataSourceCode: [{ required: true, message: '请选择MQTT数据源', trigger: 'change' }],
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

const addFieldMapping = () => {
  mqttDataset.value.jsonFieldMappings.push({ field: '', jsonPath: '', type: 'string' })
}

const removeFieldMapping = (index: number) => {
  mqttDataset.value.jsonFieldMappings.splice(index, 1)
}

const test = async () => {
  try {
    if (!formData.dataSourceCode || !mqttDataset.value.topic.trim()) {
      ElMessage.error('请先选择MQTT数据源并填写订阅主题')
      return false
    }
    if (processingMode.value === 'script' && !mqttDataset.value.script?.trim()) {
      ElMessage.error('请先输入消息处理脚本')
      return false
    }
    if (!mqttDataset.value.sampleData?.trim()) {
      ElMessage.error('请先输入测试样本')
      return false
    }
    const res = await datasetApi.test({ dataset: formData })
    previewData.value = res.data
    if (res.outputList && res.outputList.length > 0) {
      const existingConfig = new Map(
        (formData.outputList || []).map(item => [item.name, { type: item.type, desc: item.desc }]),
      )
      formData.outputList = res.outputList.map(field => ({
        name: field.name,
        type: existingConfig.get(field.name)?.type || field.type || 'String',
        desc: existingConfig.get(field.name)?.desc || field.desc || '',
      }))
      ElMessage.success('测试成功')
    } else {
      formData.outputList = []
      ElMessage.info('测试样本处理结果无法推断字段')
    }
    return true
  } catch (error) {
    console.error('MQTT数据集测试失败:', error)
    // 请求封装已展示具体错误，保留脚本禁用等原因。
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

      <el-form-item label="MQTT数据源" prop="dataSourceCode">
        <el-select v-model="formData.dataSourceCode" placeholder="请选择MQTT数据源" filterable>
          <el-option
            v-for="ds in mqttDataSourceList"
            :key="ds.code"
            :label="ds.name"
            :value="ds.code!"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="订阅主题">
        <el-input v-model="mqttDataset.topic" placeholder="temperature" clearable />
      </el-form-item>

      <el-form-item class="dataset-editor-form-grid__full" label="数据处理方式">
        <el-radio-group v-model="processingMode" @change="resetProcessingResult">
          <el-radio v-if="!processingMode" value="">原有字段映射</el-radio>
          <el-radio value="json">JSON</el-radio>
          <el-radio value="script">自定义脚本</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="processingMode === 'json'"
        class="dataset-editor-form-grid__full"
        label="JSONPath"
      >
        <el-input v-model="mqttDataset.jsonPath" placeholder="例如 $.data，留空使用完整 JSON" clearable />
        <div class="script-hint">
          <el-text tag="p" type="info" size="small">直接解析 JSON 消息，JSONPath 支持提取嵌套对象或数组，例如 $.data 或 $.data[0]</el-text>
        </div>
      </el-form-item>

      <el-form-item v-else-if="processingMode === 'script'" class="dataset-editor-form-grid__full" label="消息处理脚本">
        <div class="codemirror-wrapper codemirror-wrapper--script">
          <Codemirror
            v-model="mqttDataset.script"
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
            v-model="mqttDataset.sampleData"
            :extensions="jsonExtensions"
            placeholder="请输入用于测试数据处理的样本消息"
          />
        </div>
      </el-form-item>
      <el-form-item v-if="!processingMode" class="dataset-editor-form-grid__full" label="字段映射">
        <div class="dataset-form-section">
          <div class="dataset-form-toolbar">
            <el-button type="primary" size="small" @click="addFieldMapping">添加映射</el-button>
            <el-button size="small" @click="test">测试</el-button>
          </div>
          <el-table class="dataset-form-table" :data="mqttDataset.jsonFieldMappings" border>
            <el-table-column label="字段名" width="150">
              <template #default="{ row }">
                <el-input v-model="row.field" size="small" placeholder="temperature" />
              </template>
            </el-table-column>
            <el-table-column label="JSON路径" width="200">
              <template #default="{ row }">
                <el-input v-model="row.jsonPath" size="small" placeholder="$.temperature" />
              </template>
            </el-table-column>
            <el-table-column label="类型" width="120">
              <template #default="{ row }">
                <el-select v-model="row.type" size="small">
                  <el-option label="字符串" value="string" />
                  <el-option label="数值" value="number" />
                  <el-option label="布尔" value="boolean" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button type="danger" size="small" text @click="removeFieldMapping($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="mqttDataset.jsonFieldMappings.length === 0"
            description="点击「添加映射」配置JSON字段映射规则"
            :image-size="80"
          />
        </div>
      </el-form-item>
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
          description="请点击测试按钮获取字段列表"
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
