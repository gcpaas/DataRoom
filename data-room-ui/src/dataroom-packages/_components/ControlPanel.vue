<!-- 控制面板 -->
<script setup lang="ts">
import {computed, ref, watch, defineAsyncComponent, inject} from 'vue'
import {Pointer, Setting} from "@element-plus/icons-vue";
import {getComponentBehaviors, getComponentDatasetFields} from "@/dataroom-packages/components/AutoInstall.ts";
import type {DatasetEntity, DatasetInputParam, DatasetOutputParam} from '@/dataroom-packages/dataset/api'
import {datasetApi} from '@/dataroom-packages/dataset/api'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";
import type {CanvasInst} from "@/dataroom-packages/PageDesigner/type/CanvasInst.ts";
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts";
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts";
import type {GlobalVariable} from "@/dataroom-packages/PageDesigner/type/GlobalVariable.ts";

const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst
/**
 * 懒加载数据集管理页面
 */
const DatasetManage = defineAsyncComponent(() => import('@/dataroom-packages/dataset/index.vue'))
/**
 * 懒加载交互配置对话框
 */
const BehaviorConfigDialog = defineAsyncComponent(() => import('./BehaviorConfigDialog.vue'))

const {chart, globalVariableList = []} = defineProps<{
  chart: ChartConfig<unknown>
  globalVariableList?: GlobalVariable[]
}>()

// 默认激活样式tab
const activeTab = ref('style')
// 默认展开所有数据折叠面板
const activeDataCollapse = ref(['dataset', 'fields', 'params', 'script'])
const chartConfig = computed(() => chart)

// 数据集选择对话框
const datasetDialogVisible = ref(false)
const selectedDataset = ref<DatasetEntity | null>(null)
const datasetName = ref('')
const datasetFields = ref<ChartDatasetField[]>([])
const behaviors = ref<Behavior[]>([])
const behaviorConfigDialogVisible = ref(false)
const currentBehavior = ref<Behavior | null>(null)
// 数据集输出字段列表
const datasetOutputList = ref<DatasetOutputParam[]>([])
// 数据集输入参数列表
const datasetInputList = ref<DatasetInputParam[]>([])
// 计算属性：过滤出有效的数据集输入参数
const validDatasetInputList = computed(() => {
  if (!chartConfig.value.dataset?.params) {
    return []
  }
  return datasetInputList.value.filter(input => {
    return chartConfig.value.dataset.params && chartConfig.value.dataset.params[input.name]
  })
})
// 表单引用
const dataFormRef = ref()
// 表单校验规则
const dataFormRules = computed(() => {
  const rules: Record<string, any[]> = {}
  datasetFields.value.forEach(field => {
    if (field.required) {
      rules[`fields.${field.name}`] = [
        {required: true, message: `请选择${field.desc}`, trigger: 'change'}
      ]
    }
  })
  return rules
})

/**
 * 初始化组件相关数据
 * 根据组件类型获取对应的数据集字段、行为等属性
 */
const initComponentData = () => {
  datasetFields.value = getComponentDatasetFields(chart.type)
  behaviors.value = getComponentBehaviors(chart.type)
  // 加载数据集名称
  loadDatasetName()
  // 初始化字段为数组
  initDatasetFields()
}

// 加载数据集名称、输出字段和输入参数
const loadDatasetName = async () => {
  datasetName.value = ''
  datasetOutputList.value = []
  datasetInputList.value = []
  if (chartConfig.value.dataset?.code) {
    const detail = await datasetApi.detail(chartConfig.value.dataset?.code)
    datasetName.value = detail.name
    datasetOutputList.value = detail.outputList || []
    datasetInputList.value = detail.inputList || []
    // 初始化 params 结构
    initDatasetParams()
  }
}

// 初始化数据集参数
const initDatasetParams = () => {
  if (!chartConfig.value.dataset.params) {
    chartConfig.value.dataset.params = {}
  }
  // 为每个入参初始化配置（如果不存在）
  datasetInputList.value.forEach(input => {
    if (!chartConfig.value.dataset.params) {
      chartConfig.value.dataset.params = {}
    }
    if (!chartConfig.value.dataset.params[input.name]) {
      chartConfig.value.dataset.params[input.name] = {
        from: 'globalVar',
        variableName: '',
        defaultValue: input.defaultVal || ''
      }
    }
  })
}

