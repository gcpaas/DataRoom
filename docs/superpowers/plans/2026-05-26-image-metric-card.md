# Image Metric Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `DrImageMetricCard` 图片指标卡组件，在指标卡分类中提供图片 + 描述 + 数值 + 单位的横向指标展示能力。

**Architecture:** 组件独立放在 `components/DrImageMetricCard`，不改造 `DrMetricCard` 或 `DrImage`。运行时复用现有数据归一化和数值格式化工具，同时新增一个组件内 `runtime.ts` 放置可单测的值兜底、图片背景映射和文字发光样式逻辑。

**Tech Stack:** Vue 3, TypeScript, Element Plus, existing `createChartConfig`, existing `useDrComponent`, existing metric-table utilities, Bun static/unit scripts, `vue-tsc`, ESLint.

---

## File Structure

- Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/runtime.ts`: pure runtime helpers for value fallback, image background style, and text glow style.
- Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/runtime.spec.ts`: Bun assertions for runtime helpers.
- Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts`: static assertions for component files, exports, panel constraints, and registration.
- Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/install.ts`: component contract, default props, behavior definition, and dataset field definition.
- Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/index.vue`: render image, description, value, unit, animation, dataset value fallback, and click behavior.
- Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/panel/index.vue`: Element Plus configuration panel bound directly to `chart.props`.
- Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/plugin.ts`: component library metadata.
- Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/images/image-metric-card.svg`: thumbnail asset.
- Modify `dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts`: import and register `DrImageMetricCardPlugin` under `ComponentLibTagTypeConst.METRIC`.

Existing unrelated worktree changes must be preserved. Before editing `PluginRegister.ts`, read its current content and patch only the new import and the new `pluginList` entry.

## Task 1: Runtime Helper

**Files:**
- Create: `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/runtime.spec.ts`
- Create: `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/runtime.ts`

- [ ] **Step 1: Write the failing runtime test**

Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/runtime.spec.ts`:

```ts
import {
  getImageMetricBackgroundStyle,
  getImageMetricTextShadow,
  resolveImageMetricValue,
} from './runtime.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const row = {
  amount: 1234.56,
  nested: {
    value: 88,
  },
}

assert(
  resolveImageMetricValue(row, { valueField: ['amount'] }, 0) === 1234.56,
  'should read configured valueField from dataset row'
)
assert(
  resolveImageMetricValue(row, { valueField: ['nested.value'] }, 0) === 88,
  'should read nested valueField path from dataset row'
)
assert(
  resolveImageMetricValue(row, {}, 66) === 66,
  'should fall back to default value when valueField is not configured'
)
assert(
  resolveImageMetricValue({ amount: null }, { valueField: ['amount'] }, 77) === 77,
  'should fall back to default value when dataset value is null'
)

const containStyle = getImageMetricBackgroundStyle('/dataRoom/resource/image/a.png', 'no-repeat-contain', 8)
assert(containStyle.backgroundImage === 'url(/dataRoom/resource/image/a.png)', 'should set background image when url exists')
assert(containStyle.backgroundSize === 'contain', 'contain mode should use background-size contain')
assert(containStyle.backgroundRepeat === 'no-repeat', 'contain mode should not repeat')
assert(containStyle.backgroundPosition === 'center', 'contain mode should center image')
assert(containStyle.borderRadius === '8px', 'should map image border radius')

const stretchStyle = getImageMetricBackgroundStyle('/image.png', 'no-repeat-stretch', 0)
assert(stretchStyle.backgroundSize === '100% 100%', 'stretch mode should fill image area')
assert(stretchStyle.backgroundRepeat === 'no-repeat', 'stretch mode should not repeat')

const repeatXStyle = getImageMetricBackgroundStyle('/image.png', 'repeat-x', 0)
assert(repeatXStyle.backgroundRepeat === 'repeat-x', 'repeat-x mode should repeat horizontally')

assert(
  getImageMetricTextShadow({ enabled: false, color: '', blur: 8, offsetX: 0, offsetY: 0 }) === undefined,
  'disabled glow should not generate text shadow'
)
assert(
  getImageMetricTextShadow({ enabled: true, color: '', blur: 10, offsetX: 1, offsetY: 2 }) === '1px 2px 10px currentColor',
  'glow should default to currentColor when color is empty'
)
assert(
  getImageMetricTextShadow({ enabled: true, color: 'var(--el-color-warning)', blur: 6, offsetX: 0, offsetY: 0 }) ===
    '0px 0px 6px var(--el-color-warning)',
  'glow should use configured color'
)
```

- [ ] **Step 2: Run the test and verify it fails**

Run from `dataRoomFront`:

```bash
npx -y bun src/dataroom-packages/components/DrImageMetricCard/runtime.spec.ts
```

Expected: command fails because `./runtime.ts` does not exist.

- [ ] **Step 3: Implement the runtime helper**

Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/runtime.ts`:

