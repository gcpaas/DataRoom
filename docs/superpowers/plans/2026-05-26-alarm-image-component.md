# Alarm Image Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `DrAlarmImage` 告警图组件，通过一个数据集数值字段驱动多图片条件切换，并展示格式化数值。

**Architecture:** 组件独立位于 `components/DrAlarmImage`，不改造 `DrImage` 或 `DrMetricCard`。条件表达式解析和图片匹配抽到组件本地 TypeScript 工具，渲染组件复用 `useDrComponent`、`getResourceUrl`、`normalizeRows`、`getFirstFieldValue`、`formatMetricValue` 等现有能力。配置面板只绑定 `chart.props`，组件库展示通过现有 `plugin.ts` + `PluginRegister.ts` 模式接入。

**Tech Stack:** Vue 3, TypeScript, Element Plus, existing `createChartConfig`, existing `useDrComponent`, static Node/Jiti regression scripts, `vue-tsc`, ESLint.

---

## Scope Check

该 spec 只覆盖一个前端可视化组件，属于单一可测试交付单元。不涉及后端、数据库、数据源、资源管理接口或现有组件重构。

实现前必须重新读取当前工作区状态。当前仓库可能已有与本任务无关的用户改动，尤其是 `PluginRegister.ts` 和 `_shared/metric-table-utils.ts`。实现时只追加 `DrAlarmImage` 相关代码，不回滚、不覆盖这些既有改动。

## File Structure

- Create `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/alarm-condition.ts`: 解析 `100 > x > 90` 等表达式，并根据规则列表解析当前图片项。
- Create `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/alarm-condition.spec.ts`: 轻量回归脚本，覆盖区间、单边、边界、非法表达式和图片匹配优先级。
- Create `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/install.ts`: 组件配置类型、默认实例、交互定义和数据集字段定义。
- Create `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/index.vue`: 画布运行时渲染、数据集取值、图片切换和点击行为。
- Create `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/panel/index.vue`: 右侧专属配置面板。
- Create `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/plugin.ts`: 组件库元数据。
- Create `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/images/alarm-image.svg`: 组件库缩略图。
- Create `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/alarm-image.static.spec.mjs`: 静态集成检查，验证文件、导出、注册和面板样式禁用项。
- Modify `dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts`: 导入 `DrAlarmImagePlugin`，并加入 `pluginList` 的指标卡分类。

## Task 1: 条件表达式与图片匹配工具

**Files:**
- Create: `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/alarm-condition.spec.ts`
- Create: `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/alarm-condition.ts`

- [ ] **Step 1: 写失败测试**

创建 `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/alarm-condition.spec.ts`：

```ts
import {
  matchAlarmCondition,
  resolveAlarmImageItem,
  type AlarmImageItem,
} from './alarm-condition'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const items: AlarmImageItem[] = [
  {
    id: 'normal',
    name: '正常',
    url: '/normal.png',
    condition: '',
    enabled: true,
  },
  {
    id: 'warning',
    name: '预警',
    url: '/warning.png',
    condition: '100 > x > 90',
    enabled: true,
  },
  {
    id: 'danger',
    name: '异常',
    url: '/danger.png',
    condition: 'x >= 100',
    enabled: true,
  },
]

assert(matchAlarmCondition('100 > x > 90', 95), 'should match open interval expression')
assert(!matchAlarmCondition('100 > x > 90', 100), 'should exclude open upper boundary')
assert(!matchAlarmCondition('100 > x > 90', 90), 'should exclude open lower boundary')
assert(matchAlarmCondition('100 >= x >= 90', 100), 'should include upper boundary with >=')
assert(matchAlarmCondition('100 >= x >= 90', 90), 'should include lower boundary with >=')
assert(matchAlarmCondition('x > 90', 91), 'should match right-side greater-than expression')
assert(matchAlarmCondition('x <= 100', 100), 'should match right-side less-than-or-equal expression')
assert(matchAlarmCondition('90 < x', 91), 'should match left-side less-than expression')
assert(matchAlarmCondition('100 >= x', 100), 'should match left-side greater-than-or-equal expression')
assert(!matchAlarmCondition('abc', 95), 'should reject invalid expression')
assert(!matchAlarmCondition('', 95), 'should reject empty expression')
assert(!matchAlarmCondition('100 > x > 90', 'not-a-number'), 'should reject non-numeric values')

assert(
  resolveAlarmImageItem({ items, defaultItemId: 'normal', value: 95 })?.id === 'warning',
  'should select first matching warning item',
)
assert(
  resolveAlarmImageItem({ items, defaultItemId: 'normal', value: 100 })?.id === 'danger',
  'should select danger item when threshold is reached',
)
assert(
  resolveAlarmImageItem({ items, defaultItemId: 'normal', value: 80 })?.id === 'normal',
  'should fall back to configured default item',
)
assert(
  resolveAlarmImageItem({
    items: [{ ...items[1], enabled: false }],
    defaultItemId: 'missing',
    value: 95,
  })?.id === undefined,
  'should return undefined when no enabled item can be used',
)
assert(
  resolveAlarmImageItem({
    items: [
      { ...items[0], enabled: true },
      { ...items[1], condition: 'x > 90', enabled: true },
      { ...items[2], condition: 'x > 90', enabled: true },
    ],
    defaultItemId: 'normal',
    value: 95,
  })?.id === 'warning',
  'should prefer the first matching enabled rule',
)
```

