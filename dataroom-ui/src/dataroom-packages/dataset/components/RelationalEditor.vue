<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { DatasetEntity } from '../api'
import { datasetApi } from '../api'
import { ElMessage } from 'element-plus'
import { parseParams } from '@/dataroom-packages/_common/_utils'

const props = defineProps<{
  modelValue: DatasetEntity
  dataSourceList?: any[]
  onSave?: () => Promise<void>
  onClose?: () => void
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DatasetEntity]
}>()

const formRef = ref<FormInstance>()

const formData = reactive<DatasetEntity>({
  name: '',
  datasetType: 'relational',
  parentCode: 'root',
  dataSourceCode: '',
  dataset: {
    datasetType: 'relational',
    sql: ''
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
          datasetType: 'relational',
          sql: ''
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
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
  dataSourceCode: [{ required: true, message: '请选择数据源', trigger: 'change' }]
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
    if (!formData.dataSourceCode) {
      ElMessage.error('请先选择数据源')
      return
    }
    if (!formData.dataset || !('sql' in formData.dataset) || !formData.dataset.sql) {
      ElMessage.error('请先输入SQL语句')
      return
    }

    // 调用测试接口
    const res = await datasetApi.test({ dataset: formData })
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
  } catch (error) {
    console.error('测试数据集失败:', error)
    ElMessage.error('测试失败')
  }
}

/**
 * 解析SQL中的入参
 * 匹配 #{paramName} 格式
 */
const parseInputParams = () => {
  if (!formData.dataset || !('sql' in formData.dataset) || !formData.dataset.sql) {
    ElMessage.warning('请先输入SQL语句')
    return
  }

  const sql = formData.dataset.sql
  const paramNames = parseParams(sql)

  if (paramNames.length === 0) {
    ElMessage.info('未发现任何参数')
    return
  }

  // 保存现有的参数配置
  const existingParams = new Map(
    (formData.inputList || []).map(item => [item.name, item])
  )

  // 生成新的参数列表，保留已存在的配置
  formData.inputList = paramNames.map(name => {
    const existing = existingParams.get(name)
    return existing || {
      name,
      type: 'String',
      required: false,
      defaultVal: '',
      desc: ''
    }
  })

  ElMessage.success(`成功解析${paramNames.length}个参数`)
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

defineExpose({
  validate,
  resetFields,
  getData,
  test,
  testAndSave
})
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
    <el-form-item label="数据集名称" prop="name">
      <el-input v-model="formData.name" placeholder="请输入数据集名称" clearable />
    </el-form-item>
    <el-form-item label="数据源" prop="dataSourceCode">
      <el-select v-model="formData.dataSourceCode" placeholder="请选择数据源" clearable>
        <el-option
          v-for="item in dataSourceList"
          :key="item.code"
          :label="item.name"
          :value="item.code"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="SQL语句">
      <el-input
        v-if="formData.dataset && 'sql' in formData.dataset"
        v-model="formData.dataset.sql"
        type="textarea"
        :rows="10"
        placeholder="请输入SQL语句"
      />
    </el-form-item>
    <el-form-item label="入参配置">
      <div style="width: 100%">
        <el-button size="small" @click="parseInputParams">
          入参解析
        </el-button>
        <el-table :data="formData.inputList" border style="width: 100%; margin-top: 8px">
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
    <el-form-item label="字段说明">
      <div style="width: 100%">
        <el-table :data="formData.outputList" border style="width: 100%">
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
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
:deep(.el-form) {
  padding: 16px;
}
</style>
