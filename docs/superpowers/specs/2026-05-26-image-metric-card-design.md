# 图片指标卡组件设计

## 背景

新增一个可视化大屏组件，参考“左侧图片、右侧描述与数值”的指标展示效果。组件用于金额、告警数、设备数等单值指标场景，比纯指标卡更适合带图标或装饰素材的看板布局。

组件作为独立组件实现，不扩展现有 `DrMetricCard` 或 `DrImage`。这样可以保持现有组件行为稳定，同时复用它们已经沉淀的数值格式化、数值动画和图片填充逻辑。

## 组件定位

- 组件目录：`data-room-ui/src/dataroom-packages/components/DrImageMetricCard/`
- 组件类型：`DrImageMetricCard`
- 组件库名称：`图片指标卡`
- 组件库分类：`ComponentLibTagTypeConst.METRIC`
- 组件描述关键词：图片指标卡、图文指标、KPI、金额、单值、图标、数值
- 默认尺寸：`360 x 120`

首屏默认形态为横向布局：图片在左、文本在右；配置中支持切换为右图左文。

## 范围

### 包含

- 图片、描述、数值、单位四类展示内容。
- 图片位置支持 `left` 和 `right`。
- 描述和数值上下两行布局，支持调换顺序。
- 单位可显示在描述后、数值前或数值后。
- 只有数值支持数据集字段绑定。
- 描述、单位和图片只使用配置项。
- 数值格式化复用指标卡能力。
- 数值支持文字发光效果。
- 点击组件触发 `click` 行为。

### 不包含

- 不支持图片绑定数据集字段。
- 不支持描述绑定数据集字段。
- 不支持单位绑定数据集字段。
- 不提供超链接跳转。
- 不提供图片发光模拟，图片发光由素材本身决定。
- 不提供字距配置。描述、数值和单位均保持 `letter-spacing: 0`，遵循 `docs/design/DESIGN.md`。

## 配置模型

`install.ts` 中声明 `DrImageMetricCardPropsInterface`，所有面板字段直接绑定 `chart.props`。

```ts
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
    horizontalAlign: 'left' | 'center' | 'right'
    verticalAlign: 'top' | 'center' | 'bottom'
  }
  image: {
    url: string
    width: number
    height: number
    repeatMode:
      | 'no-repeat-stretch'
      | 'no-repeat-contain'
      | 'no-repeat-center'
      | 'repeat'
      | 'repeat-x'
      | 'repeat-y'
    borderRadius: number
  }
  description: {
    text: string
    fontSize: number
    color: string
    fontWeight: 'normal' | 'bold' | 'bolder'
    lineHeight: number
    align: 'left' | 'center' | 'right'
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
    fontWeight: 'normal' | 'bold' | 'bolder'
    lineHeight: number
    align: 'left' | 'center' | 'right'
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
    fontWeight: 'normal' | 'bold' | 'bolder'
    lineHeight: number
  }
  animation: {
    enabled: boolean
    duration: number
    easing: 'linear' | 'cubicOut' | 'elasticOut' | 'bounceOut'
  }
}
```

默认配置应尽量贴近参考图：透明或弱背景、左图右文、描述在上、数值在下、数值使用千分位格式、数值字号大于描述字号。

## 渲染结构

组件根节点负责外层尺寸、整体内边距、背景、边框、圆角和阴影。

内部结构为两列 flex：

- 图片区域：固定为配置的 `image.width` 和 `image.height`，不参与文本伸缩。
- 文本区域：`flex: 1`，最小宽度为 `0`，避免长文本撑破布局。

图片填充语义沿用 `DrImage`：

- `no-repeat-stretch`：`background-size: 100% 100%; background-repeat: no-repeat`
- `no-repeat-contain`：`background-size: contain; background-repeat: no-repeat; background-position: center`
- `no-repeat-center`：`background-size: auto; background-repeat: no-repeat; background-position: center`
- `repeat`：`background-repeat: repeat`
- `repeat-x`：`background-repeat: repeat-x`
- `repeat-y`：`background-repeat: repeat-y`

文本区包含描述行和值行。`contentOrder` 决定描述行和值行的上下顺序。

单位拼接规则：

- `descriptionSuffix`：单位作为描述行的一部分，显示在描述后。
- `valuePrefix`：单位显示在数值前。
- `valueSuffix`：单位显示在数值后。
- 组件不自动添加括号、空格或中文符号；这些由用户在单位文本中自行配置。

所有文本均设置：

```css
letter-spacing: 0;
```

数值文本额外设置：

```css
font-feature-settings: "tnum";
```

## 数据流

`datasetFields` 只声明一个字段：