// 初始化数据集字段
const initDatasetFields = () => {
  if (!chartConfig.value.dataset.fields) {
    chartConfig.value.dataset.fields = {}
  }
  // 为每个字段初始化为数组（如果不存在或不是数组）
  datasetFields.value.forEach(field => {
    const currentValue = chartConfig.value.dataset.fields[field.name]
    if (!currentValue) {
      // 如果字段不存在，初始化为空数组
      chartConfig.value.dataset.fields[field.name] = []
    } else if (!Array.isArray(currentValue)) {
      // 如果字段存在但不是数组，转换为数组
      chartConfig.value.dataset.fields[field.name] = currentValue ? [currentValue] : []
    }
  })
}

// 打开数据集选择对话框
const openDatasetDialog = () => {
  datasetDialogVisible.value = true
}

// 处理数据集选择
const handleDatasetSelect = (dataset: DatasetEntity) => {
  selectedDataset.value = dataset
}

// 取消选择
const handleCancelDataset = () => {
  datasetDialogVisible.value = false
  selectedDataset.value = null
}

// 确认选择数据集
const handleConfirmDataset = () => {
  if (selectedDataset.value) {
    console.log(selectedDataset.value)
    // 更新数据集名称到输入框
    datasetName.value = selectedDataset.value.name
    // 保存数据集编码到chartConfig
    chartConfig.value.dataset.code = selectedDataset.value.code ?? ''
    // 更新输出字段列表
    datasetOutputList.value = selectedDataset.value.outputList || []
    // 更新输入参数列表
    datasetInputList.value = selectedDataset.value.inputList || []
    // 初始化参数配置
    initDatasetParams()
    // 初始化字段为数组
    initDatasetFields()
    datasetDialogVisible.value = false
    // 触发自动刷新
    triggerAutoRefresh()
  }
}

/**
 * 检查交互行为是否启用
 * @param behavior
 */
const isBehaviorEnabled = (behavior: Behavior): boolean => {
  if (!chartConfig.value.behaviors) {
    return false
  }
  const behaviorConfig = chartConfig.value.behaviors[behavior.method]
  if (!behaviorConfig) {
    return false
  }
  return !behaviorConfig.disabled
}

/**
 * 切换交互行为开关
 * @param behavior
 * @param enabled
 */
const toggleBehavior = (behavior: Behavior, enabled: boolean) => {
  if (!chartConfig.value.behaviors) {
    chartConfig.value.behaviors = {}
  }
  let oriBehavior = chartConfig.value.behaviors[behavior.method]
  if (!oriBehavior) {
    chartConfig.value.behaviors[behavior.method] = {
      disabled: !enabled,
      actions: []
    }
    return
  }
  oriBehavior.disabled = !enabled
}

/**
 * 打开交互行为配置对话框
 * @param behavior
 */
const openBehaviorConfig = (behavior: Behavior) => {
  currentBehavior.value = behavior
  behaviorConfigDialogVisible.value = true
}

/**
 * 获取数据集参数配置
 * @param paramName 参数名称
 */
const getParamConfig = (paramName: string) => {
  if (!chartConfig.value.dataset?.params) {
    return null
  }
  return chartConfig.value.dataset.params[paramName] || null
}

/**
 * 处理字段选择变化
 * 当field.multiple为false时，自动保留最新选择的项（单选效果）
 * 当field.multiple为true时，保持多选行为
 */
const handleFieldChange = (field: ChartDatasetField, newValue: string[]) => {
  if (!field.multiple && newValue.length > 1) {
    // 单选模式：只保留最新选择的项
    const arr = newValue[newValue.length - 1]!
    chartConfig.value.dataset.fields[field.name] = [arr]
  } else {
    // 多选模式：保持原样
    chartConfig.value.dataset.fields[field.name] = newValue
  }
  triggerAutoRefresh()
}

/**
 * 监听组件实例变化
 * 当chart.id改变时，说明切换了不同的组件实例，需要重新初始化
 * immediate: true 确保首次进入时也会执行
 */
watch(
  () => chart.id,
  () => {
    initComponentData()
  },
  {immediate: true}
)

/**
 * 触发组件自动刷新数据
 */
const triggerAutoRefresh = () => {
  if (!chart.id) {
    return
  }
  try {
    canvasInst.triggerChartAction(chart.id, {
      name: 'autoRefreshData',
      type: 'autoRefreshData',
      code: ''
    }, {})
  } catch (error) {
    console.error('触发自动刷新失败:', error)
  }
}

</script>

