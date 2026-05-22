# 图表组件配置面板规范

## 1. 适用范围

本规范用于 `data-room-ui/src/dataroom-packages/components/*/panel/index.vue` 中的图表类组件配置面板。新增或改造图表组件时，应以 `DrBarChart/panel/index.vue` 的结构为基准，并根据图表类型裁剪轴、系列、标签等配置。

图表配置面板只负责组件视觉和图表行为配置，数据集绑定、数据处理脚本、交互动作等通用能力继续由设计器通用面板承载，除非该组件确实需要新增图表专属配置项。

## 2. 文件与类型约定

每个图表组件目录必须保持以下结构：

| 文件 | 说明 |
|------|------|
| `install.ts` | 定义 `PropsInterface`、`ChartConfig` 类型、默认配置、`controlPanel`、`behaviors`、`datasetFields` |
| `index.vue` | 图表渲染组件，消费 `chart.props` 并生成 ECharts 或自定义渲染配置 |
| `panel/index.vue` | 图表专属配置面板，直接绑定并修改 `chart.props` |

配置项必须先在 `install.ts` 的 `PropsInterface` 和 `getInstance()` 默认值中声明，再在 `panel/index.vue` 中提供编辑控件。不要只在面板中维护本地状态，也不要让面板字段与默认配置脱节。

## 3. 面板基础模板

面板组件使用两个 `<script>` 块：普通脚本声明稳定组件名，`script setup` 声明属性和面板逻辑。

```vue
<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type {DrXxxChartConfig} from '../install.ts'
import {computed} from 'vue'

const {chart} = defineProps<{
  chart: DrXxxChartConfig
}>()
const chartConfig = computed(() => chart)
</script>
```

根节点类名使用组件短横线命名，例如 `dr-bar-chart-panel`、`dr-line-chart-panel`。表单统一使用：

```vue
<el-form :model="chartConfig" label-width="90px" size="small" label-position="left">
```

## 4. 分组顺序

常规笛卡尔坐标图表按以下顺序组织折叠面板：

1. 全局配置
2. X 轴
3. Y 轴
4. 图例
5. 提示框
6. 系列样式
7. 动画

非笛卡尔图表可裁剪或替换轴配置，例如饼图使用「图形布局」「扇区样式」，仪表盘使用「仪表盘」「指针」「进度条」。但通用分组仍应放在前后固定位置：全局配置靠前，图例和提示框居中，动画靠后。

每个一级分组使用独立的 `el-collapse` 和 `el-collapse-item`，二级分组使用 `.sub-title`，不要把多个视觉层级堆在同一个表单项里。

## 5. 通用配置项

### 5.1 全局配置

全局配置至少包含图表内边距：

```ts
global: {
  padding: [number, number, number, number]
}
```

优先使用 `PaddingBoxEditor` 编辑 `[上, 右, 下, 左]` 四元组，并通过 computed 适配 `v-model`：

```ts
const globalPadding = computed<[number, number, number, number]>({
  get: () => chartConfig.value.props.global.padding,
  set: (value) => {
    chartConfig.value.props.global.padding = value
  },
})
```

### 5.2 坐标轴配置

坐标轴类图表应复用以下结构：

| 配置 | 字段 | 控件 |
|------|------|------|
| 显示 | `axis.show` | `el-switch` |
| 类型 | `axis.type` | `el-select` |
| 轴名称 | `axis.name` | `el-input`，仅需要时提供 |
| 显示范围 | `axis.range.auto/min/max` | `el-switch` + `el-input-number` |
| 轴线 | `axis.axisLine.show/color/width` | `el-switch` + `el-color-picker` + `el-input-number` |
| 轴标签 | `axis.axisLabel.show/fontSize/color/fontWeight/fontFamily/rotate` | switch、数字、颜色、下拉 |
| 刻度线 | `axis.axisTick.show/length/color` | switch、数字、颜色 |
| 网格线 | `axis.splitLine.show/color/width/type` | switch、颜色、数字、线型下拉 |

关闭 `axis.show` 后，该轴的子配置不显示；关闭轴线、标签、刻度线、网格线后，只隐藏对应子项，不删除已有配置值。

### 5.3 图例配置

图例统一使用：

```ts
legend: {
  show: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
  textStyle: {
    fontSize: number
    color: string
    fontWeight: string
  }
  itemGap: number
}
```

显示开关关闭后隐藏位置、文字样式、间距等子项。

### 5.4 提示框配置

提示框统一使用：

```ts
tooltip: {
  show: boolean
  trigger: 'axis' | 'item'
  backgroundColor: string
  borderColor: string
  textStyle: {
    fontSize: number
    color: string
  }
}
```