- [ ] **Step 2: 运行测试确认失败**

Run from `dataRoomFront`:

```bash
npx jiti src/dataroom-packages/components/DrAlarmImage/alarm-condition.spec.ts
```

Expected: FAIL with module resolution error for `./alarm-condition`.

- [ ] **Step 3: 实现条件工具**

创建 `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/alarm-condition.ts`：

```ts
import { toFiniteNumber } from '../_shared/metric-table-utils.ts'

export interface AlarmImageItem {
  id: string
  name: string
  url: string
  condition: string
  enabled: boolean
}

export interface ResolveAlarmImageItemOptions {
  items: AlarmImageItem[]
  defaultItemId: string
  value: unknown
  chartId?: string
}

type AlarmOperator = '>' | '>=' | '<' | '<='

const NUMBER_PATTERN = '[-+]?(?:\\d+\\.?\\d*|\\.\\d+)'
const OPERATOR_PATTERN = '(>=|<=|>|<)'
const VARIABLE_PATTERN = '[xX]'
const intervalRegExp = new RegExp(`^(${NUMBER_PATTERN})${OPERATOR_PATTERN}${VARIABLE_PATTERN}${OPERATOR_PATTERN}(${NUMBER_PATTERN})$`)
const rightSideRegExp = new RegExp(`^${VARIABLE_PATTERN}${OPERATOR_PATTERN}(${NUMBER_PATTERN})$`)
const leftSideRegExp = new RegExp(`^(${NUMBER_PATTERN})${OPERATOR_PATTERN}${VARIABLE_PATTERN}$`)

const compare = (left: number, operator: AlarmOperator, right: number): boolean => {
  switch (operator) {
    case '>':
      return left > right
    case '>=':
      return left >= right
    case '<':
      return left < right
    case '<=':
      return left <= right
  }
}

const normalizeCondition = (condition: string): string => condition.trim().replace(/\s+/g, ' ')

const parseNumber = (value: string): number | undefined => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const isAlarmConditionSyntax = (condition: string): boolean => {
  const compact = normalizeCondition(condition).replace(/\s/g, '')
  if (!compact) {
    return false
  }
  return intervalRegExp.test(compact) || rightSideRegExp.test(compact) || leftSideRegExp.test(compact)
}

export const matchAlarmCondition = (condition: string, value: unknown): boolean => {
  const numericValue = toFiniteNumber(value)
  if (numericValue === undefined) {
    return false
  }

  const normalized = normalizeCondition(condition)
  if (!normalized) {
    return false
  }

  const compact = normalized.replace(/\s/g, '')
  const intervalMatch = compact.match(intervalRegExp)
  if (intervalMatch) {
    const leftValue = parseNumber(intervalMatch[1]!)
    const leftOperator = intervalMatch[2] as AlarmOperator
    const rightOperator = intervalMatch[3] as AlarmOperator
    const rightValue = parseNumber(intervalMatch[4]!)
    if (leftValue === undefined || rightValue === undefined) {
      return false
    }
    return compare(leftValue, leftOperator, numericValue) && compare(numericValue, rightOperator, rightValue)
  }

  const rightSideMatch = compact.match(rightSideRegExp)
  if (rightSideMatch) {
    const operator = rightSideMatch[1] as AlarmOperator
    const rightValue = parseNumber(rightSideMatch[2]!)
    return rightValue === undefined ? false : compare(numericValue, operator, rightValue)
  }

  const leftSideMatch = compact.match(leftSideRegExp)
  if (leftSideMatch) {
    const leftValue = parseNumber(leftSideMatch[1]!)
    const operator = leftSideMatch[2] as AlarmOperator
    return leftValue === undefined ? false : compare(leftValue, operator, numericValue)
  }

  return false
}

const warnInvalidCondition = (chartId: string | undefined, condition: string) => {
  if (!condition.trim()) {
    return
  }
  const prefix = chartId ? `组件 ${chartId}` : '告警图组件'
  console.warn(`${prefix} 条件表达式无法解析: ${condition}`)
}

export const resolveAlarmImageItem = (options: ResolveAlarmImageItemOptions): AlarmImageItem | undefined => {
  const enabledItems = options.items.filter(item => item.enabled)
  const matchedItem = enabledItems.find(item => {
    if (!item.condition.trim()) {
      return false
    }
    const matched = matchAlarmCondition(item.condition, options.value)
    if (!matched && toFiniteNumber(options.value) !== undefined && !isAlarmConditionSyntax(item.condition)) {
      warnInvalidCondition(options.chartId, item.condition)
    }
    return matched
  })

  if (matchedItem) {
    return matchedItem
  }

  return enabledItems.find(item => item.id === options.defaultItemId) ?? enabledItems[0]
}
```