```ts
import { getFirstFieldValue, type DatasetRow } from '../_shared/metric-table-utils.ts'

export type ImageMetricRepeatMode =
  | 'no-repeat-stretch'
  | 'no-repeat-contain'
  | 'no-repeat-center'
  | 'repeat'
  | 'repeat-x'
  | 'repeat-y'

export interface ImageMetricGlowConfig {
  enabled: boolean
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

export const resolveImageMetricValue = (
  row: DatasetRow | undefined,
  fields: Record<string, string[]> | undefined,
  defaultValue: number,
): unknown => {
  const datasetValue = getFirstFieldValue(row, fields, 'valueField')
  return datasetValue === undefined || datasetValue === null ? defaultValue : datasetValue
}

export const getImageMetricBackgroundStyle = (
  imageUrl: string,
  repeatMode: ImageMetricRepeatMode,
  borderRadius: number,
): Record<string, string> => {
  const style: Record<string, string> = {
    width: '100%',
    height: '100%',
    borderRadius: `${borderRadius}px`,
  }
  if (imageUrl) {
    style.backgroundImage = `url(${imageUrl})`
  }

  switch (repeatMode) {
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
}

export const getImageMetricTextShadow = (glow: ImageMetricGlowConfig): string | undefined => {
  if (!glow.enabled) {
    return undefined
  }
  return `${glow.offsetX}px ${glow.offsetY}px ${glow.blur}px ${glow.color || 'currentColor'}`
}
```

- [ ] **Step 4: Run the runtime test and verify it passes**

Run from `dataRoomFront`:

```bash
npx -y bun src/dataroom-packages/components/DrImageMetricCard/runtime.spec.ts
```

Expected: exit code `0`.

- [ ] **Step 5: Commit runtime helper**

```bash
git add dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/runtime.ts dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/runtime.spec.ts
git commit -m "feat: add image metric card runtime helpers"
```

## Task 2: Component Contract and Plugin Metadata

**Files:**
- Create: `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts`
- Create: `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/install.ts`
- Create: `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/plugin.ts`
- Create: `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/images/image-metric-card.svg`

- [ ] **Step 1: Write the failing component contract test**

Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts`:

```ts
declare const require: (id: string) => {
  existsSync: (path: URL) => boolean
  readFileSync: (path: URL, encoding: 'utf-8') => string
}

const { existsSync, readFileSync } = require('node:fs')

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const componentDir = new URL('./', import.meta.url)
const requiredFiles = ['runtime.ts', 'install.ts', 'index.vue', 'panel/index.vue', 'plugin.ts', 'images/image-metric-card.svg']

for (const file of requiredFiles) {
  assert(existsSync(new URL(file, componentDir)), `DrImageMetricCard must provide ${file}`)
}

const installSource = readFileSync(new URL('./install.ts', componentDir), 'utf-8')
assert(installSource.includes('DrImageMetricCardPropsInterface'), 'install.ts must define props interface')
assert(installSource.includes("'DrImageMetricCard'"), 'install.ts must create DrImageMetricCard config')
assert(installSource.includes("title: '图片指标卡'"), 'default title must be 图片指标卡')
assert(installSource.includes("name: 'valueField'"), 'datasetFields must expose only valueField')
assert(!installSource.includes("name: 'descriptionField'"), 'description must not bind dataset field')
assert(!installSource.includes("name: 'unitField'"), 'unit must not bind dataset field')
assert(!installSource.includes("name: 'url'"), 'image url must not bind dataset field')
assert(installSource.includes("method: 'click'"), 'behaviors must define click method')
assert(installSource.includes("name: 'formattedValue'"), 'click payload definition must include formattedValue')

const pluginSource = readFileSync(new URL('./plugin.ts', componentDir), 'utf-8')
assert(pluginSource.includes('DrImageMetricCardPlugin'), 'plugin.ts must export DrImageMetricCardPlugin')
assert(pluginSource.includes("'图片指标卡'"), 'plugin name must be 图片指标卡')

