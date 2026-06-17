# DataV 边框与装饰组件迁移设计

## 背景

DataRoom 需要复用 `/Users/liuchengbiao/Downloads/datav-vue3-master/packages/datav-vue3` 中的边框和装饰素材，并在现有组件体系中新增两个组件：

- `DrBorder`：边框组件，通过配置选择 `BorderBox1` 到 `BorderBox13`。
- `DrDecoration`：装饰组件，通过配置选择 `Decoration1` 到 `Decoration12`。

迁移后的 DataV 源码放在 `dataRoomFront/src/dataRoom/datav`。原始下载目录只作为来源，不在本次工作中修改。

## 目标

1. 将 `packages/datav-vue3` 复制到 `dataRoomFront/src/dataRoom/datav`，作为 DataRoom 内部素材库。
2. 新增 `DrBorder` 和 `DrDecoration` 两个符合 DataRoom 组件规范的组件。
3. 两个组件按当前配置异步加载 DataV 子组件，不全局注册 DataV 全量插件。
4. 配置模型覆盖所有边框和装饰公开属性。
5. DataRoom 配置面板和组件库界面遵循 `docs/design/DESIGN.md`；迁入的 DataV 素材源码保留原视觉色值。

## 非目标

1. 不把 25 个 DataV 子组件分别注册成 25 个 DataRoom 组件。
2. 第一版 `DrBorder` 不承载其他 DataRoom 组件，只作为纯视觉边框层。
3. 不重写 DataV 边框和装饰的视觉实现。
4. 不接入 DataV 的全局插件入口。
5. 不迁移 DataV 中与边框、装饰无关的文档站、示例应用和构建脚本，除非源码依赖确实需要。

## 架构

采用“内部素材库 + DataRoom 包装组件”的结构：

```text
dataRoomFront/src/dataRoom/
├── datav/
│   ├── components/
│   │   ├── BorderBox1/
│   │   ├── ...
│   │   ├── BorderBox13/
│   │   ├── Decoration1/
│   │   ├── ...
│   │   └── Decoration12/
│   ├── composables/
│   ├── types/
│   └── utils/
└── components/
    ├── DrBorder/
    │   ├── install.ts
    │   ├── index.vue
    │   ├── panel/index.vue
    │   └── plugin.ts
    └── DrDecoration/
        ├── install.ts
        ├── index.vue
        ├── panel/index.vue
        └── plugin.ts
```

`datav` 目录视为第三方可视化素材源码。实施时需要把内部导入路径从 `packages/datav-vue3/...` 改为 `@/dataRoom/datav/...`。

`DrBorder` 和 `DrDecoration` 是 DataRoom 对外暴露的组件类型。它们负责读取 `chart.props`、选择对应的 DataV 子组件、过滤并传递该子组件支持的属性。

## 配置模型

### DrBorder

`DrBorder` 覆盖所有边框公开属性：

```ts
interface DrBorderPropsInterface {
  borderType:
    | 'BorderBox1'
    | 'BorderBox2'
    | 'BorderBox3'
    | 'BorderBox4'
    | 'BorderBox5'
    | 'BorderBox6'
    | 'BorderBox7'
    | 'BorderBox8'
    | 'BorderBox9'
    | 'BorderBox10'
    | 'BorderBox11'
    | 'BorderBox12'
    | 'BorderBox13'
  colors: string[]
  backgroundColor: string
  reverse: boolean
  dur: number | null
  title: string
  titleWidth: number
  animate: boolean
}
```

默认值：

```ts
{
  borderType: 'BorderBox1',
  colors: [],
  backgroundColor: 'transparent',
  reverse: false,
  dur: null,
  title: '',
  titleWidth: 250,
  animate: true
}
```

边框属性支持关系：

| 子组件 | 支持属性 |
| --- | --- |
| `BorderBox1/2/3/6/7/9/10/12/13` | `color`、`backgroundColor` |
| `BorderBox4/5` | `color`、`backgroundColor`、`reverse` |
| `BorderBox8` | `color`、`backgroundColor`、`reverse`、`dur` |
| `BorderBox11` | `color`、`backgroundColor`、`title`、`titleWidth`、`animate` |

`colors` 会转换成 DataV 的 `color` 属性。`dur` 为 `null` 时不传给 DataV，保留 DataV 默认动画时长。

### DrDecoration

`DrDecoration` 覆盖所有装饰公开属性：

```ts
interface DrDecorationPropsInterface {
  decorationType:
    | 'Decoration1'
    | 'Decoration2'
    | 'Decoration3'
    | 'Decoration4'
    | 'Decoration5'
    | 'Decoration6'
    | 'Decoration7'
    | 'Decoration8'
    | 'Decoration9'
    | 'Decoration10'
    | 'Decoration11'
    | 'Decoration12'
  colors: string[]
  reverse: boolean
  dur: number | null
  scanDur: number | null
  haloDur: number | null
}
```

默认值：

```ts
{
  decorationType: 'Decoration1',
  colors: [],
  reverse: false,
  dur: null,
  scanDur: null,
  haloDur: null
}
```

装饰属性支持关系：

| 子组件 | 支持属性 |
| --- | --- |
| `Decoration1/3/6/7/10/11` | `color` |
| `Decoration2/4` | `color`、`reverse`、`dur` |
| `Decoration5/9` | `color`、`dur` |
| `Decoration8` | `color`、`reverse` |
| `Decoration12` | `color`、`scanDur`、`haloDur` |

`colors` 会转换成 DataV 的 `color` 属性。`dur`、`scanDur`、`haloDur` 为 `null` 时不传给 DataV，保留 DataV 默认动画时长。

## 按需加载