- [ ] **Step 4: 运行测试确认通过**

Run from `dataRoomFront`:

```bash
npx jiti src/dataroom-packages/components/DrAlarmImage/alarm-condition.spec.ts
```

Expected: PASS with exit code `0`.

- [ ] **Step 5: 提交条件工具**

```bash
git add dataRoomFront/src/dataroom-packages/components/DrAlarmImage/alarm-condition.ts dataRoomFront/src/dataroom-packages/components/DrAlarmImage/alarm-condition.spec.ts
git commit -m "feat: add alarm image condition matcher"
```

## Task 2: 组件壳、配置类型和组件库元数据

**Files:**
- Create: `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/install.ts`
- Create: `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/plugin.ts`
- Create: `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/images/alarm-image.svg`
- Create: `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/index.vue`
- Create: `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/panel/index.vue`

- [ ] **Step 1: 创建 `install.ts`**

```ts
import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'
import type { Behavior } from '@/dataroom-packages/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataroom-packages/components/type/ChartDatasetField.ts'
import type { AlarmImageItem } from './alarm-condition.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrAlarmImagePropsInterface {
  value: {
    show: boolean
    defaultValue: number
    format: 'value' | 'integer' | 'float1' | 'float2' | 'percent' | 'thousand' | 'currency'
    decimalPlaces: number
    thousandSeparator: boolean
    prefix: string
    suffix: string
    emptyText: string
    fontSize: number
    color: string
    fontWeight: 'normal' | 'bold' | 'bolder'
    lineHeight: number
  }
  image: {
    defaultItemId: string
    repeatMode: 'no-repeat-stretch' | 'no-repeat-contain' | 'no-repeat-center' | 'repeat' | 'repeat-x' | 'repeat-y'
    borderRadius: number
    items: AlarmImageItem[]
  }
  layout: {
    direction: 'vertical' | 'horizontal'
    imageSize: 'auto' | 'contain'
    gap: number
    horizontalAlign: 'left' | 'center' | 'right'
    verticalAlign: 'top' | 'center' | 'bottom'
  }
  animation: {
    enabled: boolean
    duration: number
  }
}

export type DrAlarmImageConfig = ChartConfig<DrAlarmImagePropsInterface>

const getInstance = (): DrAlarmImageConfig => {
  return createChartConfig<DrAlarmImagePropsInterface>(
    'DrAlarmImage',
    {
      value: {
        show: true,
        defaultValue: 95,
        format: 'integer',
        decimalPlaces: 0,
        thousandSeparator: false,
        prefix: '',
        suffix: '',
        emptyText: '--',
        fontSize: 28,
        color: 'var(--el-text-color-primary)',
        fontWeight: 'bold',
        lineHeight: 1,
      },
      image: {
        defaultItemId: 'normal',
        repeatMode: 'no-repeat-contain',
        borderRadius: 0,
        items: [
          {
            id: 'normal',
            name: '正常',
            url: '/dataRoom/resource/image/placeholder.png',
            condition: '',
            enabled: true,
          },
          {
            id: 'warning',
            name: '预警',
            url: '/dataRoom/resource/image/placeholder.png',
            condition: '100 > x > 90',
            enabled: true,
          },
          {
            id: 'danger',
            name: '异常',
            url: '/dataRoom/resource/image/placeholder.png',
            condition: 'x >= 100',
            enabled: true,
          },
        ],
      },
      layout: {
        direction: 'vertical',
        imageSize: 'contain',
        gap: 8,
        horizontalAlign: 'center',
        verticalAlign: 'center',
      },
      animation: {
        enabled: true,
        duration: 200,
      },
    },
    {
      title: '告警图',
      w: 220,
      h: 180,
    },
  )
}

const behaviors: Behavior[] = [
  {
    name: '告警图单击',
    desc: '鼠标点击告警图时触发',
    method: 'click',
    paramsList: [
      { name: 'value', desc: '当前原始数值', type: 'number' },
      { name: 'formattedValue', desc: '当前格式化数值文本', type: 'string' },
      { name: 'imageName', desc: '当前图片名称', type: 'string' },
      { name: 'imageUrl', desc: '当前图片地址', type: 'string' },
      { name: 'condition', desc: '当前命中的条件表达式', type: 'string' },
    ],
  },
]

const datasetFields: ChartDatasetField[] = [
  {
    name: 'valueField',
    desc: '告警数值字段',
    required: false,
    multiple: false,
  },
]

export { component, controlPanel, getInstance, behaviors, datasetFields }
```