const panelSource = readFileSync(new URL('./panel/index.vue', componentDir), 'utf-8')
assert(panelSource.includes('chartConfigPanel.scss'), 'panel must import shared config panel styles')
assert(!panelSource.includes('letter-spacing'), 'panel must not expose letter-spacing configuration')
assert(!/:deep\(\.el-/.test(panelSource), 'panel must not override Element Plus internals')
assert(!/::v-deep|\/deep\/|>>>/.test(panelSource), 'panel must not use deep selectors')
assert(!/!important/.test(panelSource), 'panel must not use !important')
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run from `dataRoomFront`:

```bash
npx -y bun src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts
```

Expected: command fails because `install.ts`, `index.vue`, `panel/index.vue`, `plugin.ts`, and thumbnail are not present yet.

- [ ] **Step 3: Implement `install.ts`**

Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/install.ts`:

```ts
import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'
import type { Behavior } from '@/dataroom-packages/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataroom-packages/components/type/ChartDatasetField.ts'
import type { ImageMetricRepeatMode } from './runtime.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

type TextAlign = 'left' | 'center' | 'right'
type FontWeight = 'normal' | 'bold' | 'bolder'

export interface DrImageMetricCardPropsInterface {
  global: {
    padding: [number, number, number, number]
    backgroundColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
    shadow: {
      enabled: boolean
      color: string
      blur: number
      offsetX: number
      offsetY: number
    }
  }
  layout: {
    imagePosition: 'left' | 'right'
    contentOrder: 'descriptionFirst' | 'valueFirst'
    gap: number
    rowGap: number
    horizontalAlign: TextAlign
    verticalAlign: 'top' | 'center' | 'bottom'
  }
  image: {
    url: string
    width: number
    height: number
    repeatMode: ImageMetricRepeatMode
    borderRadius: number
  }
  description: {
    text: string
    fontSize: number
    color: string
    fontWeight: FontWeight
    lineHeight: number
    align: TextAlign
  }
  value: {
    defaultValue: number
    format: 'value' | 'integer' | 'float1' | 'float2' | 'percent' | 'thousand' | 'currency'
    decimalPlaces: number
    thousandSeparator: boolean
    prefix: string
    suffix: string
    emptyText: string
    fontSize: number
    color: string
    fontWeight: FontWeight
    lineHeight: number
    align: TextAlign
    glow: {
      enabled: boolean
      color: string
      blur: number
      offsetX: number
      offsetY: number
    }
  }
  unit: {
    text: string
    position: 'descriptionSuffix' | 'valuePrefix' | 'valueSuffix'
    gap: number
    fontSize: number
    color: string
    fontWeight: FontWeight
    lineHeight: number
  }
  animation: {
    enabled: boolean
    duration: number
    easing: 'linear' | 'cubicOut' | 'elasticOut' | 'bounceOut'
  }
}

export type DrImageMetricCardConfig = ChartConfig<DrImageMetricCardPropsInterface>

const getInstance = (): DrImageMetricCardConfig => {
  return createChartConfig<DrImageMetricCardPropsInterface>(
    'DrImageMetricCard',
    {
      global: {
        padding: [12, 16, 12, 16],
        backgroundColor: '',
        borderColor: '',
        borderWidth: 0,
        borderRadius: 8,
        shadow: {
          enabled: false,
          color: '',
          blur: 12,
          offsetX: 0,
          offsetY: 4,
        },
      },
      layout: {
        imagePosition: 'left',
        contentOrder: 'descriptionFirst',
        gap: 18,
        rowGap: 8,
        horizontalAlign: 'left',
        verticalAlign: 'center',
      },
      image: {
        url: '/dataRoom/resource/image/placeholder.png',
        width: 120,
        height: 96,
        repeatMode: 'no-repeat-contain',
        borderRadius: 0,
      },
      description: {
        text: '批销总金额',
        fontSize: 16,
        color: '',
        fontWeight: 'bold',
        lineHeight: 1.4,
        align: 'left',
      },
      value: {
        defaultValue: 1234.56,
        format: 'thousand',
        decimalPlaces: 2,
        thousandSeparator: true,
        prefix: '',
        suffix: '',
        emptyText: '--',
        fontSize: 36,
        color: '',
        fontWeight: 'bold',
        lineHeight: 1,
        align: 'left',
        glow: {
          enabled: true,
          color: '',
          blur: 8,
          offsetX: 0,
          offsetY: 0,
        },
      },
      unit: {
        text: '（单位）',
        position: 'descriptionSuffix',
        gap: 6,
        fontSize: 14,
        color: '',
        fontWeight: 'normal',
        lineHeight: 1.4,
      },
      animation: {
        enabled: true,
        duration: 800,
        easing: 'cubicOut',
      },
    },
    {
      title: '图片指标卡',
      w: 360,
      h: 120,
      x: 0,
      y: 0,
      z: 0,
    },
  )
}

const behaviors: Behavior[] = [
  {
    name: '图片指标卡单击',
    desc: '鼠标点击图片指标卡时触发',
    method: 'click',
    paramsList: [
      { name: 'value', desc: '当前原始数值', type: 'number|string' },
      { name: 'formattedValue', desc: '当前格式化数值', type: 'string' },
      { name: 'description', desc: '描述文本', type: 'string' },
      { name: 'unit', desc: '单位文本', type: 'string' },
      { name: 'imageUrl', desc: '图片地址', type: 'string' },
    ],
  },
]

const datasetFields: ChartDatasetField[] = [
  {
    name: 'valueField',
    desc: '指标数值字段',
    required: false,
    multiple: false,
  },
]

export { component, controlPanel, getInstance, behaviors, datasetFields }
```

- [ ] **Step 4: Implement `plugin.ts` and thumbnail**

Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/plugin.ts`:

```ts
import thumbnail from './images/image-metric-card.svg'
import { ChartPlugin } from '@/dataroom-packages/components/type/ChartPlugin.ts'

export class DrImageMetricCardPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrImageMetricCard', '图片指标卡', '图片指标卡、图文指标、KPI、金额、单值、图标、数值', thumbnail, tags)
  }
}
```

Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/images/image-metric-card.svg`:

```svg
<svg width="160" height="96" viewBox="0 0 160 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="158" height="94" rx="8" fill="var(--el-fill-color-blank)" stroke="var(--el-border-color)"/>
  <rect x="16" y="20" width="52" height="52" rx="10" fill="var(--el-fill-color-light)" stroke="var(--el-border-color-light)"/>
  <path d="M34 50L41 41L49 54L54 48L61 60H25L34 50Z" fill="var(--el-text-color-secondary)"/>
  <rect x="82" y="26" width="58" height="8" rx="4" fill="var(--el-text-color-secondary)"/>
  <rect x="82" y="48" width="46" height="12" rx="6" fill="var(--el-color-primary)"/>
</svg>
```

- [ ] **Step 5: Run the contract test and note the remaining expected failure**

Run from `dataRoomFront`:

```bash
npx -y bun src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts
```

Expected: command still fails because `index.vue` and `panel/index.vue` are not present yet.

- [ ] **Step 6: Commit component contract files**

```bash
git add dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/install.ts dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/plugin.ts dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/images/image-metric-card.svg dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts
git commit -m "feat: add image metric card contract"
```

## Task 3: Render Component

**Files:**
- Create: `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/index.vue`
- Modify: `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts`

- [ ] **Step 1: Extend the contract test for render requirements**

Append these assertions after the existing `installSource` assertions in `componentContract.spec.ts`:

```ts
const indexSource = readFileSync(new URL('./index.vue', componentDir), 'utf-8')
assert(indexSource.includes('useDrComponent'), 'index.vue must use common component data flow hook')
assert(indexSource.includes('triggerChartBehavior'), 'index.vue must trigger click behavior')
assert(indexSource.includes('resolveImageMetricValue'), 'index.vue must use runtime value fallback helper')
assert(indexSource.includes('getImageMetricBackgroundStyle'), 'index.vue must use runtime image background helper')
assert(indexSource.includes('getImageMetricTextShadow'), 'index.vue must use runtime text glow helper')
assert(indexSource.includes('letter-spacing: 0'), 'index.vue must keep text letter spacing at 0')
assert(indexSource.includes('font-feature-settings: \"tnum\"'), 'index.vue must use tabular numbers for metric value')
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run from `dataRoomFront`:

```bash
npx -y bun src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts
```

Expected: command fails because `index.vue` does not exist.

- [ ] **Step 3: Implement `index.vue`**

Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/index.vue`. The implementation must include these concrete structures:

```vue
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrImageMetricCard',
})
</script>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { getResourceUrl } from '@/dataroom-packages/_common/_utils.ts'
import { useDrComponent } from '@/dataroom-packages/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataroom-packages/components/type/ComponentExpose.ts'
import {
  formatMetricValue,
  normalizeRows,
  toFiniteNumber,
} from '@/dataroom-packages/components/_shared/metric-table-utils.ts'
import type { DrImageMetricCardConfig } from './install.ts'
import {
  getImageMetricBackgroundStyle,
  getImageMetricTextShadow,
  resolveImageMetricValue,
} from './runtime.ts'

