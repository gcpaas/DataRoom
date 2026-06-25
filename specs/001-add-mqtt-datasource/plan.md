# 实施计划：新增 MQTT 数据源

**分支**: `[001-add-mqtt-datasource]` | **日期**: 2026-06-25 | **规格**: [spec.md](./spec.md)

**输入**: `/specs/001-add-mqtt-datasource/spec.md` 中的功能规格说明

**说明**: 本计划由 `/speckit-plan` 生成，覆盖 Phase 0 研究和 Phase 1 设计产物；任务拆分由后续 `/speckit-tasks` 生成。

## 概要

新增 MQTT 作为 DataRoom 数据源与数据集能力：管理员可创建 MQTT 数据源并测试连接；大屏开发者可创建 MQTT JSON 数据集，系统持续订阅主题并为每个数据集维护最新有限消息缓存，数据集执行时读取缓存结果供图表绑定。首版范围明确为 JSON 消息体、默认缓存最近 5 条消息、支持无认证/账号密码/TLS 单向认证，不包含发布消息、纯文本/二进制消息体、双向证书认证或无限历史消息存储。

技术方案遵循现有数据源与数据集工厂模式：新增 MQTT 数据源类型、MQTT 数据集类型、后端运行态订阅与缓存服务、连接测试能力、前端数据源/数据集配置 UI，以及对应契约、测试和文档同步。

## 技术背景

**语言/版本**: Java 17、Spring Boot 3.5.10；Vue 3.5、TypeScript 5.9、Vite 7；Node.js `^20.19.0 || >=22.12.0`

**主要依赖**: 后端复用 Spring Boot、MyBatis-Plus、Jackson 多态 JSON、Shiro、Caffeine；MQTT 客户端库在实现阶段选型，优先选择支持 MQTT 3.1.1/5、TLS、重连和 Spring Boot 3/JDK 17 的维护中客户端；前端复用 Element Plus 与现有 request 封装。

**存储**: 复用现有 `DataSourceEntity.dataSource` 与 `DatasetEntity.dataset` JSON 持久化；MQTT 最新消息缓存为运行态有限缓存，不作为无限历史消息持久化。

**测试方式**: 后端 Maven 单元/集成测试，至少覆盖数据源反序列化、连接测试、MQTT 数据集运行、缓存边界和异常日志；前端运行 `npm run type-check`，涉及样式或格式变更运行 `npm run lint`；如修改 Java `catch` 块运行 `mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test`。

**目标平台**: DataRoom Web 应用，后端服务默认运行在 JVM 服务端，前端运行在浏览器。

**项目类型**: 前后端 Web 应用；后端提供 REST API 与数据集运行能力，前端提供数据源/数据集管理 UI 和设计器数据绑定入口。

**接口响应封装**: 涉及 HTTP 接口时继续使用 `{"code": 0, "msg": "success", "data": <T>}`。

**性能目标**: 95% 可访问 MQTT 连接测试在 10 秒内返回；数据集收到匹配 JSON 消息后，预览可在 5 分钟内完成；默认缓存最近 5 条消息，单次数据集执行仅返回配置范围内有限结果。

**约束条件**: 首版仅 JSON 消息体；不支持向 MQTT 发布消息；不支持双向证书认证；不得暴露明文凭据或 TLS 单向认证材料；前端样式必须遵循 `docs/design/DESIGN.md`，不得覆盖 Element Plus 内部样式或引入硬编码颜色。

**规模/范围**: 影响数据源管理、数据集 CRUD/执行、运行态缓存、图表数据绑定、HTTP 契约、前端数据源/数据集配置 UI、测试与文档；不改变页面生命周期和组件自动注册机制。

## 宪章检查

*门禁：进入 Phase 0 研究前必须通过；完成 Phase 1 设计后必须重新检查。*

- [x] 已映射全部受影响架构表面，包括数据集/数据源/页面配置类型注册、页面生命周期存储
      和组件自动注册契约。
- [x] 已识别需要同步更新的契约表面，包括默认值、渲染逻辑、配置面板、后端处理、持久化
      结构与文档，不允许只规划单表面改动；若涉及 HTTP 接口，已确认响应继续遵循统一的
      `code/msg/data` 包装约定。
- [x] 若涉及前端 UI 或样式，方案已引用 `docs/design/DESIGN.md`，并说明如何保持仅使用
      Element Plus 变量、且不覆盖其内部样式的约束。