- [ ] **Step 2: 创建 `plugin.ts`**

```ts
import thumbnail from './images/alarm-image.svg'
import { ChartPlugin } from '@/dataroom-packages/components/type/ChartPlugin.ts'

export class DrAlarmImagePlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrAlarmImage', '告警图', '告警、图片、阈值、指标、状态、区间', thumbnail, tags)
  }
}
```

- [ ] **Step 3: 创建缩略图**

创建 `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/images/alarm-image.svg`：

```svg
<svg width="96" height="72" viewBox="0 0 96 72" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="76" height="52" rx="8" fill="currentColor" fill-opacity="0.08"/>
  <path d="M48 18L72 56H24L48 18Z" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
  <path d="M48 32V44" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
  <circle cx="48" cy="51" r="3" fill="currentColor"/>
</svg>
```

- [ ] **Step 4: 创建可编译的最小 `index.vue`**

```vue
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrAlarmImage',
})
</script>
<script setup lang="ts">
import type { DrAlarmImageConfig } from './install.ts'

defineProps<{
  chart: DrAlarmImageConfig
}>()
</script>

<template>
  <div class="dr-alarm-image">告警图</div>
</template>

<style scoped>
.dr-alarm-image {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-regular);
  letter-spacing: 0;
}
</style>
```

- [ ] **Step 5: 创建可编译的最小配置面板**

```vue
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrAlarmImageControlPanel',
})
</script>
<script setup lang="ts">
import { computed } from 'vue'
import type { DrAlarmImageConfig } from '../install.ts'

const { chart } = defineProps<{
  chart: DrAlarmImageConfig
}>()
const chartConfig = computed(() => chart)
</script>

<template>
  <div class="dr-config-panel dr-alarm-image-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="数值" name="value">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.value.show" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-alarm-image-config-panel {
  padding: 0;
}

.dr-alarm-image-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
```

- [ ] **Step 6: 类型检查**

Run from `dataRoomFront`:

```bash
npm run type-check
```

Expected: PASS.

- [ ] **Step 7: 提交组件壳**

```bash
git add dataRoomFront/src/dataroom-packages/components/DrAlarmImage/install.ts dataRoomFront/src/dataroom-packages/components/DrAlarmImage/plugin.ts dataRoomFront/src/dataroom-packages/components/DrAlarmImage/images/alarm-image.svg dataRoomFront/src/dataroom-packages/components/DrAlarmImage/index.vue dataRoomFront/src/dataroom-packages/components/DrAlarmImage/panel/index.vue
git commit -m "feat: add alarm image component shell"
```

## Task 3: 画布运行时渲染

**Files:**
- Modify: `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/index.vue`

- [ ] **Step 1: 替换 `index.vue` 为运行时实现**

实现必须包含以下结构：

