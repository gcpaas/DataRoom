# DataRoom 运行时组件 SDK 与注册表改造设计

## 1. 背景与目标

本文记录 DataRoom 支持外部图表组件运行时导入所需的两部分设计：

- DataRoom Component SDK API 草案：给外部组件开发者使用，避免组件直接依赖 DataRoom 源码内部路径。
- DataRoom 侧 ComponentRegistry 改造方案：把现有构建期静态组件注册改造成统一注册表，同时支持内置组件和运行时扩展组件。

本文暂不讨论组件商城、审核、支付、下载统计等平台能力。

目标效果：

- 外部组件可以打包成 JS 或 ZIP 后导入 DataRoom。
- 导入后无需重启系统、无需重新构建前端，组件可以立即出现在组件库中。
- 外部组件在使用体验上与本地组件一致，支持样式配置面板、数据集字段绑定、数据处理脚本、交互配置、预览和发布。
- 大屏设计器只面向统一的 `ChartConfig + ComponentRegistry`，不关心组件来自内置代码还是运行时导入。

## 2. 对大屏设计器的影响

对用户体验的影响应尽量小：

- 组件库增加扩展组件来源。
- 用户导入组件后可以立即拖入大屏。
- 样式配置、数据配置、交互配置仍使用现有入口。
- 已保存的大屏再次打开时，运行时扩展组件自动加载。
- 如果组件缺失，画布显示缺失组件占位，不影响整个页面打开。

对设计器内部的影响主要包括：

- 组件获取方式从静态 `import.meta.glob` map 改为统一 registry。
- 组件库列表从静态 `pluginList` 改为 registry 动态列表。
- 设计器、预览页、发布页初始化时需要先注册内置组件并加载已启用扩展组件。
- 页面配置建议增加可选插件来源信息，便于缺失提示、版本校验和页面迁移。
- 需要新增缺失组件占位，避免某个组件加载失败导致整张大屏不可用。

核心结论：大屏设计器的拖拽、缩放、图层、复制、删除、撤销重做、保存、发布等通用能力不应受到破坏性影响，因为它们主要操作通用 `ChartConfig`，不依赖组件来源。

## 3. DataRoom Component SDK API 草案

SDK 建议独立发布为：

```text
@dataroom/component-sdk
```

SDK 目标：

- 给开发者提供稳定、公开的组件开发 API。
- 隐藏 DataRoom 内部源码路径。
- 统一组件插件对象格式。
- 稳定 `ChartConfig` 创建方式。
- 封装组件数据刷新、实例注册和交互触发能力。

外部组件不应写：

```ts
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
```

应写：

```ts
import {
  defineDataRoomComponent,
  createChartConfig,
  useDataRoomComponent,
} from '@dataroom/component-sdk'
```

### 3.1 SDK 核心导出

```ts
export {
  defineDataRoomComponent,
  createChartConfig,
  useDataRoomComponent,
  emitChartBehavior,
  defineDatasetFields,
  defineBehaviors,
  defineMockDataset,
}

export type {
  DataRoomComponentPlugin,
  DataRoomComponentManifest,
  DataRoomComponentContext,
  ChartConfig,
  ChartDatasetField,
  ChartMockDataset,
  Behavior,
  BehaviorParam,
  ChartAction,
  ComponentExpose,
}
```

### 3.2 DataRoomComponentPlugin

```ts
export interface DataRoomComponentPlugin<TProps = unknown> {
  manifest: DataRoomComponentManifest

  component: Component
  controlPanel?: Component

  getInstance: () => ChartConfig<TProps>

  datasetFields?: ChartDatasetField[]
  behaviors?: Behavior[]
  mockDataset?: ChartMockDataset

  migrations?: DataRoomComponentMigration[]

  install?: (context: DataRoomComponentContext) => void | Promise<void>
  uninstall?: (context: DataRoomComponentContext) => void | Promise<void>
}
```

字段说明：

