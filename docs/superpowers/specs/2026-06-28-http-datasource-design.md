# HTTP 数据源与 HTTP 数据集优化设计

## 背景

当前 HTTP 数据集直接保存完整请求地址。环境从开发迁移到生产时，如果域名、网关前缀或公共请求头发生变化，需要逐个修改 HTTP 数据集，维护成本高，也容易遗漏。

本次优化新增 HTTP 数据源，用于集中维护 HTTP API 的基础访问地址和公共请求头。HTTP 数据集可以选择 HTTP 数据源，也可以不选择数据源独立使用。

## 目标

- 新增 HTTP 数据源，支持配置基础访问地址和公共请求头。
- HTTP 数据集支持选择 HTTP 数据源；选择后将数据源基础地址与数据集访问路径拼接请求。
- HTTP 数据集不强制绑定数据源；未选择数据源时，访问路径字段允许填写完整 URL。
- 数据源请求头与数据集请求头合并，HTTP 数据集请求头优先级更高。
- 请求头合并按 key 大小写不敏感处理，最终保留覆盖方填写的 key 形式。
- `KeyVal` 增加是否加密开关，由用户逐条决定请求头 value 是否加密。
- HTTP 数据源请求头和 HTTP 数据集请求头都支持加密开关。

## 非目标

- 首版不为 HTTP 数据源提供连接测试。
- 不新增 HTTP 方法范围，继续沿用现有 GET、POST 能力。
- 不迁移历史字段名，`HttpDataset.url` 继续作为持久化字段使用，只调整 UI 标签和后端语义。
- 不引入基于 header 名称的自动敏感字段判断，是否加密完全由用户勾选控制。

## 数据模型

### KeyVal

`com.gccloud.gcpaas.dataroom.core.bean.KeyVal` 新增字段：

```java
private Boolean encrypted;
```

语义：

- `true`：`val` 为 RSA 加密后的密文，执行请求前由后端私钥解密。
- `false` 或 `null`：`val` 按明文处理。
- 旧数据没有 `encrypted` 字段时，按 `false` 兼容。

### HTTP 数据源

新增 `HttpDatasource extends BaseDataSource`，注册到：

- `DataSourceType.HTTP`
- `BaseDataSource.@JsonSubTypes`

字段：

- `baseUrl`：HTTP 服务基础地址，例如 `https://api.example.com/base`。
- `headerList: List<KeyVal>`：数据源级公共请求头。

敏感处理：

- `desensitize()` 对 `encrypted=true` 的请求头返回 `******`。
- `updatedSensitive()` 在更新时，如果某个加密请求头的 `val` 为空或 `******`，沿用数据库中的旧密文。

### HTTP 数据集

`HttpDataset` 保留现有字段：

- `url`
- `method`
- `headerList`
- `body`
- `respJsonPath`

语义调整：

- `url` 在 UI 上展示为“访问路径”。
- `DatasetEntity.dataSourceCode` 为空时，`url` 必须是完整 `http://` 或 `https://` 地址。
- `DatasetEntity.dataSourceCode` 不为空时，必须指向 HTTP 数据源，`url` 必须是相对路径。
- `headerList` 使用新增后的 `KeyVal`，支持逐条配置是否加密。

## 执行流程

HTTP 数据集执行时按以下顺序处理：

1. 合并参数：沿用现有默认入参、运行时入参和系统默认参数合并逻辑。
2. 解析目标 URL：
   - 未选择数据源：校验 `HttpDataset.url` 是完整 URL。
   - 已选择数据源：查询 `DatasetEntity.dataSourceCode` 对应的数据源，校验类型为 HTTP 数据源，并将 `baseUrl` 与 `HttpDataset.url` 拼接。
   - 拼接自动处理 `/`，避免重复或缺失斜杠。
3. 合并请求头：
   - 先加入 HTTP 数据源 `headerList`。
   - 再加入 HTTP 数据集 `headerList`。
   - key 按大小写不敏感匹配；同名时数据集覆盖数据源，保留数据集填写的 key 形式。
