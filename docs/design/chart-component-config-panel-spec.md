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

根节点类名使用组件短横线命名，例如 `dr-bar-chart-panel`、`dr-line-chart-panel`。少量普通单行配置可以使用 Element Plus 表单 label：

```vue
<el-form :model="chartConfig" label-width="90px" size="small" label-position="left">
```

轴线、轴标签、刻度线、网格线、系列样式等三级配置应放在所属二级配置容器内部，使用单列表单项组织，label 放在表单组件左侧，详见“面板层级与布局”。

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

每个一级分组使用独立的 `el-collapse` 和 `el-collapse-item`，二级分组使用 `.dr-config-panel__sub-title`，不要把多个视觉层级堆在同一个表单项里。

## 5. 面板层级与布局

图表配置面板按「一级配置 -> 二级配置 -> 三级配置项」组织。层级用于表达配置归属，不用于覆盖 Element Plus 组件内部样式。

### 5.1 一级配置

一级配置对应配置面板中的主分组，例如柱状图中的「全局配置」「X 轴」「Y 轴」「图例」「提示框」「系列样式」「动画」。

- 一级配置使用 `el-collapse-item` 承载。
- 一级配置标题必须是用户可识别的图表配置域，例如「X 轴」，不要使用字段名或英文属性名。
- 一级配置内部可以直接放少量通用配置，也可以继续拆分二级配置。

### 5.2 二级配置

二级配置用于组织一级配置下面的语义子区域。例如「X 轴」是一级配置时，「轴线」「轴标签」「刻度线」「网格线」都是二级配置。

- 二级配置使用项目自定义标题容器，例如 `.dr-config-panel__sub-title`。
- 二级配置标题行可以放一个开关，开关用于控制该二级配置是否显示或启用。
- 二级配置标题只表达分组名称和开关状态，不承载具体输入项。
- 二级配置之间通过外层容器间距或分割线形成视觉区隔，不通过修改 `el-collapse` 内部样式实现。

示例结构：

```vue
<el-collapse-item title="X 轴" name="xAxis">
  <div class="dr-config-panel__section">
    <div class="dr-config-panel__sub-title">
      <span>轴线</span>
      <el-switch v-model="chartConfig.props.xAxis.axisLine.show" size="small"/>
    </div>
    <!-- 轴线下的三级配置项 -->
  </div>

  <div class="dr-config-panel__section">
    <div class="dr-config-panel__sub-title">
      <span>轴标签</span>
      <el-switch v-model="chartConfig.props.xAxis.axisLabel.show" size="small"/>
    </div>
    <!-- 轴标签下的三级配置项 -->
  </div>
</el-collapse-item>
```

### 5.3 三级配置项

三级配置项是最终可编辑字段，例如「名称」「颜色」「大小」「偏移量」「旋转角度」「线宽」。三级配置项必须归属于某个二级配置区域，不要与二级配置标题平级堆放。

- 三级配置项使用单列布局，一行只放 1 个配置项。
- 三级配置项放在二级配置容器内部，例如「X 轴 -> 轴标签 -> 字号/颜色/字重」。
- 三级配置项 label 放在表单组件左侧。配置面板内部的三级字段优先使用 `.dr-config-panel__sub-label`，不要写内联 `style`。
- `.dr-config-panel__sub-label` 后面的表单组件必须与 label 处于同一行，不允许被换到下一行。
- 列表型字段也是三级配置项，例如柱子样式中的「颜色列表」；它的 label 仍放在左侧，右侧区域内部再纵向排列颜色项和操作按钮。
- 二级配置标题是分组标题，三级配置项 label 是字段标题，两者必须有明确包含关系，不能视觉上处在同一层级。
- 每个二级配置区域可以使用内部 `el-form` 承载三级配置项，但三级字段的 label 不依赖 `el-form-item` 内置 label 区域时，应使用 `.dr-config-panel__sub-form-item` 保持 label 与控件同行。
- 颜色选择、数字输入、下拉选择、文本输入等控件保持 Element Plus 默认样式；只允许在外层二级容器上控制间距、缩进和分组关系。
- 二级配置的开关关闭后，隐藏对应三级配置项，但不清空已有配置值。

推荐结构：

```vue
<div class="dr-config-panel__sub-section">
  <div class="dr-config-panel__sub-title">
    <span>轴标签</span>
    <el-switch v-model="chartConfig.props.xAxis.axisLabel.show" size="small"/>
  </div>

  <el-form
    v-if="chartConfig.props.xAxis.axisLabel.show"
    class="dr-config-panel__sub-form"
    :model="chartConfig"
    size="small"
  >
    <el-form-item class="dr-config-panel__sub-form-item">
      <span class="dr-config-panel__sub-label">字号</span>
      <el-input-number
        v-model="chartConfig.props.xAxis.axisLabel.fontSize"
        class="dr-config-panel__control"
        :min="8"
        :max="64"
        controls-position="right"
      />
    </el-form-item>

    <el-form-item class="dr-config-panel__sub-form-item">
      <span class="dr-config-panel__sub-label">颜色</span>
      <el-color-picker v-model="chartConfig.props.xAxis.axisLabel.color" show-alpha/>
    </el-form-item>

    <el-form-item class="dr-config-panel__sub-form-item">
      <span class="dr-config-panel__sub-label">偏移量</span>
      <el-input-number
        v-model="chartConfig.props.xAxis.axisLabel.margin"
        class="dr-config-panel__control"
        :min="-100"
        :max="100"
        controls-position="right"
      />
    </el-form-item>
  </el-form>
</div>
```