- `manifest`：组件元数据。
- `component`：设计器、预览页、发布页渲染的主组件。
- `controlPanel`：组件自己的样式配置面板。
- `getInstance`：创建默认组件实例。
- `datasetFields`：声明组件需要绑定的数据集字段。
- `behaviors`：声明组件支持触发的交互事件。
- `mockDataset`：设计态默认数据和字段映射。
- `migrations`：组件版本升级时迁移旧配置，第一阶段可先保留类型不实现。
- `install` / `uninstall`：插件生命周期，第一阶段应保持保守，不开放高权限能力。

### 3.3 DataRoomComponentManifest

```ts
export interface DataRoomComponentManifest {
  schemaVersion: string

  id: string
  type: string
  name: string
  description?: string
  version: string
  author?: string

  category?: string[]
  tags?: string[]

  thumbnail?: string

  hostApiVersion: string
  compatibleDataRoom?: string

  dependencies?: Record<string, 'external' | string>

  permissions?: {
    network?: boolean
    storage?: boolean
    eval?: boolean
  }
}
```

示例：

```ts
const manifest = {
  schemaVersion: '1.0',
  id: 'com.example.sales-funnel',
  type: 'ExtSalesFunnel',
  name: '销售漏斗图',
  description: '适用于销售阶段转化分析',
  version: '1.0.0',
  author: 'example',
  category: ['funnel'],
  tags: ['漏斗图', '销售', '转化率'],
  thumbnail: './assets/thumbnail.png',
  hostApiVersion: '^1.0.0',
  compatibleDataRoom: '>=1.0.0',
  dependencies: {
    vue: 'external',
    echarts: 'external',
    'element-plus': 'external',
  },
  permissions: {
    network: false,
    storage: false,
    eval: false,
  },
}
```

约束：

- `manifest.type` 必须全局唯一。
- `manifest.type` 必须与 `getInstance().type` 一致。
- 外部组件建议使用命名空间前缀，例如 `ExtSalesFunnel`、`vendor.sales.FunnelChart` 或 `com.example.SalesFunnel`。
- 运行时组件不能覆盖内置组件类型，例如不能注册 `DrBarChart`。

### 3.4 defineDataRoomComponent

```ts
export function defineDataRoomComponent<TProps>(
  plugin: DataRoomComponentPlugin<TProps>
): DataRoomComponentPlugin<TProps>
```

作用：

- 提供类型推导。
- 校验必填字段。
- 约束 `manifest.type` 与 `getInstance().type`。
- 后续可在开发期输出 warning。

使用示例：

```ts
export default defineDataRoomComponent<SalesFunnelProps>({
  manifest,

  component: Chart,
  controlPanel: Panel,

  getInstance() {
    return createChartConfig<SalesFunnelProps>(
      'ExtSalesFunnel',
      {
        title: '销售漏斗',
        colors: ['#409eff', '#67c23a'],
        label: {
          show: true,
          fontSize: 14,
        },
      },
      {
        title: '销售漏斗图',
        w: 420,
        h: 300,
      },
    )
  },

  datasetFields: [
    {
      name: 'nameField',
      desc: '阶段字段',
      required: true,
      multiple: false,
    },
    {
      name: 'valueField',
      desc: '数值字段',
      required: true,
      multiple: false,
    },
  ],

  behaviors: [
    {
      name: '单击',
      desc: '点击漏斗项时触发',
      method: 'click',
      paramsList: [
        { name: 'name', desc: '阶段名称', type: 'string' },
        { name: 'value', desc: '阶段数值', type: 'number' },
      ],
    },
  ],

  mockDataset: {
    dataset: [
      { stage: '线索', value: 1000 },
      { stage: '商机', value: 600 },
      { stage: '成交', value: 180 },
    ],
    fields: [
      { name: 'nameField', bindName: 'stage' },
      { name: 'valueField', bindName: 'value' },
    ],
  },
})
```

### 3.5 createChartConfig