4. 解密与参数替换：
   - 对 `encrypted=true` 的请求头 value，先用后端私钥解密。
   - 解密后的明文再参与 `#{param}` 参数替换。
   - `encrypted=false` 或 `null` 的请求头 value 直接参与参数替换。
   - URL 和 body 继续沿用现有参数替换逻辑。
5. 执行请求：
   - GET、POST、默认 `Content-Type: application/json`、响应 JSON 解析和 `respJsonPath` 处理继续沿用现有行为。
6. 错误处理：
   - 非法 URL、缺失数据源、数据源类型不匹配、解密失败、HTTP 非 2xx 等失败场景需要记录异常栈或明确错误日志。
   - 对外响应继续沿用现有失败返回空数组的行为。

## 前端交互

### 数据源管理

新增 HTTP 数据源类型：

- 名称：`HTTP`
- 描述：复用 HTTP API 基础地址和公共请求头。
- 编辑器：`HttpEditor.vue`

编辑器字段：

- 数据源名称
- 访问地址 `baseUrl`
- 请求头表格：`Key`、`Value`、`加密`、操作

保存规则：

- 勾选“加密”的请求头 value 使用现有 `encryptByRsa` 加密后提交。
- 编辑详情中已脱敏的 `******` 不重复加密。
- 首版不提供连接测试按钮。

### HTTP 数据集编辑器

调整 `HttpEditor.vue`：

- 增加“HTTP 数据源”选择框，仅展示 `dataSourceType === 'http'` 的数据源，允许清空。
- “请求地址”标签改为“访问路径”。
- 未选择数据源时，提示填写完整地址，例如 `https://api.example.com/users`。
- 已选择数据源时，提示填写相对路径，例如 `/users`。
- 请求头表格增加“加密”列，保存或测试时对勾选且不是 `******` 的 value 加密。
- 入参解析范围保持为访问路径、数据集请求头 value、请求体；数据源 `baseUrl/headerList` 不参与数据集入参解析。

## 兼容策略

- 历史 HTTP 数据集没有 `dataSourceCode` 时继续按完整 URL 执行。
- `HttpDataset.url` 字段不重命名，避免历史 JSON、接口和页面配置大面积迁移。
- 历史 `KeyVal` 没有 `encrypted` 字段时按不加密处理。
- HTTP 数据源详情需要对加密请求头脱敏。
- HTTP 数据集详情也需要避免暴露加密请求头明文；编辑时 `******` 表示保留原密文。

## 验证范围

### 后端

至少覆盖以下测试：

- HTTP 数据源多态反序列化。
- `KeyVal.encrypted` 默认兼容。
- HTTP 数据源加密请求头脱敏和更新保留。
- 未选择数据源时，HTTP 数据集必须使用完整 URL。
- 选择 HTTP 数据源时，HTTP 数据集必须使用相对路径。
- `baseUrl` 与访问路径拼接规则。
- 请求头按大小写不敏感合并，且数据集优先。
- 加密请求头解密后参与请求。

验证命令：

```bash
mvn test -pl dataRoomServer -Dtest=HttpDatasourceJsonTest,HttpDatasetServiceTest
```

如果修改 Java `catch` 块，额外运行：

```bash
mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

### 前端

验证命令：

```bash
cd dataRoomFront
npm run type-check
```

涉及样式或格式规范时运行：

```bash
cd dataRoomFront
npm run lint
```

## 实施边界

本功能影响：

- 后端数据源类型注册与多态 JSON。
- 后端 HTTP 数据集执行逻辑。
- 请求头加密、脱敏和更新保留逻辑。
- 前端数据源类型、HTTP 数据源编辑器。
- 前端 HTTP 数据集编辑器。
- 相关单元测试和类型检查。

不改变：

- 页面生命周期。
- 数据集工厂命名规则。
- 图表组件数据绑定协议。
- 现有 GET/POST 响应解析行为。
