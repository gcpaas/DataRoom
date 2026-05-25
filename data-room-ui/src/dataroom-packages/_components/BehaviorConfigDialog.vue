<!-- 交互行为配置对话框 -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus, Rank } from '@element-plus/icons-vue'
import type { Behavior } from '@/dataroom-packages/components/type/Behavior.ts'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'
import type { ChartAction } from '@/dataroom-packages/components/type/ChartAction.ts'

const props = defineProps<{
  modelValue: boolean
  behavior: Behavior
  chart: ChartConfig<unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// 当前选中的action索引
const activeActionIndex = ref<number>(0)

// 获取或初始化behavior配置
const getBehaviorConfig = () => {
  if (!props.chart.behaviors) {
    props.chart.behaviors = {}
  }
  if (!props.chart.behaviors[props.behavior.method]) {
    props.chart.behaviors[props.behavior.method] = {
      disabled: false,
      actions: [],
    }
  }
  return props.chart.behaviors[props.behavior.method]
}

// 获取actions列表
const actions = computed(() => {
  const config = getBehaviorConfig()
  return config?.actions || []
})

// 当前选中的action
const currentAction = computed(() => {
  if (activeActionIndex.value >= 0 && activeActionIndex.value < actions.value.length) {
    return actions.value[activeActionIndex.value]
  }
  return null
})

// 添加新的action
const addAction = () => {
  const config = getBehaviorConfig()
  if (!config) {
    return
  }
  // 自动生成动作名称
  const actionCount = config.actions.length + 1
  const newAction: ChartAction = {
    name: `动作${actionCount}`,
    type: 'code',
    code: '// 请输入JS代码\n',
  }
  config.actions.push(newAction)
  activeActionIndex.value = config.actions.length - 1
  ElMessage.success('已添加新的动作')
}

// 删除action
const deleteAction = (index: number) => {
  const config = getBehaviorConfig()
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
    const config = getBehaviorConfig()
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

// 监听behavior变化，重置选中索引
watch(
  () => props.behavior,
  () => {
    activeActionIndex.value = 0
  },
  { immediate: true },
)

// 关闭对话框
const onClose = () => {
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="`${behavior.name}动作`" width="80%" :close-on-click-modal="false">
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
              <div class="action-type">{{ action.type === 'code' ? '代码' : action.type }}</div>
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
            <el-select v-model="currentAction.type" disabled>
              <el-option label="代码" value="code"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="JS代码">
            <el-input v-model="currentAction.code" type="textarea" :rows="12" placeholder="请输入JavaScript代码"></el-input>
          </el-form-item>
          <el-form-item label="说明">
            <el-alert type="info" :closable="false">
              <template #default>
                <div class="param-help-title">bep.params对象属性说明</div>
                <div v-for="param in behavior.paramsList" :key="param.name" class="param-help-row">
                  <strong>{{ param.name }}</strong> ({{ param.type }}): {{ param.desc }}
                </div>
                <div v-if="behavior.paramsList.length === 0" class="param-help-empty">无参数</div>
              </template>
            </el-alert>
          </el-form-item>
        </el-form>
        <div v-else class="empty-action">
          <el-empty description="请选择或添加动作" />
        </div>
      </div>
    </div>
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