```ts
export function createChartConfig<TProps>(
  type: string,
  props: TProps,
  overrides?: Partial<Omit<ChartConfig<TProps>, 'type' | 'props'>>
): ChartConfig<TProps>
```

默认生成结构：

```ts
{
  id,
  i: id,
  type,
  title: '未命名组件',
  w: 150,
  h: 100,
  x: 100,
  y: 100,
  z: 100,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  props,
  behaviors: {},
  dataset: {
    code: '',
    datasetType: '',
    fields: {},
    script: '',
    params: {},
  },
}
```

约束：

- 外部组件不应手写完整 `ChartConfig`。
- 新增基础字段时，应通过 SDK 内的 `createChartConfig` 统一补齐。
- `props` 中的配置字段应与配置面板直接绑定。

### 3.6 useDataRoomComponent

外部组件主组件用它接入 DataRoom 生命周期、数据刷新和动作调用。

```ts
export interface UseDataRoomComponentOptions<TData = unknown> {
  chart: ChartConfig<unknown>
  changeData?: (datasetValue: TData) => void
}

export interface UseDataRoomComponentReturn {
  canvasInst: DataRoomCanvasContext
  expose: ComponentExpose
  autoRefreshData: () => void
  changeData: (datasetValue: unknown) => void
  triggerAction: (action: ChartAction, data: unknown) => void
}
```

使用示例：

```ts
const props = defineProps<{
  chart: ChartConfig<SalesFunnelProps>
}>()

const { canvasInst, expose } = useDataRoomComponent({
  chart: props.chart,
  changeData(rows) {
    renderChart(rows)
  },
})

defineExpose(expose)
```

SDK 内部可以对应当前 DataRoom 的 `useDrComponent`，但外部开发者不感知内部实现。

### 3.7 emitChartBehavior

给组件触发交互事件使用。

```ts
export function emitChartBehavior<TPayload = unknown>(
  chart: ChartConfig<unknown>,
  method: string,
  payload: TPayload
): void
```

使用示例：

```ts
emitChartBehavior(chart, 'click', {
  name: item.name,
  value: item.value,
})
```

内部等价于：

```ts
canvasInst.triggerChartBehavior(chart.id, method, payload)
```

这样开发者不必直接依赖 `canvasInst` 细节。

### 3.8 DataRoomComponentContext

插件生命周期可获得宿主上下文。

```ts
export interface DataRoomComponentContext {
  app: App
  hostApiVersion: string

  registry: {
    has: (type: string) => boolean
    get: (type: string) => DataRoomComponentPlugin | undefined
  }

  logger: {
    debug: (...args: unknown[]) => void
    info: (...args: unknown[]) => void
    warn: (...args: unknown[]) => void
    error: (...args: unknown[]) => void
  }

  theme: {
    getCssVar: (name: string) => string
  }
}
```

第一阶段建议 `context` 保守，不开放 HTTP、路由、全局 store 等高权限对象。

### 3.9 辅助声明 API

```ts
export function defineDatasetFields<T extends ChartDatasetField[]>(
  fields: T
): T

export function defineBehaviors<T extends Behavior[]>(
  behaviors: T
): T

export function defineMockDataset<T extends ChartMockDataset>(
  dataset: T
): T
```

作用：

- 提升类型推导。
- 让开发者写法更稳定。
- 后续可在开发期附加校验。

### 3.10 配置面板开发约束

外部配置面板统一接收：

```ts
defineProps<{
  chart: ChartConfig<MyProps>
}>()
```

推荐写法：

```vue
<template>
  <el-form label-width="100px" label-position="left" size="small">
    <el-form-item label="标题">
      <el-input v-model="chart.props.title" />
    </el-form-item>

    <el-form-item label="字号">
      <el-input-number v-model="chart.props.label.fontSize" :min="10" :max="60" />
    </el-form-item>
  </el-form>
</template>
```

约束：

