# 全局变量来源多态设计

## 目标

优化全局变量配置能力，新增“代码块”来源，并将全局变量的数据结构调整为来源驱动的多态配置。

设计目标：

- 全局变量外层只保存通用字段：唯一标识、变量名称、来源、备注。
- 不同来源的私有字段放入各自独立的 `config` 配置对象中。
- 只有“代码块”来源显示并保存 JS 脚本。
- 静态值和 URL 来源不再显示、不再保存、不再执行脚本。
- 现有数据集参数绑定、组件同步全局变量、交互动作更新全局变量继续通过统一方法访问全局变量。

## 非目标

- 不兼容历史全局变量结构。
- 不迁移旧字段 `from`、`urlName`、`defaultValue`、`script`。
- 不改变页面配置的存储位置，全局变量仍保存在 `pageConfig.globalVariableList`。
- 不新增后端表结构或后端接口。
- 不把 URL 或代码块变量设计为可写变量。

## 当前状态

全局变量类型定义在 `dataRoomFront/src/dataRoom/designer/types/GlobalVariable.ts`。

当前结构是扁平字段：

```ts
export interface GlobalVariable {
  id: string
  from: 'static' | 'url'
  urlName?: string
  name: string
  remark: string
  defaultValue: string
  script?: string
}
```

全局变量配置入口是 `dataRoomFront/src/dataRoom/designer/components/GlobalVariable.vue`。

运行时读取和更新集中在 `dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts`：

- `getGlobalVariableValue(globalVariableName)` 根据变量名读取变量值。
- `updateGlobalVariableValue(globalVariableName, value)` 根据变量名更新变量值。

当前脚本字段在外层，静态变量和 URL 变量都可能执行脚本。新设计将脚本收敛到“代码块”来源，避免来源语义混杂。

## 数据结构

全局变量改为外层通用字段加内层来源配置：

```ts
export type GlobalVariableSource = 'static' | 'url' | 'code'

export interface GlobalVariable {
  id: string
  name: string
  remark: string
  source: GlobalVariableSource
  config: GlobalVariableConfig
}

export type GlobalVariableConfig =
  | StaticGlobalVariableConfig
  | UrlGlobalVariableConfig
  | CodeGlobalVariableConfig

export interface StaticGlobalVariableConfig {
  value: string
}

export interface UrlGlobalVariableConfig {
  paramName: string
  defaultValue: string
}

export interface CodeGlobalVariableConfig {
  code: string
}
```

内层 `config` 不再保存 `type` 字段。类型分发由外层 `source` 负责。

理由：

- `getGlobalVariableValue` 和 `updateGlobalVariableValue` 已经是统一访问入口，可以在这两个边界通过 `source` 将 `config` 转成对应类型。
- 去掉内层 `type` 可以避免 `source` 和 `config.type` 不一致。
- 持久化 JSON 更简洁，来源只表达一次。

新增变量默认创建静态变量：

```ts
{
  id: uuid,
  name: 'var_xxxxx',
  remark: '',
  source: 'static',
  config: {
    value: ''
  }
}
```

切换来源时，立即重建该来源的默认 `config`：

- 静态值：`{ value: '' }`
- URL：`{ paramName: '', defaultValue: '' }`
- 代码块：`{ code: '// 请输入JS代码\nreturn \'\'' }`

不保留上一来源的私有字段。

## 运行时规则

### 读取全局变量值

`getGlobalVariableValue(name)` 继续作为唯一取值入口。

规则：

- 找不到变量时，记录 warning 并返回空字符串。
- `source === 'static'` 时，将 `config` 转为 `StaticGlobalVariableConfig`，返回 `config.value`。
- `source === 'url'` 时，将 `config` 转为 `UrlGlobalVariableConfig`，从 `window.location.search` 读取 `config.paramName` 对应的 URL 参数。
- URL 参数名未配置时，记录错误并返回 `config.defaultValue || ''`。
- URL 参数不存在或为空时，返回 `config.defaultValue || ''`。
- `source === 'code'` 时，将 `config` 转为 `CodeGlobalVariableConfig`，执行 `config.code`，用脚本返回值作为变量值。
- 代码块脚本返回 `undefined` 或 `null` 时，记录错误并返回空字符串。
- 代码块脚本执行异常时，记录错误并返回空字符串。

代码块上下文复用交互代码块的 `bep` 对象：

```ts
const behaviorEventParam = {
  canvasInst,
  params: {}
}
```

脚本通过显式 `return` 返回值。例如：

```js
const city = bep.canvasInst.getGlobalVariableValue('city')
return city || '杭州'
```

静态值和 URL 来源不再执行任何脚本。

### 更新全局变量值

`updateGlobalVariableValue(name, value)` 继续作为唯一更新入口。

规则：

- 找不到变量时，记录 warning。
- 只允许更新静态变量：`staticConfig.value = value`。
- URL 和代码块变量是派生值，不允许写回。
- 写入 URL 或代码块变量时，记录 warning 并跳过。

这会影响以下现有调用方，但调用方式不需要变化：

- 交互动作“更新全局变量”。
- `DrInput`。
- `DrRadio`。
- `DrSelect`。
- `DrTabList`。

如果这些组件或动作绑定的是静态变量，行为保持可写。如果绑定的是 URL 或代码块变量，写回会被跳过。

## 配置界面

全局变量弹窗继续使用当前左右结构。

左侧：

- 顶部保留搜索框和新增按钮。
- 变量列表第一行显示变量名称。
- 变量列表第二行显示“来源标签 + 变量描述”。
- 来源标签使用 Element Plus 的 `el-tag`。
- 来源标签文案：
  - `static`：静态值
  - `url`：URL
  - `code`：代码块
