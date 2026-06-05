# 告警图组件设计

## 背景

DataRoom 前端可视化组件遵循固定目录和自动注册约定：

- 每个组件位于 `dataRoomFront/src/dataroom-packages/components/<ComponentName>/`。
- `install.ts` 导出主组件、配置面板、默认实例工厂、交互定义和数据集字段定义。
- `index.vue` 负责画布渲染。
- `panel/index.vue` 负责右侧组件专属配置。
- `plugin.ts` 和 `PluginRegister.ts` 负责组件库展示。

本设计新增独立组件 `DrAlarmImage`，用于展示一个图片和一个数值，并根据数值命中的条件区间切换图片。组件面向大屏中的告警状态、设备状态、风险等级和指标状态展示场景。

## 目标

- 新增「告警图」组件，组件类型为 `DrAlarmImage`。
- 支持配置多个图片项，并指定一个默认图片。
- 支持为每个图片项配置数值条件，命中条件时切换到该图片。
- 条件表达式支持区间格式，例如 `100 > x > 90`。
- 支持数据集绑定一个主数值字段 `valueField`。
- 支持在图片旁展示当前数值，并提供常用数值格式化能力。
- 遵循现有组件注册、配置面板和设计系统规范。

## 非目标

- 不新增后端接口。
- 不实现复杂表达式语言、函数、逻辑与或非、变量选择或脚本执行。
- 不支持多个数据点同时驱动多个图片。
- 不支持按文本枚举值切换图片；本版本只按数值条件匹配。
- 不改造 `DrImage` 或 `DrMetricCard` 的现有职责。
- 不实现素材选择器；图片地址沿用现有 URL 输入和资源地址解析机制。

## 组件结构

目录：

`dataRoomFront/src/dataroom-packages/components/DrAlarmImage/`

文件：

- `install.ts`
- `index.vue`
- `panel/index.vue`
- `plugin.ts`
- `images/alarm-image.svg`

注册：

- 组件类型：`DrAlarmImage`
- 组件标题：`告警图`
- 组件库分类：`ComponentLibTagTypeConst.METRIC`
- 搜索描述：`告警、图片、阈值、指标、状态、区间`
- 在 `dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts` 中手动加入组件库插件列表。

## 配置模型

`DrAlarmImagePropsInterface` 分为四个配置域。

### 数值配置

`value` 描述数据值的默认值、格式化和展示样式：

- `show`: 是否显示数值。
- `defaultValue`: 未绑定数据集时使用的默认数值。
- `format`: `value | integer | float1 | float2 | percent | thousand | currency`。
- `decimalPlaces`: 小数位。
- `thousandSeparator`: 是否显示千分位。
- `prefix`: 数值前缀。
- `suffix`: 数值后缀。
- `emptyText`: 空值兜底文本。
- `fontSize`: 字号。
- `color`: 文字颜色。
- `fontWeight`: `normal | bold | bolder`。
- `lineHeight`: 行高。

数值格式化复用 `dataRoomFront/src/dataroom-packages/components/_shared/metric-table-utils.ts` 中的 `formatMetricValue()`。

### 图片配置

`image` 描述图片规则列表和图片显示方式：

- `defaultItemId`: 默认图片项 id。
- `repeatMode`: `no-repeat-stretch | no-repeat-contain | no-repeat-center | repeat | repeat-x | repeat-y`。
- `borderRadius`: 图片圆角。
- `items`: 图片项数组。

每个图片项包含：

- `id`: 稳定 id。
- `name`: 图片名称，用于配置面板和交互参数。
- `url`: 图片地址。
- `condition`: 条件表达式。
- `enabled`: 是否启用该规则。

默认图片项允许没有条件。非默认图片项没有条件或条件解析失败时不参与匹配。

### 布局配置

`layout` 控制图片和数值的排列：

- `direction`: `vertical | horizontal`。
- `imageSize`: `auto | contain`。
- `gap`: 图片与数值之间的间距。
- `horizontalAlign`: `left | center | right`。
- `verticalAlign`: `top | center | bottom`。

默认布局为纵向居中，图片在上，数值在下。

### 动画配置

`animation` 控制图片切换过渡：

- `enabled`: 是否启用切换过渡。
- `duration`: 过渡时长，单位毫秒。

首版只做透明度过渡，不引入复杂动画类型。

## 默认实例

默认实例配置：

- 标题：`告警图`
- 宽高：`w: 220`, `h: 180`
- `value.defaultValue`: `95`
- `value.format`: `integer`
- `value.show`: `true`
- 默认图片：正常状态图片项。
- 预置三条图片项：
  - 正常：默认项，无条件。
  - 预警：`100 > x > 90`
  - 异常：`x >= 100`

默认图片地址使用项目已有占位资源路径，例如 `/dataRoom/resource/image/placeholder.png`。缩略图使用组件本地 `images/alarm-image.svg`。

## 条件表达式

表达式变量固定为 `x`，表示当前主数值。运行时先把当前值转成有限数字，无法转换时不匹配任何条件并回退默认图片。