- 直接绑定 `chart.props`。
- 不复制完整 props 到本地状态。
- 不修改 `chart.dataset`、`chart.behaviors`，这些由宿主通用面板负责。
- 样式只写外层布局，不覆盖 Element Plus 内部类。
- 不使用全局 `.el-*`、`:deep(.el-*)`、`!important`。

## 4. ComponentRegistry 改造方案

### 4.1 当前问题

当前组件注册主要存在这些问题：

- `AutoInstall.ts` 使用 `import.meta.glob('./**/install.ts', { eager: true })`，只能注册构建时已存在的组件。
- `PluginRegister.ts` 手动维护组件库列表。
- 组件、配置面板、实例工厂、行为、数据字段、模拟数据分散在多个 map 中，但没有统一插件概念。
- 外部组件无法在运行时加入这些 map。

### 4.2 改造目标

```text
本地组件 install.ts
        │
        ▼
Builtin 注册器
        │
        ▼
ComponentRegistry 统一注册表 ◀──── Runtime 插件加载器 ◀──── 外部 js/zip
        │
        ├── getComponent()
        ├── getPanelComponent()
        ├── getComponentInstance()
        ├── getComponentBehaviors()
        ├── getComponentDatasetFields()
        ├── getComponentMockDataset()
        └── getPluginList()
```

设计器、预览页、发布页都只依赖 `ComponentRegistry`，不直接关心组件来源。

### 4.3 建议新增目录

```text
dataRoomFront/src/dataRoom/designer/registry/
├── ComponentRegistry.ts
├── registerBuiltinComponents.ts
├── RuntimePluginLoader.ts
├── PluginNormalize.ts
├── PluginValidator.ts
└── PluginTypes.ts

dataRoomFront/src/dataRoom/components/
├── AutoInstall.ts
└── MissingComponent.vue
```

其中 `AutoInstall.ts` 先保留文件名，用于兼容现有导入路径，内部改为代理 `ComponentRegistry`。

### 4.4 Registry 核心类型

```ts
export interface RegisteredComponentPlugin<TProps = unknown> {
  source: 'builtin' | 'runtime'

  manifest: {
    id: string
    type: string
    name: string
    description?: string
    version?: string
    author?: string
    thumbnail?: string
    category?: string[]
    tags?: string[]
  }

  component: Component
  controlPanel?: Component

  getInstance: () => ChartConfig<TProps>

  datasetFields?: ChartDatasetField[]
  behaviors?: Behavior[]
  mockDataset?: ChartMockDataset

  loadedAt?: number
}
```

内部存储建议：

```ts
const pluginMap = shallowReactive(new Map<string, RegisteredComponentPlugin>())
```

key 使用 `manifest.type`。

### 4.5 Registry 对外 API

```ts
export const componentRegistry = {
  register,
  unregister,
  has,
  getPlugin,
  getPluginList,

  getComponent,
  getPanelComponent,
  getComponentInstance,
  getComponentBehaviors,
  getComponentDatasetFields,
  getComponentMockDataset,
}
```

#### 4.5.1 register

```ts
function register(plugin: RegisteredComponentPlugin): void
```

行为：

1. 校验 `plugin.manifest.type`。
2. 校验 `plugin.component`。
3. 校验 `plugin.getInstance`。
4. 调用 `plugin.getInstance()`，确认返回的 `type` 与 manifest 一致。
5. 检查 type 冲突。
6. 写入 `pluginMap`。

冲突策略：

- `builtin` 组件不允许被 `runtime` 覆盖。
- 同一个 runtime 插件同版本重复注册，忽略。
- 同 type 不同插件 id，拒绝。
- 同 plugin id 新版本，走升级流程，不在 `register` 中静默替换。

伪代码：