```vue
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrAlarmImage',
})
</script>
<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, ref } from 'vue'
import type { DrAlarmImageConfig } from './install.ts'
import { getResourceUrl } from '@/dataroom-packages/_common/_utils.ts'
import { useDrComponent } from '@/dataroom-packages/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataroom-packages/components/type/ComponentExpose.ts'
import {
  formatMetricValue,
  getFirstFieldValue,
  normalizeRows,
  toFiniteNumber,
} from '@/dataroom-packages/components/_shared/metric-table-utils.ts'
import { resolveAlarmImageItem } from './alarm-condition.ts'

const { chart } = defineProps<{
  chart: DrAlarmImageConfig
}>()

const datasetValue = ref<unknown>(undefined)

const changeData = (value: unknown) => {
  const row = normalizeRows(value)[0]
  const nextValue = getFirstFieldValue(row, chart.dataset?.fields, 'valueField')
  datasetValue.value = nextValue === undefined ? undefined : nextValue
}

const { canvasInst, expose } = useDrComponent({
  chart,
  changeData,
})

const rawValue = computed(() => (datasetValue.value === undefined ? chart.props.value.defaultValue : datasetValue.value))

const currentImageItem = computed(() =>
  resolveAlarmImageItem({
    items: chart.props.image.items,
    defaultItemId: chart.props.image.defaultItemId,
    value: rawValue.value,
    chartId: chart.id,
  }),
)

const formattedValue = computed(() =>
  formatMetricValue(rawValue.value, {
    format: chart.props.value.format,
    decimalPlaces: chart.props.value.decimalPlaces,
    thousandSeparator: chart.props.value.thousandSeparator,
    prefix: chart.props.value.prefix,
    suffix: chart.props.value.suffix,
    emptyText: chart.props.value.emptyText,
  }),
)

const rootStyle = computed<CSSProperties>(() => {
  const horizontalAlignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  } as const
  const verticalAlignMap = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end',
  } as const
  const isHorizontal = chart.props.layout.direction === 'horizontal'
  return {
    flexDirection: isHorizontal ? 'row' : 'column',
    alignItems: isHorizontal ? verticalAlignMap[chart.props.layout.verticalAlign] : horizontalAlignMap[chart.props.layout.horizontalAlign],
    justifyContent: isHorizontal ? horizontalAlignMap[chart.props.layout.horizontalAlign] : verticalAlignMap[chart.props.layout.verticalAlign],
    gap: `${chart.props.layout.gap}px`,
  }
})

const imageStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    borderRadius: `${chart.props.image.borderRadius}px`,
  }
  const url = currentImageItem.value?.url ? getResourceUrl(currentImageItem.value.url) : ''
  if (url) {
    style.backgroundImage = `url(${url})`
  }
  if (chart.props.layout.imageSize === 'contain') {
    style.flex = '1 1 auto'
  }
  if (chart.props.animation.enabled) {
    style.transition = `background-image ${chart.props.animation.duration}ms ease, opacity ${chart.props.animation.duration}ms ease`
  }
  switch (chart.props.image.repeatMode) {
    case 'no-repeat-stretch':
      style.backgroundSize = '100% 100%'
      style.backgroundRepeat = 'no-repeat'
      break
    case 'no-repeat-contain':
      style.backgroundSize = 'contain'
      style.backgroundRepeat = 'no-repeat'
      style.backgroundPosition = 'center'
      break
    case 'no-repeat-center':
      style.backgroundSize = 'auto'
      style.backgroundRepeat = 'no-repeat'
      style.backgroundPosition = 'center'
      break
    case 'repeat':
      style.backgroundRepeat = 'repeat'
      break
    case 'repeat-x':
      style.backgroundRepeat = 'repeat-x'
      break
    case 'repeat-y':
      style.backgroundRepeat = 'repeat-y'
      break
  }
  return style
})

const valueStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.value.fontSize}px`,
  color: chart.props.value.color,
  fontWeight: chart.props.value.fontWeight,
  lineHeight: chart.props.value.lineHeight,
}))

const onClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', {
    value: toFiniteNumber(rawValue.value) ?? rawValue.value,
    formattedValue: formattedValue.value,
    imageName: currentImageItem.value?.name ?? '',
    imageUrl: currentImageItem.value?.url ?? '',
    condition: currentImageItem.value?.condition ?? '',
  })
}

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-alarm-image" :id="chart.id" :style="rootStyle" @click="onClick">
    <div v-if="currentImageItem?.url" class="dr-alarm-image__image" :style="imageStyle"></div>
    <div v-else class="dr-alarm-image__error">图片加载失败</div>
    <div v-if="chart.props.value.show" class="dr-alarm-image__value" :style="valueStyle">
      {{ formattedValue }}
    </div>
  </div>
</template>

