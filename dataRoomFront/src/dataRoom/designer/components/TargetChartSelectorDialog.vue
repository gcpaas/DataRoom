<!-- 目标组件选择器 -->
<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue'
import { toPng } from 'html-to-image'
import type { TreeNodeData, TreeOptionProps } from 'element-plus'
import { DrConst } from '@/dataRoom/constants/DrConst.ts'
import type { CanvasInst } from '@/dataRoom/designer/types/CanvasInst.ts'
import { createLayerNodes, type LayerNode } from '@/dataRoom/designer/components/component-layer.ts'

const props = defineProps<{
  modelValue: boolean
  selectedChartIds: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [value: string[]]
}>()

const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const checkedChartIds = ref<string[]>([])
const activeLayerNode = ref<LayerNode>()
const previewImageUrl = ref('')
const previewLoading = ref(false)
const previewMessage = ref('点击左侧组件查看缩略图')

const layerTreeProps: TreeOptionProps = {
  label: 'title',
  children: 'children',
}

const layerList = computed<LayerNode[]>(() => {
  return createLayerNodes(canvasInst.chartList)
})

const collectLayerIds = (nodes: LayerNode[], ids = new Set<string>()) => {
  nodes.forEach((node) => {
    ids.add(node.id)
    if (node.children?.length) {
      collectLayerIds(node.children, ids)
    }
  })
  return ids
}

const validLayerIds = computed(() => collectLayerIds(layerList.value))

const normalizeCheckedChartIds = (chartIds: Array<string | number>) => {
  const validIds = validLayerIds.value
  return Array.from(new Set(chartIds.map(String))).filter((id) => validIds.has(id))
}

const activeChartMeta = computed(() => {
  const chart = activeLayerNode.value?.chart
  if (!chart) {
    return {
      title: '未选择组件',
      type: '-',
      size: '-',
    }
  }
  return {
    title: chart.title || chart.id,
    type: chart.type,
    size: `${chart.w} x ${chart.h}`,
  }
})

const syncCheckedState = () => {
  checkedChartIds.value = normalizeCheckedChartIds(props.selectedChartIds)
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      syncCheckedState()
    }
  },
  { immediate: true },
)

watch(
  () => props.selectedChartIds,
  () => {
    if (props.modelValue) {
      syncCheckedState()
    }
  },
)