const { chart } = defineProps<{
  chart: DrImageMetricCardConfig
}>()

const datasetValue = ref<unknown>(undefined)
const animatedValue = ref(chart.props.value.defaultValue)
let animationFrame = 0

const changeData = (value: unknown) => {
  const row = normalizeRows(value)[0]
  datasetValue.value = resolveImageMetricValue(row, chart.dataset?.fields, chart.props.value.defaultValue)
}

const { canvasInst, expose } = useDrComponent({
  chart,
  changeData,
})

const rawValue = computed(() => datasetValue.value ?? chart.props.value.defaultValue)
const numericValue = computed(() => {
  const numeric = toFiniteNumber(rawValue.value)
  return numeric === undefined ? chart.props.value.defaultValue : numeric
})

const easingProgress = (progress: number) => {
  switch (chart.props.animation.easing) {
    case 'cubicOut':
      return 1 - Math.pow(1 - progress, 3)
    case 'elasticOut':
      return progress === 0 || progress === 1
        ? progress
        : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
    case 'bounceOut': {
      const n1 = 7.5625
      const d1 = 2.75
      if (progress < 1 / d1) return n1 * progress * progress
      if (progress < 2 / d1) return n1 * (progress -= 1.5 / d1) * progress + 0.75
      if (progress < 2.5 / d1) return n1 * (progress -= 2.25 / d1) * progress + 0.9375
      return n1 * (progress -= 2.625 / d1) * progress + 0.984375
    }
    case 'linear':
    default:
      return progress
  }
}

watch(
  numericValue,
  (nextValue, previousValue) => {
    window.cancelAnimationFrame(animationFrame)
    if (!chart.props.animation.enabled || chart.props.animation.duration <= 0 || previousValue === undefined) {
      animatedValue.value = nextValue
      return
    }
    const startValue = animatedValue.value
    const diff = nextValue - startValue
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / chart.props.animation.duration, 1)
      animatedValue.value = startValue + diff * easingProgress(progress)
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick)
      }
    }
    animationFrame = window.requestAnimationFrame(tick)
  },
  { immediate: true },
)

const formattedValue = computed(() => {
  const displayValue = toFiniteNumber(rawValue.value) === undefined ? rawValue.value : animatedValue.value
  return formatMetricValue(displayValue, {
    format: chart.props.value.format,
    decimalPlaces: chart.props.value.decimalPlaces,
    thousandSeparator: chart.props.value.thousandSeparator,
    prefix: chart.props.value.prefix,
    suffix: chart.props.value.suffix,
    emptyText: chart.props.value.emptyText,
  })
})

const fallbackColor = (value: string, fallback: string) => value || fallback

const rootStyle = computed<CSSProperties>(() => {
  const global = chart.props.global
  const [top, right, bottom, left] = global.padding
  const style: CSSProperties = {
    padding: `${top}px ${right}px ${bottom}px ${left}px`,
    borderRadius: `${global.borderRadius}px`,
  }
  if (global.backgroundColor) {
    style.backgroundColor = global.backgroundColor
  }
  if (global.borderWidth > 0) {
    style.border = `${global.borderWidth}px solid ${global.borderColor || 'var(--el-border-color)'}`
  }
  if (global.shadow.enabled) {
    style.boxShadow = `${global.shadow.offsetX}px ${global.shadow.offsetY}px ${global.shadow.blur}px ${global.shadow.color || 'var(--el-border-color)'}`
  }
  return style
})