<style scoped>
.dr-alarm-image {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.dr-alarm-image__image {
  width: 100%;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.dr-alarm-image__error {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-regular);
  letter-spacing: 0;
}

.dr-alarm-image__value {
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-feature-settings: "tnum";
  letter-spacing: 0;
}
</style>
```

- [ ] **Step 2: 运行条件测试**

Run from `dataRoomFront`:

```bash
npx jiti src/dataroom-packages/components/DrAlarmImage/alarm-condition.spec.ts
```

Expected: PASS.

- [ ] **Step 3: 类型检查**

Run from `dataRoomFront`:

```bash
npm run type-check
```

Expected: PASS.

- [ ] **Step 4: 提交渲染实现**

```bash
git add dataRoomFront/src/dataroom-packages/components/DrAlarmImage/index.vue
git commit -m "feat: render alarm image component"
```

## Task 4: 配置面板

**Files:**
- Modify: `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/panel/index.vue`

- [ ] **Step 1: 实现面板脚本逻辑**

替换 `panel/index.vue` 的脚本部分，保留组件名 `DrAlarmImageControlPanel`。脚本必须包含：

```ts
import { computed } from 'vue'
import type { DrAlarmImageConfig } from '../install.ts'
import { getResourceUrl } from '@/dataroom-packages/_common/_utils.ts'

const { chart } = defineProps<{
  chart: DrAlarmImageConfig
}>()
const chartConfig = computed(() => chart)

const valueFormatOptions = [
  { label: '原始值', value: 'value' },
  { label: '整数', value: 'integer' },
  { label: '一位小数', value: 'float1' },
  { label: '两位小数', value: 'float2' },
  { label: '百分比', value: 'percent' },
  { label: '千分位', value: 'thousand' },
  { label: '货币', value: 'currency' },
]

const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '粗体', value: 'bold' },
  { label: '更粗', value: 'bolder' },
]

const repeatModeOptions = [
  { label: '不重复，拉伸满', value: 'no-repeat-stretch' },
  { label: '不重复，等比适应', value: 'no-repeat-contain' },
  { label: '不重复，居中', value: 'no-repeat-center' },
  { label: '平铺', value: 'repeat' },
  { label: '水平平铺', value: 'repeat-x' },
  { label: '垂直平铺', value: 'repeat-y' },
]

const directionOptions = [
  { label: '纵向', value: 'vertical' },
  { label: '横向', value: 'horizontal' },
]

const imageSizeOptions = [
  { label: '自动', value: 'auto' },
  { label: '填充剩余空间', value: 'contain' },
]

const horizontalAlignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' },
]

const verticalAlignOptions = [
  { label: '顶部', value: 'top' },
  { label: '居中', value: 'center' },
  { label: '底部', value: 'bottom' },
]

const createItemId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `alarm-image-${Date.now()}-${Math.round(Math.random() * 100000)}`
}

const addImageItem = () => {
  const id = createItemId()
  chartConfig.value.props.image.items.push({
    id,
    name: `图片${chartConfig.value.props.image.items.length + 1}`,
    url: '/dataRoom/resource/image/placeholder.png',
    condition: '100 > x > 90',
    enabled: true,
  })
  if (!chartConfig.value.props.image.defaultItemId) {
    chartConfig.value.props.image.defaultItemId = id
  }
}

const removeImageItem = (index: number) => {
  const [removed] = chartConfig.value.props.image.items.splice(index, 1)
  if (removed?.id === chartConfig.value.props.image.defaultItemId) {
    chartConfig.value.props.image.defaultItemId = chartConfig.value.props.image.items[0]?.id ?? ''
  }
}

