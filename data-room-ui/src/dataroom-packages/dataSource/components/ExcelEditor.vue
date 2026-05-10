<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { dataSourceApi, type ExcelColumn, type ExcelDataSource } from '../api'

const props = defineProps<{
  modelValue: { name: string; code?: string; dataSourceType: string; dataSource: ExcelDataSource | Record<string, unknown> }
}>()

defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const formRef = ref<FormInstance>()
const uploading = ref(false)
const uploadId = ref('')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const previewData = ref<Record<string, any>[]>([])
const totalRows = ref(0)
const columns = ref<ExcelColumn[]>([])
const uploadedFileName = ref('')
const selectedFile = ref<File | null>(null)

// 是否为编辑模式
const isEditMode = computed(() => !!props.modelValue.code)

// 是否已上传并解析（显示列配置区域）
const showColumnConfig = computed(() => columns.value.length > 0)

const formData = reactive({
  name: '',
  tableName: '',
  importMode: 'overwrite' as 'overwrite' | 'append'
})

// 监听外部传入的值
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      formData.name = newVal.name || ''
      if (newVal.dataSource && 'tableName' in newVal.dataSource) {
        const excelDs = newVal.dataSource as ExcelDataSource
        formData.tableName = excelDs.tableName || ''
        if (excelDs.columns && excelDs.columns.length > 0) {
          columns.value = JSON.parse(JSON.stringify(excelDs.columns))
        }
        if (excelDs.importMode) {
          formData.importMode = excelDs.importMode as 'overwrite' | 'append'
        }
      }
    }
  },
  { immediate: true, deep: true }
)

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  tableName: [
    { required: true, message: '请输入表名称', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (!value) {
          callback(new Error('请输入表名称'))
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          callback(new Error('表名仅支持字母、数字、下划线'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

/**
 * 处理文件选择（手动上传模式）
 */
const handleFileChange: UploadProps['onChange'] = (uploadFile) => {
  const file = uploadFile.raw
  if (!file) return

  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    ElMessage.error('仅支持xlsx格式的Excel文件')
    return
  }

  selectedFile.value = file
  uploadedFileName.value = file.name
  doUploadParse(file)
}

/**
 * 执行上传解析
 */
const doUploadParse = async (file: File) => {
  uploading.value = true
  try {
    const result = await dataSourceApi.excelUpload(file)
    uploadId.value = result.uploadId
    columns.value = result.columns
    previewData.value = result.previewData
    totalRows.value = result.totalRows
    ElMessage.success(`解析成功，共 ${result.totalRows} 行数据`)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Excel解析失败'
    ElMessage.error(msg)
    columns.value = []
    previewData.value = []
  } finally {
    uploading.value = false
  }
}

/**
 * 列类型选项
 */
const columnTypeOptions = [
  { label: 'VARCHAR (文本)', value: 'VARCHAR' },
  { label: 'INTEGER (整数)', value: 'INTEGER' },
  { label: 'DECIMAL (小数)', value: 'DECIMAL' },
  { label: 'DATE (日期)', value: 'DATE' }
]

/**
 * 设置主键
 */
const handlePrimaryKeyChange = (index: number) => {
  columns.value.forEach((col, i) => {
    col.primaryKey = i === index
  })
}

/**
 * 表单验证
 */
const validate = async () => {
  await formRef.value?.validate()
  if (!isEditMode.value && columns.value.length === 0) {
    throw new Error('请先上传Excel文件')
  }
  if (isEditMode.value && selectedFile.value && columns.value.length === 0) {
    throw new Error('请先上传Excel文件')
  }
}

/**
 * 获取数据（Excel无需加密）
 */
const getEncryptedData = () => {
  return {
    name: formData.name,
    tableName: formData.tableName,
    uploadId: uploadId.value,
    columns: columns.value,
    originalFileName: uploadedFileName.value,
    importMode: formData.importMode
  }
}

/**
 * 是否有新文件上传（编辑模式下判断）
 */
const hasNewFile = computed(() => !!selectedFile.value)

defineExpose({
  validate,
  getEncryptedData,
  isEditMode,
  hasNewFile,
  selectedFile,
  importMode: computed(() => formData.importMode)
})
</script>

<template>
  <div class="excel-editor">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <!-- 基本信息 -->
      <el-form-item label="数据源名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入数据源名称" clearable />
      </el-form-item>

      <el-form-item label="表名称" prop="tableName">
        <el-input
          v-model="formData.tableName"
          placeholder="excel_your_table_name"
          clearable
          :disabled="isEditMode"
        >
          <template #prepend v-if="!isEditMode">excel_</template>
        </el-input>
        <div class="form-tip" v-if="!isEditMode">仅支持字母、数字、下划线，系统自动添加excel_前缀</div>
      </el-form-item>

      <!-- 编辑模式下的导入模式选择 -->
      <el-form-item label="导入模式" v-if="isEditMode">
        <el-radio-group v-model="formData.importMode">
          <el-radio value="overwrite">覆盖（清空原有数据后导入）</el-radio>
          <el-radio value="append">追加（保留原有数据）</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 文件上传 -->
      <el-form-item label="Excel文件">
        <el-upload
          class="excel-upload"
          :auto-upload="false"
          :show-file-list="false"
          accept=".xlsx"
          :on-change="handleFileChange"
          :limit="1"
        >
          <template #trigger>
            <div class="upload-area" v-loading="uploading">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="upload-text" v-if="!uploadedFileName">
                点击选择 .xlsx 文件
              </div>
              <div class="upload-text uploaded" v-else>
                {{ uploadedFileName }}
                <span class="row-count" v-if="totalRows > 0">（{{ totalRows }} 行数据）</span>
              </div>
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <!-- 列配置区域 -->
    <div class="column-config" v-if="showColumnConfig">
      <div class="section-title">列配置</div>
      <el-table :data="columns" border size="small" max-height="300">
        <el-table-column label="原始表头" prop="originalHeader" width="120" />
        <el-table-column label="列名" width="150">
          <template #default="{ row }">
            <el-input v-model="row.name" size="small" placeholder="列名" />
          </template>
        </el-table-column>
        <el-table-column label="类型" width="160">
          <template #default="{ row }">
            <el-select v-model="row.type" size="small" placeholder="类型">
              <el-option
                v-for="opt in columnTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="主键" width="70" align="center">
          <template #default="{ $index }">
            <el-radio
              :model-value="columns[$index]?.primaryKey"
              :value="true"
              @change="handlePrimaryKeyChange($index)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 预览数据 -->
      <div class="section-title" style="margin-top: 16px">数据预览（前10行）</div>
      <el-table :data="previewData" border size="small" max-height="250">
        <el-table-column
          v-for="col in columns"
          :key="col.name"
          :prop="col.name"
          :label="col.originalHeader"
          min-width="120"
          show-overflow-tooltip
        />
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.excel-editor {
  :deep(.el-form) {
    padding: var(--space-5) var(--space-6);
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

    .el-form-item__label {
      font-size: 14px;
      font-weight: 500;
      color: var(--dr-gray-700);
    }

    .el-input__wrapper,
    .el-textarea__inner {
      border-radius: var(--radius-md);
      box-shadow: none;
      border: 1px solid var(--dr-gray-200);
      transition: border-color 0.2s, box-shadow 0.2s;

      &:hover {
        border-color: var(--dr-gray-400);
      }

      &.is-focus,
      &:focus {
        border-color: var(--dr-blue);
        box-shadow: var(--dr-shadow-focus);
      }
    }

    .el-input__inner {
      font-size: 14px;
      font-weight: 400;
      color: var(--dr-gray-900);

      &::placeholder {
        color: var(--dr-gray-500);
      }
    }
  }

  .form-tip {
    font-size: 12px;
    color: var(--dr-gray-500);
    margin-top: 4px;
    line-height: 1.4;
  }

  .excel-upload {
    width: 100%;
  }

  .upload-area {
    width: 100%;
    padding: 20px;
    border: 1px dashed var(--dr-gray-300);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-color: var(--dr-blue);
    }

    .upload-icon {
      font-size: 32px;
      color: var(--dr-gray-400);
      margin-bottom: 8px;
    }

    .upload-text {
      font-size: 13px;
      color: var(--dr-gray-500);

      &.uploaded {
        color: var(--dr-gray-700);
        font-weight: 500;
      }

      .row-count {
        color: var(--dr-blue);
        font-weight: 400;
      }
    }
  }

  .column-config {
    padding: 0 24px 16px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--dr-gray-700);
      margin-bottom: 10px;
      padding-left: 8px;
      border-left: 3px solid var(--dr-blue);
    }
  }
}
</style>
