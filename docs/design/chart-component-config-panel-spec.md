# 图表组件配置面板规范

## 1. 适用范围

本规范用于 `data-room-ui/src/dataroom-packages/components/*/panel/index.vue` 中的图表类组件配置面板。新增或改造图表组件时，应以 `DrBarChart/panel/index.vue` 的结构为基准，并根据图表类型裁剪轴、系列、标签等配置。

图表配置面板只负责组件视觉和图表行为配置，数据集绑定、数据处理脚本、交互动作等通用能力继续由设计器通用面板承载，除非该组件确实需要新增图表专属配置项。

本规范是图表配置面板改造的强制约束。以后新增或优化图表配置面板时，必须逐项对照本规范和第 10 节检查清单执行；不能只满足类名存在，还必须保证 DOM 层级、表单属性、缩进来源和字段归属与参考结构一致。交付前必须检查是否存在错误层级，例如把一级基础字段误放入 `.dr-config-panel__sub-section`，或遗漏三级表单的 `label-width="72px"`。

## 2. 文件与类型约定

每个图表组件目录必须保持以下结构：

| 文件              | 说明                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `install.ts`      | 定义 `PropsInterface`、`ChartConfig` 类型、默认配置、`controlPanel`、`behaviors`、`datasetFields` |
| `index.vue`       | 图表渲染组件，消费 `chart.props` 并生成 ECharts 或自定义渲染配置                                  |
| `panel/index.vue` | 图表专属配置面板，直接绑定并修改 `chart.props`                                                    |

配置项必须先在 `install.ts` 的 `PropsInterface` 和 `getInstance()` 默认值中声明，再在 `panel/index.vue` 中提供编辑控件。不要只在面板中维护本地状态，也不要让面板字段与默认配置脱节。

## 3. 面板基础模板

面板组件使用两个 `<script>` 块：普通脚本声明稳定组件名，`script setup` 声明属性和面板逻辑。

```vue
<script lang="ts">
import { defineComponent } from "vue";
import { DrConst } from "@/dataroom-packages/constant/DrConst.ts";

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + "ControlPanel",
});
</script>
<script setup lang="ts">
import type { DrXxxChartConfig } from "../install.ts";
import { computed } from "vue";

const { chart } = defineProps<{
  chart: DrXxxChartConfig;
}>();
const chartConfig = computed(() => chart);
</script>
```

根节点必须使用共享配置面板类 `.dr-config-panel`，并叠加组件专属短横线类，例如 `.dr-bar-chart-config-panel`、`.dr-line-chart-config-panel`。共享类提供统一配置面板布局，组件专属类只用于当前图表确实需要的局部布局修正。

```vue
<div class="dr-config-panel dr-bar-chart-config-panel">
  <el-form
    class="dr-config-panel__form"
    :model="chartConfig"
    label-width="60px"
    size="small"
    label-position="left"
  >
    <!-- 图表配置 -->
  </el-form>
</div>
```

面板样式块必须使用 `scoped lang="scss"`，并在第一行引入共享配置面板样式。只写 `.dr-config-panel__sub-row`、`.dr-config-panel__sub-label` 等类名是不够的；如果没有引入 `chartConfigPanel.scss`，三级配置项会按普通块级元素渲染，出现 label 和输入框上下排列的问题，例如「文本内容 -> 标题」中“标题”和输入框不在同一行。

```vue
<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-xxx-chart-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-xxx-chart-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
```

根表单属性必须与参考实现保持一致：`label-width="60px"`、`size="small"`、`label-position="left"`。不要因为某个图表字段 label 较长而把根表单改成 `90px` 或其他宽度；需要更长 label 时，应优先调整字段文案或放入二级配置下的三级配置行。

轴线、轴标签、刻度线、网格线、系列样式等三级配置应放在所属二级配置容器内部，使用单列表单项组织，label 放在表单组件左侧，详见“面板层级与布局”。

## 4. 分组顺序

常规笛卡尔坐标图表按以下顺序组织折叠面板：

1. X 轴
2. Y 轴
3. 图例
4. 提示框
5. 系列样式
6. 动画
7. 全局配置