const contentStyle = computed<CSSProperties>(() => {
  const verticalAlignMap = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end',
  } as const
  return {
    flexDirection: chart.props.layout.imagePosition === 'left' ? 'row' : 'row-reverse',
    alignItems: verticalAlignMap[chart.props.layout.verticalAlign],
    gap: `${chart.props.layout.gap}px`,
  }
})

const imageFrameStyle = computed<CSSProperties>(() => ({
  width: `${chart.props.image.width}px`,
  height: `${chart.props.image.height}px`,
  borderRadius: `${chart.props.image.borderRadius}px`,
}))

const imageStyle = computed<CSSProperties>(() =>
  getImageMetricBackgroundStyle(
    getResourceUrl(chart.props.image.url),
    chart.props.image.repeatMode,
    chart.props.image.borderRadius,
  ),
)

const textStackStyle = computed<CSSProperties>(() => ({
  gap: `${chart.props.layout.rowGap}px`,
  alignItems:
    chart.props.layout.horizontalAlign === 'left'
      ? 'flex-start'
      : chart.props.layout.horizontalAlign === 'right'
        ? 'flex-end'
        : 'center',
  justifyContent:
    chart.props.layout.verticalAlign === 'top'
      ? 'flex-start'
      : chart.props.layout.verticalAlign === 'bottom'
        ? 'flex-end'
        : 'center',
  textAlign: chart.props.layout.horizontalAlign,
}))

const descriptionStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.description.fontSize}px`,
  color: fallbackColor(chart.props.description.color, 'var(--el-text-color-secondary)'),
  fontWeight: chart.props.description.fontWeight,
  lineHeight: chart.props.description.lineHeight,
  textAlign: chart.props.description.align,
}))

const valueStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.value.fontSize}px`,
  color: fallbackColor(chart.props.value.color, 'var(--el-text-color-primary)'),
  fontWeight: chart.props.value.fontWeight,
  lineHeight: chart.props.value.lineHeight,
  textAlign: chart.props.value.align,
  textShadow: getImageMetricTextShadow(chart.props.value.glow),
}))

const unitStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.unit.fontSize}px`,
  color: fallbackColor(chart.props.unit.color, 'var(--el-text-color-secondary)'),
  fontWeight: chart.props.unit.fontWeight,
  lineHeight: chart.props.unit.lineHeight,
}))

const inlineUnitStyle = computed<CSSProperties>(() => {
  const gap = `${chart.props.unit.gap}px`
  return {
    ...unitStyle.value,
    marginLeft: chart.props.unit.position === 'descriptionSuffix' || chart.props.unit.position === 'valueSuffix' ? gap : undefined,
    marginRight: chart.props.unit.position === 'valuePrefix' ? gap : undefined,
  }
})

const rows = computed(() => {
  const descriptionRow = 'description'
  const valueRow = 'value'
  return chart.props.layout.contentOrder === 'descriptionFirst'
    ? [descriptionRow, valueRow]
    : [valueRow, descriptionRow]
})

const onClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', {
    value: rawValue.value,
    formattedValue: formattedValue.value,
    description: chart.props.description.text,
    unit: chart.props.unit.text,
    imageUrl: chart.props.image.url,
  })
}

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrame)
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-image-metric-card" :id="chart.id" :style="rootStyle" @click="onClick">
    <div class="dr-image-metric-card__content" :style="contentStyle">
      <div class="dr-image-metric-card__image-frame" :style="imageFrameStyle">
        <div v-if="chart.props.image.url" class="dr-image-metric-card__image" :style="imageStyle"></div>
        <div v-else class="dr-image-metric-card__image-empty">图片加载失败</div>
      </div>

      <div class="dr-image-metric-card__text-stack" :style="textStackStyle">
        <template v-for="row in rows" :key="row">
          <div v-if="row === 'description'" class="dr-image-metric-card__description-row" :style="descriptionStyle">
            <span class="dr-image-metric-card__text">{{ chart.props.description.text }}</span>
            <span
              v-if="chart.props.unit.text && chart.props.unit.position === 'descriptionSuffix'"
              class="dr-image-metric-card__unit"
              :style="inlineUnitStyle"
            >
              {{ chart.props.unit.text }}
            </span>
          </div>

          <div v-else class="dr-image-metric-card__value-row" :style="valueStyle">
            <span
              v-if="chart.props.unit.text && chart.props.unit.position === 'valuePrefix'"
              class="dr-image-metric-card__unit"
              :style="inlineUnitStyle"
            >
              {{ chart.props.unit.text }}
            </span>
            <span class="dr-image-metric-card__value">{{ formattedValue }}</span>
            <span
              v-if="chart.props.unit.text && chart.props.unit.position === 'valueSuffix'"
              class="dr-image-metric-card__unit"
              :style="inlineUnitStyle"
            >
              {{ chart.props.unit.text }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dr-image-metric-card {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.dr-image-metric-card__content {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.dr-image-metric-card__image-frame {
  flex: 0 0 auto;
  overflow: hidden;
}

.dr-image-metric-card__image,
.dr-image-metric-card__image-empty {
  width: 100%;
  height: 100%;
}

.dr-image-metric-card__image-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  letter-spacing: 0;
}

.dr-image-metric-card__text-stack {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}

.dr-image-metric-card__description-row,
.dr-image-metric-card__value-row {
  display: flex;
  align-items: baseline;
  max-width: 100%;
  min-width: 0;
  letter-spacing: 0;
}

.dr-image-metric-card__text,
.dr-image-metric-card__unit,
.dr-image-metric-card__value {
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0;
}

.dr-image-metric-card__value {
  font-feature-settings: "tnum";
}
</style>
```