<template>
  <div class="dr-control-panel">
    <el-tabs v-model="activeTab" class="control-tabs">
      <el-tab-pane label="样式" name="style">
        <div class="tab-content">
          <el-form label-width="100px" label-position="left" size="small">
            <el-form-item label="标题/图层">
              <el-input v-model="chartConfig.title"></el-input>
            </el-form-item>
          </el-form>
          <slot></slot>
        </div>
      </el-tab-pane>
      <el-tab-pane label="数据" name="data">
        <div class="tab-content">
          <el-collapse v-model="activeDataCollapse" class="dr-collapse">
            <!-- 数据集选择 -->
            <el-collapse-item name="dataset" title="数据集选择">
              <el-form ref="dataFormRef" :model="chartConfig.dataset" :rules="dataFormRules" label-width="100px" label-position="left" size="small">
                <el-form-item label="数据集">
                  <el-input
                    v-model="datasetName"
                    placeholder="请选择数据集"
                    :suffix-icon="Pointer"
                    readonly
                    @click="openDatasetDialog"
                    style="cursor: pointer;"
                  ></el-input>
                </el-form-item>
              </el-form>
            </el-collapse-item>

            <!-- 字段绑定 -->
            <el-collapse-item name="fields" title="组件字段绑定">
              <el-form ref="dataFormRef" :model="chartConfig.dataset" :rules="dataFormRules" label-width="100px" label-position="left" size="small">
                <el-form-item
                  v-for="field in datasetFields"
                  :key="field.name"
                  :label="field.desc"
                  :prop="'fields.' + field.name"
                  :required="field.required"
                >
                  <el-select
                    :model-value="chartConfig.dataset.fields[field.name]"
                    @update:model-value="(val:string[]) => handleFieldChange(field, val)"
                    :placeholder="`请选择${field.desc}`"
                    multiple
                    :multiple-limit="field.multiple ? 10 : 0"
                    filterable
                    allow-create
                    default-first-option
                    clearable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="output in datasetOutputList"
                      :key="output.name"
                      :label="output.name"
                      :value="output.name"
                    >
                      <div class="custom-option">
                        <span class="option-name">{{ output.name }}</span>
                        <span class="option-desc">{{ output.desc }}</span>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </el-collapse-item>

            <!-- 数据集参数绑定 -->
            <el-collapse-item name="params" title="数据集参数绑定" v-if="validDatasetInputList.length > 0">
              <el-form :model="chartConfig.dataset" label-width="100px" label-position="left" size="small">
                <template v-for="inputParam in validDatasetInputList" :key="inputParam.name">
                  <div class="param-item">
                    <div class="param-header">
                      <span class="param-name">{{ inputParam.name }}</span>
                      <span class="param-desc" v-if="inputParam.desc">（{{ inputParam.desc }}）</span>
                    </div>

                    <el-form-item label="参数来源" v-if="getParamConfig(inputParam.name)">
                      <el-select
                        v-model="getParamConfig(inputParam.name)!.from"
                        placeholder="请选择参数来源"
                        style="width: 100%"
                        @change="triggerAutoRefresh"
                      >
                        <el-option label="全局变量" value="globalVar"></el-option>
                      </el-select>
                    </el-form-item>

                    <el-form-item label="变量名称" v-if="getParamConfig(inputParam.name)">
                      <el-select
                        v-if="getParamConfig(inputParam.name)!.from === 'globalVar'"
                        v-model="getParamConfig(inputParam.name)!.variableName"
                        placeholder="请选择全局变量"
                        filterable
                        clearable
                        style="width: 100%"
                        @change="triggerAutoRefresh"
                      >
                        <el-option
                          v-for="gVar in globalVariableList"
                          :key="gVar.id"
                          :label="gVar.name"
                          :value="gVar.name"
                        >
                          <div class="custom-option">
                            <span class="option-name">{{ gVar.name }}</span>
                            <span class="option-desc">{{ gVar.remark }}</span>
                          </div>
                        </el-option>
                      </el-select>
                      <el-input
                        v-else
                        v-model="getParamConfig(inputParam.name)!.variableName"
                        placeholder="请输入变量名称"
                        style="width: 100%"
                        @change="triggerAutoRefresh"
                      ></el-input>
                    </el-form-item>

                    <el-form-item label="默认值" v-if="getParamConfig(inputParam.name)">
                      <el-input
                        v-model="getParamConfig(inputParam.name)!.defaultValue"
                        placeholder="请输入默认值"
                        style="width: 100%"
                        @change="triggerAutoRefresh"
                      ></el-input>
                    </el-form-item>
                  </div>
                </template>
              </el-form>
            </el-collapse-item>

            <!-- 数据处理 -->
            <el-collapse-item name="script" title="数据处理">
              <el-form :model="chartConfig.dataset" label-width="100px" label-position="left" size="small">
                <el-form-item label="处理脚本">
                  <el-input
                    v-model="chartConfig.dataset.script"
                    type="textarea"
                    :rows="8"
                    placeholder="请输入数据处理JS脚本"
                    style="width: 100%"
                    @change="triggerAutoRefresh"
                  ></el-input>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-tab-pane>
      <el-tab-pane label="交互" name="interaction">
        <div class="tab-content">
          <div class="behavior-list">
            <div class="behavior-item" v-for="behavior in behaviors" :key="behavior.name">
              <div class="behavior-info">
                <div class="behavior-name">{{ behavior.name }}</div>
                <div class="behavior-desc">{{ behavior.desc }}</div>
              </div>
              <div class="behavior-controls">
                <el-switch
                  :model-value="isBehaviorEnabled(behavior)"
                  size="small"
                  @change="(val: boolean) => toggleBehavior(behavior, val)"
                />
                <el-icon class="setting-icon" @click="openBehaviorConfig(behavior)">
                  <Setting/>
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 数据集选择对话框 -->
    <el-dialog
      v-model="datasetDialogVisible"
      title="选择数据集"
      width="80%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="dataset-dialog-wrapper">
        <DatasetManage :selectable="true" @update:selectedDataset="handleDatasetSelect"/>
      </div>
      <template #footer>
        <el-button @click="handleCancelDataset">取消</el-button>
        <el-button type="primary" @click="handleConfirmDataset">确定</el-button>
      </template>
    </el-dialog>

    <!-- 交互配置对话框 -->
    <BehaviorConfigDialog
      v-if="behaviorConfigDialogVisible && currentBehavior"
      v-model="behaviorConfigDialogVisible"
      :behavior="currentBehavior"
      :chart="chartConfig"
    />
  </div>
