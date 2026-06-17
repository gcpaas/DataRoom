<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'

const props = defineProps<{
  chart?: ChartConfig<unknown>
}>()
// 确保拿到的chart非空
const chart = props.chart!

const emit = defineEmits<{
  switchRightControlPanel: [open: boolean]
  deleteChart: [chartId: string]
}>()

onMounted(() => {
  document.addEventListener('click', onOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick)
})

const contextMenuRef = ref()
const contextMenuVisible = ref(true)
/**
 * 点击其他位置后，隐藏菜单
 * @param e
 */
const onOutsideClick = (e: MouseEvent) => {
  if (contextMenuRef.value) {
    if (!contextMenuRef.value.contains(e.target as Node)) {
      contextMenuVisible.value = false
    }
  }
}

/**
 * 点击配置
 */
const onChartConfigClick = () => {
  emit('switchRightControlPanel', true)
  contextMenuVisible.value = false
}
/**
 * 删除组件
 */
const onChartDeleteClick = () => {
  ElMessageBox.confirm('确定要删除这个组件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emit('switchRightControlPanel', false)
      emit('deleteChart', chart.id)
      contextMenuVisible.value = false
    })
    .catch(() => {
      // 用户取消删除
    })
}
/**
 * 复制组件
 */
const onChartCopyClick = () => {
  ElMessage.warning('功能开发中...')
  contextMenuVisible.value = false
}
/**
 * 隐藏组件
 */
const onChartHideClick = () => {
  ElMessage.warning('功能开发中...')
  contextMenuVisible.value = false
}
</script>

<template>
  <div class="dr-context-menu-wrapper" ref="contextMenuRef" v-if="contextMenuVisible">
    <div class="menu" @click="onChartConfigClick">配置</div>
    <div class="menu" @click="onChartDeleteClick">删除</div>
    <div class="menu" @click="onChartCopyClick">复制并粘贴</div>
    <div class="menu" @click="onChartHideClick">设为隐藏</div>
  </div>
</template>

<style scoped>
.dr-context-menu-wrapper {
  width: 200px;
  background: var(--el-fill-color-blank);
  padding: 8px 0;
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
  color: var(--el-text-color-regular);
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  font-size: 14px;
  font-weight: 400;
  z-index: 2000;

  & .menu {
    padding: 8px 16px;
    transition: all 0.15s;

    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
      cursor: pointer;
    }
  }
}
</style>
