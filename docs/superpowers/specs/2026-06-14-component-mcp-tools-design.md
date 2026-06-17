# 组件 MCP 工具设计

## 目标

新增两个 MCP 工具，把 DataRoom 前端组件元数据提供给 MCP 客户端使用：

- 获取当前系统的组件列表，包含组件名称、中文展示名和中文说明。
- 根据组件名称获取指定组件的详细配置信息，包含配置字段、类型、可选值、中文描述和默认值。

组件元数据由 `dataRoomFront` 通过 npm 命令导出，生成到后端 classpath 资源目录 `dataRoomServer/src/main/resources/mcp/component-configs/`。后端 MCP 工具运行时只读取这些生成后的资源文件，不直接解析前端源码。

## 当前上下文

后端已经接入 Spring AI MCP Server。`DataRoomMcpConfiguration` 通过 `MethodToolCallbackProvider` 注册工具对象，现有 MCP 工具使用 `@Tool` 标注在 Controller 方法上。

前端组件信息目前主要分布在两个位置：

- `dataRoomFront/src/dataRoom/_components/PluginRegister.ts` 通过组件插件类构建设计器可见的组件列表。
- 每个组件目录中包含 `plugin.ts` 和 `install.ts`：
  - `plugin.ts` 定义组件标识、中文名称、中文说明和缩略图。
  - `install.ts` 定义 `getInstance()`、props TypeScript 接口、数据集字段和交互行为。

本功能导出的详细配置只覆盖组件 props 配置。数据集绑定字段和组件交互行为属于独立概念，本期不混入配置字段列表。

## 输出文件

前端导出命令写入以下目录：

```text
dataRoomServer/src/main/resources/mcp/component-configs/
├── index.json
├── DrText.config.json
├── DrBarChart.config.json
└── ...
```

`index.json` 保存组件摘要列表：

```json
[
  {
    "componentName": "DrText",
    "displayName": "文本",
    "description": "文字、文本、数字"
  }
]
```

每个组件详情文件命名为 `{componentName}.config.json`，内容包含组件基础信息和扁平化的 `fields` 字段列表：

```json
{
  "componentName": "DrText",
  "displayName": "文本",
  "description": "文字、文本、数字",
  "fields": [
    {
      "field": "text",
      "type": "string",
      "description": "文本内容",
      "defaultValue": "文本占位符"
    },
    {
      "field": "align",
      "type": "enum",
      "options": ["left", "center", "right"],
      "description": "对齐方式",
      "defaultValue": "left"
    },
    {
      "field": "textStyle.fontSize",
      "type": "number",
      "description": "字体大小(px)",
      "defaultValue": 14
    }
  ]
}
```

嵌套字段使用点路径表达，例如 `tooltip.show`、`series.label.position`、`background.border.style`。

## 前端导出命令

在 `dataRoomFront/package.json` 中新增脚本：

```json
{
  "scripts": {
    "export:component-configs": "node scripts/export-component-configs.mjs"
  }
}
```

导出脚本读取前端组件源码并生成静态 JSON 资源文件。脚本使用 ESM Node 实现，并复用项目现有的 `typescript` 依赖做 AST 解析，避免新增脚本运行器依赖。

数据提取规则：

- 组件基础信息来自组件 `plugin.ts` 的 `super(...)` 构造参数：
  - `componentName`：第一个参数，例如 `DrText`。
  - `displayName`：第二个参数，例如 `文本`。
  - `description`：第三个参数，例如 `文字、文本、数字`。
- 配置字段来自组件 `install.ts` 中声明的 props interface。
- 字段中文描述来自 interface 属性上的 JSDoc 注释。
- 字段类型来自 TypeScript 属性类型。
- 字符串字面量联合类型导出为 `type: "enum"`，并写入 `options`。
- 默认值来自 `getInstance()` 中传给 `createChartConfig(...)` 的 props 默认配置对象。
- 嵌套对象属性展开为点路径字段。

导出命令需要稳定、可重复执行：每次执行覆盖旧的生成文件，并保持输出顺序确定。`PluginRegister.ts` 中注册的组件如果无法解析，应直接失败并输出清晰错误，避免生成不完整元数据。

## 后端 MCP 工具

新增独立工具对象，例如 `ComponentMcpTool`，不把新方法继续塞进 `PageController` 或 `DatasetController`。

在 `DataRoomMcpConfiguration` 中注册该工具对象：

```java
MethodToolCallbackProvider.builder()
        .toolObjects(datasetController, pageController, componentMcpTool)
        .build();
```

新增工具：

- `listComponents`
  - 读取 `classpath:mcp/component-configs/index.json`。
  - 返回组件摘要列表。
  - 工具描述中说明 `componentName` 是查询详情工具的入参。
- `getComponentConfig`
  - 入参：`componentName`。
  - 读取 `classpath:mcp/component-configs/{componentName}.config.json`。
  - 返回组件基础信息和扁平化配置字段列表。

后端应抽一个小的 service/helper 负责 classpath 资源读取和 JSON 解析，让两个工具复用同一套错误处理逻辑。

## 错误处理

如果 `index.json` 或组件详情文件缺失，返回明确错误，提示先执行前端导出命令：

```text
npm run export:component-configs
```

如果 `componentName` 为空，直接返回清晰的参数校验错误。

如果指定组件不存在，返回“组件不存在”的错误，并在可读取 `index.json` 的情况下附带可用的 `componentName` 列表。

Java `catch` 块必须遵循项目规范，先记录异常栈，再保留原有处理逻辑或返回错误。

## 测试

前端验证：

- 执行 `npm run export:component-configs`。
- 确认 `index.json` 生成到 `dataRoomServer/src/main/resources/mcp/component-configs/`。
- 抽查 `DrText.config.json`、`DrBarChart.config.json` 等代表性组件，确认包含扁平化字段、中文描述、默认值和枚举可选项。
- 执行 `npm run type-check`。

后端验证：

- 为资源读取/helper 增加聚焦测试：
  - 能从 `index.json` 返回组件列表；
  - 能返回指定组件配置；
  - 能清晰处理组件名不存在的情况。
- 运行相关后端测试。
- 如果后端 Java 修改包含 `catch` 块，额外运行：

```bash
mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

## 不在本期范围

- 后端运行时直接解析前端源码。
- 通过普通 REST 接口暴露组件元数据。
- 把组件数据集字段绑定或交互行为定义混入配置字段列表。
- 输出 JSON Schema。
- 根据导出的元数据自动校验页面配置 payload。
