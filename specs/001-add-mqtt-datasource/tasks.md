# 任务清单：新增 MQTT 数据源

**输入**: 来自 `/specs/001-add-mqtt-datasource/` 的设计文档

**前置条件**: plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md

**验证要求**: 后端逻辑改动必须运行相关 Maven 测试；涉及 Java `catch` 块必须运行 `mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test`；前端改动必须运行 `npm run type-check`；涉及样式或 Element Plus 布局变更必须运行 `npm run lint`。

**组织方式**: 任务按用户故事分组，确保每个故事都能独立实现与独立测试。

## 格式：`[ID] [P?] [Story] 任务描述`

- **[P]**: 可并行执行（不同文件、无依赖）
- **[Story]**: 所属用户故事（如 US1、US2、US3）
- 描述中必须写明准确文件路径

## Phase 1：准备阶段（共享基础设施）

**目的**: 完成依赖、契约和实现边界准备。

- [x] T001 在 `pom.xml` 和 `dataRoomServer/pom.xml` 中确认并加入 MQTT 客户端依赖，要求兼容 JDK 17、Spring Boot 3、MQTT 3.1.1/5、TLS 和异步回调
- [x] T002 [P] 在 `specs/001-add-mqtt-datasource/contracts/http-api.md` 中复核 MQTT 接口契约与统一 `code/msg/data` 响应包装，发现实现差异时同步修订契约
- [x] T003 [P] 在 `specs/001-add-mqtt-datasource/contracts/ui-contract.md` 中复核数据源和数据集 UI 字段，确保与实现字段命名一致
- [x] T004 [P] 在 `docs/design/DESIGN.md` 中复核前端样式约束，记录实现时不得使用硬编码颜色、`:deep(.el-*)` 和 `!important`
- [x] T005 在 `specs/001-add-mqtt-datasource/quickstart.md` 中确认本地 MQTT Broker 验证前置条件和测试主题

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**: 完成 MQTT 类型注册、基础模型、敏感字段规则和测试骨架；本阶段完成前不得开始用户故事实现。

- [x] T006 [P] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/constant/DataSourceType.java` 中新增 MQTT 数据源枚举和值 `mqtt`
- [x] T007 [P] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/constant/DatasetType.java` 中新增 MQTT 数据集枚举和值 `mqtt`
- [x] T008 [P] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/bean/MqttDatasource.java` 中创建 MQTT 数据源模型并实现敏感字段更新规则
- [x] T009 [P] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/bean/MqttDataset.java` 中创建 MQTT 数据集模型，包含 topic、cacheSize、jsonFieldMappings、emptyDataStrategy
- [x] T010 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/bean/BaseDataSource.java` 中把 `MqttDatasource` 注册到 `@JsonSubTypes`
- [x] T011 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/bean/BaseDataset.java` 中把 `MqttDataset` 注册到 `@JsonSubTypes`
- [x] T012 [P] 在 `dataRoomFront/src/dataRoom/data-source/api.ts` 中新增 `MqttDataSource` 类型并把 `mqtt` 加入 `DataSourceEntity.dataSourceType`
- [x] T013 [P] 在 `dataRoomFront/src/dataRoom/dataset/api.ts` 中新增 `MqttDataset` 类型并把 `mqtt` 加入 `DatasetType` 与 `DatasetEntity.dataset` 联合类型
- [x] T014 [P] 在 `dataRoomFront/src/dataRoom/constants/DataSourceType.ts` 中新增 MQTT 数据源常量
- [x] T015 [P] 在 `dataRoomFront/src/dataRoom/constants/DatasetType.ts` 中新增 MQTT 数据集常量
- [x] T016 [P] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/datasource/bean/MqttDataSourceJsonTest.java` 中新增 MQTT 数据源 JSON 反序列化和敏感字段脱敏测试
- [x] T017 [P] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/dataset/bean/MqttDatasetJsonTest.java` 中新增 MQTT 数据集 JSON 反序列化和默认 cacheSize 测试

**检查点**: MQTT 数据源和数据集类型可被前后端识别，JSON 多态注册不再阻塞后续用户故事。

---

## Phase 3：用户故事 1 - 管理员创建 MQTT 数据源（优先级：P1）🎯 MVP

**目标**: 用户可在数据源管理中创建、保存、查看和编辑 MQTT 数据源，并且敏感凭据脱敏。

**独立测试方式**: 创建一个 MQTT 数据源，保存后重新打开详情，验证配置持久化、列表类型展示和敏感字段脱敏。

### 用户故事 1 的验证任务

