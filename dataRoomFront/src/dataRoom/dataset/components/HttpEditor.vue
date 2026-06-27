<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { DatasetEntity, HttpDataset } from '../api'
import { datasetApi } from '../api'
import { ElMessage } from 'element-plus'
import { parseParams } from '@/dataRoom/utils'
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
const layoutRef = ref<{ revealPreview: () => Promise<void> }>()

const isHttpDataset = (dataset: DatasetEntity['dataset']): dataset is HttpDataset => {
  return dataset?.datasetType === 'http'
}

const formData = reactive<DatasetEntity>({
  name: '',
  datasetType: 'http',
  parentCode: 'root',
  dataset: {
    datasetType: 'http',
    url: '',
    method: 'GET',
    headerList: [],
    body: '',
    respJsonPath: ''
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
          datasetType: 'http',
          url: '',
          method: 'GET',
          headerList: [],
          body: '',
          respJsonPath: ''
        }
      } else if (isHttpDataset(formData.dataset)) {
        // 确保dataset中包含所有必需字段
        if (!formData.dataset.body) {
          formData.dataset.body = ''
        }
        if (!formData.dataset.respJsonPath) {
          formData.dataset.respJsonPath = ''
        }
        if (!formData.dataset.headerList) {
          formData.dataset.headerList = []
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
    // 验证必填字段
    if (!isHttpDataset(formData.dataset) || !formData.dataset.url) {
      ElMessage.error('请先输入请求地址')
      return false
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
      ElMessage.success('测试成功，字段列表已更新')
    } else {
      ElMessage.warning('未获取到字段信息')
    }
    return true
  } catch (error) {
    console.error('测试数据集失败:', error)
    ElMessage.error('测试失败')
    return false
  }
}

/**
 * 解析HTTP请求中的入参
 * 匹配请求地址、请求头value、请求体中的 #{paramName} 格式
 */
const parseInputParams = () => {
  if (!isHttpDataset(formData.dataset)) {
    ElMessage.warning('请先配置请求信息')
    return
  }

  const paramNames = new Set<string>()

  // 解析请求地址
  if (formData.dataset.url) {
    const params = parseParams(formData.dataset.url)
    params.forEach(param => paramNames.add(param))
  }

  // 解析请求头value
  if (formData.dataset.headerList) {
    formData.dataset.headerList.forEach(header => {
      if (header.val) {
        const params = parseParams(header.val)
        params.forEach(param => paramNames.add(param))
      }
    })
  }

  // 解析请求体
  if (formData.dataset.body) {
    const params = parseParams(formData.dataset.body)
    params.forEach(param => paramNames.add(param))
  }

  if (paramNames.size === 0) {
    ElMessage.info('未发现任何参数')
    return
  }

  // 保存现有的参数配置
  const existingParams = new Map(
    (formData.inputList || []).map(item => [item.name, item])
  )

  // 生成新的参数列表，保留已存在的配置
  formData.inputList = Array.from(paramNames).map(name => {
    const existing = existingParams.get(name)
    return existing || {
      name,
      type: 'String',
      required: false,
      defaultVal: '',
      desc: ''
    }
  })

  ElMessage.success(`成功解析${paramNames.size}个参数`)
}

/**
 * 测试并保存
 */
const testAndSave = async () => {
  try {
    // 先验证表单
    await validate()

    // 先测试
    const tested = await test()
    if (!tested) {
      return
    }

    // 然后保存
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
      <el-form-item label="请求地址">
        <el-input
          v-if="formData.dataset && 'url' in formData.dataset"
          v-model="formData.dataset.url"
          placeholder="请输入请求地址"
          clearable
        />
      </el-form-item>
      <el-form-item label="请求方法">
        <el-select
          v-if="formData.dataset && 'method' in formData.dataset"
          v-model="formData.dataset.method"
          placeholder="请选择请求方法"
        >
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
        </el-select>
      </el-form-item>
      <el-form-item class="dataset-editor-form-grid__full" label="请求头">
        <div class="dataset-form-section">
          <el-button
            size="small"
            @click="
              formData.dataset &&
                'headerList' in formData.dataset &&
                formData.dataset.headerList?.push({ key: '', val: '' })
            "
          >
            添加请求头
          </el-button>
          <el-table
            v-if="formData.dataset && 'headerList' in formData.dataset"
            :data="formData.dataset.headerList"
            border
            class="dataset-form-table dataset-form-table--spaced"
          >
            <el-table-column label="Key" width="200">
              <template #default="{ row }">
                <el-input v-model="row.key" size="small" placeholder="Key" />
              </template>
            </el-table-column>
            <el-table-column label="Value">
              <template #default="{ row }">
                <el-input v-model="row.val" size="small" placeholder="Value" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="
                    formData.dataset &&
                      'headerList' in formData.dataset &&
                      formData.dataset.headerList?.splice($index, 1)
                  "
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
      <el-form-item class="dataset-editor-form-grid__full" label="请求体">
        <el-input
          v-if="formData.dataset && 'body' in formData.dataset"
          v-model="formData.dataset.body"
          type="textarea"
          :rows="5"
          placeholder="请输入请求体（JSON格式）"
        />
      </el-form-item>
      <el-form-item label="响应路径">
        <el-input
          v-if="formData.dataset && 'respJsonPath' in formData.dataset"
          v-model="formData.dataset.respJsonPath"
          placeholder="请输入响应数据的JSONPath，例如：$.data.list"
          clearable
        />
      </el-form-item>
      <el-form-item class="dataset-editor-form-grid__full" label="入参配置">
        <div class="dataset-form-section">
          <el-button size="small" @click="parseInputParams">
            入参解析
          </el-button>
          <el-table class="dataset-form-table dataset-form-table--spaced" :data="formData.inputList" border>
            <el-table-column label="参数名" width="120">
              <template #default="{ row }">
                <span>{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-select v-model="row.type" size="small" placeholder="类型">
                  <el-option label="String" value="String" />
                  <el-option label="Number" value="Number" />
                  <el-option label="Boolean" value="Boolean" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="必填" width="80">
              <template #default="{ row }">
                <el-checkbox v-model="row.required" />
              </template>
            </el-table-column>
            <el-table-column label="默认值" width="120">
              <template #default="{ row }">
                <el-input v-model="row.defaultVal" size="small" placeholder="默认值" />
              </template>
            </el-table-column>
            <el-table-column label="描述">
              <template #default="{ row }">
                <el-input v-model="row.desc" size="small" placeholder="描述" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="formData.inputList?.splice($index, 1)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
    </el-form>
    <template #fields>
      <div class="dataset-form-section">
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
</style>
