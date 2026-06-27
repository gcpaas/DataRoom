<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
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
      cacheSize: 5,
      jsonFieldMappings: [],
      emptyDataStrategy: 'emptyArray',
      sampleData: '',
    }
  }
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
    const res = await datasetApi.test({ dataset: formData })
    previewData.value = res.data
    if (res.outputList && res.outputList.length > 0) {
      formData.outputList = res.outputList
      ElMessage.success('测试成功')
    } else {
      ElMessage.info('暂无数据')
    }
    return true
  } catch (error) {
    console.error('MQTT数据集测试失败:', error)
    ElMessage.error('测试失败')
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
        <el-input v-model="mqttDataset.topic" placeholder="factory/line-1/temperature" clearable />
      </el-form-item>

      <el-form-item label="缓存条数">
        <el-input-number v-model="mqttDataset.cacheSize" :min="1" :max="100" />
      </el-form-item>

      <el-form-item label="空数据策略">
        <el-select v-model="mqttDataset.emptyDataStrategy">
          <el-option label="返回空数组" value="emptyArray" />
          <el-option label="返回null" value="null" />
        </el-select>
      </el-form-item>

      <el-form-item class="dataset-editor-form-grid__full" label="测试样本">
        <el-input
          v-model="mqttDataset.sampleData"
          type="textarea"
          :rows="4"
          placeholder='{"temperature": 31.2, "timestamp": "2026-06-25T10:00:00"}'
        />
      </el-form-item>

      <el-form-item class="dataset-editor-form-grid__full" label="字段映射">
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
                  <el-option label="string" value="string" />
                  <el-option label="number" value="number" />
                  <el-option label="boolean" value="boolean" />
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
