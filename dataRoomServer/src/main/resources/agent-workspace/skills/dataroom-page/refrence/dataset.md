# DataRoom 数据集规范（页面设计参考资源）

本文件是 `dataroom-page` 技能的参考资源。当页面/大屏设计流程涉及**创建数据集、修改数据集、执行数据集、为组件绑定数据**时阅读本文件。数据集操作通过 `dataroom-mcp-server` 提供的 MCP 工具完成。

## 一、MCP 工具契约

数据集相关 MCP 工具**只有以下 4 个**，不要编造 `listDatasets`、`deleteDataset`、`testDataset`、`createDatasource` 等不存在的工具。

| 工具 | 入参 | 返回（Resp.data） | 说明 |
|------|------|------|------|
| `getDatasetDetail` | `code`：数据集编码 | 完整 DatasetEntity | 修改数据集前**必须先调用**获取现有配置 |
| `insertDataset` | `datasetEntity`：配置对象 | 新生成的 `code`（**不是 id**） | 新增数据集或目录 |
| `updateDataset` | `datasetEntity`：配置对象 | 数据库原有 `code` | 必须携带真实 `id`，按 id 更新 |
| `runDataset` | `datasetCode` + `inputParam` | `{ outputList, data }` | 执行数据集，返回数据与输出字段 |

关键规则：

1. **`code` 与 `id` 是两个字段**。`insertDataset` 返回 `code`；`updateDataset` 需要 `id`（通过 `getDatasetDetail` 用 code 换取）；`runDataset`、组件绑定用 `code`。
2. `updateDataset` 中 `code` 不可修改，以数据库原值为准。
3. `runDataset` 响应有两层 `data`：外层 `Resp.data` 是 `{ outputList, data }`，内层 `data` 才是业务数据（通常为对象数组）。
4. `outputList` 中的字段名可作为组件 `dataset.fields` 绑定的 value。

## 二、DatasetEntity 公共结构

```json
{
  "name": "数据集名称",
  "datasetType": "json",
  "parentCode": "root",
  "dataSourceCode": "数据源编码（按类型决定是否需要）",
  "dataset": { "datasetType": "json", "...": "类型专属配置" },
  "inputList": [],
  "outputList": []
}
```

- `parentCode`：所属目录编码，根级显式传 `"root"`。
- `datasetType`：**外层实体与内层 `dataset.datasetType` 必须一致**，否则运行时分派会类型转换失败。
- `id`、`code`、`createDate`、`createUser`、`updateDate`、`updateUser`、`tenantCode`、`delFlag` 由后端维护，新增时不要填写。
- **更新陷阱**：`updateDataset` 是全量覆盖语义。只传 `id` + 个别字段会把 `inputList`/`outputList` 等覆盖为空。正确流程：先 `getDatasetDetail` → 在原配置基础上改目标字段 → 带原 `id` 整体提交 → 再查详情核对。

## 三、数据集类型总览

| datasetType | 用途 | 需要 dataSourceCode | 可执行 |
|-------------|------|---------------------|--------|
| `directory` | 目录，仅用于组织分类 | 否 | **否，禁止 runDataset** |
| `json` | 静态 JSON 文本 | 否 | 是 |
| `http` | HTTP 接口取数 | 可选（引用 HTTP 数据源或完整 URL） | 是 |
| `sql` | 关系型数据库查询 | 是（关系型数据源） | 是 |
| `excel` | 查询已导入的 Excel 表 | 否（用应用库连接） | 是 |
| `es` | Elasticsearch 查询 | 是（ES 数据源） | 是 |
| `websocket` | WebSocket 实时数据 | 否 | runDataset 仅处理 sampleData |
| `mqtt` | MQTT 实时数据 | 是（MQTT 数据源） | runDataset 仅处理 sampleData |

## 四、各类型 dataset 内层配置

### 4.1 directory（目录）

只需 `name`、`datasetType: "directory"`、`parentCode`，**不要传 `dataset`**。

### 4.2 json（静态 JSON）

```json
{ "datasetType": "json", "json": "[{\"region\":\"华东\",\"value\":12}]" }
```

- `json` 是 **JSON 文本字符串**（需转义），不是嵌套对象。
- 图表推荐对象数组；不支持 `#{param}` 占位，`inputParam` 不生效。
- JSON 格式错误时执行返回空数组。

### 4.3 http（HTTP 接口）

```json
{
  "datasetType": "http",
  "url": "https://api.example.com/metrics 或 /relative/path",
  "method": "GET",
  "headerList": [{ "key": "Authorization", "val": "RSA密文", "encrypted": true }],
  "body": "",
  "respJsonPath": "$.data.records"
}
```

- `method` 必须显式传 `GET` 或 `POST`（后端无默认值，GET 是前端默认）。
- 无 `dataSourceCode` 时 `url` 必须是完整 `http(s)://` 地址；有 `dataSourceCode` 时 `url` 为相对路径，与数据源 `baseUrl` 拼接。
- `body` 建议**始终显式传 `""`**（即使 GET），避免参数替换时空指针。
- `url`、`headerList[].val`、`body` 支持 `#{参数名}` 占位；不会自动把 inputParam 拼成 query string。
- `respJsonPath` 为空表示取整个响应体；响应必须可解析为 JSON。
- `encrypted: true` 表示 `val` **已是 RSA 密文**；详情接口会脱敏为 `"******"`，更新时同名加密 header 传 `"******"` 或空值表示保留旧值。