- [x] T018 [P] [US1] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/datasource/DataSourceControllerMqttTest.java` 中编写新增 MQTT 数据源成功保存的控制器测试
- [x] T019 [P] [US1] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/datasource/DataSourceControllerMqttTest.java` 中编写 MQTT 数据源详情和列表不返回敏感明文的测试
- [x] T020 [P] [US1] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/datasource/bean/MqttDatasourceValidationTest.java` 中编写 authMode、host、port、TLS 单向认证材料校验测试

### 用户故事 1 的实现任务

- [x] T021 [US1] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/bean/MqttDatasource.java` 中实现无认证、账号密码、TLS 单向认证字段校验和敏感字段留空不更新语义
- [x] T022 [US1] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/service/DatasourceService.java` 中集成 MQTT 数据源保存、编辑和详情脱敏处理
- [x] T023 [US1] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/DataSourceController.java` 中确认新增、更新、详情、列表继续返回统一 `Resp` 包装并处理 MQTT 校验错误
- [x] T024 [P] [US1] 在 `dataRoomFront/src/dataRoom/data-source/index.vue` 中新增 MQTT 类型卡片和编辑入口
- [x] T025 [P] [US1] 在 `dataRoomFront/src/dataRoom/data-source/index.vue` 中新增 MQTT 表单字段：host、port、clientId、authMode、username、password、tlsCaCertificate、defaultTopic、connectionTimeoutSeconds
- [x] T026 [US1] 在 `dataRoomFront/src/dataRoom/data-source/index.vue` 中实现认证方式切换时的必填项和敏感字段留空不更新提示
- [x] T027 [US1] 在 `dataRoomFront/src/dataRoom/data-source/index.vue` 中确保 MQTT 表单只使用 Element Plus 默认表单组件和外层布局样式
- [x] T028 [US1] 运行 `mvn test -pl dataRoomServer -Dtest=DataSourceControllerMqttTest,MqttDataSourceJsonTest,MqttDatasourceValidationTest` 并记录结果到 `specs/001-add-mqtt-datasource/quickstart.md`

**检查点**: 用户故事 1 已可作为 MVP 演示：创建 MQTT 数据源、保存、查看详情、确认敏感字段脱敏。

---

## Phase 4：用户故事 2 - 连接测试与错误定位（优先级：P1）

**目标**: 用户可对 MQTT 数据源执行连接测试，并得到成功、超时、认证失败、主题无权限或配置错误等可区分结果。

**独立测试方式**: 对一个可访问和一个不可访问的 MQTT 服务分别执行连接测试，验证成功反馈和失败提示。

### 用户故事 2 的验证任务

- [x] T029 [P] [US2] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/datasource/service/MqttDatasourceConnectionServiceTest.java` 中编写连接成功、超时、认证失败和主题无权限分类测试
- [x] T030 [P] [US2] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/datasource/DataSourceControllerMqttTest.java` 中编写 MQTT 连接测试接口统一 `code/msg/data` 响应测试
- [x] T031 [P] [US2] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/quality/CatchBlockLoggingTest.java` 中补充或确认 MQTT 相关 catch 块必须打印 `ExceptionUtils.getStackTrace(e)` 的检查覆盖

### 用户故事 2 的实现任务

- [x] T032 [US2] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/service/MqttDatasourceConnectionService.java` 中实现 MQTT 客户端连接、TLS 单向认证、订阅校验和超时控制
- [x] T033 [US2] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/service/MqttDatasourceConnectionService.java` 中实现连接测试结果分类：success、timeout、authFailed、topicDenied、configInvalid、unreachable
- [x] T034 [US2] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/DataSourceController.java` 中新增或复用 `/dataRoom/dataSource/test` MQTT 连接测试入口
- [x] T035 [US2] 在 `dataRoomFront/src/dataRoom/data-source/api.ts` 中新增或复用数据源连接测试方法并声明 MQTT 测试结果类型
- [x] T036 [US2] 在 `dataRoomFront/src/dataRoom/data-source/index.vue` 中接入 MQTT 连接测试按钮、加载态、成功态和失败提示
- [x] T037 [US2] 在 `dataRoomFront/src/dataRoom/data-source/index.vue` 中确保连接测试错误提示不展示密码、证书或完整连接密钥
- [x] T038 [US2] 运行 `mvn test -pl dataRoomServer -Dtest=MqttDatasourceConnectionServiceTest,DataSourceControllerMqttTest` 并记录结果到 `specs/001-add-mqtt-datasource/quickstart.md`
- [x] T039 [US2] 运行 `mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test` 并记录结果到 `specs/001-add-mqtt-datasource/quickstart.md`