```ts
[
  {
    name: 'valueField',
    desc: '指标数值字段',
    required: false,
    multiple: false
  }
]
```

运行时数据处理：

1. `useDrComponent` 接收数据集执行结果。
2. 使用 `normalizeRows` 取首行数据。
3. 使用 `getFirstFieldValue(row, chart.dataset?.fields, 'valueField')` 取数值。
4. 如果字段未配置、结果为空或值为 `undefined` / `null`，回退到 `chart.props.value.defaultValue`。
5. 使用 `formatMetricValue` 输出展示值。
6. 如果数值动画启用，使用现有指标卡的 requestAnimationFrame 动画逻辑。

描述、单位和图片地址不读取数据集。

## 交互

组件支持点击行为：

```ts
{
  name: '图片指标卡单击',
  desc: '鼠标点击图片指标卡时触发',
  method: 'click',
  paramsList: [
    { name: 'value', desc: '当前原始数值', type: 'number|string' },
    { name: 'formattedValue', desc: '当前格式化数值', type: 'string' },
    { name: 'description', desc: '描述文本', type: 'string' },
    { name: 'unit', desc: '单位文本', type: 'string' },
    { name: 'imageUrl', desc: '图片地址', type: 'string' }
  ]
}
```

点击时调用 `canvasInst.triggerChartBehavior(chart.id, 'click', payload)`。首版不处理页面跳转。

## 配置面板

面板文件为 `panel/index.vue`，遵循 `docs/design/chart-component-config-panel-spec.md`：

- 根节点使用 `.dr-config-panel.dr-image-metric-card-config-panel`。
- 根表单使用 `label-width="60px"`、`size="small"`、`label-position="left"`。
- 引入 `@/dataroom-packages/assets/styles/chartConfigPanel.scss`。
- 所有 Element Plus 控件使用默认样式，通过 props 表达尺寸和状态。
- 不使用 `:deep(.el-*)`、`!important` 或全局 `.el-*` 选择器。

折叠面板分组顺序：

1. 全局配置
2. 布局
3. 图片
4. 描述
5. 数值
6. 单位
7. 动画

配置项只控制当前组件自己的 `chart.props`。数据集绑定、参数、脚本和交互动作仍由设计器通用面板负责。

## 错误与降级

- 图片地址为空时，图片区域显示占位文本“图片加载失败”。
- 图片加载失败时不影响描述、数值和单位渲染。
- 数据集返回非数字时，格式化逻辑按 `formatMetricValue` 现有行为处理；无法转换为数字时展示原始值或空值文本。
- 容器过小时，文本使用单行省略，避免撑破组件。
- 动画期间组件卸载时取消 `requestAnimationFrame`。

## 文件清单

新增文件：

- `data-room-ui/src/dataroom-packages/components/DrImageMetricCard/install.ts`
- `data-room-ui/src/dataroom-packages/components/DrImageMetricCard/index.vue`
- `data-room-ui/src/dataroom-packages/components/DrImageMetricCard/panel/index.vue`
- `data-room-ui/src/dataroom-packages/components/DrImageMetricCard/plugin.ts`
- `data-room-ui/src/dataroom-packages/components/DrImageMetricCard/images/image-metric-card.svg`

修改文件：

- `data-room-ui/src/dataroom-packages/_components/PluginRegister.ts`

## 测试与验证

实现后至少执行：

- `npm run type-check`
- `npm run lint`，如果样式或面板结构有调整
- 搜索确认没有硬编码业务样式违规项：
  - 新增面板不包含 `:deep(.el-*)`、`::v-deep`、`/deep/`、`>>>`、`!important`
  - 新增样式不使用 `--dr-*`
  - 描述、数值、单位不提供 `letter-spacing` 配置项，也不生成非零 `letter-spacing`

建议补充轻量断言：

- `getInstance()` 默认配置包含 `DrImageMetricCard` 类型和必需 props。
- `PluginRegister.ts` 注册“图片指标卡”插件。
- 数值字段未配置时使用默认值。

## 验收标准

- 组件库“指标卡”分类中出现“图片指标卡”。
- 组件默认效果为图片 + 描述 + 数值的横向指标卡。
- 支持左图右文和右图左文。
- 支持描述与数值上下顺序切换。
- 只有数值读取数据集字段，其他内容只读配置项。
- 数值格式化支持指标卡同等格式。
- 数值文字发光可开关并可配置颜色、模糊和偏移。
- 图片填充方式与 `DrImage` 语义一致。
- 单位可放在描述后、数值前或数值后，组件不自动补符号。
- 点击行为按设计触发并携带完整 payload。
- 所有文本字距保持 `0`。