非笛卡尔图表可裁剪或替换轴配置，例如饼图使用「图形布局」「扇区样式」，仪表盘使用「仪表盘」「指针」「进度配置」。但通用分组仍应保持稳定位置：图例和提示框居中，动画靠后，全局配置放在最后。

所有一级分组放在同一个 `el-collapse.dr-config-panel__section` 中，每个一级分组使用一个带稳定 `name` 的 `el-collapse-item`。不要为每个一级分组创建独立 `el-collapse`，否则会产生重复边框、额外间距和不必要的滚动高度。二级分组使用 `.dr-config-panel__sub-title`，不要把多个视觉层级堆在同一个表单项里。

推荐结构：

```vue
<el-collapse class="dr-config-panel__section">
  <el-collapse-item title="X 轴" name="xAxis">
    <!-- X 轴配置 -->
  </el-collapse-item>

  <el-collapse-item title="Y 轴" name="yAxis">
    <!-- Y 轴配置 -->
  </el-collapse-item>

  <el-collapse-item title="图例" name="legend">
    <!-- 图例配置 -->
  </el-collapse-item>

  <el-collapse-item title="提示框" name="tooltip">
    <!-- 提示框配置 -->
  </el-collapse-item>

  <el-collapse-item title="柱子样式" name="series">
    <!-- 系列配置 -->
  </el-collapse-item>

  <el-collapse-item title="动画" name="animation">
    <!-- 动画配置 -->
  </el-collapse-item>

  <el-collapse-item title="全局配置" name="global">
    <!-- 图表边距等全局配置 -->
  </el-collapse-item>
</el-collapse>
```

## 5. 面板层级与布局

图表配置面板按「一级配置 -> 二级配置 -> 三级配置项」组织。层级用于表达配置归属，不用于覆盖 Element Plus 组件内部样式。

### 5.1 一级配置

一级配置对应配置面板中的主分组，例如柱状图中的「全局配置」「X 轴」「Y 轴」「图例」「提示框」「系列样式」「动画」。

- 一级配置使用 `el-collapse-item` 承载。
- 一级配置标题必须是用户可识别的图表配置域，例如「X 轴」，不要使用字段名或英文属性名。
- 一级配置内部可以直接放少量一级基础字段，也可以继续拆分二级配置。
- 一级基础字段是控制整个一级配置域的字段，例如「X 轴 -> 显示」「X 轴 -> 数据类型」「Y 轴 -> 显示」「Y 轴 -> 轴名称」。这类字段必须直接作为 `el-collapse-item` 的子节点，不要包进 `.dr-config-panel__sub-section`，否则会产生多余缩进，与柱状图参考实现不一致。
- 只有真正的语义子区域才使用 `.dr-config-panel__sub-section`，例如「X 轴 -> 轴线」「X 轴 -> 轴标签」「Y 轴 -> 显示范围」「系列样式 -> 颜色列表」。

一级基础字段推荐结构：

```vue
<el-collapse-item title="X 轴" name="xAxis">
  <el-form-item label="显示">
    <el-switch v-model="chartConfig.props.xAxis.show"/>
  </el-form-item>
  <el-form-item label="数据类型">
    <el-select v-model="chartConfig.props.xAxis.type">
      <el-option label="类目" value="category"/>
      <el-option label="时间" value="time"/>
    </el-select>
  </el-form-item>

  <!-- 只有真正二级配置才进入 sub-section -->
  <div class="dr-config-panel__sub-section">
    <div class="dr-config-panel__sub-title">
      <span>轴线</span>
      <el-switch v-model="chartConfig.props.xAxis.axisLine.show"/>
    </div>
    <!-- 轴线下的三级配置项 -->
  </div>
</el-collapse-item>
```

### 5.2 二级配置

二级配置用于组织一级配置下面的语义子区域。例如「X 轴」是一级配置时，「轴线」「轴标签」「刻度线」「网格线」都是二级配置。