**检查点**: 用户故事 2 可独立验证：连接测试能分类返回结果且失败可追踪。

---

## Phase 5：用户故事 3 - 数据集使用 MQTT 消息（优先级：P2）

**目标**: 大屏开发者可创建 MQTT JSON 数据集，系统持续订阅主题并缓存最新有限消息，数据集执行返回结构化结果。

**独立测试方式**: 使用已有 MQTT 数据源创建数据集，发送 JSON 测试消息后运行数据集，验证返回字段和缓存条数。

### 用户故事 3 的验证任务

- [x] T040 [P] [US3] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/dataset/service/MqttDatasetServiceTest.java` 中编写尚未收到消息返回空数据、收到 JSON 后返回结构化结果的测试
- [x] T041 [P] [US3] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/dataset/runtime/MqttLatestMessageCacheTest.java` 中编写默认缓存 5 条、超过上限移除最旧消息的测试
- [x] T042 [P] [US3] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/dataset/runtime/MqttDatasetRuntimeTest.java` 中编写非 JSON 消息、字段解析失败和重连失败可追踪测试
- [x] T043 [P] [US3] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/dataset/service/DatasetServiceFactoryMqttTest.java` 中编写 `mqttDatasetService` 工厂解析测试

### 用户故事 3 的实现任务

- [x] T044 [US3] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/runtime/MqttLatestMessageCache.java` 中实现每数据集有限消息缓存、默认 5 条和线程安全读写
- [x] T045 [US3] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/runtime/MqttDatasetRuntime.java` 中实现 MQTT 持续订阅、JSON 解析、字段映射和错误状态记录
- [x] T046 [US3] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/runtime/MqttDatasetRuntimeFactory.java` 中实现 `DatasetType.MQTT` 的运行态工厂
- [x] T047 [US3] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/service/MqttDatasetService.java` 中实现 `run()` 从 `MqttLatestMessageCache` 读取缓存结果并返回 `DatasetRunResponse`
- [x] T048 [US3] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/service/DatasetServiceFactory.java` 中确认 `mqttDatasetService` Bean 命名符合 `{DatasetType.value}DatasetService`
- [x] T049 [US3] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/DatasetController.java` 中确认 MQTT 数据集运行、测试和错误响应继续使用统一 `Resp` 包装
- [x] T050 [P] [US3] 在 `dataRoomFront/src/dataRoom/dataset/components/MqttEditor.vue` 中创建 MQTT 数据集编辑器，包含数据源选择、topic、cacheSize、JSON 字段映射、emptyDataStrategy
- [x] T051 [P] [US3] 在 `dataRoomFront/src/dataRoom/dataset/api.ts` 中补齐 MQTT 字段映射、缓存条数和空数据策略类型
- [x] T052 [US3] 在 `dataRoomFront/src/dataRoom/dataset/index.vue` 中注册 MQTT 数据集类型、展示名称和 `MqttEditor.vue`
- [x] T053 [US3] 在 `dataRoomFront/src/dataRoom/dataset/streaming-dataset.ts` 中按实现策略确认是否将 `mqtt` 标记为 streaming dataset，并同步运行态订阅行为
- [x] T054 [US3] 运行 `mvn test -pl dataRoomServer -Dtest=MqttDatasetServiceTest,MqttLatestMessageCacheTest,MqttDatasetRuntimeTest,DatasetServiceFactoryMqttTest,MqttDatasetJsonTest` 并记录结果到 `specs/001-add-mqtt-datasource/quickstart.md`

**检查点**: 用户故事 3 可独立验证：MQTT 数据集可保存、订阅、缓存并通过 `/dataRoom/dataset/run` 返回结构化 JSON 字段结果。

---

## Phase 6：用户故事 4 - 在大屏中稳定展示 MQTT 数据（优先级：P3）

**目标**: 图表在预览和发布页面中稳定展示 MQTT 数据，服务短暂不可用时页面不崩溃，恢复后继续展示最新可用数据。

**独立测试方式**: 将 MQTT 数据集绑定到图表组件，发布页面后持续发送 JSON 消息，验证页面显示、刷新和异常状态。

### 用户故事 4 的验证任务

- [x] T055 [P] [US4] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/dataset/service/MqttDatasetChartRunTest.java` 中编写 `run4Chart` 兼容数组结果和空数据结果的后端测试
- [x] T056 [P] [US4] 在 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/dataset/runtime/MqttDatasetRuntimeLifecycleTest.java` 中编写数据源删除、数据集删除或配置变更后停止订阅并释放缓存的测试

### 用户故事 4 的实现任务