- [ ] **Step 4: Run the contract test**

Run from `dataRoomFront`:

```bash
npx -y bun src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts
```

Expected: command still fails because `panel/index.vue` is not present yet.

- [ ] **Step 5: Commit render component**

```bash
git add dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/index.vue dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts
git commit -m "feat: render image metric card"
```

## Task 4: Configuration Panel

**Files:**
- Create: `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/panel/index.vue`

- [ ] **Step 1: Re-run the contract test and verify the panel failure**

Run from `dataRoomFront`:

```bash
npx -y bun src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts
```

Expected: command fails because `panel/index.vue` does not exist.

- [ ] **Step 2: Implement panel script and option lists**

Create `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/panel/index.vue` with this script:

```vue
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrImageMetricCardControlPanel',
})
</script>

<script setup lang="ts">
import { computed } from 'vue'
import type { DrImageMetricCardConfig } from '../install.ts'

const { chart } = defineProps<{
  chart: DrImageMetricCardConfig
}>()

const chartConfig = computed(() => chart)

const imagePositionOptions = [
  { label: '左图右文', value: 'left' },
  { label: '右图左文', value: 'right' },
]

const contentOrderOptions = [
  { label: '描述在上', value: 'descriptionFirst' },
  { label: '数值在上', value: 'valueFirst' },
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

const repeatModeOptions = [
  { label: '不重复，拉伸满', value: 'no-repeat-stretch' },
  { label: '不重复，等比适应', value: 'no-repeat-contain' },
  { label: '不重复，居中', value: 'no-repeat-center' },
  { label: '平铺', value: 'repeat' },
  { label: '水平平铺', value: 'repeat-x' },
  { label: '垂直平铺', value: 'repeat-y' },
]

const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '粗体', value: 'bold' },
  { label: '更粗', value: 'bolder' },
]

const valueFormatOptions = [
  { label: '原始值', value: 'value' },
  { label: '整数', value: 'integer' },
  { label: '一位小数', value: 'float1' },
  { label: '两位小数', value: 'float2' },
  { label: '百分比', value: 'percent' },
  { label: '千分位', value: 'thousand' },
  { label: '货币', value: 'currency' },
]

const unitPositionOptions = [
  { label: '描述后', value: 'descriptionSuffix' },
  { label: '数值前', value: 'valuePrefix' },
  { label: '数值后', value: 'valueSuffix' },
]

const easingOptions = [
  { label: '线性', value: 'linear' },
  { label: '缓出', value: 'cubicOut' },
  { label: '弹性', value: 'elasticOut' },
  { label: '回弹', value: 'bounceOut' },
]
</script>
```

- [ ] **Step 3: Implement panel template**

In the same file, add this template. It intentionally does not include any `letter-spacing` control.