### 4.4 sql（关系型查询）

```json
{ "datasetType": "sql", "sql": "SELECT region, value FROM t_metric WHERE region = #{region}" }
```

- `dataSourceCode` 必须指向已有关系型数据源（MySQL/PostgreSQL/H2）。
- `#{param}` 走 PreparedStatement 参数绑定，**禁止 `${}` 拼接**（后端直接拒绝，防 SQL 注入）；`#{param}` 外不要自行加引号。
- 仅允许**单条 SELECT**（支持 CTE、子查询、JOIN），不支持 INSERT/UPDATE/DELETE/DDL/多语句。
- 支持 MyBatis 动态标签（`<if>`、`<foreach>`），SQL 中裸 `<`、`&` 需 XML 转义。
- 无自动分页、行数上限、查询超时；返回字段键取自 JDBC `getColumnName`，别名行为以实际返回为准。

### 4.5 excel（已导入 Excel 表查询）

```json
{ "datasetType": "excel", "sql": "SELECT region, value FROM excel_sales" }
```

- 查询的是**已通过 Excel 导入功能落库的表**，表名必须以 `excel_` 开头（大小写不敏感）。
- 不是上传文件路径配置；SQL 规则同 `sql` 类型（`#{}` 绑定、仅单条 SELECT）。
- 与 `sql` 的差异：执行错误会抛出而不是返回空数组。

### 4.6 es（Elasticsearch）

```json
{ "datasetType": "es", "path": "/my_index/_search", "method": "POST", "body": "{\"size\":10}", "respJsonPath": "$.hits.hits" }
```

- `dataSourceCode` 必须指向 ES 数据源；`path` 与数据源 `baseUrl` 拼接。
- `method` 支持 GET/POST，缺省按 POST；有 DSL body 时用 POST。
- `path`、`body` 支持 `#{param}`；不会自动提取 `_source` 为业务行，用 `respJsonPath` 或组件脚本处理。

### 4.7 websocket / mqtt（实时数据）

```json
// websocket
{ "datasetType": "websocket", "url": "wss://example.com/stream", "script": "", "sampleData": "{\"value\":12}" }
// mqtt
{ "datasetType": "mqtt", "topic": "sensor/+/data", "cacheSize": 5, "sampleData": "{\"value\":12}", "jsonFieldMappings": [{ "field": "temperature", "jsonPath": "$.sensor.temperature", "type": "number" }] }
```

- **`runDataset` 只解析 `sampleData`，不连接上游、不读实时缓存**，不能用它验证实时链路。
- mqtt：`jsonFieldMappings[].jsonPath` 仅支持 `$.a.b` 点路径（非完整 JSONPath），`type` 仅声明不做转换。
- 后端脚本执行默认禁用，`script` 保持空字符串。

## 五、inputList / outputList 参数规范

```json
{ "name": "region", "desc": "地区", "type": "String", "required": false, "defaultVal": "华东", "testVal": "华东" }
```

- `type` 有实际转换的只有 `String` 与 `int`（32 位整数）；其余类型原样透传。
- `required`、`testVal` 无后端强制逻辑，属元数据；默认值先转换再被实际入参覆盖，**非法默认值会先触发失败**。
- `outputList` 是字段元数据（`name`/`type`/`desc`），普通执行不会自动回填保存，建议显式维护，供组件绑定使用。

## 六、组件绑定数据集（与页面设计衔接）

`chartList` 中组件实例的 `dataset` 结构：

```json
{
  "code": "数据集编码",
  "datasetType": "json",
  "fields": { "组件字段槽位": ["数据集字段名"] },
  "params": { "region": { "from": "fixed", "variableName": "", "defaultValue": "华东" } },
  "script": ""
}
```

- `fields` 的 key 来自 `getComponentConfig` 返回的 `datasetFields` 定义，value 来自 `runDataset`/`getDatasetDetail` 的 `outputList` 字段名，**value 是数组**。
- `params.*.from`：`fixed` 固定值 | `globalVar` 全局变量（配合 `variableName`）。
- 转换脚本只接收单个 `bep` 参数：用 `bep.data`、`bep.params`，**禁止写裸 `data`/`params` 变量**；该脚本仅在前端组件层执行，`runDataset` 不执行。
- 组件上的 `datasetType` 必须与数据集实际类型一致。

## 七、注意事项与禁止事项

1. 外层与内层 `datasetType` 必须一致；类型字段是 `datasetType` 不是 `type`；`mysql`/`postgresql` 是数据源类型，不是数据集类型。
2. `updateDataset` 必须带真实 `id`，禁止把 `insertDataset` 返回的 `code` 当 id 使用。
3. `runDataset` 返回外层 `code: 200` 不代表查询成功：sql/http/es 的一般异常会被兜底为空数组。空数组需区分"真实无数据"与"执行被吞错"，必要时结合 `getDatasetDetail` 复核配置。
4. json/http/es/websocket/mqtt 普通执行通常不回填 `outputList`，空 `outputList` 不代表无字段。
5. 禁止对 `directory` 调用 `runDataset`。
6. SQL 禁止 `${}`；http 的 `body` 显式传 `""`、`method` 显式传值。
7. websocket/mqtt 的 `runDataset` 结果只证明 `sampleData` 可解析，不代表实时订阅可用。
8. 没有数据集列表、删除、数据源查询的 MCP 工具；需要目录编码时，使用用户提供的编码或先创建目录获取返回的 `code`。
