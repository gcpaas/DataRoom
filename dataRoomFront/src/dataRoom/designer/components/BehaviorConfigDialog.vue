<!-- 交互行为配置对话框 -->
<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Behavior } from '@/dataRoom/components/type/Behavior.ts'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import type { GlobalVariable } from '@/dataRoom/designer/types/GlobalVariable.ts'
import ActionConfigEditor from './ActionConfigEditor.vue'

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

const chartConfig = computed(() => props.chart)

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
  return config
}

const behaviorConfig = computed(() => ensureBehaviorConfig())

watch(
  () => props.behavior,
  () => {
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

const onClose = () => {
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="`触发事件: ${behavior.name}`" width="80%" :close-on-click-modal="false">
    <ActionConfigEditor :behavior="behavior" :actions="behaviorConfig.actions" :global-variable-list="globalVariableList" />
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onClose">确定</el-button>
    </template>
  </el-dialog>
</template>