const setDefaultItem = (id: string) => {
  chartConfig.value.props.image.defaultItemId = id
}
```

- [ ] **Step 2: 实现面板模板**

模板必须按一个 `el-collapse.dr-config-panel__section` 组织四个一级分组：数值、图片规则、布局、动画。图片规则列表每项必须能编辑启用状态、名称、地址、条件，能设置默认和删除。

关键模板结构：

```vue
<template>
  <div class="dr-config-panel dr-alarm-image-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="数值" name="value">
          <!-- show/defaultValue/format/decimalPlaces/thousandSeparator/prefix/suffix/emptyText/fontSize/color/fontWeight/lineHeight -->
        </el-collapse-item>

        <el-collapse-item title="图片规则" name="imageRules">
          <!-- repeatMode/borderRadius/items -->
        </el-collapse-item>

        <el-collapse-item title="布局" name="layout">
          <!-- direction/imageSize/gap/horizontalAlign/verticalAlign -->
        </el-collapse-item>

        <el-collapse-item title="动画" name="animation">
          <!-- enabled/duration -->
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>
```

图片规则项内部使用这个字段集合：

```vue
<div v-for="(item, index) in chartConfig.props.image.items" :key="item.id" class="dr-alarm-image-config-panel__rule">
  <div class="dr-alarm-image-config-panel__rule-header">
    <span class="dr-alarm-image-config-panel__rule-title">{{ item.name || `图片${index + 1}` }}</span>
    <el-switch v-model="item.enabled" size="small" />
  </div>
  <el-form class="dr-config-panel__sub-form" :model="item" label-width="72px" size="small" label-position="left">
    <el-form-item class="dr-config-panel__sub-form-item">
      <div class="dr-config-panel__sub-row">
        <span class="dr-config-panel__sub-label">名称</span>
        <el-input v-model="item.name" class="dr-config-panel__control" />
      </div>
    </el-form-item>
    <el-form-item class="dr-config-panel__sub-form-item">
      <div class="dr-config-panel__sub-row">
        <span class="dr-config-panel__sub-label">地址</span>
        <el-input v-model="item.url" class="dr-config-panel__control" placeholder="请输入图片地址" />
      </div>
    </el-form-item>
    <el-form-item class="dr-config-panel__sub-form-item">
      <div class="dr-config-panel__sub-row">
        <span class="dr-config-panel__sub-label">条件</span>
        <el-input v-model="item.condition" class="dr-config-panel__control" placeholder="100 > x > 90" />
      </div>
    </el-form-item>
    <el-form-item v-if="item.url" class="dr-config-panel__sub-form-item">
      <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
        <span class="dr-config-panel__sub-label">预览</span>
        <div class="dr-alarm-image-config-panel__preview">
          <el-image :src="getResourceUrl(item.url)" fit="contain" class="dr-alarm-image-config-panel__preview-image">
            <template #error>
              <div class="dr-alarm-image-config-panel__preview-error">图片加载失败</div>
            </template>
          </el-image>
        </div>
      </div>
    </el-form-item>
    <div class="dr-alarm-image-config-panel__rule-actions">
      <el-button size="small" :type="chartConfig.props.image.defaultItemId === item.id ? 'primary' : 'default'" @click="setDefaultItem(item.id)">
        默认
      </el-button>
      <el-button size="small" @click="removeImageItem(index)">删除</el-button>
    </div>
  </el-form>
</div>
```

颜色字段用 `el-input` 绑定 `chartConfig.props.value.color`，默认值为 Element Plus CSS 变量，避免面板默认态写入硬编码颜色。

- [ ] **Step 3: 实现面板样式**

样式必须只控制外层布局，不覆盖 `.el-*` 内部结构：

```scss
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-alarm-image-config-panel {
  padding: 0;
}

