# Quickstart：新增 MQTT 数据源验证指南

## 前置条件

- JDK 17 可用。
- Node.js 满足 `^20.19.0 || >=22.12.0`。
- 项目依赖已安装或可由 Maven/npm 获取。
- 准备一个可访问的 MQTT Broker，至少包含：
  - 无认证或账号密码连接场景。
  - 如验证 TLS 单向认证，准备对应 CA 证书。
  - 一个可订阅主题，例如 `factory/line-1/temperature`。

## 端到端验证流程

### 1. 启动后端

```bash
mvn spring-boot:run -pl dataRoomServer
```

预期：

- 服务启动成功。
- 默认访问地址为 `http://localhost:8081/dataRoom`。

### 2. 启动前端

```bash
cd dataRoomFront
npm run dev
```

预期：

- 前端开发服务启动成功。
- 数据源管理和数据集管理页面可访问。

### 3. 创建 MQTT 数据源

操作：

1. 进入数据源管理页面。
2. 选择 MQTT 类型。
3. 填写服务地址、端口、认证方式、默认主题和连接超时时间。
4. 执行连接测试。
5. 保存数据源。

预期：

- 可访问 Broker 时，连接测试在 10 秒内返回成功。
- 保存后列表显示 MQTT 类型。
- 详情页不明文显示密码或 TLS 单向认证材料。

### 4. 创建 MQTT 数据集

操作：

1. 进入数据集管理页面。
2. 新建 MQTT 数据集。
3. 选择刚创建的 MQTT 数据源。
4. 填写订阅主题。
5. 保持缓存条数默认 5。
6. 配置 JSON 字段映射。

测试消息示例：

```json
{
  "temperature": 31.2,
  "timestamp": "2026-06-25T10:00:00"
}
```

预期：

- 数据集保存成功。
- 尚未收到消息时预览为空数据状态。
- 发布 JSON 测试消息后，预览返回最新缓存结果。
- 连续发布超过 5 条消息后，默认只返回最近 5 条。

### 5. 图表绑定验证

操作：

1. 在页面设计器或大屏设计器中选择一个图表组件。
2. 绑定 MQTT 数据集。
3. 发布或预览页面。
4. 向主题发送 JSON 消息。

预期：

- 图表在刷新周期内展示最新缓存数据。
- MQTT 服务短暂不可用时页面不崩溃。
- 服务恢复并收到新消息后，图表继续展示最新可用数据。

## 必跑验证命令

### 后端

```bash
mvn test -pl dataRoomServer
```

如实现涉及 Java `catch` 块：

```bash
mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

### 前端

```bash
cd dataRoomFront
npm run type-check
```

涉及样式、格式或 Element Plus 表单布局变更时：

```bash
cd dataRoomFront
npm run lint
```

## 失败场景验证

- 错误 host 或端口：连接测试返回服务不可达或超时。
- 错误账号密码：连接测试返回认证失败。
- 无主题权限：连接测试或数据集预览返回主题无权限。
- 非 JSON 消息体：数据集预览返回可理解错误或空结果，页面不崩溃。
- 删除 MQTT 数据源后运行引用数据集：返回明确不可用状态。
- 编辑敏感字段留空：不覆盖原有敏感配置。
- 编辑敏感字段填入新值：后续连接使用新配置，详情仍脱敏。