- 来源标签和变量描述之间保留间距。
- 变量描述为空时，只显示来源标签。
- 搜索继续按变量名称和备注过滤。

右侧：

- 始终显示变量名称。
- 始终显示来源选择。
- 根据来源显示不同配置表单。
- 始终显示备注。

来源选择项：

| 显示文案 | 值 |
| --- | --- |
| 静态值 | `static` |
| URL | `url` |
| 代码块 | `code` |

动态配置：

| 来源 | 字段 |
| --- | --- |
| 静态值 | 变量值 |
| URL | URL 参数名称、默认值 |
| 代码块 | JS 脚本 |

代码块来源使用 CodeMirror JS 编辑器显示和编辑脚本。

项目已有 CodeMirror 基础依赖和 `vue-codemirror`，但当前没有 `@codemirror/lang-javascript`。实现时需要新增依赖：

```bash
npm install @codemirror/lang-javascript
```

CodeMirror 主题复用已有 `@uiw/codemirror-theme-eclipse`。

## 样式约束

涉及 Vue 和样式修改时必须遵循 `docs/design/DESIGN.md`。

要求：

- 使用 Element Plus 默认表单控件样式。
- 颜色、边框、文本、状态色只使用 Element Plus CSS 变量。
- 不新增 `--dr-*` 私有颜色变量。
- 不写硬编码十六进制、RGB、HSL 或颜色英文名。
- 不覆盖 Element Plus 内部 `.el-*` 选择器。
- 不使用 `!important`。
- 字距保持 `0`。

CodeMirror 外层容器可以设置布局尺寸和间距。若需要调整 CodeMirror 自身高度，应限制在本组件的 CodeMirror 容器范围内，不影响全局编辑器样式。

## 影响面

### 类型

修改：

- `dataRoomFront/src/dataRoom/designer/types/GlobalVariable.ts`

### 配置 UI

修改：

- `dataRoomFront/src/dataRoom/designer/components/GlobalVariable.vue`

需要处理：

- 新增变量默认结构。
- 来源切换时重建 `config`。
- 左侧来源 `el-tag`。
- 右侧动态来源配置表单。
- 代码块来源 CodeMirror JS 编辑器。

### 运行时

修改：

- `dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts`

需要处理：

- `getGlobalVariableValue` 按新结构取值。
- `updateGlobalVariableValue` 只写静态变量。
- 代码块变量复用 `bep` 上下文。
- URL 和代码块变量不可写回时输出 warning。

### 使用全局变量的调用方

调用方继续使用统一方法，不直接理解新结构：

- 数据集参数绑定通过 `fillDatasetParams` 和 `getGlobalVariableValue` 获取变量值。
- 交互动作“更新全局变量”通过 `updateGlobalVariableValue` 写入变量值。
- 表单类组件通过 `updateGlobalVariableValue` 同步值。

重点验证调用方：

- `dataRoomFront/src/dataRoom/designer/components/ControlPanel.vue`
- `dataRoomFront/src/dataRoom/designer/components/BehaviorConfigDialog.vue`
- `dataRoomFront/src/dataRoom/components/DrInput/index.vue`
- `dataRoomFront/src/dataRoom/components/DrRadio/index.vue`
- `dataRoomFront/src/dataRoom/components/DrSelect/index.vue`
- `dataRoomFront/src/dataRoom/components/DrTabList/index.vue`

### 页面保存和预览

页面配置仍保存 `globalVariableList`。

影响文件包括：

- `dataRoomFront/src/dataRoom/page-designer/PageDesigner.vue`
- `dataRoomFront/src/dataRoom/page-designer/preview/PagePreviewer.vue`
- `dataRoomFront/src/dataRoom/visual-screen-designer/VisualScreenDesigner.vue`
- `dataRoomFront/src/dataRoom/visual-screen-designer/preview/VisualScreenPreview.vue`
- `dataRoomFront/src/dataRoom/page-designer/type/PageConfig.ts`
- `dataRoomFront/src/dataRoom/page-designer/type/VisualScreenPageConfig.ts`

这些文件主要受类型变化影响，保存和加载流程不需要新增逻辑。

## 错误处理

- 缺少全局变量：warning。
- URL 来源未配置参数名：error，返回默认值。
- URL 参数不存在：返回默认值，不记录错误。
- 代码块没有返回有效值：error，返回空字符串。
- 代码块执行异常：error，返回空字符串。
- 写入 URL 或代码块变量：warning，跳过。

## 测试和验证

实现完成后至少运行：

```bash
cd dataRoomFront
npm run type-check
npm run lint
```

手工验证：

1. 新增全局变量时，默认创建静态值变量。
2. 左侧变量列表显示变量名称、来源 `el-tag` 和变量描述。
3. 修改变量描述后，左侧列表同步显示。
4. 切换到静态值来源，只显示变量值。
5. 切换到 URL 来源，只显示 URL 参数名称和默认值。
6. 切换到代码块来源，只显示 JS 脚本 CodeMirror 编辑器。
7. 静态值变量可被表单组件和交互动作写回。
8. URL 变量不可被表单组件和交互动作写回，并输出 warning。
9. 代码块变量不可被表单组件和交互动作写回，并输出 warning。
10. 数据集参数绑定静态值变量时得到静态值。
11. 数据集参数绑定 URL 变量时优先得到 URL 参数值，缺失时得到默认值。
12. 数据集参数绑定代码块变量时得到脚本返回值。
13. 代码块变量可以通过 `bep.canvasInst.getGlobalVariableValue` 读取其他变量。
14. 代码块执行异常时不阻断页面渲染，返回空字符串并输出错误。

## 交付边界

本设计可以作为单个前端改动实现。实现范围集中在全局变量类型、配置弹窗和画布运行时，不需要后端改造。