- [x] T057 [US4] 在 `dataRoomFront/src/dataRoom/hooks/use-dr-component/index.ts` 中确认 MQTT 数据集通过 `datasetApi.run4Chart()` 返回数组结果并不会导致图表崩溃
- [x] T058 [US4] 在 `dataRoomFront/src/dataRoom/hooks/use-realtime-dataset/index.ts` 中确认 MQTT 运行态订阅启动/停止与页面生命周期一致
- [x] T059 [US4] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/runtime/MqttDatasetRuntime.java` 中实现数据源不可用、恢复和重连后的最新消息继续写入缓存
- [x] T060 [US4] 在 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/runtime/MqttLatestMessageCache.java` 中实现数据集删除、禁用或配置变更时的缓存清理入口
- [x] T061 [US4] 在 `dataRoomFront/src/dataRoom/dataset/components/DatasetPreviewTable.vue` 中确认 MQTT 空数据和错误状态展示不破坏现有预览表格
- [x] T062 [US4] 运行 `mvn test -pl dataRoomServer -Dtest=MqttDatasetChartRunTest,MqttDatasetRuntimeLifecycleTest,MqttDatasetRuntimeTest` 并记录结果到 `specs/001-add-mqtt-datasource/quickstart.md`

**检查点**: 用户故事 4 可独立验证：图表绑定 MQTT 数据集后能展示缓存结果，异常期间页面稳定。

---

## Phase 7：收尾与横切关注项

**目的**: 完成跨故事验证、文档同步、安全复核和设计规范复核。

- [x] T063 [P] 在 `specs/001-add-mqtt-datasource/contracts/http-api.md` 中根据最终实现同步 MQTT 请求/响应字段和错误分类
- [x] T064 [P] 在 `specs/001-add-mqtt-datasource/contracts/ui-contract.md` 中根据最终实现同步 MQTT 表单字段、默认值和交互状态
- [x] T065 [P] 在 `specs/001-add-mqtt-datasource/data-model.md` 中根据最终实现同步实体字段、校验规则和状态转换
- [x] T066 在 `specs/001-add-mqtt-datasource/quickstart.md` 中执行并记录完整端到端验证：创建数据源、连接测试、创建数据集、发布 JSON 消息、图表绑定
- [x] T067 运行 `mvn test -pl dataRoomServer` 并记录结果到 `specs/001-add-mqtt-datasource/quickstart.md`
- [x] T068 运行 `mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test` 并记录结果到 `specs/001-add-mqtt-datasource/quickstart.md`
- [x] T069 运行 `cd dataRoomFront && npm run type-check` 并记录结果到 `specs/001-add-mqtt-datasource/quickstart.md`
- [x] T070 运行 `cd dataRoomFront && npm run lint` 并记录结果到 `specs/001-add-mqtt-datasource/quickstart.md`
- [x] T071 对 `dataRoomFront/src/dataRoom/data-source/index.vue` 和 `dataRoomFront/src/dataRoom/dataset/components/MqttEditor.vue` 执行设计规范复核，确认无硬编码颜色、无 `--dr-*`、无 `:deep(.el-*)`、无 `!important`
- [x] T072 对 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/bean/MqttDatasource.java` 和 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/runtime/MqttDatasetRuntime.java` 执行安全复核，确认敏感字段不明文回显且异常栈完整记录
- [x] T073 对照 `specs/001-add-mqtt-datasource/spec.md`、`specs/001-add-mqtt-datasource/plan.md` 和 `specs/001-add-mqtt-datasource/checklists/requirements.md` 执行宪章合规复核

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1 准备阶段**: 无依赖，可立即开始。
- **Phase 2 基础阶段**: 依赖 Phase 1，阻塞全部用户故事。
- **Phase 3 用户故事 1**: 依赖 Phase 2，是 MVP 的第一部分。
- **Phase 4 用户故事 2**: 依赖 Phase 2，可与 US1 部分并行，但连接测试 UI 依赖 US1 的 MQTT 表单字段。
- **Phase 5 用户故事 3**: 依赖 Phase 2，并需要至少存在一个 MQTT 数据源；可使用测试夹具独立验证。
- **Phase 6 用户故事 4**: 依赖 US3 的 MQTT 数据集运行能力。
- **Phase 7 收尾**: 依赖目标用户故事完成。

### 用户故事依赖

- **US1 管理员创建 MQTT 数据源（P1）**: 基础阶段完成后即可开始，不依赖其他用户故事。
- **US2 连接测试与错误定位（P1）**: 基础阶段完成后即可开始；前端交互依赖 US1 的 MQTT 表单。
- **US3 数据集使用 MQTT 消息（P2）**: 基础阶段完成后即可开始；运行验证需要 MQTT 数据源，可用测试夹具或 US1 成果。
- **US4 在大屏中稳定展示 MQTT 数据（P3）**: 依赖 US3 的数据集执行和缓存能力。

