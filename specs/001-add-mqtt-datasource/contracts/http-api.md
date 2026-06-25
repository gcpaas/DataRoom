# HTTP 接口契约：新增 MQTT 数据源

所有接口响应继续使用统一包装：

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

错误响应不得在 `msg` 或 `data` 中暴露 MQTT 密码、TLS 单向认证材料或完整连接密钥。

## 数据源列表

**Endpoint**: `GET /dataRoom/dataSource/list`

**行为要求**:

- 列表中 MQTT 数据源的 `dataSourceType` 为 `mqtt`。
- `dataSource` 中敏感字段必须脱敏或省略。

**响应 data 示例**:

```json
[
  {
    "name": "生产 MQTT",
    "code": "DS_xxx",
    "dataSourceType": "mqtt",
    "dataSource": {
      "dataSourceType": "mqtt",
      "host": "broker.example.com",
      "port": 8883,
      "authMode": "tlsOneWay",
      "username": "",
      "password": "******",
      "tlsCaCertificate": "******",
      "defaultTopic": "factory/line-1/metrics",
      "connectionTimeoutSeconds": 10
    }
  }
]
```

## 数据源详情

**Endpoint**: `GET /dataRoom/dataSource/detail/{code}`

**行为要求**:

- 返回 MQTT 数据源详情。
- 敏感字段只返回脱敏占位，不返回明文。

## 新增数据源

**Endpoint**: `POST /dataRoom/dataSource/insert`

**请求 dataSource 示例**:

```json
{
  "name": "生产 MQTT",
  "dataSourceType": "mqtt",
  "dataSource": {
    "dataSourceType": "mqtt",
    "host": "broker.example.com",
    "port": 8883,
    "clientId": "dataroom-prod",
    "authMode": "tlsOneWay",
    "username": "",
    "password": "",
    "tlsCaCertificate": "-----BEGIN CERTIFICATE-----...",
    "defaultTopic": "factory/line-1/metrics",
    "connectionTimeoutSeconds": 10
  }
}
```

**响应 data**: 新增数据源编码或 ID，保持现有数据源新增接口约定。

## 更新数据源

**Endpoint**: `POST /dataRoom/dataSource/update`

**行为要求**:

- 更新 MQTT 数据源基础配置。
- 敏感字段留空表示不更新；传入新值表示替换。
- 更新连接信息后，引用该数据源的 MQTT 数据集运行态需要重新建立连接或进入等待恢复状态。

## 删除数据源

**Endpoint**: `POST /dataRoom/dataSource/delete/{code}`

**行为要求**:

- 复用现有软删除语义。
- 引用该数据源的 MQTT 数据集应在预览或执行时返回明确不可用状态。

## 连接测试

**Endpoint**: `POST /dataRoom/dataSource/test`

**说明**: 若现有接口名称不同，实现阶段应复用现有连接测试入口或补齐一致入口；响应仍使用统一包装。

**请求示例**:

```json
{
  "dataSourceType": "mqtt",
  "dataSource": {
    "dataSourceType": "mqtt",
    "host": "broker.example.com",
    "port": 8883,
    "authMode": "tlsOneWay",
    "tlsCaCertificate": "-----BEGIN CERTIFICATE-----...",
    "defaultTopic": "factory/line-1/metrics",
    "connectionTimeoutSeconds": 10
  }
}
```

**响应 data 示例**:

```json
{
  "success": true,
  "status": "success",
  "message": "连接与订阅校验已通过",
  "testedAt": "2026-06-25T10:00:00"
}
```

## 新增或更新 MQTT 数据集

**Endpoint**: `POST /dataRoom/dataset/insert` / `POST /dataRoom/dataset/update`

**请求 dataset 示例**:

```json
{
  "name": "产线温度 MQTT",
  "datasetType": "mqtt",
  "dataSourceCode": "DS_xxx",
  "dataset": {
    "datasetType": "mqtt",
    "topic": "factory/line-1/temperature",
    "cacheSize": 5,
    "jsonFieldMappings": [
      {
        "field": "temperature",
        "jsonPath": "$.temperature",
        "type": "number"
      },
      {
        "field": "timestamp",
        "jsonPath": "$.timestamp",
        "type": "string"
      }
    ],
    "emptyDataStrategy": "emptyArray"
  },
  "outputList": [
    {
      "name": "temperature",
      "type": "number",
      "desc": "温度"
    },
    {
      "name": "timestamp",
      "type": "string",
      "desc": "时间"
    }
  ]
}
```

## 执行 MQTT 数据集

**Endpoint**: `POST /dataRoom/dataset/run`

**请求示例**:

```json
{
  "datasetCode": "DATASET_xxx",
  "paramMap": {}
}
```

**响应 data 示例**:

```json
{
  "data": [
    {
      "temperature": 31.2,
      "timestamp": "2026-06-25T10:00:00"
    }
  ],
  "outputList": [
    {
      "name": "temperature",
      "type": "number",
      "desc": "温度"
    },
    {
      "name": "timestamp",
      "type": "string",
      "desc": "时间"
    }
  ]
}
```

**错误/空数据行为**:

- 尚未收到消息：返回空数组或配置的空数据策略结果。
- 非 JSON 消息或 JSON 解析失败：返回可理解错误，不暴露原始敏感内容。
- 数据源删除、禁用或不可连接：返回明确不可用状态。
