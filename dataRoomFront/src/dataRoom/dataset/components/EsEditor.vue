<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { DatasetEntity, EsDataset } from '../api'
import { datasetApi } from '../api'
import { parseParams } from '@/dataRoom/utils'
import DatasetEditorLayout from './DatasetEditorLayout.vue'

interface DataSourceOption {
  code?: string
  name?: string
  dataSourceType?: string
}

const props = defineProps<{
  modelValue: DatasetEntity
  dataSourceList?: DataSourceOption[]
  onSave?: () => Promise<void>
  onClose?: () => void
}>()

const formRef = ref<FormInstance>()
const previewData = ref<unknown>([])
const layoutRef = ref<{ revealPreview: () => Promise<void> }>()

const defaultEsDataset = (): EsDataset => ({
  datasetType: 'es',
  path: '',
  method: 'POST',
  body: '',
  respJsonPath: '',
})

const formData = reactive<DatasetEntity>({
  name: '',
  datasetType: 'es',
  parentCode: 'root',
  dataSourceCode: '',
  dataset: defaultEsDataset(),
  inputList: [],
  outputList: [],
})

const esDataset = computed(() => formData.dataset as EsDataset)
const esDataSourceList = computed(() => (props.dataSourceList || []).filter(item => item.dataSourceType === 'es'))

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, newVal)
      formData.dataset = {
        ...defaultEsDataset(),
        ...newVal.dataset,
        datasetType: 'es',
      } as EsDataset
    }
  },
  { immediate: true },
)

const rules = reactive<FormRules<DatasetEntity>>({
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
  dataSourceCode: [{ required: true, message: '请选择ES数据源', trigger: 'change' }],
  'dataset.path': [{ required: true, message: '请输入查询地址', trigger: 'blur' }],
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
    if (!formData.dataSourceCode) {
      ElMessage.error('请先选择ES数据源')
      return false
    }
    if (!esDataset.value.path) {
      ElMessage.error('请先输入查询地址')
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
      ElMessage.success('测试成功，字段列表已更新')
    } else {
      ElMessage.warning('未获取到字段信息')
    }
    return true
  } catch (error) {
    console.error('测试ES数据集失败:', error)
    ElMessage.error('测试失败')
    return false
  }
}

const parseInputParams = () => {
  const paramNames = new Set<string>()

  if (esDataset.value.path) {
    parseParams(esDataset.value.path).forEach(param => paramNames.add(param))
  }
  if (esDataset.value.body) {
    parseParams(esDataset.value.body).forEach(param => paramNames.add(param))
  }

  if (paramNames.size === 0) {
    ElMessage.info('未发现任何参数')
    return
  }

  const existingParams = new Map(
    (formData.inputList || []).map(item => [item.name, item]),
  )

  formData.inputList = Array.from(paramNames).map(name => {
    const existing = existingParams.get(name)
    return existing || {
      name,
      type: 'String',
      required: false,
      defaultVal: '',
      desc: '',
    }
  })

  ElMessage.success(`成功解析${paramNames.size}个参数`)
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
    <el-form class="dataset-editor-form dataset-editor-form-grid" ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <el-form-item label="数据集名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入数据集名称" clearable />
      </el-form-item>
      <el-form-item label="ES数据源" prop="dataSourceCode">
        <el-select v-model="formData.dataSourceCode" placeholder="请选择ES数据源" clearable>
          <el-option
            v-for="item in esDataSourceList"
            :key="item.code"
            :label="item.name"
            :value="item.code || ''"
          >
            <span class="datasource-option">
              <span class="datasource-option__name">{{ item.name }}</span>
              <span class="datasource-option__type">es</span>
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="查询地址" prop="dataset.path">
        <el-input v-model="esDataset.path" placeholder="/your-index/_search 或 /_cat/indices/your-index?v" clearable />
      </el-form-item>
      <el-form-item label="请求方法">
        <el-select v-model="esDataset.method" placeholder="请选择请求方法">
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
        </el-select>
      </el-form-item>
      <el-form-item class="dataset-editor-form-grid__full" label="查询报文">
        <el-input
          v-model="esDataset.body"
          type="textarea"
          :rows="10"
          placeholder='{"query":{"match_all":{}}}'
        />
      </el-form-item>
      <el-form-item label="响应路径">
        <el-input
          v-model="esDataset.respJsonPath"
          placeholder="请输入响应数据的JSONPath，例如：$.hits.hits"
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

.datasource-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  &__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 400;
    color: var(--el-text-color-primary);
  }

  &__type {
    flex-shrink: 0;
    margin-left: 12px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 400;
  }
}
</style>