- 二级配置使用项目自定义标题容器，例如 `.dr-config-panel__sub-title`。
- 二级配置标题行可以放一个开关，开关用于控制图表运行时是否显示或启用该配置域。
- 二级配置标题只表达分组名称和开关状态，不承载具体输入项。
- 当一级配置标题与二级配置标题名称一致，并且该二级配置标题行只是当前一级配置域的显示或启用开关时，二级标题必须统一写为「启用」。例如一级「图例」下的开关标题写「启用」，不要继续写「图例」；一级「动画」下的开关标题写「启用」，不要继续写「动画」。这样避免一级、二级视觉层级出现重复名称。
- 二级配置之间通过外层容器间距或分割线形成视觉区隔，不通过修改 `el-collapse` 内部样式实现。
- 二级配置必须使用 `.dr-config-panel__sub-section` 作为外层容器。不要只写一个孤立的 `.dr-config-panel__sub-title`，否则后续三级表单无法获得统一缩进和分组间距。
- 二级配置下承载三级配置项的内部表单必须使用 `class="dr-config-panel__sub-form"`，并保持 `label-width="72px"`、`size="small"`、`label-position="left"`。这与柱状图参考实现保持一致，用于稳定三级配置项缩进。

示例结构：

```vue
<el-collapse-item title="X 轴" name="xAxis">
  <div class="dr-config-panel__sub-section">
    <div class="dr-config-panel__sub-title">
      <span>轴线</span>
      <el-switch v-model="chartConfig.props.xAxis.axisLine.show" size="small"/>
    </div>
    <!-- 轴线下的三级配置项 -->
  </div>

  <div class="dr-config-panel__sub-section">
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
- `.dr-config-panel__sub-label` 后面的表单组件必须与 label 处于同一行，不允许被换到下一行。该要求依赖共享样式中的 `.dr-config-panel__sub-row { display: flex; flex-wrap: nowrap; }` 生效；每个面板必须引入 `chartConfigPanel.scss`，否则 DOM 层级看似正确但视觉上仍会变成上下两行。
- 列表型字段也是三级配置项，例如柱子样式中的「颜色列表」；它的 label 仍放在左侧，右侧区域内部再纵向排列颜色项和操作按钮。
- 二级配置标题是分组标题，三级配置项 label 是字段标题，两者必须有明确包含关系，不能视觉上处在同一层级。
- 每个二级配置区域可以使用内部 `el-form` 承载三级配置项，但三级字段的 label 不依赖 `el-form-item` 内置 label 区域时，应使用 `.dr-config-panel__sub-form-item` 保持 label 与控件同行。
- 颜色选择、数字输入、下拉选择、文本输入等控件保持 Element Plus 默认样式；只允许在外层二级容器上控制间距、缩进和分组关系。
- 二级配置的开关只写回 `chart.props`，不控制面板中三级配置项显隐；开关关闭时，相关配置项仍然保持可编辑。

推荐结构：

```vue
<div class="dr-config-panel__sub-section">
  <div class="dr-config-panel__sub-title">
    <span>轴标签</span>
    <el-switch v-model="chartConfig.props.xAxis.axisLabel.show" size="small"/>
  </div>

  <el-form
    class="dr-config-panel__sub-form"
    :model="chartConfig"
    label-width="72px"
    size="small"
    label-position="left"
  >
    <el-form-item class="dr-config-panel__sub-form-item">
      <div class="dr-config-panel__sub-row">
        <span class="dr-config-panel__sub-label">字号</span>
        <el-input-number
          v-model="chartConfig.props.xAxis.axisLabel.fontSize"
          class="dr-config-panel__control"
          :min="8"
          :max="64"
          controls-position="right"
        />
      </div>
    </el-form-item>

    <el-form-item class="dr-config-panel__sub-form-item">
      <div class="dr-config-panel__sub-row">
        <span class="dr-config-panel__sub-label">颜色</span>
        <el-color-picker v-model="chartConfig.props.xAxis.axisLabel.color" show-alpha/>
      </div>
    </el-form-item>

    <el-form-item class="dr-config-panel__sub-form-item">
      <div class="dr-config-panel__sub-row">
        <span class="dr-config-panel__sub-label">偏移量</span>
        <el-input-number
          v-model="chartConfig.props.xAxis.axisLabel.margin"
          class="dr-config-panel__control"
          :min="-100"
          :max="100"
          controls-position="right"
        />
      </div>
    </el-form-item>
  </el-form>
