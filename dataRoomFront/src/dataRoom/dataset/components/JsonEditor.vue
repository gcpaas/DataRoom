<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { DatasetEntity } from '../api'
import { datasetApi } from '../api'
import { ElMessage } from 'element-plus'
import { Codemirror } from 'vue-codemirror'
import { json } from '@codemirror/lang-json'
import { eclipse } from '@uiw/codemirror-theme-eclipse'
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

const formRef = ref<FormInstance>()
const previewData = ref<unknown>([])

// CodeMirror 扩展配置：JSON语言 + Eclipse主题
const cmExtensions = [json(), eclipse]

const formData = reactive<DatasetEntity>({
  name: '',
  datasetType: 'json',
  parentCode: 'root',
  dataset: {
    datasetType: 'json',
    json: ''
  },
  inputList: [],
  outputList: []
})

// 监听外部传入的值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, newVal)
      if (!formData.dataset) {
        formData.dataset = {
          datasetType: 'json',
          json: ''
        }
      }
    }
  },
  { immediate: true, deep: true }
)

// 监听内部值变化，触发更新
watch(
  formData,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true }
)

const rules = reactive<FormRules<DatasetEntity>>({
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }]
})

/**
 * 表单验证
 */
const validate = () => {
  return formRef.value?.validate()
}

/**
 * 重置表单
 */
const resetFields = () => {
  formRef.value?.resetFields()
}

/**
 * 获取数据
 */
const getData = (): DatasetEntity => {
  return { ...formData }
}

/**
 * 测试数据集
 */
const test = async () => {
  try {
    if (!formData.dataset || !('json' in formData.dataset) || !formData.dataset.json) {
      ElMessage.error('请先输入JSON数据')
      return
    }
    // 验证JSON格式
    try {
      JSON.parse(formData.dataset.json)
    } catch {
      ElMessage.error('JSON格式错误，请检查')
      return
    }
    
    // 调用测试接口
    const res = await datasetApi.test({ dataset: formData })
    previewData.value = res.data
    if (res.outputList && res.outputList.length > 0) {
      // 保存现有的用户配置
      const existingConfig = new Map(
        (formData.outputList || []).map(item => [item.name, { type: item.type, desc: item.desc }])
      )
      // 更新字段列表，保留用户已配置的类型和描述
      formData.outputList = res.outputList.map(field => ({
        name: field.name,
        type: existingConfig.get(field.name)?.type || field.type || 'String',
        desc: existingConfig.get(field.name)?.desc || field.desc || ''
      }))
    } else {
      // 解析JSON获取字段
      const jsonData = JSON.parse(formData.dataset.json)
      const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData]
      if (dataArray.length > 0) {
        const fields = Object.keys(dataArray[0])
        // 保存现有的用户配置
        const existingConfig = new Map(
          (formData.outputList || []).map(item => [item.name, { type: item.type, desc: item.desc }])
        )
        // 更新字段列表，保留用户已配置的类型和描述
        formData.outputList = fields.map(name => ({
          name,
          type: existingConfig.get(name)?.type || 'String',
          desc: existingConfig.get(name)?.desc || ''
        }))
      }
    }
    ElMessage.success('测试成功，字段列表已更新')
  } catch (error) {
    console.error('测试数据集失败:', error)
    ElMessage.error('测试失败')
  }
}

/**
 * 测试并保存
 */
const testAndSave = async () => {
  try {
    // 先验证表单
    await validate()
    
    // 先测试
    await test()
    
    // 然后保存
    if (props.onSave) {
      await props.onSave()
    }
  } catch (error) {
    console.error('测试并保存失败:', error)
  }
}

/**
 * 解析JSON字段，自动提取字段名和类型
 */
const parseFields = () => {
  if (!formData.dataset || !('json' in formData.dataset) || !formData.dataset.json) {
    ElMessage.error('请先输入JSON数据')
    return
  }
  let jsonData: unknown
  try {
    jsonData = JSON.parse(formData.dataset.json)
  } catch {
    ElMessage.error('JSON格式错误，请检查')
    return
  }
  const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData]
  if (dataArray.length === 0) {
    ElMessage.warning('JSON数据为空，无法解析字段')
    return
  }
  const firstItem = dataArray[0]
  if (typeof firstItem !== 'object' || firstItem === null) {
    ElMessage.warning('JSON数据格式不支持，请提供对象或对象数组')
    return
  }
  const obj = firstItem as Record<string, unknown>
  const fields = Object.keys(obj)
  // 保存现有的用户配置（描述等）
  const existingConfig = new Map(
    (formData.outputList || []).map(item => [item.name, { type: item.type, desc: item.desc }])
  )
  // 根据值推断类型
  formData.outputList = fields.map(name => {
    const value = obj[name]
    let inferredType = 'String'
    if (Array.isArray(value)) {
      inferredType = 'Array'
    } else if (value === null) {
      inferredType = 'String'
    } else if (typeof value === 'number') {
      inferredType = 'Number'
    } else if (typeof value === 'boolean') {
      inferredType = 'Boolean'
    } else if (typeof value === 'object') {
      inferredType = 'Object'
    }
    return {
      name,
      type: existingConfig.get(name)?.type || inferredType,
      desc: existingConfig.get(name)?.desc || ''
    }
  })
  ElMessage.success('字段解析成功')
}

/**
 * 格式化JSON
 */
const formatJson = () => {
  try {
    if (formData.dataset && 'json' in formData.dataset && formData.dataset.json) {
      const parsed = JSON.parse(formData.dataset.json)
      formData.dataset.json = JSON.stringify(parsed, null, 2)
      ElMessage.success('格式化成功')
    }
  } catch {
    ElMessage.error('JSON格式错误，无法格式化')
  }
}

defineExpose({
  validate,
  resetFields,
  getData,
  test,
  testAndSave
})
</script>

<template>
  <DatasetEditorLayout :preview-data="previewData">
    <el-form class="dataset-editor-form" ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="数据集名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入数据集名称" clearable />
      </el-form-item>
      <el-form-item label="JSON数据">
        <div class="json-editor-shell">
          <div
            v-if="formData.dataset && 'json' in formData.dataset"
            class="codemirror-wrapper"
          >
            <Codemirror
              v-model="formData.dataset.json"
              :extensions="cmExtensions"
              placeholder='请输入JSON数据，例如：[{"name": "张三", "age": 20}]'
            />
          </div>
          <div class="json-format-action">
            <el-button size="small" @click="formatJson">格式化</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="字段列表">
        <div class="dataset-form-section">
          <div class="dataset-form-toolbar">
            <el-button type="primary" size="small" @click="parseFields">字段解析</el-button>
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
            description="请点击「字段解析」按钮自动解析字段列表"
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

.json-editor-shell {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.json-format-action {
  position: absolute;
  right: 12px;
  bottom: 16px;
  z-index: 1;
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
    height: 360px;
    max-width: 100%;
    font-family: 'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
    font-size: 13px;

    .cm-scroller {
      overflow: auto;
    }

    .cm-content {
      max-width: 100%;
    }

    .cm-cursor,
    .cm-dropCursor {
      border-left-color: var(--el-text-color-primary);
    }

    .cm-gutters {
      background-color: var(--el-fill-color-extra-light);
      border-right: 1px solid var(--el-border-color-lighter);
      color: var(--el-text-color-secondary);
    }

    .cm-activeLineGutter {
      color: var(--el-text-color-primary);
    }
  }
}
</style>
