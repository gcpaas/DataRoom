<!-- 定时器配置对话框 -->
<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { PageTimer } from '@/dataRoom/page-designer/type/PageTimer.ts'
import { ensureTimerTickBehavior, TIMER_TICK_BEHAVIOR } from '@/dataRoom/page-designer/type/PageTimer.ts'
import type { GlobalVariable } from '@/dataRoom/designer/types/GlobalVariable.ts'
import ActionConfigEditor from '@/dataRoom/designer/components/ActionConfigEditor.vue'

const props = defineProps<{
  modelValue: boolean
  timer: PageTimer
  globalVariableList?: GlobalVariable[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const tickBehavior = computed(() => ensureTimerTickBehavior(props.timer))

watch(
  () => props.timer,
  () => {
    ensureTimerTickBehavior(props.timer)
  },
  { immediate: true },
)

const onClose = () => {
  dialogVisible.value = false
}

const onConfirm = () => {
  if (!props.timer.name.trim()) {
    ElMessage.warning('请输入定时器名称')
    return
  }
  if (props.timer.interval < 500) {
    ElMessage.warning('定时器间隔不能小于500ms')
    return
  }
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="`定时器配置 - ${timer.name}`" width="80%" :close-on-click-modal="false">
    <el-scrollbar class="dialog-scrollbar">
      <div class="dr-timer-config-wrapper">
        <div class="basic-config-section">
          <el-form label-position="left" size="default" inline class="inline-form">
            <el-form-item label="名称">
              <el-input v-model="timer.name" placeholder="请输入定时器名称" clearable class="timer-name-input"></el-input>
            </el-form-item>
            <el-form-item label="执行间隔">
              <el-input-number v-model="timer.interval" :min="100" :max="3600000" :step="1000" controls-position="right" class="timer-interval-input" />
              <span class="form-tip">单位：毫秒</span>
            </el-form-item>
            <el-form-item label="启用状态">
              <el-switch v-model="timer.enabled" />
            </el-form-item>
            <el-form-item label="事件状态">
              <el-switch v-model="tickBehavior.disabled" :active-value="false" :inactive-value="true" />
            </el-form-item>
          </el-form>
        </div>
        <ActionConfigEditor :behavior="TIMER_TICK_BEHAVIOR" :actions="tickBehavior.actions" :global-variable-list="globalVariableList" />
      </div>
    </el-scrollbar>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.dialog-scrollbar {
  height: calc(70vh - 60px);
  padding: 0 4px;
}

.dr-timer-config-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;

  .basic-config-section {
    background: var(--el-fill-color-light);
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color);

    .inline-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;

      .timer-name-input {
        width: 180px;
      }

      .timer-interval-input {
        width: 180px;
      }

      .form-tip {
        margin-left: 8px;
        color: var(--el-text-color-secondary);
        font-size: 12px;
        letter-spacing: 0;
      }
    }
  }
}
</style>