```ts
function register(plugin: RegisteredComponentPlugin) {
  const type = plugin.manifest.type

  if (!type) {
    throw new Error('组件 type 不能为空')
  }

  if (!plugin.component) {
    throw new Error(`组件 ${type} 缺少 component`)
  }

  if (!plugin.getInstance) {
    throw new Error(`组件 ${type} 缺少 getInstance`)
  }

  const instance = plugin.getInstance()

  if (instance.type !== type) {
    throw new Error(`组件 ${type} 的 manifest.type 与 getInstance().type 不一致`)
  }

  const existing = pluginMap.get(type)

  if (existing?.source === 'builtin' && plugin.source === 'runtime') {
    throw new Error(`运行时组件不能覆盖内置组件 ${type}`)
  }

  pluginMap.set(type, plugin)
}
```

#### 4.5.2 unregister

```ts
function unregister(type: string): void
```

行为：

- 只允许卸载 runtime 组件。
- 不允许卸载 builtin 组件。
- 卸载后，已存在画布里的组件会变成缺失组件占位。

```ts
function unregister(type: string) {
  const plugin = pluginMap.get(type)

  if (!plugin) {
    return
  }

  if (plugin.source === 'builtin') {
    throw new Error(`内置组件 ${type} 不允许卸载`)
  }

  pluginMap.delete(type)
}
```

#### 4.5.3 getComponent

```ts
function getComponent(type: string): Component
```

如果找不到，返回 `MissingComponent`，而不是 `undefined`。

```ts
function getComponent(type: string) {
  return pluginMap.get(type)?.component || MissingComponent
}
```

#### 4.5.4 getPanelComponent

```ts
function getPanelComponent(type?: string): Component | null
```

```ts
function getPanelComponent(type?: string) {
  if (!type) return null
  return pluginMap.get(type)?.controlPanel || null
}
```

#### 4.5.5 getComponentInstance

```ts
function getComponentInstance(type: string): ChartConfig<unknown>
```

保持当前行为：创建实例时补 `hide: false`。

```ts
function getComponentInstance(type: string): ChartConfig<unknown> {
  const plugin = pluginMap.get(type)

  if (!plugin) {
    throw new Error(`未找到组件 ${type}`)
  }

  return {
    hide: false,
    ...plugin.getInstance(),
  }
}
```

#### 4.5.6 getComponentBehaviors

```ts
function getComponentBehaviors(type: string): Behavior[] {
  return pluginMap.get(type)?.behaviors || []
}
```

#### 4.5.7 getComponentDatasetFields

```ts
function getComponentDatasetFields(type: string): ChartDatasetField[] {
  return pluginMap.get(type)?.datasetFields || []
}
```

#### 4.5.8 getComponentMockDataset

```ts
function getComponentMockDataset(type: string): ChartMockDataset | null {
  return pluginMap.get(type)?.mockDataset || null
}
```

#### 4.5.9 getPluginList

替代当前 `PluginRegister.ts` 的手工 `pluginList`。

```ts
function getPluginList(options?: {
  source?: 'builtin' | 'runtime'
  keyword?: string
  tag?: string
}): RegisteredComponentPlugin[] {
  let list = Array.from(pluginMap.values())

  if (options?.source) {
    list = list.filter(item => item.source === options.source)
  }

  if (options?.keyword) {
    const keyword = options.keyword
    list = list.filter(item => {
      return item.manifest.name.includes(keyword)
        || item.manifest.description?.includes(keyword)
        || item.manifest.tags?.some(tag => tag.includes(keyword))
    })
  }

  if (options?.tag) {
    list = list.filter(item => item.manifest.tags?.includes(options.tag))
  }

  return list
}
```

### 4.6 内置组件注册改造

新增：

```text
dataRoomFront/src/dataRoom/designer/registry/registerBuiltinComponents.ts
```

职责：

1. 使用 `import.meta.glob` 扫描本地 `install.ts`。
2. 使用 `import.meta.glob` 扫描本地 `plugin.ts` 或从约定元数据读取。
3. 转成 `RegisteredComponentPlugin`。
4. 调用 `componentRegistry.register()`。

短期兼容方案：

```ts
const installModules = import.meta.glob('./../../components/**/install.ts', {
  eager: true,
})

const pluginModules = import.meta.glob('./../../components/**/plugin.ts', {
  eager: true,
})
```