### 每个用户故事内部顺序

- 先写对应测试任务，再实现模型/服务/接口/UI。
- 先完成后端类型和服务，再接入前端 UI。
- 用户故事签收前必须完成契约同步和验证命令。
- 任何 Java `catch` 变更必须在故事签收前通过 `CatchBlockLoggingTest`。

### 并行机会

- T002、T003、T004、T005 可并行。
- T006、T007、T008、T009、T012、T013、T014、T015、T016、T017 可并行，T010 依赖 T006/T008，T011 依赖 T007/T009。
- US1 的后端测试 T018/T019/T020 可并行；前端类型卡片 T024 可与后端服务 T021/T022 并行。
- US2 的测试 T029/T030/T031 可并行；前端 API T035 可与后端连接服务 T032/T033 并行。
- US3 的测试 T040/T041/T042/T043 可并行；缓存 T044、前端编辑器 T050、前端类型 T051 可并行。
- US4 的测试 T055/T056 可并行；前端 hooks T057/T058 可与后端生命周期 T059/T060 并行。

---

## 并行示例：用户故事 1

```bash
Task: "T018 [P] [US1] 在 dataRoomServer/src/test/java/com/gccloud/gcpaas/core/datasource/DataSourceControllerMqttTest.java 中编写新增 MQTT 数据源成功保存的控制器测试"
Task: "T020 [P] [US1] 在 dataRoomServer/src/test/java/com/gccloud/gcpaas/core/datasource/bean/MqttDatasourceValidationTest.java 中编写 authMode、host、port、TLS 单向认证材料校验测试"
Task: "T024 [P] [US1] 在 dataRoomFront/src/dataRoom/data-source/index.vue 中新增 MQTT 类型卡片和编辑入口"
```

## 并行示例：用户故事 2

```bash
Task: "T029 [P] [US2] 在 dataRoomServer/src/test/java/com/gccloud/gcpaas/core/datasource/service/MqttDatasourceConnectionServiceTest.java 中编写连接成功、超时、认证失败和主题无权限分类测试"
Task: "T035 [US2] 在 dataRoomFront/src/dataRoom/data-source/api.ts 中新增或复用数据源连接测试方法并声明 MQTT 测试结果类型"
```

## 并行示例：用户故事 3

```bash
Task: "T041 [P] [US3] 在 dataRoomServer/src/test/java/com/gccloud/gcpaas/core/dataset/runtime/MqttLatestMessageCacheTest.java 中编写默认缓存 5 条、超过上限移除最旧消息的测试"
Task: "T050 [P] [US3] 在 dataRoomFront/src/dataRoom/dataset/components/MqttEditor.vue 中创建 MQTT 数据集编辑器"
Task: "T051 [P] [US3] 在 dataRoomFront/src/dataRoom/dataset/api.ts 中补齐 MQTT 字段映射、缓存条数和空数据策略类型"
```

## 实施策略

### 先做 MVP（用户故事 1 + 用户故事 2）

1. 完成 Phase 1：准备阶段。
2. 完成 Phase 2：基础阶段。
3. 完成 Phase 3：管理员创建 MQTT 数据源。
4. 完成 Phase 4：连接测试与错误定位。
5. 停止并验证：用户可创建 MQTT 数据源并完成连接测试，敏感信息不泄露。

### 增量交付

1. 交付 US1 + US2，形成可管理、可测试连接的 MQTT 数据源。
2. 交付 US3，形成可被数据集执行的 MQTT JSON 缓存结果。
3. 交付 US4，完成大屏图表绑定和运行态稳定性。
4. 完成 Phase 7，执行全量验证、设计规范复核和宪章合规复核。

### 验证门禁

- MVP 签收前必须通过 US1/US2 后端测试、`CatchBlockLoggingTest`、前端 `type-check`。
- 完整功能签收前必须通过 `mvn test -pl dataRoomServer`、`CatchBlockLoggingTest`、`npm run type-check`、`npm run lint`。
- 无法执行任何验证命令时，必须在 `specs/001-add-mqtt-datasource/quickstart.md` 记录原因。

## 说明

- 所有任务均使用 `- [x] T###` 清单格式。
- `[P]` 表示不同文件或无直接依赖，可并行处理。
- `[US#]` 标签用于追踪用户故事实现范围。
- 每个用户故事完成后都应能独立演示和验证。