```vue
<template>
  <div class="dr-config-panel dr-image-metric-card-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="全局配置" name="global">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title"><span>内边距</span></div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">上</span><el-input-number v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" /></div></el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">右</span><el-input-number v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" /></div></el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">下</span><el-input-number v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" /></div></el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">左</span><el-input-number v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" /></div></el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title"><span>卡片样式</span></div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">背景</span><el-color-picker v-model="chartConfig.props.global.backgroundColor" show-alpha /></div></el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">边框色</span><el-color-picker v-model="chartConfig.props.global.borderColor" show-alpha /></div></el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">边框宽</span><el-input-number v-model="chartConfig.props.global.borderWidth" class="dr-config-panel__control" :min="0" :max="40" :step="1" controls-position="right" /></div></el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">圆角</span><el-input-number v-model="chartConfig.props.global.borderRadius" class="dr-config-panel__control" :min="0" :max="200" :step="1" controls-position="right" /></div></el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title"><span>阴影</span><el-switch v-model="chartConfig.props.global.shadow.enabled" size="small" /></div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">颜色</span><el-color-picker v-model="chartConfig.props.global.shadow.color" show-alpha /></div></el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">模糊</span><el-input-number v-model="chartConfig.props.global.shadow.blur" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" /></div></el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">X偏移</span><el-input-number v-model="chartConfig.props.global.shadow.offsetX" class="dr-config-panel__control" :min="-120" :max="120" :step="1" controls-position="right" /></div></el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">Y偏移</span><el-input-number v-model="chartConfig.props.global.shadow.offsetY" class="dr-config-panel__control" :min="-120" :max="120" :step="1" controls-position="right" /></div></el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="布局" name="layout">
          <el-form-item label="图文">
            <el-select v-model="chartConfig.props.layout.imagePosition" class="dr-config-panel__control">
              <el-option v-for="item in imagePositionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="顺序">
            <el-select v-model="chartConfig.props.layout.contentOrder" class="dr-config-panel__control">
              <el-option v-for="item in contentOrderOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="图文距">
            <el-input-number v-model="chartConfig.props.layout.gap" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="行间距">
            <el-input-number v-model="chartConfig.props.layout.rowGap" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="水平">
            <el-select v-model="chartConfig.props.layout.horizontalAlign" class="dr-config-panel__control">
              <el-option v-for="item in horizontalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="垂直">
            <el-select v-model="chartConfig.props.layout.verticalAlign" class="dr-config-panel__control">
              <el-option v-for="item in verticalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="图片" name="image">
          <el-form-item label="地址"><el-input v-model="chartConfig.props.image.url" class="dr-config-panel__control" clearable /></el-form-item>
          <el-form-item label="宽度"><el-input-number v-model="chartConfig.props.image.width" class="dr-config-panel__control" :min="1" :max="1000" :step="1" controls-position="right" /></el-form-item>
          <el-form-item label="高度"><el-input-number v-model="chartConfig.props.image.height" class="dr-config-panel__control" :min="1" :max="1000" :step="1" controls-position="right" /></el-form-item>
          <el-form-item label="填充">
            <el-select v-model="chartConfig.props.image.repeatMode" class="dr-config-panel__control">
              <el-option v-for="item in repeatModeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="圆角"><el-input-number v-model="chartConfig.props.image.borderRadius" class="dr-config-panel__control" :min="0" :max="500" :step="1" controls-position="right" /></el-form-item>
        </el-collapse-item>

        <el-collapse-item title="描述" name="description">
          <el-form-item label="文本"><el-input v-model="chartConfig.props.description.text" class="dr-config-panel__control" clearable /></el-form-item>
          <el-form-item label="字号"><el-input-number v-model="chartConfig.props.description.fontSize" class="dr-config-panel__control" :min="10" :max="120" :step="1" controls-position="right" /></el-form-item>
          <el-form-item label="颜色"><el-color-picker v-model="chartConfig.props.description.color" show-alpha /></el-form-item>
          <el-form-item label="字重">
            <el-select v-model="chartConfig.props.description.fontWeight" class="dr-config-panel__control">
              <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="行高"><el-input-number v-model="chartConfig.props.description.lineHeight" class="dr-config-panel__control" :min="0.8" :max="3" :step="0.1" controls-position="right" /></el-form-item>
          <el-form-item label="对齐">
            <el-select v-model="chartConfig.props.description.align" class="dr-config-panel__control">
              <el-option v-for="item in horizontalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="数值" name="value">
          <el-form-item label="默认值"><el-input-number v-model="chartConfig.props.value.defaultValue" class="dr-config-panel__control" :step="1" controls-position="right" /></el-form-item>
          <el-form-item label="格式">
            <el-select v-model="chartConfig.props.value.format" class="dr-config-panel__control">
              <el-option v-for="item in valueFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="小数位"><el-input-number v-model="chartConfig.props.value.decimalPlaces" class="dr-config-panel__control" :min="0" :max="8" :step="1" controls-position="right" /></el-form-item>
          <el-form-item label="千分位"><el-switch v-model="chartConfig.props.value.thousandSeparator" size="small" /></el-form-item>
          <el-form-item label="前缀"><el-input v-model="chartConfig.props.value.prefix" class="dr-config-panel__control" clearable /></el-form-item>
          <el-form-item label="后缀"><el-input v-model="chartConfig.props.value.suffix" class="dr-config-panel__control" clearable /></el-form-item>
          <el-form-item label="空文本"><el-input v-model="chartConfig.props.value.emptyText" class="dr-config-panel__control" clearable /></el-form-item>
          <el-form-item label="字号"><el-input-number v-model="chartConfig.props.value.fontSize" class="dr-config-panel__control" :min="12" :max="160" :step="1" controls-position="right" /></el-form-item>
          <el-form-item label="颜色"><el-color-picker v-model="chartConfig.props.value.color" show-alpha /></el-form-item>
          <el-form-item label="字重">
            <el-select v-model="chartConfig.props.value.fontWeight" class="dr-config-panel__control">
              <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="行高"><el-input-number v-model="chartConfig.props.value.lineHeight" class="dr-config-panel__control" :min="0.8" :max="3" :step="0.1" controls-position="right" /></el-form-item>
          <el-form-item label="对齐">
            <el-select v-model="chartConfig.props.value.align" class="dr-config-panel__control">
              <el-option v-for="item in horizontalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title"><span>发光</span><el-switch v-model="chartConfig.props.value.glow.enabled" size="small" /></div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">颜色</span><el-color-picker v-model="chartConfig.props.value.glow.color" show-alpha /></div></el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">模糊</span><el-input-number v-model="chartConfig.props.value.glow.blur" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" /></div></el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">X偏移</span><el-input-number v-model="chartConfig.props.value.glow.offsetX" class="dr-config-panel__control" :min="-80" :max="80" :step="1" controls-position="right" /></div></el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item"><div class="dr-config-panel__sub-row"><span class="dr-config-panel__sub-label">Y偏移</span><el-input-number v-model="chartConfig.props.value.glow.offsetY" class="dr-config-panel__control" :min="-80" :max="80" :step="1" controls-position="right" /></div></el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="单位" name="unit">
          <el-form-item label="文本"><el-input v-model="chartConfig.props.unit.text" class="dr-config-panel__control" clearable /></el-form-item>
          <el-form-item label="位置">
            <el-select v-model="chartConfig.props.unit.position" class="dr-config-panel__control">
              <el-option v-for="item in unitPositionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="间距"><el-input-number v-model="chartConfig.props.unit.gap" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" /></el-form-item>
          <el-form-item label="字号"><el-input-number v-model="chartConfig.props.unit.fontSize" class="dr-config-panel__control" :min="10" :max="80" :step="1" controls-position="right" /></el-form-item>
          <el-form-item label="颜色"><el-color-picker v-model="chartConfig.props.unit.color" show-alpha /></el-form-item>
          <el-form-item label="字重">
            <el-select v-model="chartConfig.props.unit.fontWeight" class="dr-config-panel__control">
              <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="行高"><el-input-number v-model="chartConfig.props.unit.lineHeight" class="dr-config-panel__control" :min="0.8" :max="3" :step="0.1" controls-position="right" /></el-form-item>
        </el-collapse-item>

        <el-collapse-item title="动画" name="animation">
          <el-form-item label="启用"><el-switch v-model="chartConfig.props.animation.enabled" size="small" /></el-form-item>
          <el-form-item label="时长"><el-input-number v-model="chartConfig.props.animation.duration" class="dr-config-panel__control" :min="0" :max="5000" :step="100" controls-position="right" /></el-form-item>
          <el-form-item label="缓动">
            <el-select v-model="chartConfig.props.animation.easing" class="dr-config-panel__control">
              <el-option v-for="item in easingOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>
```

