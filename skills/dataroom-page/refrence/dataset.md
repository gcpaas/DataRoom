# 数据集配置与组件绑定

仅在新增、修改、执行数据集或绑定组件时读取；流程与确认规则遵循主技能。

## 通用契约

- 当前数据集工具仅有 `getDatasetDetail`、`insertDataset`、`updateDataset`、`runDataset`；不编造列表、删除、测试或数据源管理工具。
- 新增返回 `code`；详情查询、执行、组件绑定均用 `code`；更新必须使用详情返回的真实 `id`，不可修改 `code`。
- 更新按完整配置提交，避免只传 `id` 和局部字段导致入参、出参等被清空；保留未修改字段。
- 根目录显式传 `parentCode: "root"`；其他目录使用真实编码。新增不填写主键、编码、审计或删除标记字段。
- 非目录的外层 `datasetType` 与内层 `dataset.datasetType` 必须一致；`mysql`、`postgresql` 是数据源类型，不是数据集类型。

完整 JSON 数据集示例：

```json
{
  "name": "地区指标",
  "datasetType": "json",
  "parentCode": "root",
  "dataset": {
    "datasetType": "json",
    "json": "[{\"region\":\"华东\",\"value\":12}]"
  },
  "inputList": [],
  "outputList": [
    { "name": "region", "type": "String", "desc": "地区" },
    { "name": "value", "type": "int", "desc": "指标" }
  ]
}
```

## 按类型配置

以下字段位于内层 `dataset`，`dataSourceCode` 位于外层实体。

| `datasetType` | 内层字段 | 数据源要求 |
|---|---|---|
| `directory` | 不传 `dataset`，仅填名称、类型、目录 | 无；不可执行 |
| `json` | `json`：JSON 文本字符串，推荐对象数组 | 无 |
| `http` | `url`、`method`、`headerList`、`body`、`respJsonPath` | 可选 HTTP 数据源 |
| `sql` | `sql`：查询语句 | 必须为已有关系型数据源 |
| `excel` | `sql`：查询已导入的 `excel_` 表 | 使用应用库，无需数据源编码 |
| `es` | `path`、`method`、`body`、`respJsonPath` | 必须为已有 ES 数据源 |
| `websocket` | `url`、`script`、`sampleData` | 无 |
| `mqtt` | `topic`、`cacheSize`、`sampleData`、`jsonFieldMappings` | 必须为已有 MQTT 数据源 |

### JSON / SQL / Excel

- JSON 必须传转义后的字符串，不传嵌套对象；不支持 `#{param}` 替换，`inputParam` 不生效。
- SQL / Excel 仅允许单条只读 SELECT（含 CTE、JOIN、子查询）；禁止 DML、DDL、多语句及 `${}` 拼接。
- 使用 `#{param}` 参数绑定，占位符外不加引号；支持 MyBatis 动态标签，裸 `<`、`&` 按 XML 转义。
- 使用真实表名与字段，按数据库方言主动限制结果量；不要假设自动分页、行数上限或查询超时。
- Excel 查询已导入的表，不填写本地文件路径；表名以 `excel_` 开头。
- 字段名和别名以实际执行结果为准，不仅依据 SQL 文本推断。

### HTTP / ES

- HTTP 显式指定 `method: "GET"` 或 `"POST"`；无请求体时传 `body: ""`，有请求体时保留实际内容。
- HTTP 无数据源时使用完整 `http(s)://` URL；引用数据源时使用相对路径，由后端拼接 `baseUrl`。
- HTTP 的 `url`、`headerList[].val`、`body` 支持 `#{参数名}`；不会自动把 `inputParam` 追加为查询参数。
- 请求头结构为 `{ "key": "请求头名", "val": "值", "encrypted": false }`；`encrypted: true` 仅用于已加密的 RSA 密文，不将明文标记为密文。
- 修改加密请求头时，保留原有 key 与加密标记；同名头的 `val` 为 `"******"` 或空值表示沿用旧密文，不泄露凭证。
- ES 的 `path` 与数据源 `baseUrl` 拼接；支持 GET/POST，有 DSL 请求体时用 POST，`body` 为 JSON 文本。
- ES 的 `path`、`body` 支持参数占位；不会自动展开 `_source`。
- 用 `respJsonPath` 提取业务数据；HTTP 留空取整个响应。仅访问用户授权的数据来源，不执行有副作用的接口或 ES 写操作。

### WebSocket / MQTT

- `sampleData` 为 JSON 文本；`runDataset` 只解析样例，不连接上游、不读取实时缓存，不能证明订阅链路可用。
- WebSocket 的后端 `script` 保持空字符串，默认不启用后端脚本执行。
- MQTT 映射示例：`{ "field": "temperature", "jsonPath": "$.sensor.temperature", "type": "number" }`；路径仅支持点路径，`type` 不执行类型转换。

## 入参与出参

- `inputList` 元素包含 `name`、`desc`、`type`、`required`、`defaultVal`、`testVal`。
- 仅 `String`、`int` 有实际转换逻辑；先校验默认值合法性，默认值转换先于实际入参覆盖。
- `required`、`testVal` 是元数据，不依赖后端自动校验必填或使用测试值；执行时显式提供所需 `inputParam`。
- `outputList` 使用 `name`、`type`、`desc` 描述实际输出；普通执行不会自动保存字段元数据，缺失时从实际数据核实后按修改流程补齐。
- `runDataset` 的 `Resp.data` 为结果对象，业务数据在 `Resp.data.data`，输出字段在 `Resp.data.outputList`。
- 成功码不保证取数成功：JSON 解析错误及 SQL / HTTP / ES 一般异常可能返回空数组；空结果需复核配置、参数与预期，不能直接声称通过。

## 组件绑定

以下结构位于组件实例的 `dataset`，不是数据集实体的内层配置：

```json
{
  "code": "实际数据集编码",
  "datasetType": "json",
  "fields": { "实际组件槽位": ["region"] },
  "params": {
    "region": { "from": "fixed", "variableName": "", "defaultValue": "华东" }
  },
  "script": ""
}
```

- `fields` 的 key 使用 `getComponentConfig` 返回的 `datasetFields[].name`，value 为实际输出字段名数组；必填槽位必须绑定，多字段绑定遵循 `multiple`。
- `params.*.from` 使用 `fixed` 或 `globalVar`；后者通过 `variableName` 引用页面已定义的全局变量。
- `datasetType` 与目标数据集一致，不得只填 `code` 而遗漏字段映射。
- 组件转换脚本仅接收 `bep`，使用 `bep.data`、`bep.params`，不得引用裸 `data` / `params`；脚本在前端执行，不由 `runDataset` 验证。