</div>
```

对应 SCSS 已抽取到配置面板共享样式中，文件在 `data-room-ui/src/dataroom-packages/assets/styles/chartConfigPanel.scss`。每个使用这些类名的面板都必须通过 `@use` 引入该文件，不能假设其他组件已经全局加载：

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

面板内不得重新实现 `.dr-config-panel__sub-row` 为 grid、block 或其他布局，也不要在组件专属样式中覆盖 `.dr-config-panel__sub-label` 的宽度、换行或边距。需要保证三级行与柱状图参考实现保持一致：`.dr-config-panel__sub-row` 是单行 flex 容器，`.dr-config-panel__sub-label` 固定 60px，后续控件在同一行右侧展示。

柱状图当前实现还需要在组件专属根类上收敛外层空隙，并让折叠面板边框色融入右侧配置面板背景：

```scss
.dr-bar-chart-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-bar-chart-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
```

其他图表面板如果采用同一视觉效果，可使用自己的组件专属根类做等价处理；不要在全局样式中覆盖 Element Plus 折叠面板内部选择器。

## 6. 通用配置项

### 6.1 全局配置

全局配置放在折叠面板最后，至少包含图表内边距：

```ts
global: {
  padding: [number, number, number, number];
}
```

当前柱状图参考实现不使用 `PaddingBoxEditor`，而是参考「柱子样式 -> 圆角」的单列配置方式，将 `[上, 右, 下, 左]` 四元组拆成 4 个三级配置项：

```vue
<el-collapse-item title="全局配置" name="global">
  <div class="dr-config-panel__sub-section">
    <div class="dr-config-panel__sub-title">
      <span>图表边距</span>
    </div>
    <el-form
      class="dr-config-panel__sub-form"
      :model="chartConfig"
      label-width="72px"
      size="small"
      label-position="left"
    >
      <el-form-item class="dr-config-panel__sub-form-item">
        <div class="dr-config-panel__sub-row">
          <span class="dr-config-panel__sub-label">上边距</span>
          <el-input-number
            v-model="chartConfig.props.global.padding[0]"
            class="dr-config-panel__control"
            :min="0"
            :max="200"
            controls-position="right"
          />
        </div>
      </el-form-item>
      <!-- 右边距、下边距、左边距同理绑定 padding[1]、padding[2]、padding[3] -->
    </el-form>
  </div>