适配逻辑：

```ts
Object.entries(installModules).forEach(([path, module]) => {
  const type = parseComponentType(path)
  const pluginMeta = resolvePluginMeta(type, pluginModules)

  componentRegistry.register({
    source: 'builtin',
    manifest: {
      id: `builtin.${type}`,
      type,
      name: pluginMeta?.name || type,
      description: pluginMeta?.desc || '',
      thumbnail: pluginMeta?.thumbnail || '',
      tags: pluginMeta?.tags || [],
      version: DataRoomVersion,
    },
    component: module.component,
    controlPanel: module.controlPanel,
    getInstance: module.getInstance,
    behaviors: module.behaviors || [],
    datasetFields: module.datasetFields || [],
    mockDataset: module.mockDataset || null,
  })
})
```

长期建议：本地组件也逐步改造成与外部组件相同的 `defineDataRoomComponent` 导出格式。

### 4.7 AutoInstall.ts 兼容改造

为降低改动面，先保留 `AutoInstall.ts` 文件，但内部改为代理 registry。

当前常用导出：

```ts
getComponent()
getPanelComponent()
getComponentInstance()
getComponentBehaviors()
getComponentDatasetFields()
getComponentMockDataset()
```

改造后：

```ts
import { componentRegistry } from '@/dataRoom/designer/registry/ComponentRegistry'

export const getComponent = componentRegistry.getComponent
export const getPanelComponent = componentRegistry.getPanelComponent
export const getComponentInstance = componentRegistry.getComponentInstance
export const getComponentBehaviors = componentRegistry.getComponentBehaviors
export const getComponentDatasetFields = componentRegistry.getComponentDatasetFields
export const getComponentMockDataset = componentRegistry.getComponentMockDataset
```

这样 `VisualScreenDesigner.vue`、`ControlPanel.vue`、`VisualScreenPreview.vue` 等调用点可以少改。

### 4.8 PluginRegister.ts 改造

当前 `ComponentLib.vue` 直接使用：

```ts
import { pluginList } from '@/dataRoom/designer/registry/PluginRegister.ts'
```

建议改为：

```ts
import { componentRegistry } from '@/dataRoom/designer/registry/ComponentRegistry.ts'

const pluginList = computed(() => {
  return componentRegistry.getPluginList()
})
```

展示字段从：

```ts
plugin.type
plugin.name
plugin.desc
plugin.thumbnail
plugin.tags
```

改为：

```ts
plugin.manifest.type
plugin.manifest.name
plugin.manifest.description
plugin.manifest.thumbnail
plugin.manifest.tags
```

为了降低 UI 改动，也可以由 registry 提供兼容视图：

```ts
function getComponentLibItems(): ChartPluginLike[]
```

返回：

```ts
{
  type,
  name,
  desc,
  thumbnail,
  tags,
  source,
}
```

### 4.9 RuntimePluginLoader

新增：

```text
dataRoomFront/src/dataRoom/designer/registry/RuntimePluginLoader.ts
```

核心 API：

```ts
export async function loadRuntimePlugin(entryUrl: string): Promise<void>
```

逻辑：

```ts
export async function loadRuntimePlugin(entryUrl: string) {
  const mod = await import(/* @vite-ignore */ entryUrl)
  const plugin = normalizeRuntimePlugin(mod.default)

  componentRegistry.register({
    source: 'runtime',
    manifest: plugin.manifest,
    component: plugin.component,
    controlPanel: plugin.controlPanel,
    getInstance: plugin.getInstance,
    datasetFields: plugin.datasetFields || [],
    behaviors: plugin.behaviors || [],
    mockDataset: plugin.mockDataset || null,
  })
}
```

`normalizeRuntimePlugin` 校验：

- 是否有 default export。
- 是否有 `manifest`。
- 是否有 `component`。
- 是否有 `getInstance`。
- `manifest.type` 是否合法。
- `getInstance().type` 是否一致。
- `datasetFields` 格式是否正确。
- `behaviors` 格式是否正确。

