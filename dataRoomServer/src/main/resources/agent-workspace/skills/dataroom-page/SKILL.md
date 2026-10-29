---
name: dataroom-page
description: 使用 dataroom-mcp-server MCP 工具设计和构建 DataRoom 页面或数据大屏的完整流程指南。当用户要求创建页面、设计大屏、配置可视化组件、搭建数据看板、或操作 DataRoom 平台页面时触发。也适用于用户提到"新建页面"、"大屏设计"、"添加图表"、"页面配置"、"DataRoom"等场景。
---

# DataRoom 页面/大屏设计流程

通过 dataroom-mcp-server 提供的 MCP 工具，按以下流程完成页面或大屏的设计与配置。

## 工具总览

| 工具 | 用途 | 调用时机 |
|------|------|----------|
| `listPages` | 查询页面/大屏列表（含 code、pageType） | 修改已有页面前，确认目标页面编码 |
| `getPageDesignConfig` | 获取页面当前设计态完整配置 | 修改已有页面前，读取现状配置 |
| `listComponents` | 获取系统可用组件列表 | 设计前，了解有哪些组件可用 |
| `getComponentConfig` | 获取指定组件的详细配置字段 | 添加组件前，获取其完整属性定义 |
| `newPage` | 创建新页面/大屏，返回页面ID与code | 流程第一步，创建页面实体 |
| `updatePageConfig` | 更新页面配置（组件布局、数据等） | 创建页面后，配置页面内容 |

## 修改已有页面/大屏的流程

1. 调用 `listPages`（可按名称模糊匹配）确认目标页面的 `code` 与 `pageType`；匹配到多个时必须向用户确认。
2. 调用 `getPageDesignConfig`（pageStatus 固定传 `design`）读取当前完整配置。
3. 在当前配置基础上做最小必要修改，保持未涉及组件的配置原样不变。
4. 调用 `updatePageConfig` 保存，pageConfig 必须保持完整结构（含 basicConfig/chartList/globalVariableList/pageType）。

## 新建页面/大屏设计流程

### 第一步：了解可用组件

调用 `listComponents` 获取系统中所有可用组件的列表，包括 componentName、displayName 和 description。

```
CallMcpTool:
  server_name: dataroom-mcp-server
  tool_name: listComponents
  arguments: {}
```

根据返回结果，确定页面需要用到哪些组件（如 DrText、DrBarChart、DrLineChart 等）。

### 第二步：确认页面类型

根据用户输入的需求进行意图识别，用户是想创建页面还是想创建大屏，如果你不确定，可以提示用户进行确认

### 第三步：创建页面实体

调用 `dataroom-mcp-server`的`newPage` 创建页面实体，除了id、createDate、createUser、updateDate、updateUser、tenantCode、delFlag字段不需要填写外，其他字段都必须填写。其中 `pageType` 决定后端自动生成的默认 pageConfig 结构，必须与后续设计器类型一致（页面传 `page`，大屏传 `visualScreen`），传错会导致默认配置与设计器不匹配。工具调用成功后返回页面ID。 记录返回的页面 ID，后续步骤需要用到。

### 第四步：设计页面
思考用户想要的页面或大屏需要用到哪些组件，从`listComponents` 返回的组件列表中选择合适的；
#### 特别注意：
* 如果pageType为page时，那么组件的w表示的占用页面的列数，h表示占用页面的行数，其中页面被拆分为了48列、每行占用的高度是16px，i的值是唯一的且必填
* 可以使用DrHTML组件进行视觉装饰和原生组件无法实现的特殊静态效果，如：
  * 全局渐变背景 
  * 网格、纹理、光晕、暗角 
  * 面板半透明底板 
  * 金色边框、切角、分隔线 
  * 标题流光底座 
  * 活动氛围装饰，例如“618”标识 
  * 纯 CSS 动画 
  * 原生组件无法实现的特殊排版或装饰

### 第五步：获取组件配置