.dr-alarm-image-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-alarm-image-config-panel__rule {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.dr-alarm-image-config-panel__rule + .dr-alarm-image-config-panel__rule {
  padding-top: 8px;
}

.dr-alarm-image-config-panel__rule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.dr-alarm-image-config-panel__rule-title {
  min-width: 0;
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dr-alarm-image-config-panel__rule-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.dr-alarm-image-config-panel__preview {
  display: flex;
  width: 100%;
  height: 96px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.dr-alarm-image-config-panel__preview-image {
  width: 100%;
  height: 100%;
}

.dr-alarm-image-config-panel__preview-error {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  letter-spacing: 0;
}
```

- [ ] **Step 4: 检查禁用样式模式**

Run from repo root:

```bash
rg -n "#[0-9a-fA-F]{3,8}|rgb\\(|rgba\\(|hsl\\(|hsla\\(|--dr-|:deep\\(\\.el-|::v-deep|/deep/|>>>|!important|letter-spacing:\\s*-" dataRoomFront/src/dataroom-packages/components/DrAlarmImage
```

Expected: no output.

- [ ] **Step 5: 类型检查**

Run from `dataRoomFront`:

```bash
npm run type-check
```

Expected: PASS.

- [ ] **Step 6: 提交配置面板**

```bash
git add dataRoomFront/src/dataroom-packages/components/DrAlarmImage/panel/index.vue
git commit -m "feat: configure alarm image component"
```

## Task 5: 组件库注册与静态集成检查

**Files:**
- Modify: `dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts`
- Create: `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/alarm-image.static.spec.mjs`

- [ ] **Step 1: 注册组件库插件**

先读取 `PluginRegister.ts` 当前内容，保留已有用户改动。追加导入：

```ts
import { DrAlarmImagePlugin } from '@/dataroom-packages/components/DrAlarmImage/plugin.ts'
```

在 `pluginList` 的指标卡组件附近加入：

```ts
new DrAlarmImagePlugin([ComponentLibTagTypeConst.METRIC]),
```

- [ ] **Step 2: 写静态集成检查**

创建 `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/alarm-image.static.spec.mjs`：

```js
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const componentDir = __dirname
const requiredFiles = [
  'alarm-condition.ts',
  'alarm-condition.spec.ts',
  'install.ts',
  'index.vue',
  'panel/index.vue',
  'plugin.ts',
  'images/alarm-image.svg',
]

for (const file of requiredFiles) {
  assert(existsSync(resolve(componentDir, file)), `DrAlarmImage must provide ${file}`)
}

const installSource = readFileSync(resolve(componentDir, 'install.ts'), 'utf8')
assert(installSource.includes("'DrAlarmImage'") || installSource.includes('"DrAlarmImage"'), 'install.ts must register DrAlarmImage type')
assert(installSource.includes("title: '告警图'") || installSource.includes('title: "告警图"'), 'install.ts must set default title')
assert(installSource.includes("name: 'valueField'") || installSource.includes('name: "valueField"'), 'install.ts must expose valueField')
assert(installSource.includes('告警图单击'), 'install.ts must expose click behavior')

const panelSource = readFileSync(resolve(componentDir, 'panel/index.vue'), 'utf8')
assert(panelSource.includes('chartConfigPanel.scss'), 'panel must import shared config panel styles')
assert(!/:deep\(\.el-/.test(panelSource), 'panel must not override Element Plus internals')
assert(!/::v-deep|\/deep\/|>>>/.test(panelSource), 'panel must not use deep selectors')
assert(!/!important/.test(panelSource), 'panel must not use important declarations')

const registerSource = readFileSync(resolve(componentDir, '../../_components/PluginRegister.ts'), 'utf8')
assert(registerSource.includes('DrAlarmImagePlugin'), 'PluginRegister must import DrAlarmImagePlugin')
assert(
  registerSource.includes('new DrAlarmImagePlugin([ComponentLibTagTypeConst.METRIC])'),
  'PluginRegister must add DrAlarmImagePlugin to metric category',
)
```

- [ ] **Step 3: 运行静态集成检查**

Run from `dataRoomFront`:

```bash
node src/dataroom-packages/components/DrAlarmImage/alarm-image.static.spec.mjs
```

Expected: PASS.

- [ ] **Step 4: 类型检查**

Run from `dataRoomFront`:

```bash
npm run type-check
```

Expected: PASS.

- [ ] **Step 5: 提交注册**

```bash
git add dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts dataRoomFront/src/dataroom-packages/components/DrAlarmImage/alarm-image.static.spec.mjs
git commit -m "feat: register alarm image component"
```

## Task 6: 最终验证和交付检查

**Files:**
- Verify: `dataRoomFront/src/dataroom-packages/components/DrAlarmImage/**`
- Verify: `dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts`

- [ ] **Step 1: 运行条件工具回归**

Run from `dataRoomFront`:

```bash
npx jiti src/dataroom-packages/components/DrAlarmImage/alarm-condition.spec.ts
```

Expected: PASS.

- [ ] **Step 2: 运行静态集成检查**

Run from `dataRoomFront`:

```bash
node src/dataroom-packages/components/DrAlarmImage/alarm-image.static.spec.mjs
```

Expected: PASS.

- [ ] **Step 3: 运行类型检查**

Run from `dataRoomFront`:

```bash
npm run type-check
```

Expected: PASS.

- [ ] **Step 4: 运行 lint**

Run from `dataRoomFront`:

```bash
npm run lint
```

Expected: PASS. If ESLint formats files, review the diff and only keep changes related to `DrAlarmImage` and its registration.

- [ ] **Step 5: 运行样式规范扫描**

Run from repo root:

```bash
rg -n "#[0-9a-fA-F]{3,8}|rgb\\(|rgba\\(|hsl\\(|hsla\\(|--dr-|:deep\\(\\.el-|::v-deep|/deep/|>>>|!important|letter-spacing:\\s*-" dataRoomFront/src/dataroom-packages/components/DrAlarmImage
```

Expected: no output.

- [ ] **Step 6: 手工验证设计器行为**

Run from `dataRoomFront`:

```bash
npm run dev
```

Expected: Vite prints a local URL.

Manual checks:

- Open the designer.
- Confirm the component library can search `告警图`.
- Add `告警图` to a canvas.
- Confirm default value `95` displays and the `100 > x > 90` image rule is selected.
- Change default value to `100` and confirm `x >= 100` image rule is selected.
- Disable a matching image rule and confirm the component falls back to the default image.
- Bind a dataset `valueField` and confirm the first row value drives image switching.

- [ ] **Step 7: Final commit if lint changed files**

If Step 4 produced additional formatting changes in task-owned files:

```bash
git add dataRoomFront/src/dataroom-packages/components/DrAlarmImage dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts
git commit -m "chore: verify alarm image component"
```

If Step 4 did not change files, do not create an empty commit.
