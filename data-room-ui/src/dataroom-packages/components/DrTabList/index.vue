<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE,
})
</script>
<script setup lang="ts">
import type {DrTabListConfig} from './install.ts'
import {ref, computed, watch, nextTick, onMounted} from "vue"
import {useDrComponent} from "@/dataroom-packages/hooks/use-dr-component"
import type {ComponentExpose} from "@/dataroom-packages/components/type/ComponentExpose.ts"

const {chart} = defineProps<{
  chart: DrTabListConfig
}>()

/** 当前选中的标签索引 */
const activeIndex = ref(chart.props.basic.defaultIndex || 0)

/** 指示器样式（用于动态定位） */
const indicatorStyle = ref<Record<string, string>>({})

/** Tab元素引用列表 */
const tabRefs = ref<HTMLElement[]>([])

/** 动态加载的标签数据 */
const dynamicTabs = ref<Array<{ label: string; value: string }>>([])

/**
 * 获取当前使用的标签列表（优先使用数据集加载的动态数据）
 */
const tabList = computed(() => {
  if (dynamicTabs.value.length > 0) {
    return dynamicTabs.value
  }
  return chart.props.options.staticTabs || []
})

/**
 * 数据集数据变化时更新标签列表
 */
const changeData = (datasetValue: any) => {
  if (!datasetValue) {
    dynamicTabs.value = []
    return
  }

  const data = Array.isArray(datasetValue) ? datasetValue : []
  if (data.length === 0) {
    dynamicTabs.value = []
    return
  }

  // 从数据集字段映射获取 label 和 value 字段名
  const labelFieldNames = chart.dataset?.fields?.labelField || []
  const valueFieldNames = chart.dataset?.fields?.valueField || []
  const labelFieldName = labelFieldNames[0] || 'label'
  const valueFieldName = valueFieldNames[0] || 'value'

  dynamicTabs.value = data.map((item: any) => ({
    label: String(item[labelFieldName] ?? ''),
    value: String(item[valueFieldName] ?? '')
  }))

  // 数据更新后重置索引
  if (activeIndex.value >= dynamicTabs.value.length) {
    activeIndex.value = 0
  }

  nextTick(() => {
    updateIndicator()
    syncGlobalVariable()
  })
}

const {canvasInst, expose} = useDrComponent({
  chart: chart,
  changeData: changeData
})

/**
 * 设置Tab元素引用
 */
const setTabRef = (el: any, index: number) => {
  if (el) {
    tabRefs.value[index] = el as HTMLElement
  }
}

/**
 * 更新指示器位置和大小
 */
const updateIndicator = () => {
  if (!chart.props.indicator.show) return

  const currentTab = tabRefs.value[activeIndex.value]
  if (!currentTab) return

  const isHorizontal = chart.props.layout.direction === 'horizontal'

  if (isHorizontal) {
    indicatorStyle.value = {
      left: currentTab.offsetLeft + 'px',
      width: currentTab.offsetWidth + 'px',
      height: chart.props.indicator.height + 'px',
      bottom: '0px',
      borderRadius: chart.props.indicator.borderRadius + 'px',
      backgroundColor: chart.props.indicator.color
    }
  } else {
    indicatorStyle.value = {
      top: currentTab.offsetTop + 'px',
      height: currentTab.offsetHeight + 'px',
      width: chart.props.indicator.height + 'px',
      right: '0px',
      borderRadius: chart.props.indicator.borderRadius + 'px',
      backgroundColor: chart.props.indicator.color
    }
  }
}

/**
 * 同步选中值到全局变量
 */
const syncGlobalVariable = () => {
  const globalVarName = chart.props.globalVar.globalVarName
  if (!globalVarName) return

  const tabs = tabList.value
  if (tabs.length === 0) return

  const currentIndex = Math.min(activeIndex.value, tabs.length - 1)
  const currentTab = tabs[currentIndex]
  if (currentTab) {
    canvasInst.updateGlobalVariableValue(globalVarName, currentTab.value)
  }
}

/**
 * 处理Tab点击事件
 */
const onTabClick = (index: number) => {
  if (chart.props.basic.disabled) return
  if (index === activeIndex.value) return

  activeIndex.value = index

  nextTick(() => {
    updateIndicator()
  })

  // 同步全局变量
  syncGlobalVariable()

  // 触发行为事件
  const currentTab = tabList.value[index]
  if (currentTab) {
    canvasInst.triggerChartBehavior(chart.id, 'tabChange', {
      index: index,
      label: currentTab.label,
      value: currentTab.value
    })
  }
}