### 4.10 初始化顺序

设计器、预览页、发布页都应使用统一初始化函数：

```ts
export async function initComponentRegistry() {
  registerBuiltinComponents()

  const runtimePlugins = await pluginApi.listEnabled()

  await Promise.all(
    runtimePlugins.map(plugin => loadRuntimePlugin(plugin.entryUrl))
  )
}
```

调用顺序：

```text
初始化 registry
  │
  ├── 注册内置组件
  ├── 加载 runtime 组件
  ▼
加载页面配置
  ▼
渲染画布
```

这个顺序需要覆盖：

- `VisualScreenDesigner.vue`
- `VisualScreenPreview.vue`
- 已发布大屏页面
- `PageDesigner` 相关页面

如果插件加载失败，应记录错误并继续渲染页面，失败组件由 `MissingComponent` 承接。

### 4.11 缺失组件占位

新增：

```text
dataRoomFront/src/dataRoom/components/MissingComponent.vue
```

用途：

- 插件未安装。
- 插件加载失败。
- 插件被禁用。
- 插件版本不兼容。

显示内容建议：

```text
组件未安装
类型：ExtSalesFunnel
请安装对应扩展组件后刷新页面
```

配置面板也可以提供 `MissingComponentPanel`：

```text
该组件来自扩展插件，但当前环境未安装。
组件类型：ExtSalesFunnel
```

目标是页面配置不丢失，用户仍可删除该组件或安装插件后恢复。

### 4.12 Registry 初始化幂等性

内置组件注册必须幂等，避免热更新或重复进入页面时报冲突。

```ts
let builtinRegistered = false

export function registerBuiltinComponents() {
  if (builtinRegistered) return
  builtinRegistered = true

  // register...
}
```

运行时插件也要避免重复加载：

```ts
const loadedRuntimeEntries = new Set<string>()
```

### 4.13 页面配置兼容

现有页面配置中的核心结构可以保持：

```json
{
  "type": "DrBarChart",
  "props": {},
  "dataset": {},
  "behaviors": {}
}
```

外部组件使用同样结构：

```json
{
  "type": "ExtSalesFunnel",
  "props": {},
  "dataset": {},
  "behaviors": {}
}
```

建议新增可选字段：

```json
{
  "type": "ExtSalesFunnel",
  "plugin": {
    "id": "com.example.sales-funnel",
    "version": "1.0.0"
  }
}
```

用途：

- 缺失插件提示。
- 插件版本校验。
- 页面导出时生成插件依赖清单。
- 页面迁移到另一套 DataRoom 时提示安装依赖。

## 5. 建议落地顺序

第一阶段只做运行时组件闭环：

1. 抽出 `ComponentRegistry`。
2. 保留 `AutoInstall.ts` 兼容导出。
3. 本地组件通过 registry 注册。
4. `ComponentLib.vue` 从 registry 获取组件列表。
5. 支持 `loadRuntimePlugin(entryUrl)` 动态注册一个 ESM 插件。
6. 增加 `MissingComponent`。
7. SDK 提供 `defineDataRoomComponent`、`createChartConfig`、`useDataRoomComponent`、`emitChartBehavior`。

第一阶段暂不做：

- 插件升级迁移。
- iframe 沙箱。
- 复杂权限系统。
- 组件商城。
- 在线审核。
- 远程依赖加载。

验收目标：

- 外部 ESM 组件可以运行时加载。
- 外部组件出现在组件库中。
- 外部组件可以拖入大屏。
- 外部组件主组件可以渲染。
- 外部组件配置面板可以展示并修改 `chart.props`。
- 外部组件数据集字段可以在通用数据面板中绑定。
- 外部组件交互事件可以在通用交互面板中配置。
- 预览页和发布页能渲染外部组件。
- 插件缺失时，页面显示缺失组件占位，不崩溃。
