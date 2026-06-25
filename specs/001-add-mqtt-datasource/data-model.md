# 数据模型：新增 MQTT 数据源

## MQTT 数据源

**说明**: 一个可被 DataRoom 管理和复用的 MQTT 连接配置，作为现有数据源体系的新类型。

**主要字段**:

- `name`: 数据源名称，列表与详情中展示。
- `code`: 数据源唯一编码，由系统生成。
- `dataSourceType`: 固定为 `mqtt`。
- `host`: MQTT 服务地址，必填。
- `port`: MQTT 服务端口，必填。
- `clientId`: 客户端标识，可由用户填写或系统生成。
- `authMode`: 认证方式，取值为 `none`、`usernamePassword`、`tlsOneWay`。
- `username`: 账号密码模式下的用户名。
- `password`: 账号密码模式下的密码，敏感字段。
- `tlsCaCertificate`: TLS 单向认证使用的 CA 证书或证书引用，敏感字段。
- `defaultTopic`: 默认主题或主题规则。
- `connectionTimeoutSeconds`: 连接超时时间。
- `status`: 可用、不可用或未知。
- `createDate` / `updateDate` / `createUser` / `updateUser` / `delFlag`: 复用现有实体审计与软删除字段。

**校验规则**:

- `host`、`port`、`authMode`、`connectionTimeoutSeconds` 必填。
- `authMode=usernamePassword` 时 `username` 和 `password` 创建时必填；编辑时可留空表示不更新密码。
- `authMode=tlsOneWay` 时 TLS 单向认证材料创建时必填；编辑时可留空表示不更新认证材料。
- 详情、列表、错误消息和普通日志不得返回 `password` 或 TLS 认证材料明文。

**关系**:

- 一个 MQTT 数据源可被多个 MQTT 数据集引用。
- 删除或禁用 MQTT 数据源后，引用它的数据集进入不可用状态。

## MQTT 数据集配置

**说明**: 某个数据集如何从 MQTT 数据源读取 JSON 消息。

**主要字段**:

- `datasetType`: 固定为 `mqtt`。
- `dataSourceCode`: 引用的 MQTT 数据源编码。
- `topic`: 订阅主题，必填。
- `cacheSize`: 最新消息缓存条数，默认 5。
- `jsonFieldMappings`: JSON 字段映射规则，用于把消息体字段映射为数据集输出字段。
- `emptyDataStrategy`: 尚未收到消息或解析后为空时的处理方式。
- `outputList`: 数据集输出字段定义。

**校验规则**:

- `dataSourceCode` 必须引用存在且未删除的 MQTT 数据源。
- `topic` 必须符合 MQTT 主题规则。
- `cacheSize` 必须为正整数，默认 5，最大值由实现阶段按资源约束确定。
- 首版只接受 JSON 消息体；非 JSON 消息不得进入结构化结果。

**关系**:

- 一个 MQTT 数据集引用一个 MQTT 数据源。
- 一个 MQTT 数据集拥有一个运行态最新消息缓存。

## 最新消息缓存

**说明**: 系统为每个 MQTT 数据集维护的运行态有限消息集合。

**主要字段**:

- `datasetCode`: 数据集编码。
- `cacheSize`: 当前缓存上限。
- `messages`: 按接收时间排序的最新 JSON 消息解析结果。
- `lastMessageAt`: 最近一次成功接收并解析消息的时间。
- `lastError`: 最近一次连接、订阅或解析失败摘要。

**生命周期**:

1. MQTT 数据集创建或启用后，运行态开始订阅主题。
2. 收到 JSON 消息后，按字段映射写入缓存。
3. 缓存超过 `cacheSize` 时移除最旧消息。
4. 数据集更新主题、数据源或字段映射后，运行态重建订阅并清理不兼容缓存。
5. 数据集删除、禁用或引用数据源删除后，运行态停止订阅并释放缓存。

## 连接测试结果

**说明**: 一次 MQTT 数据源连通性验证的用户可见结果。

**主要字段**:

- `success`: 是否成功。
- `status`: 成功、超时、认证失败、主题无权限、配置错误、服务不可达等分类。
- `message`: 用户可理解提示，不包含敏感明文。
- `testedAt`: 测试时间。

## 消息样本

**说明**: 用于预览和字段映射的 MQTT JSON 消息内容。

**主要字段**:

- `raw`: 原始 JSON 字符串或脱敏后的预览内容。
- `parsed`: JSON 解析后的对象。
- `fields`: 可映射字段列表。
- `receivedAt`: 接收时间。

## 状态转换

```text
MQTT 数据源:
草稿配置 -> 已保存 -> 连接测试成功/失败 -> 可编辑 -> 软删除

MQTT 数据集:
已创建 -> 等待消息 -> 已缓存消息 -> 执行返回缓存结果
       -> 连接异常/解析异常 -> 恢复订阅 -> 已缓存消息
       -> 删除/禁用 -> 停止订阅
```