/**
 * 容器样式
 */
const containerStyle = computed(() => {
  const props = chart.props
  const style: Record<string, string> = {
    display: 'flex',
    position: 'relative'
  }

  if (props.layout.direction === 'horizontal') {
    style.flexDirection = 'row'
    style.flexWrap = 'nowrap'
  } else {
    style.flexDirection = 'column'
  }

  // 对齐方式
  const alignMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch'
  }
  if (props.layout.direction === 'horizontal') {
    style.justifyContent = alignMap[props.layout.align] || 'flex-start'
  } else {
    style.alignItems = alignMap[props.layout.align] || 'flex-start'
  }

  // 间距
  style.gap = props.tabStyle.gap + 'px'

  // 底部边框线
  if (props.tabStyle.borderBottom.show) {
    if (props.layout.direction === 'horizontal') {
      style.borderBottom = `${props.tabStyle.borderBottom.width}px solid ${props.tabStyle.borderBottom.color}`
    } else {
      style.borderRight = `${props.tabStyle.borderBottom.width}px solid ${props.tabStyle.borderBottom.color}`
    }
  }

  return style
})

/**
 * 获取单个Tab的样式
 */
const getTabStyle = (index: number) => {
  const props = chart.props
  const isActive = index === activeIndex.value
  const style: Record<string, string> = {}

  style.fontSize = props.tabStyle.fontSize + 'px'
  style.color = isActive ? props.tabStyle.activeColor : props.tabStyle.color
  style.backgroundColor = isActive ? props.tabStyle.activeBgColor : props.tabStyle.backgroundColor
  style.borderRadius = props.tabStyle.borderRadius + 'px'
  style.padding = `${props.tabStyle.padding[0]}px ${props.tabStyle.padding[1]}px ${props.tabStyle.padding[2]}px ${props.tabStyle.padding[3]}px`
  style.cursor = props.basic.disabled ? 'not-allowed' : 'pointer'
  style.whiteSpace = 'nowrap'
  style.userSelect = 'none'
  style.transition = 'color 0.3s, background-color 0.3s'

  if (props.tabStyle.height > 0) {
    style.height = props.tabStyle.height + 'px'
    style.lineHeight = props.tabStyle.height + 'px'
    style.padding = `0 ${props.tabStyle.padding[1]}px`
  }

  if (props.basic.disabled) {
    style.opacity = '0.5'
  }

  return style
}

// 监听配置变化时更新指示器
watch(
  () => [chart.props.indicator, chart.props.tabStyle, chart.props.layout.direction],
  () => {
    nextTick(() => updateIndicator())
  },
  {deep: true}
)

// 监听默认索引变化
watch(
  () => chart.props.basic.defaultIndex,
  (newIndex) => {
    if (newIndex >= 0 && newIndex < tabList.value.length) {
      activeIndex.value = newIndex
      nextTick(() => {
        updateIndicator()
        syncGlobalVariable()
      })
    }
  }
)

// 监听标签列表变化
watch(
  () => chart.props.options.staticTabs,
  () => {
    nextTick(() => {
      if (activeIndex.value >= tabList.value.length) {
        activeIndex.value = 0
      }
      updateIndicator()
    })
  },
  {deep: true}
)

onMounted(() => {
  nextTick(() => {
    updateIndicator()
    syncGlobalVariable()
  })
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-tab-list" :id="chart.id">
    <div class="dr-tab-list__container" :style="containerStyle">
      <div
        v-for="(tab, index) in tabList"
        :key="tab.value + '-' + index"
        :ref="(el) => setTabRef(el, index)"
        class="dr-tab-list__item"
        :class="{'dr-tab-list__item--active': index === activeIndex}"
        :style="getTabStyle(index)"
        @click="onTabClick(index)"
      >
        {{ tab.label }}
      </div>
      <!-- 指示器 -->
      <div
        v-if="chart.props.indicator.show && tabList.length > 0"
        class="dr-tab-list__indicator"
        :style="indicatorStyle"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.dr-tab-list {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.dr-tab-list__container {
  width: 100%;
  height: 100%;
  position: relative;
}

.dr-tab-list__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;
}

.dr-tab-list__indicator {
  position: absolute;
  transition: left 0.3s ease, top 0.3s ease, width 0.3s ease, height 0.3s ease;
}
</style>