对每个需要添加到页面的组件，调用 `getComponentConfig` 获取其完整属性定义。

```
CallMcpTool:
  server_name: dataroom-mcp-server
  tool_name: getComponentConfig
  arguments:
    componentName: "DrBarChart"
```

返回的 `fields` 字段是扁平化的配置列表，需要将其转换为 JSON 树结构作为组件的初始化配置。


### 第六步：更新页面配置

根据页面类型选择调用`getPageConfig`或`getVisualScreenPageConfig`获取页面属性定义信息

调用 `updatePageConfig` 将组件添加到页面并完成布局配置。

`chartList` 中每个元素代表一个组件实例，包含：
- 组件类型（componentName）
- 位置和尺寸（x, y, width, height）
- 组件属性配置（从第三步的 fields 转换而来）
- 数据源绑定信息
- 组件的配置信息要全量的，不能遗漏

涉及数据集的创建、修改、执行或组件数据绑定时，先阅读参考资源 `refrence/dataset.md`，按其中的数据集类型、MCP 工具契约与绑定规范执行。

## 关键注意事项

### 页面类型与状态的固定传参格式

MCP 工具入参 schema 由后端方法签名生成，HTTP API 文档中声明的枚举类型与 `BasePageConfig` 多态结构（`@JsonTypeInfo`）不会传导到 MCP 调用方。以下字段必须按固定格式传字符串值：

| 字段位置 | 字段 | 固定取值（小写驼峰） | 说明 |
|----------|------|----------------------|------|
| pageEntity / pageStage | `pageType` | `directory` / `page` / `visualScreen` | 页面类型，`newPage` 据此生成对应的默认配置 |
| pageEntity / pageStage | `pageStatus` | `design` / `preview` / `published` / `history` / `snapshot` | 由后端接管，设计流程固定传 `design` |
| pageStage 的 `pageConfig` 内部 | `pageType` | `page` / `visualScreen` | 多态反序列化的类型判别字段 |

硬性约束：

- **两个层级的 `pageType` 必须同时存在且取值一致**（如外层 `visualScreen`、内层 `page` 会导致类型冲突）。
- `pageConfig.pageType` 不会出现在工具 schema 的字段列表中，但它是**必需字段**，必须显式携带，缺失即多态反序列化失败。
- 取值统一使用小写驼峰：`visualScreen` 不要写成 `visual_screen` 或 `visualscreen`。
- `pageType` 为 `directory`（目录）时不会产生 pageStage 配置，后续设计流程不适用。

### 组件属性完整性

使用图表组件（如 DrLineChart、DrBarChart、DrPieChart 等）时，**必须严格依据 getComponentConfig 返回的 schema 补全所有属性字段**， 缺失关键属性会导致运行时报错。

### fields 转 JSON 树

`getComponentConfig` 、`getPageConfig` 、`getVisualScreenPageConfig` 返回的 fields 是扁平化列表，需要手动转换为嵌套 JSON 树结构。转换规则：
- 以 `.` 分隔的字段名表示嵌套层级
- 例如 `style.color` → `{ "style": { "color": "value" } }`

### 页面配置结构

`pageConfig` 必须包含以下四个必需字段：
- `basicConfig`：页面基础配置（背景色、分辨率等）
- `chartList`：组件实例数组
- `globalVariableList`：全局变量数组（可为空数组）
- `pageType`：页面类型标识（小写）

## 禁止事项

- 禁止从零手写组件 `props`。
- 禁止根据其他图表组件推测当前组件字段。
- 禁止因为父级配置为 `show: false` 或 `enabled: false`， 就删除其子配置对象。
- 禁止删除值为空、关闭或暂未使用的默认字段。
- 禁止把组件列表信息当作组件完整 Schema。
- 禁止用 `DrHtml` 实现已有图表组件。
- 禁止在未获取组件默认配置前调用 `updatePageConfig`。
- 禁止用浅合并覆盖嵌套配置对象。