</template>

<style scoped lang="scss">
@use "./assets/index.scss";

.dr-control-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .control-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
      border-bottom: none;
      padding: 0 16px;
    }

    :deep(.el-tabs__nav-wrap)::after {
      display: none;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
    }

    .tab-content {
      padding: 16px;
      height: 100%;
      overflow-y: auto;

      .placeholder {
        color: var(--el-text-color-secondary);
        text-align: center;
        padding: 40px 0;
      }
    }

    .behavior-list {
      .behavior-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        margin-bottom: 16px;
        background: var(--dr-bg2);
        border-radius: 4px;
        border: 1px solid var(--dr-border);

        .behavior-info {
          flex: 1;
          min-width: 0;
          margin-right: 12px;

          .behavior-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--dr-text);
            margin-bottom: 4px;
          }

          .behavior-desc {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .behavior-controls {
          display: flex;
          align-items: center;
          gap: 12px;

          .setting-icon {
            color: var(--dr-text);
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              color: var(--dr-primary);
              transform: rotate(90deg);
            }
          }
        }
      }
    }
  }
}

// 自定义下拉选项样式
.custom-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .option-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .option-desc {
    flex-shrink: 0;
    margin-left: 12px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    text-align: right;
  }
}

// 数据集选择对话框样式
.dataset-dialog-wrapper {
  height: calc(70vh - 120px);
  overflow: hidden;

  // 调整数据集组件在对话框中的样式
  :deep(.dr-dataset) {
    height: 100%;
    overflow: hidden;
  }

  :deep(.dataset-left) {
    flex-shrink: 0;
    height: 100%;
  }

  :deep(.dataset-left .tree-content) {
    flex: 1;
    overflow: hidden;
  }

  :deep(.dataset-left .tree-content .el-scrollbar__wrap) {
    overflow-x: hidden;
  }

  :deep(.dataset-right) {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  :deep(.el-scrollbar) {
    height: 100%;
  }

  :deep(.el-scrollbar__view) {
    height: 100%;
  }

  :deep(.el-scrollbar__bar) {
    z-index: 10 !important;
  }
}

// 参数项样式
.param-item {
  padding: 12px;
  margin-bottom: 16px;
  background: var(--dr-bg2);
  border-radius: 4px;
  border: 1px solid var(--dr-border);

  .param-header {
    margin-bottom: 12px;
    font-weight: 500;

    .param-name {
      color: var(--dr-text);
      font-size: 14px;
    }

    .param-desc {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      margin-left: 4px;
    }
  }

  .el-form-item {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