</el-collapse-item>
```

### 6.2 坐标轴配置

坐标轴类图表应复用以下结构：

| 配置     | 字段                                                              | 控件                                                |
| -------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| 显示     | `axis.show`                                                       | `el-switch`                                         |
| 类型     | `axis.type`                                                       | `el-select`                                         |
| 轴名称   | `axis.name`                                                       | `el-input`，仅需要时提供                            |
| 显示范围 | `axis.range.auto/min/max`                                         | `el-switch` + `el-input-number`                     |
| 轴线     | `axis.axisLine.show/color/width`                                  | `el-switch` + `el-color-picker` + `el-input-number` |
| 轴标签   | `axis.axisLabel.show/fontSize/color/fontWeight/fontFamily/rotate` | switch、数字、颜色、下拉                            |
| 刻度线   | `axis.axisTick.show/length/color`                                 | switch、数字、颜色                                  |
| 网格线   | `axis.splitLine.show/color/width/type`                            | switch、颜色、数字、线型下拉                        |

关闭 `axis.show` 后仅影响图表运行时轴是否显示，不隐藏该轴在配置面板中的子配置项；关闭轴线、标签、刻度线、网格线后也不隐藏对应子项，便于用户在关闭状态下继续调整配置值。

### 6.3 图例配置

图例统一使用：

```ts
legend: {
  show: boolean;
  position: "top" | "bottom" | "left" | "right";
  textStyle: {
    fontSize: number;
    color: string;
    fontWeight: string;
  }
  itemGap: number;
}
```

显示开关关闭后不隐藏位置、文字样式、间距等子项；开关仅影响图表运行时图例是否显示。

### 6.4 提示框配置

提示框统一使用：

```ts
tooltip: {
  show: boolean;
  trigger: "axis" | "item";
  backgroundColor: string;
  borderColor: string;
  textStyle: {
    fontSize: number;
    color: string;
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
  show: boolean;
  position: string;
  fontSize: number;
  color: string;
  fontWeight: string;
}
```

### 6.6 动画配置

动画统一使用：

```ts
animation: {
  enabled: boolean;
  duration: number;
  easing: "linear" | "cubicOut" | "elasticOut" | "bounceOut";
}
```

关闭动画后不隐藏时长和缓动配置；默认时长建议 `1000`，缓动建议 `cubicOut`。

## 7. 控件选择规范

| 数据类型                | 控件                      | 要求                                                                    |
| ----------------------- | ------------------------- | ----------------------------------------------------------------------- |
| 布尔值                  | `el-switch`               | 标签统一使用「显示」「启用」「自动」                                    |
| 枚举值                  | `el-select` + `el-option` | 选项数组在 `script setup` 中集中定义                                    |
| 数值                    | `el-input-number`         | 必须设置合理的 `min`、`max`、`step`，并使用 `controls-position="right"` |
| 百分比/透明度/半径/角度 | `el-input-number`         | 仍按数值处理，不使用 `el-slider`、`el-progress` 或其他进度条式控件      |
| 颜色                    | `el-color-picker`         | 默认开启 `show-alpha`                                                   |
| 字符串                  | `el-input`                | 提供简短 placeholder，例如「可选」「如 30%」                            |
| 四方向间距              | 4 个 `el-input-number`    | 按上、右、下、左顺序直接绑定四元组索引                                  |
| 列表                    | `v-for` + 操作按钮        | 删除按钮必须有最小数量保护                                              |

字体、线型、缓动等常用选项应复用以下中文标签：

图表配置面板不使用进度条式控件作为配置输入。包括半径、透明度、占比、角度、线宽、时长、阈值等连续数值在内，均使用 `el-input-number` 直接录入；只有布尔开关、枚举、颜色、字符串和列表使用对应控件。`el-slider` 和 `el-progress` 容易在窄侧栏中造成布局挤压，也会让配置项与数据展示控件混淆，因此不得用于 `panel/index.vue` 的图表配置项。

| 类型 | 推荐选项                                                 |
| ---- | -------------------------------------------------------- |
| 字重 | 正常 (400)、粗体 (700)、细 (300)、中等 (500)、较粗 (800) |
| 字体 | 微软雅黑、宋体、黑体、Arial、Helvetica                   |
| 线型 | 实线、虚线、点线                                         |
| 缓动 | 线性、平滑减速、弹性、弹跳                               |

## 8. 条件显示与状态管理

面板应直接修改传入的 `chart.props`，保持配置变更实时反映到画布：

```vue
<el-switch v-model="chartConfig.props.legend.show" />
<!-- 子配置始终展示，开关只控制图表运行时行为 -->
```

只有在组件需要适配复杂 `v-model`、数组元组或派生读写时才使用 computed setter。不要复制整份 props 到 `reactive` 本地对象，避免保存、撤销、预览时状态不一致。

## 9. 样式规范

配置面板样式必须同时遵循 `docs/design/DESIGN.md`。图表面板只定义外层布局，不覆盖 Element Plus 默认视觉。

- 面板根节点使用 `.dr-config-panel` + 组件专属类，例如 `.dr-bar-chart-config-panel`。
- 通用配置面板布局类优先放在 `data-room-ui/src/dataroom-packages/assets/styles/chartConfigPanel.scss`，各图表面板必须在 `<style scoped lang="scss">` 顶部通过 `@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';` 引入并使用统一类名。
- 允许在业务样式中控制外层容器的 `display`、`grid-template-columns`、`gap`、`padding`、`margin`、`overflow`、`width` 等布局属性。
- 允许使用 Element Plus CSS 变量设置项目自定义容器、说明文字、分割线和状态文本的颜色。
- 禁止使用 `:deep(.el-*)`、`::v-deep`、`/deep/`、`>>>`、全局 `.el-*` 选择器或 `!important` 覆盖 Element Plus 内部样式。
- 禁止为输入框、数字输入、下拉、颜色选择器、按钮、折叠面板、表单项重写颜色、边框、圆角、字号、行高、高度、内边距、hover、focus、disabled、placeholder 或弹层样式。
- 禁止写硬编码颜色、`--dr-*` 颜色变量、`box-shadow` 边框替代方案和负字距。
- 二级标题和三级配置项自定义 label 使用 Element Plus 文本变量，例如 `var(--el-text-color-primary)`、`var(--el-text-color-secondary)`。

### 9.1 右侧公共配置面板约束

图表专属面板渲染在 `data-room-ui/src/dataroom-packages/_components/ControlPanel.vue` 的「样式」Tab 内。公共右侧面板应保持以下行为：

- 「样式」「数据」「交互」三个 Tab 固定在顶部，不随内容滚动。
- 只有当前 Tab 的 `.tab-content` 允许纵向滚动。
- 右侧面板、Tabs 容器、Tab 内容区必须使用 `min-width: 0` 和 `overflow-x: hidden` 防止 1px 级横向滚动条。
- `el-tabs__header` 使用 `var(--el-fill-color-light)` 作为背景，并保留左侧 `var(--space-4)` 偏移，使 Tab 标题从左侧 16px 开始。
- 公共面板可在自身作用域内隐藏 Element Plus Tabs 的默认 header 分隔线和 active bar，以保持当前右侧面板视觉效果；不要在图表组件里重复处理 Tabs 样式。

当前公共面板关键结构：

```scss
.dr-control-panel {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.control-tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  height: 100%;
  flex: 1;
  min-height: 0;
}

.tab-content {
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
```

## 10. 新增图表面板检查清单

- `install.ts` 中已声明完整 `PropsInterface` 和默认值
- `panel/index.vue` 的 `chart` prop 类型使用该组件的 `ChartConfig`
- 面板根类、组件名、表单属性符合规范；根表单固定使用 `label-width="60px"`、`size="small"`、`label-position="left"`
- 面板样式块使用 `<style scoped lang="scss">`，并在第一行引入 `@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';`
- 通用分组顺序一致，图表专属分组命名清晰
- 一级配置项位于同一个 `el-collapse.dr-config-panel__section` 内，`el-collapse-item` 有稳定 `name`
- 一级基础字段直接放在 `el-collapse-item` 下，例如「显示」「数据类型」「轴名称」，不要放进 `.dr-config-panel__sub-section`
- 一级配置、二级配置、三级配置项层级清晰，例如「X 轴 -> 轴标签 -> 大小/颜色/偏移量」
- 二级配置必须使用 `.dr-config-panel__sub-section` 包裹，标题使用 `.dr-config-panel__sub-title`
- 三级配置内部表单必须使用 `.dr-config-panel__sub-form`，并固定 `label-width="72px"`、`size="small"`、`label-position="left"`
- 三级配置项放在所属二级配置区域内部，采用单列布局，一行只放 1 个配置项
- 三级配置项使用 `.dr-config-panel__sub-form-item` + `.dr-config-panel__sub-row` + `.dr-config-panel__sub-label`，label 放在表单组件左侧，不写内联样式
- 三级配置项 label 与后面的表单组件保持同一行，不允许换行；交付前应目视确认「label + 输入框/选择器/颜色选择器/开关」在同一行，避免出现只写类名但共享样式未加载导致的上下排列
- 列表型三级配置项使用左侧 label + 右侧列表区域，例如「颜色列表」
- 布尔开关控制子项显隐，但不清空子项配置
- 颜色、字体、线型、缓动选项使用统一中文标签
- 数字输入设置合理范围和步长
- 半径、透明度、百分比、角度等连续数值使用 `el-input-number`，不使用 `el-slider` 或 `el-progress`
- 所有控件都直接写回 `chart.props`
- 未覆盖 Element Plus 内部样式，未使用硬编码颜色、`--dr-*` 颜色变量、`!important` 或负字距
- 样式只作用于当前面板根类
- 面板没有引入横向滚动；长内容只在 Tab 内容区纵向滚动，顶部 Tabs 保持固定
- 修改后至少运行 `npm run type-check`；涉及样式或交互时再运行 `npm run lint` 并在设计器中目视验证