对应 SCSS 应抽取到配置面板共享样式中，例如 `data-room-ui/src/dataroom-packages/assets/styles/chartConfigPanel.scss`：

```scss
.dr-config-panel__sub-section {
  margin-top: var(--space-3);
}

.dr-config-panel__sub-form {
  margin-top: var(--space-2);
  padding-left: var(--space-3);
}

.dr-config-panel__sub-form-item {
  width: 100%;
}

.dr-config-panel__sub-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  width: 100%;
  min-width: 0;
}

.dr-config-panel__sub-row--start {
  align-items: flex-start;
}

.dr-config-panel__sub-label {
  flex: 0 0 60px;
  width: 60px;
  margin-right: var(--space-2);
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
}

.dr-config-panel__control {
  width: 100%;
}

.dr-config-panel__color-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}
```

## 6. 通用配置项

### 6.1 全局配置

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

### 6.2 坐标轴配置

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

### 6.3 图例配置

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

### 6.4 提示框配置

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

### 6.5 系列样式

系列样式按图表类型定义，命名应贴近 ECharts 配置语义，例如柱状图使用 `barWidth`、`barMaxWidth`、`barCategoryGap`、`barGap`，折线图使用 `lineType`、`lineWidth`、`symbol`。

多系列图表应提供颜色列表：

```ts
series: {
  colors: string[]
}
```

颜色列表编辑要求：

- 使用 `el-color-picker`，开启 `show-alpha`
- 支持添加颜色，默认新增值应来自统一颜色工具或 Element Plus 当前主题主色，不在组件中写硬编码色值
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

### 6.6 动画配置

动画统一使用：

```ts
animation: {
  enabled: boolean
  duration: number
  easing: 'linear' | 'cubicOut' | 'elasticOut' | 'bounceOut'
}
```

关闭动画后隐藏时长和缓动配置；默认时长建议 `1000`，缓动建议 `cubicOut`。

## 7. 控件选择规范

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

## 8. 条件显示与状态管理

面板应直接修改传入的 `chart.props`，保持配置变更实时反映到画布：

```vue
<el-switch v-model="chartConfig.props.legend.show"/>
<template v-if="chartConfig.props.legend.show">
  <!-- 子配置 -->
</template>
```

只有在组件需要适配复杂 `v-model`、数组元组或派生读写时才使用 computed setter。不要复制整份 props 到 `reactive` 本地对象，避免保存、撤销、预览时状态不一致。

## 9. 样式规范

配置面板样式必须同时遵循 `docs/design/DESIGN.md`。图表面板只定义外层布局，不覆盖 Element Plus 默认视觉。

- 面板根节点使用组件短横线命名，例如 `.dr-bar-chart-panel`。
- 通用配置面板布局类优先放在 `data-room-ui/src/dataroom-packages/assets/styles/chartConfigPanel.scss`，各图表面板按需引入并使用统一类名。
- 允许在业务样式中控制外层容器的 `display`、`grid-template-columns`、`gap`、`padding`、`margin`、`overflow`、`width` 等布局属性。
- 允许使用 Element Plus CSS 变量设置项目自定义容器、说明文字、分割线和状态文本的颜色。
- 禁止使用 `:deep(.el-*)`、`::v-deep`、`/deep/`、`>>>`、全局 `.el-*` 选择器或 `!important` 覆盖 Element Plus 内部样式。
- 禁止为输入框、数字输入、下拉、颜色选择器、按钮、折叠面板、表单项重写颜色、边框、圆角、字号、行高、高度、内边距、hover、focus、disabled、placeholder 或弹层样式。
- 禁止写硬编码颜色、`--dr-*` 颜色变量、`box-shadow` 边框替代方案和负字距。
- 二级标题和三级配置项自定义 label 使用 Element Plus 文本变量，例如 `var(--el-text-color-primary)`、`var(--el-text-color-secondary)`。

## 10. 新增图表面板检查清单

- `install.ts` 中已声明完整 `PropsInterface` 和默认值
- `panel/index.vue` 的 `chart` prop 类型使用该组件的 `ChartConfig`
- 面板根类、组件名、表单属性符合规范
- 通用分组顺序一致，图表专属分组命名清晰
- 一级配置、二级配置、三级配置项层级清晰，例如「X 轴 -> 轴标签 -> 大小/颜色/偏移量」
- 三级配置项放在所属二级配置区域内部，采用单列布局，一行只放 1 个配置项
- 三级配置项 label 放在表单组件左侧，使用 `.dr-config-panel__sub-label` 时不写内联样式
- 三级配置项 label 与后面的表单组件保持同一行，不允许换行
- 列表型三级配置项使用左侧 label + 右侧列表区域，例如「颜色列表」
- 布尔开关控制子项显隐，但不清空子项配置
- 颜色、字体、线型、缓动选项使用统一中文标签
- 数字输入设置合理范围和步长
- 所有控件都直接写回 `chart.props`
- 未覆盖 Element Plus 内部样式，未使用硬编码颜色、`--dr-*` 颜色变量、`!important` 或负字距
- 样式只作用于当前面板根类
- 修改后至少运行 `npm run type-check`；涉及样式或交互时再运行 `npm run lint` 并在设计器中目视验证