支持格式：

- 区间：`100 > x > 90`
- 区间含等号：`100 >= x >= 90`
- 单边右侧：`x > 90`、`x >= 90`、`x < 100`、`x <= 100`
- 单边左侧：`90 < x`、`90 <= x`、`100 > x`、`100 >= x`

匹配语义按表达式字面方向解释：

- `100 > x > 90` 表示 `x < 100 && x > 90`。
- `90 < x <= 100` 表示 `x > 90 && x <= 100`。
- `x >= 100` 表示 `x >= 100`。

非法表达式处理：

- 空表达式不匹配。
- 解析失败不匹配。
- 控制台输出一条简短警告，包含组件 id 和表达式文本。

当多个图片项同时命中时，按 `items` 数组顺序选择第一条命中的启用图片项。

## 数据流

数据集字段：

- `valueField`: 当前数值字段，非必填，单字段。

运行流程：

1. 组件挂载后调用 `useDrComponent()` 注册组件并接入现有数据自动刷新机制。
2. `changeData(datasetValue)` 使用 `normalizeRows()` 把数据集返回值规范化为行数组。
3. 从第一行读取 `valueField`，读取不到时使用 `value.defaultValue`。
4. 当前值传入条件匹配逻辑，得到当前图片项。
5. 使用 `formatMetricValue()` 生成展示文本。
6. 点击组件时触发 `click` 行为。

## 渲染行为

图片渲染复用 `DrImage` 的资源地址和背景图思路：

- 使用 `getResourceUrl()` 解析图片地址。
- `no-repeat-stretch` 使用 `background-size: 100% 100%`。
- `no-repeat-contain` 使用 `background-size: contain` 和居中。
- `no-repeat-center` 使用原始尺寸居中。
- `repeat`、`repeat-x`、`repeat-y` 按 CSS 背景平铺处理。

数值渲染：

- 文本最大宽度限制在组件容器内。
- 超出时省略显示。
- 数字启用 `font-feature-settings: "tnum"`。
- 字距保持 `0`。

组件根节点不设置硬编码颜色，面板样式遵循 `docs/design/DESIGN.md`。

## 交互定义

`behaviors` 提供一个点击事件：

- 名称：`告警图单击`
- 方法：`click`
- 参数：
  - `value`: 当前原始数值。
  - `formattedValue`: 当前格式化数值文本。
  - `imageName`: 当前图片名称。
  - `imageUrl`: 当前图片地址。
  - `condition`: 当前命中的条件表达式。

## 配置面板

配置面板使用共享结构：

- 根节点：`.dr-config-panel.dr-alarm-image-config-panel`
- 样式：第一行引入 `@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';`
- 根表单：`label-width="60px"`、`size="small"`、`label-position="left"`
- 所有一级分组放入同一个 `el-collapse.dr-config-panel__section`

分组顺序：

1. 数值
2. 图片规则
3. 布局
4. 动画

数值分组：

- 控制是否显示、默认值、格式、小数位、千分位、前缀、后缀、空文本。
- 控制字号、颜色、字重、行高。

图片规则分组：

- 控制图片填充方式和圆角。
- 支持新增图片项。
- 每个图片项支持启用、名称、地址、条件、设置默认、删除。
- 展示当前图片地址的小预览。
- 条件输入框占位提示为 `100 > x > 90`。

布局分组：

- 控制方向、图片尺寸策略、间距、水平对齐和垂直对齐。

动画分组：

- 控制是否启用切换过渡和过渡时长。

面板只绑定 `chart.props`，不复制整份 props 到本地状态。

## 错误处理

- 数据集为空：使用 `value.defaultValue`。
- 数据集字段未绑定：使用 `value.defaultValue`。
- 数据集值不能转换为有限数字：数值仍按原始值格式化展示，图片回退默认项。
- 默认图片 id 不存在：回退到第一个启用图片项；如果没有启用图片项，则显示图片加载失败占位。
- 图片 URL 为空或加载失败：组件显示“图片加载失败”占位。
- 条件解析失败：该规则不命中，不阻塞其他规则。

## 测试计划

单元测试：

- 条件表达式解析：
  - `100 > x > 90`
  - `100 >= x >= 90`
  - `x > 90`
  - `x <= 100`
  - `90 < x`
  - 非法表达式
- 图片匹配：
  - 第一条命中优先。
  - 没有命中时回退默认图片。
  - 禁用规则不参与匹配。
  - 默认图片缺失时回退第一个启用图片。

本地验证：

- 运行 `npm run type-check`。
- 涉及配置面板结构和样式，运行 `npm run lint`。
- 在设计器中手工验证新增组件出现在组件库，配置图片规则后能随数据值切换。

## 实施边界

本设计只进入前端组件层，不涉及后端、数据库、数据集执行逻辑或资源管理逻辑。实现时应避免修改已有组件行为，除 `PluginRegister.ts` 注册新插件外，不改动组件库公共注册机制。