const escapeCssIdentifier = (value: string) => {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  return value.replace(/[\0-\x1f\x7f"'\\[\]=~|^$*+?.(){}]/g, '\\$&')
}

const setPlaceholderPreview = (message: string) => {
  previewImageUrl.value = ''
  previewMessage.value = message
}

const waitForFrame = () => {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

const getSnapshotSize = (target: HTMLElement, layerNode: LayerNode) => {
  const rect = target.getBoundingClientRect()
  const width = Math.max(1, Math.round(target.offsetWidth || 0), Math.round(target.scrollWidth || 0), Math.round(layerNode.chart.w || 0), Math.round(rect.width || 0))
  const height = Math.max(1, Math.round(target.offsetHeight || 0), Math.round(target.scrollHeight || 0), Math.round(layerNode.chart.h || 0), Math.round(rect.height || 0))
  return { width, height }
}

const renderPreview = async (layerNode: LayerNode) => {
  activeLayerNode.value = layerNode
  previewLoading.value = true
  setPlaceholderPreview(layerNode.hidden ? '组件已隐藏，无法生成缩略图' : '正在生成缩略图')

  try {
    if (layerNode.hidden) {
      return
    }
    const selector = `[data-dr-id="${escapeCssIdentifier(layerNode.id)}"]`
    const target = document.querySelector(selector) as HTMLElement | null
    if (!target) {
      setPlaceholderPreview('未找到组件 DOM，无法生成缩略图')
      return
    }
    await nextTick()
    await waitForFrame()
    const { width, height } = getSnapshotSize(target, layerNode)
    previewImageUrl.value = await toPng(target, {
      cacheBust: true,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width,
      height,
      canvasWidth: width,
      canvasHeight: height,
      style: {
        position: 'relative',
        left: '0',
        top: '0',
        right: 'auto',
        bottom: 'auto',
        width: `${width}px`,
        height: `${height}px`,
        margin: '0',
        transform: 'none',
        transformOrigin: 'left top',
      },
    })
  } catch (error) {
    console.error('缩略图生成失败:', error)
    setPlaceholderPreview('缩略图生成失败')
  } finally {
    previewLoading.value = false
  }
}

const onLayerClick = (data: TreeNodeData) => {
  renderPreview(data as LayerNode)
}

const isChartChecked = (id: string) => {
  return checkedChartIds.value.includes(id)
}

const onCheckboxChange = (layerNode: LayerNode, checked: string | number | boolean) => {
  if (checked) {
    checkedChartIds.value = normalizeCheckedChartIds([...checkedChartIds.value, layerNode.id])
    return
  }
  checkedChartIds.value = checkedChartIds.value.filter((id) => id !== layerNode.id)
}

const onCancel = () => {
  dialogVisible.value = false
}

const onConfirm = () => {
  emit('confirm', normalizeCheckedChartIds(checkedChartIds.value))
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog v-model="dialogVisible" title="选择目标组件" width="860px" :close-on-click-modal="false">
    <div class="target-chart-selector">
      <section class="target-chart-selector__tree-panel" aria-label="目标组件列表">
        <el-tree
          :data="layerList"
          :props="layerTreeProps"
          node-key="id"
          default-expand-all
          empty-text="暂无组件"
          :expand-on-click-node="false"
          @node-click="onLayerClick"
        >
          <template v-slot:default="{ data }">
            <div class="target-chart-selector__tree-node" :class="{ 'target-chart-selector__tree-node--hidden': data.hidden }">
              <el-checkbox :model-value="isChartChecked(data.id)" @click.stop @change="(checked: string | number | boolean) => onCheckboxChange(data, checked)" />
              <span class="target-chart-selector__tree-title">{{ data.title || data.id }}</span>
            </div>
          </template>
        </el-tree>
      </section>

      <section class="target-chart-selector__preview-panel" aria-label="目标组件预览">
        <div class="target-chart-selector__preview-header">
          <div class="target-chart-selector__preview-title">{{ activeChartMeta.title }}</div>
          <div class="target-chart-selector__preview-meta">
            <span>{{ activeChartMeta.type }}</span>
            <span>{{ activeChartMeta.size }}</span>
          </div>
        </div>

        <div class="target-chart-selector__preview-body">
          <el-skeleton v-if="previewLoading" :rows="5" animated />
          <div v-else-if="previewImageUrl" class="target-chart-selector__preview-image-frame">
            <img class="target-chart-selector__preview-image" :src="previewImageUrl" :alt="`${activeChartMeta.title}缩略图`" />
          </div>
          <div v-else-if="activeLayerNode" class="target-chart-selector__preview-placeholder">
            <div class="target-chart-selector__placeholder-message">{{ previewMessage }}</div>
            <dl class="target-chart-selector__placeholder-meta">
              <div>
                <dt>组件名称</dt>
                <dd>{{ activeChartMeta.title }}</dd>
              </div>
              <div>
                <dt>类型</dt>
                <dd>{{ activeChartMeta.type }}</dd>
              </div>
              <div>
                <dt>尺寸</dt>
                <dd>{{ activeChartMeta.size }}</dd>
              </div>
            </dl>
          </div>
          <div v-else class="target-chart-selector__empty-message">点击左侧组件查看缩略图</div>
        </div>
      </section>
    </div>

    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.target-chart-selector {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  min-height: 460px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
  overflow: hidden;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.target-chart-selector__tree-panel {
  min-width: 0;
  padding: 16px;
  border-right: 1px solid var(--el-border-color);
  // background: var(--el-fill-color-light);
  overflow: auto;
}

.target-chart-selector__tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  width: 100%;
}

.target-chart-selector__tree-node--hidden {
  opacity: 0.6;
}

.target-chart-selector__tree-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-regular);
  letter-spacing: 0;
}

.target-chart-selector__preview-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  background: var(--el-bg-color);
}

.target-chart-selector__preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.target-chart-selector__preview-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.57;
  letter-spacing: 0;
}

.target-chart-selector__preview-meta {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
  letter-spacing: 0;
  font-feature-settings: 'tnum';
}

.target-chart-selector__preview-body {
  display: grid;
  place-items: center;
  min-height: 0;
  padding: 16px;
  overflow: hidden;
}

.target-chart-selector__preview-image-frame {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--el-fill-color-blank);
}

.target-chart-selector__preview-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.target-chart-selector__preview-placeholder {
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: 360px;
  padding: 24px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
}

.target-chart-selector__placeholder-message {
  color: var(--el-text-color-regular);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.57;
  text-align: center;
  letter-spacing: 0;
}

.target-chart-selector__empty-message {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.57;
  text-align: center;
  letter-spacing: 0;
}

.target-chart-selector__placeholder-meta {
  display: grid;
  gap: 8px;
  margin: 0;

  div {
    display: grid;
    grid-template-columns: 80px minmax(0, 1fr);
    gap: 12px;
    align-items: baseline;
  }

  dt,
  dd {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    letter-spacing: 0;
  }

  dt {
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }

  dd {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-primary);
    font-feature-settings: 'tnum';
  }
}
</style>