`DrBorder/index.vue` 维护边框异步组件映射：

```ts
const borderComponentMap = {
  BorderBox1: defineAsyncComponent(() => import('@/dataRoom/datav/components/BorderBox1/src/BorderBox1')),
  BorderBox2: defineAsyncComponent(() => import('@/dataRoom/datav/components/BorderBox2/src/BorderBox2')),
}
```

`DrDecoration/index.vue` 维护装饰异步组件映射：

```ts
const decorationComponentMap = {
  Decoration1: defineAsyncComponent(() => import('@/dataRoom/datav/components/Decoration1/src/index.vue')),
  Decoration2: defineAsyncComponent(() => import('@/dataRoom/datav/components/Decoration2/src/index.vue')),
}
```

渲染时根据当前类型选择组件：

```vue
<component :is="currentComponent" v-bind="currentDatavProps" />
```

`currentDatavProps` 只包含该子组件支持的属性，避免无效属性透传。

## 构建适配

DataV 边框组件主要使用 TSX，样式使用 Less。当前 `dataRoomFront/package.json` 未包含 DataV 所需的全部依赖。实施时新增：

1. 增加 `@vitejs/plugin-vue-jsx`，保留 DataV 边框 TSX 源码。
2. 增加 `less`，保留 DataV 原 Less 样式。
3. 增加 `@vueuse/core`，供 `autoResize` 使用。
4. 增加 `@jiaminghi/color`，供部分边框和装饰的透明色计算使用。

如果实施前依赖状态发生变化，已存在的依赖不重复添加。

## 配置面板

两个配置面板都使用现有配置面板结构：

- 根节点使用 `.dr-config-panel` 和组件专属类。
- 引入 `@/dataRoom/assets/styles/chartConfigPanel.scss`。
- 表单组件保持 Element Plus 默认样式。
- 业务样式只处理布局、间距和预览容器，不覆盖 Element Plus 内部类。

`DrBorder/panel/index.vue` 分组：

1. 边框类型：选择 `BorderBox1` 到 `BorderBox13`。
2. 颜色配置：维护 `colors` 列表，支持添加、删除和清空。
3. 背景配置：编辑 `backgroundColor`。
4. 类型专属配置：根据当前 `borderType` 显示 `reverse`、`dur`、`title`、`titleWidth`、`animate`。

`DrDecoration/panel/index.vue` 分组：

1. 装饰类型：选择 `Decoration1` 到 `Decoration12`。
2. 颜色配置：维护 `colors` 列表，支持添加、删除和清空。
3. 类型专属配置：根据当前 `decorationType` 显示 `reverse`、`dur`、`scanDur`、`haloDur`。

## 组件库注册

更新 `dataRoomFront/src/dataRoom/constant/ComponentLibTagTypeConst.ts`：

```ts
DECORATION = 'decoration'
```

更新 `dataRoomFront/src/dataRoom/_components/PluginRegister.ts`：

- 新增分类名称“装饰素材”。
- 导入 `DrBorderPlugin` 和 `DrDecorationPlugin`。
- 将两个插件加入 `pluginList`，标签使用 `ComponentLibTagTypeConst.DECORATION`。

组件库中展示两个卡片：“边框”和“装饰”。在两个组件目录内分别创建静态缩略图，例如 `images/border.svg` 和 `images/decoration.svg`，`plugin.ts` 直接导入对应缩略图。

## 数据流

1. 用户从组件库拖入“边框”或“装饰”。
2. `getInstance()` 创建 DataRoom 标准 `ChartConfig`。
3. 画布渲染 `DrBorder` 或 `DrDecoration`。
4. 包装组件根据 `chart.props` 选择 DataV 子组件。
5. 包装组件把已过滤的 DataV props 传入子组件。
6. 用户在配置面板修改类型或属性后，包装组件响应式切换渲染。

边框和装饰第一版不绑定数据集，不定义交互行为。

## 错误处理

1. 如果 `borderType` 或 `decorationType` 无法匹配，包装组件回退到默认类型。
2. 如果颜色数组为空，传空数组给 DataV，让 DataV 使用自身默认颜色。
3. 如果数值型动画配置为 `null`，不传递给 DataV。
4. 如果 DataV 子组件尺寸为 0，保留 DataV `autoResize` 的警告行为；DataRoom 默认实例尺寸应避免初始 0 宽高。

## 验证

实施完成后至少执行：

```bash
cd dataRoomFront
npm run type-check
npm run lint
```

涉及依赖新增时，还需要确认依赖安装成功。

建议启动前端开发服务做手动验证：

```bash
cd dataRoomFront
npm run dev
```

手动检查项：

1. 组件库出现“装饰素材”分类。
2. “边框”和“装饰”可以拖入画布。
3. `DrBorder` 能切换 `BorderBox1` 到 `BorderBox13` 并正常渲染。
4. `DrDecoration` 能切换 `Decoration1` 到 `Decoration12` 并正常渲染。
5. 颜色、背景、反向、动画时长、标题等适用配置能即时生效。
6. 配置面板没有硬编码业务 UI 色值、`--dr-*` 新增色值、Element Plus 内部样式覆盖或 `!important`。

## 风险与约束

1. 新增依赖可能需要联网安装；如果环境限制网络，需要记录阻塞原因。
2. DataV 原源码存在硬编码视觉色值，这是素材视觉的一部分；DataRoom 业务 UI 不新增这些硬编码色值。
3. DataV TSX 依赖 Vue JSX 编译支持，若不增加插件则需要改写边框源码，工作量更高。
4. `DrBorder` 第一版不承载子组件；后续若需要容器能力，应单独设计嵌套组件机制。