- [ ] **Step 3: Implement panel scoped style**

Add this style block to the same file:

```vue
<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-image-metric-card-config-panel {
  padding: 0;
}

.dr-image-metric-card-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
```

- [ ] **Step 4: Run the component contract test**

Run from `dataRoomFront`:

```bash
npx -y bun src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts
```

Expected: command passes all assertions currently present in `componentContract.spec.ts`.

- [ ] **Step 5: Commit panel**

```bash
git add dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/panel/index.vue
git commit -m "feat: add image metric card panel"
```

## Task 5: Register Component and Verify

**Files:**
- Modify: `dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts`
- Modify: `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts`

- [ ] **Step 1: Add registration assertions**

Append these assertions to `componentContract.spec.ts`:

```ts
const registerSource = readFileSync(new URL('../../_components/PluginRegister.ts', componentDir), 'utf-8')
assert(registerSource.includes('DrImageMetricCardPlugin'), 'PluginRegister must import DrImageMetricCardPlugin')
assert(
  registerSource.includes('new DrImageMetricCardPlugin([ComponentLibTagTypeConst.METRIC])'),
  'PluginRegister must register image metric card under metric tag'
)
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run from `dataRoomFront`:

```bash
npx -y bun src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts
```

Expected: command fails with `PluginRegister must import DrImageMetricCardPlugin`.

- [ ] **Step 3: Register the plugin**

Modify `dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts`:

1. Add this import near other metric component imports:

```ts
import {DrImageMetricCardPlugin} from '@/dataroom-packages/components/DrImageMetricCard/plugin.ts'
```

2. Add this plugin entry immediately after `new DrPeriodCompareCardPlugin([ComponentLibTagTypeConst.METRIC]),`:

```ts
  new DrImageMetricCardPlugin([ComponentLibTagTypeConst.METRIC]),
```

- [ ] **Step 4: Run focused checks**

Run from `dataRoomFront`:

```bash
npx -y bun src/dataroom-packages/components/DrImageMetricCard/runtime.spec.ts
npx -y bun src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts
```

Expected: both commands exit `0`.

- [ ] **Step 5: Run type check**

Run from `dataRoomFront`:

```bash
npm run type-check
```

Expected: `vue-tsc --build` exits `0`.

- [ ] **Step 6: Run lint**

Run from `dataRoomFront`:

```bash
npx eslint src/dataroom-packages/components/DrImageMetricCard src/dataroom-packages/_components/PluginRegister.ts
```

Expected: exits `0`.

- [ ] **Step 7: Run style-rule scans**

Run from repository root:

```bash
rg -n ":deep\\(\\.el-|::v-deep|/deep/|>>>|!important|--dr-|letter-spacing" dataRoomFront/src/dataroom-packages/components/DrImageMetricCard
```

Expected output contains only the intended `letter-spacing: 0` lines in `index.vue`; it must not contain `letter-spacing` in `panel/index.vue`, any deep selector, `!important`, or `--dr-*`.

- [ ] **Step 8: Commit registration and verification tests**

```bash
git add dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts
git commit -m "feat: register image metric card"
```

## Task 6: Final Review

**Files:**
- Review: all files from Tasks 1-5.

- [ ] **Step 1: Check the final diff**

Run from repository root:

```bash
git diff HEAD~5..HEAD -- dataRoomFront/src/dataroom-packages/components/DrImageMetricCard dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts
```

Expected: diff contains only the new `DrImageMetricCard` component and the one registration change.

- [ ] **Step 2: Confirm no unrelated files are staged**

Run from repository root:

```bash
git diff --cached --name-only
```

Expected: no output.

- [ ] **Step 3: Re-run final verification**

Run from `dataRoomFront`:

```bash
npx -y bun src/dataroom-packages/components/DrImageMetricCard/runtime.spec.ts
npx -y bun src/dataroom-packages/components/DrImageMetricCard/componentContract.spec.ts
npm run type-check
npx eslint src/dataroom-packages/components/DrImageMetricCard src/dataroom-packages/_components/PluginRegister.ts
```

Expected: all commands exit `0`.

- [ ] **Step 4: Report completion evidence**

Summarize:

- Component directory created: `dataRoomFront/src/dataroom-packages/components/DrImageMetricCard/`
- Component registered under metric tag.
- Runtime and contract scripts pass.
- `npm run type-check` passes.
- ESLint focused check passes.
- Style-rule scan has no forbidden patterns beyond `letter-spacing: 0` in `index.vue`.
