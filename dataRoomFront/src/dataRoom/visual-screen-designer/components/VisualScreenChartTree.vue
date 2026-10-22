<script setup lang="ts">
import { computed } from 'vue'

import { getComponent } from '@/dataRoom/components/AutoInstall.ts'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import { filterVisibleCharts, getVisibleChartChildren } from '@/dataRoom/designer/utils/chart-visibility.ts'
import { isGroupChart } from '@/dataRoom/visual-screen-designer/grouping'
import { getVisualScreenChartWrapperStyle } from '@/dataRoom/visual-screen-designer/chart-style'
import { shouldBlockVisualScreenIframeInteraction } from '@/dataRoom/visual-screen-designer/selection-state'

defineOptions({ name: 'VisualScreenChartTree' })

const props = withDefaults(
  defineProps<{
    charts?: ChartConfig<unknown>[]
    parentId?: string
    scopeParentId?: string
    mode?: 'designer' | 'preview'
    iframeInteractionEnabled?: boolean
  }>(),
  { mode: 'designer', iframeInteractionEnabled: false },
)

const emit = defineEmits<{
  chartClick: [event: MouseEvent, chart: ChartConfig<unknown>, parentId: string | undefined]
  chartDoubleClick: [event: MouseEvent, chart: ChartConfig<unknown>, parentId: string | undefined]
  chartContextmenu: [event: MouseEvent, chart: ChartConfig<unknown>, parentId: string | undefined]
}>()

const visibleCharts = computed(() => filterVisibleCharts(props.charts))

const isDirectScopeChild = (parentId: string | undefined) => parentId === props.scopeParentId

const isEditingScopeChart = (chart: ChartConfig<unknown>) => props.mode === 'designer' && chart.id === props.scopeParentId

const shouldBlockIframeInteraction = (chart: ChartConfig<unknown>) => {
  return shouldBlockVisualScreenIframeInteraction(props.mode, chart.type, props.iframeInteractionEnabled)
}

const canEmitDesignerEvent = (parentId: string | undefined) => {
  if (props.mode !== 'designer') {
    return false
  }
  if (isDirectScopeChild(parentId)) {
    return true
  }
  return Boolean(props.scopeParentId) && parentId === undefined
}

const onChartClick = (event: MouseEvent, chart: ChartConfig<unknown>) => {
  if (!canEmitDesignerEvent(props.parentId)) {
    return
  }
  event.stopPropagation()
  emit('chartClick', event, chart, props.parentId)
}

const onChartDoubleClick = (event: MouseEvent, chart: ChartConfig<unknown>) => {
  if (!canEmitDesignerEvent(props.parentId)) {
    return
  }
  event.stopPropagation()
  emit('chartDoubleClick', event, chart, props.parentId)
}

const onChartContextmenu = (event: MouseEvent, chart: ChartConfig<unknown>) => {
  if (!canEmitDesignerEvent(props.parentId)) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  emit('chartContextmenu', event, chart, props.parentId)
}

const forwardChartClick = (event: MouseEvent, chart: ChartConfig<unknown>, parentId: string | undefined) => {
  emit('chartClick', event, chart, parentId)
}

const forwardChartDoubleClick = (event: MouseEvent, chart: ChartConfig<unknown>, parentId: string | undefined) => {
  emit('chartDoubleClick', event, chart, parentId)
}

const forwardChartContextmenu = (event: MouseEvent, chart: ChartConfig<unknown>, parentId: string | undefined) => {
  emit('chartContextmenu', event, chart, parentId)
}
</script>

<template>
  <template v-if="mode === 'designer'">
    <div
      class="chart-wrapper"
      :class="{ 'chart-wrapper--editing-scope': isEditingScopeChart(chart) }"
      v-for="chart in visibleCharts"
      :key="chart.id"
      :id="chart.id"
      :data-dr-id="chart.id"
      :data-dr-parent-id="parentId"
      :data-dr-scope-child="isDirectScopeChild(parentId)"
      :style="getVisualScreenChartWrapperStyle(chart)"
      @click="onChartClick($event, chart)"
      @dblclick="onChartDoubleClick($event, chart)"
      @contextmenu="onChartContextmenu($event, chart)"
    >
      <template v-if="!isGroupChart(chart)">
        <component :is="getComponent(chart.type)" :chart="chart" v-bind="chart.type === 'DrVideoPlayer' ? { mode } : {}" />
        <div v-if="shouldBlockIframeInteraction(chart)" class="iframe-interaction-shield" aria-hidden="true" />
      </template>
      <VisualScreenChartTree
        v-else
        :charts="getVisibleChartChildren(chart)"
        :parent-id="chart.id"
        :scope-parent-id="scopeParentId"
        :mode="mode"
        :iframe-interaction-enabled="iframeInteractionEnabled"
        @chart-click="forwardChartClick"
        @chart-double-click="forwardChartDoubleClick"
        @chart-contextmenu="forwardChartContextmenu"
      />
    </div>
  </template>
  <template v-else>
    <div
      class="chart-wrapper"
      :class="{ 'chart-wrapper--editing-scope': isEditingScopeChart(chart) }"
      v-for="chart in visibleCharts"
      :key="chart.id"
      :id="chart.id"
      :data-dr-id="chart.id"
      :data-dr-parent-id="parentId"
      :data-dr-scope-child="isDirectScopeChild(parentId)"
      :style="getVisualScreenChartWrapperStyle(chart)"
    >
      <template v-if="!isGroupChart(chart)">
        <component :is="getComponent(chart.type)" :chart="chart" v-bind="chart.type === 'DrVideoPlayer' ? { mode } : {}" />
      </template>
      <VisualScreenChartTree
        v-else
        :charts="getVisibleChartChildren(chart)"
        :parent-id="chart.id"
        :scope-parent-id="scopeParentId"
        :mode="mode"
        :iframe-interaction-enabled="iframeInteractionEnabled"
        @chart-click="forwardChartClick"
        @chart-double-click="forwardChartDoubleClick"
        @chart-contextmenu="forwardChartContextmenu"
      />
    </div>
  </template>
</template>

<style scoped>
.iframe-interaction-shield {
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: move;
}
</style>