- [x] 已为每个受影响表面列出验证命令，包括 `npm run type-check`、样式敏感改动时的
      `npm run lint`、相关 Maven 测试，以及修改 Java `catch` 块时的
      `CatchBlockLoggingTest`。
- [x] 已记录安全、审计和失败可追踪性的影响，包括 Shiro 角色、请求鉴权链路、RSA 密码
      处理、`delFlag`、审计字段以及强制异常栈日志要求。

### 设计后宪章复核

- [x] Phase 1 产物已覆盖 `data-model.md`、`contracts/`、`quickstart.md`，并明确数据源类型、数据集类型、运行态缓存与 UI 契约。
- [x] Contracts 明确 HTTP 响应继续使用 `code/msg/data` 包装，且包含敏感字段脱敏要求。
- [x] Quickstart 明确后端、前端、样式和异常日志验证命令。
- [x] 无需记录宪章违例；本计划未延期必需契约同步工作。

## 项目结构

### 文档（本功能）

```text
specs/001-add-mqtt-datasource/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── http-api.md
│   └── ui-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### 源码结构（仓库根目录）

```text
dataRoomServer/
└── src/main/java/com/gccloud/gcpaas/dataroom/core/
    ├── constant/
    │   ├── DataSourceType.java
    │   └── DatasetType.java
    ├── datasource/
    │   ├── DataSourceController.java
    │   ├── bean/
    │   │   ├── BaseDataSource.java
    │   │   └── MqttDatasource.java
    │   └── service/
    │       ├── DatasourceService.java
    │       └── MqttDatasourceConnectionService.java
    ├── dataset/
    │   ├── DatasetController.java
    │   ├── bean/
    │   │   ├── BaseDataset.java
    │   │   └── MqttDataset.java
    │   ├── runtime/
    │   │   ├── MqttDatasetRuntime.java
    │   │   ├── MqttDatasetRuntimeFactory.java
    │   │   └── MqttLatestMessageCache.java
    │   └── service/
    │       ├── DatasetServiceFactory.java
    │       └── MqttDatasetService.java
    └── entity/
        ├── DataSourceEntity.java
        └── DatasetEntity.java

dataRoomFront/
└── src/dataRoom/
    ├── constants/
    │   ├── DataSourceType.ts
    │   └── DatasetType.ts
    ├── data-source/
    │   ├── api.ts
    │   └── index.vue
    ├── dataset/
    │   ├── api.ts
    │   ├── index.vue
    │   ├── streaming-dataset.ts
    │   └── components/
    │       └── MqttEditor.vue
    └── hooks/
        ├── use-dr-component/
        └── use-realtime-dataset/
```

**结构决策**: 采用现有前后端 Web 应用结构，在 `dataRoomServer` 中扩展数据源、数据集和运行态服务，在 `dataRoomFront/src/dataRoom` 中扩展数据源与数据集配置 UI；不新增独立模块，不改变页面生命周期或组件自动注册机制。

## Phase 0：研究摘要

详见 [research.md](./research.md)。关键决策：

- MQTT 客户端采用可维护、支持 MQTT 3.1.1/5、TLS、自动重连和异步回调的 Java 客户端。
- MQTT 数据集采用运行态持续订阅 + 每数据集有限最新消息缓存。
- 首版仅支持 JSON 消息体，纯文本、二进制和发布消息延期。
- 凭据与 TLS 单向认证材料按敏感数据处理，详情/列表/API 错误不返回明文。

## Phase 1：设计摘要

详见 [data-model.md](./data-model.md)、[contracts/http-api.md](./contracts/http-api.md)、[contracts/ui-contract.md](./contracts/ui-contract.md)、[quickstart.md](./quickstart.md)。

设计重点：

- `MqttDatasource` 作为 `BaseDataSource` 新子类型，注册到 `@JsonSubTypes` 与 `DataSourceType`。
- `MqttDataset` 作为 `BaseDataset` 新子类型，注册到 `@JsonSubTypes`、`DatasetType` 与 `DatasetServiceFactory`。
- `MqttDatasetRuntime` 负责持续订阅、重连、JSON 解析和写入 `MqttLatestMessageCache`。
- `MqttDatasetService.run()` 从最新消息缓存读取有限结果并按现有 `DatasetRunResponse` 返回。
- 前端数据源表单与数据集编辑器仅使用 Element Plus 默认组件和外层布局样式，遵循 `docs/design/DESIGN.md`。

## 复杂度追踪

| 违例 | 必要原因 | 为何未采用更简单方案 |
|------|----------|----------------------|
| 无 | N/A | N/A |