坐标轴图表默认可使用 `axis` 触发，点状、饼图、仪表盘等按 ECharts 语义选择 `item`。

### 5.5 系列样式

系列样式按图表类型定义，命名应贴近 ECharts 配置语义，例如柱状图使用 `barWidth`、`barMaxWidth`、`barCategoryGap`、`barGap`，折线图使用 `lineType`、`lineWidth`、`symbol`。

多系列图表应提供颜色列表：

```ts
series: {
  colors: string[]
}
```

颜色列表编辑要求：

- 使用 `el-color-picker`，开启 `show-alpha`
- 支持添加颜色，默认新增 `#409eff`
- 支持删除颜色，但至少保留 1 个颜色
- 更新数组项时直接写回 `chartConfig.value.props.series.colors[index]`

数据标签配置应放在系列样式内部：

```ts
label: {
  show: boolean
  position: string
  fontSize: number
  color: string
  fontWeight: string
}
```

### 5.6 动画配置

动画统一使用：

```ts
animation: {
  enabled: boolean
  duration: number
  easing: 'linear' | 'cubicOut' | 'elasticOut' | 'bounceOut'
}
```

关闭动画后隐藏时长和缓动配置；默认时长建议 `1000`，缓动建议 `cubicOut`。

## 6. 控件选择规范

| 数据类型 | 控件 | 要求 |
|----------|------|------|
| 布尔值 | `el-switch` | 标签统一使用「显示」「启用」「自动」 |
| 枚举值 | `el-select` + `el-option` | 选项数组在 `script setup` 中集中定义 |
| 数值 | `el-input-number` | 必须设置合理的 `min`、`max`、`step`，并使用 `controls-position="right"` |
| 颜色 | `el-color-picker` | 默认开启 `show-alpha` |
| 字符串 | `el-input` | 提供简短 placeholder，例如「可选」「如 30%」 |
| 四方向间距 | `PaddingBoxEditor` | 用 computed 双向绑定四元组 |
| 列表 | `v-for` + 操作按钮 | 删除按钮必须有最小数量保护 |

字体、线型、缓动等常用选项应复用以下中文标签：

| 类型 | 推荐选项 |
|------|----------|
| 字重 | 正常 (400)、粗体 (700)、细 (300)、中等 (500)、较粗 (800) |
| 字体 | 微软雅黑、宋体、黑体、Arial、Helvetica |
| 线型 | 实线、虚线、点线 |
| 缓动 | 线性、平滑减速、弹性、弹跳 |

## 7. 条件显示与状态管理

面板应直接修改传入的 `chart.props`，保持配置变更实时反映到画布：

```vue
<el-switch v-model="chartConfig.props.legend.show"/>
<template v-if="chartConfig.props.legend.show">
  <!-- 子配置 -->
</template>
```

只有在组件需要适配复杂 `v-model`、数组元组或派生读写时才使用 computed setter。不要复制整份 props 到 `reactive` 本地对象，避免保存、撤销、预览时状态不一致。

## 8. 样式规范

样式必须使用 `scoped`，通过根类限制影响范围：

```css
.dr-xxx-chart-panel {
  padding: 12px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  color: #1d2129;
}
```

配置面板应保持以下视觉规则：

- `el-collapse` 无边框，分组之间 `margin-bottom: 12px`
- 折叠标题字号 `12px`、字重 `600`、高度 `36px`
- `el-form-item` 间距 `4px`
- 表单标签字号 `12px`、字重 `500`、颜色 `#4e5969`
- 输入框、数字输入、下拉、颜色选择器圆角 `6px`
- 聚焦态使用蓝色描边 `#3478f6`
- 二级标题 `.sub-title` 使用上边框分隔，字号 `12px`、字重 `600`

如多个图表面板出现重复样式，可以后续抽取共享 SCSS；在未抽取前，各面板应保持与柱状图面板一致的局部样式。

## 9. 新增图表面板检查清单

- `install.ts` 中已声明完整 `PropsInterface` 和默认值
- `panel/index.vue` 的 `chart` prop 类型使用该组件的 `ChartConfig`
- 面板根类、组件名、表单属性符合规范
- 通用分组顺序一致，图表专属分组命名清晰
- 布尔开关控制子项显隐，但不清空子项配置
- 颜色、字体、线型、缓动选项使用统一中文标签
- 数字输入设置合理范围和步长
- 所有控件都直接写回 `chart.props`
- 样式只作用于当前面板根类
- 修改后至少运行 `npm run type-check`；涉及样式或交互时再运行 `npm run lint` 并在设计器中目视验证
