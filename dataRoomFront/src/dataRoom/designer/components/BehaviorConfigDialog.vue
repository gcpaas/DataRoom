<!-- 交互行为配置对话框 -->
<script setup lang="ts">
import { computed, inject, ref, unref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus, Rank } from '@element-plus/icons-vue'
import type { Behavior } from '@/dataRoom/components/type/Behavior.ts'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import type {
  ChartAction,
  ChartActionType,
  CodeBlockActionConfig,
  NavigateActionConfig,
  TargetChartActionConfig,
  UpdateGlobalVariableActionConfig,
} from '@/dataRoom/components/type/ChartAction.ts'
import {
  CHART_ACTION_TYPE_OPTIONS,
  createDefaultChartAction,
  createDefaultChartActionConfig,
  getChartActionTypeLabel,
  isTargetChartActionConfig,
} from '@/dataRoom/components/type/ChartAction.ts'
import type { GlobalVariable } from '@/dataRoom/designer/types/GlobalVariable.ts'
import type { CanvasInst } from '@/dataRoom/designer/types/CanvasInst.ts'
import { DrConst } from '@/dataRoom/constants/DrConst.ts'
import TargetChartSelectorDialog from './TargetChartSelectorDialog.vue'

const props = defineProps<{
  modelValue: boolean
  behavior: Behavior
  chart: ChartConfig<unknown>
  globalVariableList?: GlobalVariable[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst
const chartConfig = computed(() => props.chart)
const currentChartList = computed(() => unref(canvasInst.chartList) || [])

// 当前选中的action索引
const activeActionIndex = ref<number>(0)
const targetSelectorVisible = ref(false)
const targetSelectorSelectedIds = ref<string[]>([])
const targetSelectorConfig = ref<TargetChartActionConfig | null>(null)

const isChartActionType = (type: string | undefined): type is ChartActionType => {
  return CHART_ACTION_TYPE_OPTIONS.some((item) => item.value === type)
}

const ensureActionConfig = (action: ChartAction, index: number): ChartAction => {
  const type = isChartActionType(action.type) ? action.type : 'code'
  action.name = action.name || `动作${index + 1}`
  action.type = type
  if (!action.chartActionConfig || action.chartActionConfig.type !== type) {
    action.chartActionConfig = createDefaultChartActionConfig(type)
  }
  return action
}

const normalizeActions = (config: { actions: ChartAction[] }) => {
  config.actions.forEach((action, index) => ensureActionConfig(action, index))
}

// 获取并初始化behavior配置
const ensureBehaviorConfig = () => {
  if (!chartConfig.value.behaviors) {
    chartConfig.value.behaviors = {}
  }
  if (!chartConfig.value.behaviors[props.behavior.method]) {
    chartConfig.value.behaviors[props.behavior.method] = {
      disabled: false,
      actions: [],
    }
  }
  const config = chartConfig.value.behaviors[props.behavior.method]
  if (!config) {
    throw new Error(`未找到行为配置: ${props.behavior.method}`)
  }
  normalizeActions(config)
  return config
}

// 获取actions列表
const actions = computed(() => {
  return props.chart.behaviors?.[props.behavior.method]?.actions || []
})

// 当前选中的action
const currentAction = computed(() => {
  if (activeActionIndex.value >= 0 && activeActionIndex.value < actions.value.length) {
    return actions.value[activeActionIndex.value]
  }
  return null
})

const currentTargetActionConfig = computed<TargetChartActionConfig | null>(() => {
  const config = currentAction.value?.chartActionConfig
  if (!config || !isTargetChartActionConfig(config)) {
    return null
  }
  return config
})

const currentNavigateActionConfig = computed<NavigateActionConfig | null>(() => {
  const config = currentAction.value?.chartActionConfig
  return config?.type === 'navigate' ? config : null
})

const currentUpdateGlobalVariableActionConfig = computed<UpdateGlobalVariableActionConfig | null>(() => {
  const config = currentAction.value?.chartActionConfig
  return config?.type === 'updateGlobalVariable' ? config : null
})

const currentCodeBlockActionConfig = computed<CodeBlockActionConfig | null>(() => {
  const config = currentAction.value?.chartActionConfig
  return config?.type === 'code' ? config : null
})

const selectedBehaviorParam = computed(() => {
  const bepName = currentUpdateGlobalVariableActionConfig.value?.bepName
  return props.behavior.paramsList.find((param) => param.name === bepName) || null
})

// 添加新的action
const addAction = () => {
  const config = ensureBehaviorConfig()
  if (!config) {
    return
  }
  const newAction = createDefaultChartAction(config.actions.length + 1)
  config.actions.push(newAction)
  activeActionIndex.value = config.actions.length - 1
  ElMessage.success('已添加新的动作')
}

const handleActionTypeChange = (type: ChartActionType) => {
  const action = currentAction.value
  if (!action) {
    return
  }
  action.type = type
  action.chartActionConfig = createDefaultChartActionConfig(type)
}

// 删除action
const deleteAction = (index: number) => {
  const config = ensureBehaviorConfig()
  if (!config) {
    return
  }
  config.actions.splice(index, 1)
  // 调整选中索引
  if (activeActionIndex.value >= config.actions.length) {
    activeActionIndex.value = Math.max(0, config.actions.length - 1)
  }
  ElMessage.success('已删除动作')
}

// 拖拽排序相关
const dragStartIndex = ref<number>(-1)

const handleDragStart = (index: number) => {
  dragStartIndex.value = index
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent, dropIndex: number) => {
  e.preventDefault()
  if (dragStartIndex.value !== -1 && dragStartIndex.value !== dropIndex) {
    const config = ensureBehaviorConfig()
    if (!config) {
      return
    }
    const dragItem = config.actions[dragStartIndex.value]
    if (!dragItem) {
      return
    }
    config.actions.splice(dragStartIndex.value, 1)
    config.actions.splice(dropIndex, 0, dragItem)

    // 更新选中索引
    if (activeActionIndex.value === dragStartIndex.value) {
      activeActionIndex.value = dropIndex
    } else if (dragStartIndex.value < activeActionIndex.value && dropIndex >= activeActionIndex.value) {
      activeActionIndex.value--
    } else if (dragStartIndex.value > activeActionIndex.value && dropIndex <= activeActionIndex.value) {
      activeActionIndex.value++
    }
  }
  dragStartIndex.value = -1
}

const findChartTitle = (id: string, chartList: ChartConfig<unknown>[] | undefined): string | null => {
  if (!chartList || chartList.length === 0) {
    return null
  }
  for (const chart of chartList) {
    if (chart.id === id) {
      return chart.title || chart.id
    }
    const childTitle = findChartTitle(id, chart.children)
    if (childTitle) {
      return childTitle
    }
  }
  return null
}

const getTargetChartSummary = (targetChartIds: string[]) => {
  if (targetChartIds.length === 0) {
    return ['未选择目标组件']
  }
  return targetChartIds.map((id) => findChartTitle(id, currentChartList.value) || `组件已不存在: ${id}`)
}

const openTargetChartSelector = (config: TargetChartActionConfig) => {
  targetSelectorConfig.value = config
  targetSelectorSelectedIds.value = [...config.targetChartIds]
  targetSelectorVisible.value = true
}

const handleTargetChartConfirm = (targetChartIds: string[]) => {
  if (!targetSelectorConfig.value) {
    return
  }
  targetSelectorConfig.value.targetChartIds = [...targetChartIds]
  targetSelectorSelectedIds.value = [...targetChartIds]
}

// 监听behavior变化，重置选中索引
watch(
  () => props.behavior,
  () => {
    activeActionIndex.value = 0
    ensureBehaviorConfig()
  },
  { immediate: true },
)

watch(
  () => dialogVisible.value,
  (visible) => {
    if (visible) {
      ensureBehaviorConfig()
    }
  },
)

// 关闭对话框
const onClose = () => {
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="`触发事件: ${behavior.name}`" width="80%" :close-on-click-modal="false">
    <div class="dr-behavior-config-wrapper">
      <div class="action-list-wrapper">
        <div class="list-header">
          <span class="title">动作列表</span>
          <el-button type="primary" size="small" @click="addAction">
            <el-icon><Plus /></el-icon>
            添加
          </el-button>
        </div>
        <el-scrollbar>
          <div
            v-for="(action, index) in actions"
            :key="index"
            :class="{ 'action-item': true, active: index === activeActionIndex }"
            :draggable="true"
            @dragstart="handleDragStart(index)"
            @dragover="handleDragOver"
            @drop="(e: DragEvent) => handleDrop(e, index)"
            @click="activeActionIndex = index"
          >
            <el-icon class="drag-icon">
              <Rank />
            </el-icon>
            <div class="action-info">
              <div class="action-name">{{ action.name || `动作${index + 1}` }}</div>
              <div class="action-type">{{ getChartActionTypeLabel(action.type) }}</div>
            </div>
            <el-icon class="delete-icon" @click.stop="deleteAction(index)">
              <Delete />
            </el-icon>
          </div>
        </el-scrollbar>
      </div>
      <div class="action-form-wrapper">
        <el-form v-if="currentAction" label-width="100px" label-position="left" size="default">
          <el-form-item label="动作名称">
            <el-input v-model="currentAction.name" placeholder="请输入动作名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="动作类型">
            <el-select v-model="currentAction.type" placeholder="请选择动作类型" @change="handleActionTypeChange">
              <el-option v-for="option in CHART_ACTION_TYPE_OPTIONS" :key="option.value" :label="option.label" :value="option.value"></el-option>
            </el-select>
          </el-form-item>

          <template v-if="currentTargetActionConfig">
            <el-form-item label="目标组件">
              <div class="target-chart-field">
                <div class="target-chart-summary">
                  <div v-for="summary in getTargetChartSummary(currentTargetActionConfig.targetChartIds)" :key="summary" class="target-chart-summary__item">
                    {{ summary }}
                  </div>
                </div>
                <el-button @click="openTargetChartSelector(currentTargetActionConfig)">选择组件</el-button>
              </div>
            </el-form-item>
          </template>

          <template v-if="currentNavigateActionConfig">
            <el-form-item label="跳转方式">
              <el-select v-model="currentNavigateActionConfig.mode" placeholder="请选择跳转方式">
                <el-option label="外部地址" value="external"></el-option>
                <el-option label="内部路由" value="internal"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="跳转地址">
              <el-input v-model="currentNavigateActionConfig.url" placeholder="请输入跳转地址" clearable></el-input>
            </el-form-item>
            <el-form-item label="打开方式">
              <el-select v-model="currentNavigateActionConfig.target" placeholder="请选择打开方式">
                <el-option label="当前窗口" value="self"></el-option>
                <el-option label="新窗口" value="blank"></el-option>
              </el-select>
            </el-form-item>
          </template>

          <template v-if="currentUpdateGlobalVariableActionConfig">
            <el-form-item label="全局变量">
              <el-select v-model="currentUpdateGlobalVariableActionConfig.globalVariableName" placeholder="请选择全局变量" filterable clearable>
                <el-option v-for="gVar in globalVariableList || []" :key="gVar.id" :label="gVar.name" :value="gVar.name">
                  <div class="custom-option">
                    <span class="option-name">{{ gVar.name }}</span>
                    <span class="option-desc">{{ gVar.remark }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="赋值来源">
              <el-select v-model="currentUpdateGlobalVariableActionConfig.bepName" placeholder="请选择行为参数" filterable clearable>
                <el-option v-for="param in behavior.paramsList" :key="param.name" :label="param.name" :value="param.name">
                  <div class="custom-option">
                    <span class="option-name">{{ param.name }}</span>
                    <span class="option-desc">{{ param.desc }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="值描述">
              <div class="readonly-param-desc">
                <template v-if="selectedBehaviorParam">
                  <div class="readonly-param-desc__name">{{ selectedBehaviorParam.name }}</div>
                  <div class="readonly-param-desc__meta">{{ selectedBehaviorParam.type }}：{{ selectedBehaviorParam.desc || '无描述' }}</div>
                </template>
                <span v-else>未选择行为参数</span>
              </div>
            </el-form-item>
          </template>

          <template v-if="currentCodeBlockActionConfig">
            <el-form-item label="JS代码">
              <el-input v-model="currentCodeBlockActionConfig.code" type="textarea" :rows="12" placeholder="请输入JavaScript代码"></el-input>
            </el-form-item>
            <el-form-item label="说明">
              <el-alert type="info" :closable="false">
                <template v-slot:default>
                  <div class="param-help-title">bep.params对象属性说明</div>
                  <div v-for="param in behavior.paramsList" :key="param.name" class="param-help-row">
                    <strong>{{ param.name }}</strong> ({{ param.type }}): {{ param.desc }}
                  </div>
                  <div v-if="behavior.paramsList.length === 0" class="param-help-empty">无参数</div>
                </template>
              </el-alert>
            </el-form-item>
          </template>
        </el-form>
        <div v-else class="empty-action">
          <el-empty description="请选择或添加动作" />
        </div>
      </div>
    </div>
    <TargetChartSelectorDialog v-model="targetSelectorVisible" :selected-chart-ids="targetSelectorSelectedIds" @confirm="handleTargetChartConfirm" />
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onClose">确定</el-button>
    </template>
  </el-dialog>
</template>
<style scoped lang="scss">
.dr-behavior-config-wrapper {
  display: grid;
  grid-template-columns: 400px auto;
  background-color: var(--el-fill-color-light);
  gap: 0;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;

  .action-list-wrapper {
    height: calc(70vh - 120px);
    background: var(--el-fill-color-blank);
    padding: 16px;
    margin: 16px;
    border-radius: 8px 0 0 8px;
    border: 1px solid var(--el-border-color);

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .title {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .action-item {
      margin: 8px 0;
      padding: 12px;
      position: relative;
      cursor: move;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 6px;
      border: 1px solid var(--el-border-color);
      transition:
        background-color 0.2s ease,
        border-color 0.2s ease;
      gap: 8px;

      .drag-icon {
        font-size: 12px;
        color: var(--el-text-color-disabled);
        cursor: move;
        flex-shrink: 0;
        transition: color 0.2s ease;
      }

      .action-info {
        flex: 1;
        min-width: 0;

        .action-name {
          font-size: 14px;
          color: var(--el-text-color-primary);
          font-weight: 500;
          margin-bottom: 4px;
        }

        .action-type {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }

      .delete-icon {
        font-size: 14px;
        color: var(--el-color-danger);
        cursor: pointer;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.2);
        }
      }

      &:hover {
        background: var(--el-fill-color-lighter);
        border-color: var(--el-border-color-darker);
        cursor: pointer;

        .drag-icon {
          color: var(--el-text-color-regular);
        }
      }

      &.active {
        background: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary-light-8);
      }
    }
  }

  .action-form-wrapper {
    background: var(--el-fill-color-blank);
    padding: 16px;
    margin: 16px 16px 16px 0;
    border-radius: 0 8px 8px 0;
    border: 1px solid var(--el-border-color);

    .empty-action {
      height: calc(70vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .target-chart-field {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: start;
      width: 100%;
    }

    .target-chart-summary {
      display: grid;
      gap: 8px;
      min-width: 0;
    }

    .target-chart-summary__item,
    .readonly-param-desc {
      min-width: 0;
      padding: 8px 12px;
      border: 1px solid var(--el-border-color);
      border-radius: 6px;
      background: var(--el-fill-color-light);
      color: var(--el-text-color-regular);
      line-height: 1.5;
      letter-spacing: 0;
    }

    .custom-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-width: 0;
    }

    .option-name {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .option-desc {
      flex-shrink: 0;
      color: var(--el-text-color-secondary);
    }

    .readonly-param-desc__name {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .readonly-param-desc__meta {
      margin-top: 4px;
      color: var(--el-text-color-secondary);
    }

    .param-help-title {
      font-weight: 600;
    }

    .param-help-row {
      margin-top: 4px;
    }

    .param-help-empty {
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
