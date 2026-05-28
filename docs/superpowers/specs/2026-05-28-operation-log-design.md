# 操作日志设计

## 背景

DataRoom 当前后端接口主要通过以下链路运行：

- Shiro 统一认证与鉴权，入口在 `ShiroAuthFilter`
- Spring MVC Controller 处理业务请求
- `DataRoomExceptionHandler` 统一处理异常
- 大多数接口返回统一的 `Resp` 结构

系统目前缺少统一的操作日志能力。新增该能力时，需要同时满足以下约束：

- 覆盖所有 `/dataRoom/**` 接口操作
- 不要求逐个接口改造 Controller 方法体
- 能记录操作目标、说明、操作者、时间、URL、请求参数、耗时、HTTP 方法、结果、异常日志
- 能兼容当前 `h2`、`mysql`、`pg` 三套数据库模式
- 不能让日志系统反向拖慢或影响主业务请求

## 目标

- 为所有 `/dataRoom/**` 请求建立统一操作日志采集链路。
- 自动识别操作目标类型，例如页面、数据源、数据集、素材、地图、用户、认证等。
- 自动识别操作动作，例如查询、新增、修改、删除、发布、下线、上传、执行、登录等。
- 支持通过 Controller 方法注解显式定义“执行的是什么操作”和“属于什么业务”，并优先于规则推断。
- 统一记录请求地址、HTTP 方法、请求参数、请求开始时间、完整请求耗时、业务处理耗时、执行结果、异常信息。
- 高频运行态接口纳入日志体系，但默认只记录摘要，不落超大完整参数。
- 为后续新增模块、细化审计说明、日志查询页面、归档清理预留扩展点。

## 非目标

- 本设计不包含操作日志查询页面或前端展示。
- 本设计不包含日志导出、审计报表、权限细分。
- 本设计第一阶段不做分表、分区、冷热分层、消息队列解耦。
- 本设计第一阶段不要求通过额外查库来补齐每一条日志的目标名称。
- 本设计第一阶段不要求给现有大量接口新增注解。

## 方案对比

### 方案一：纯 Filter 方案

只在 Servlet Filter 层统一拦截和落库。

优点：

- 最容易覆盖所有请求，包括未登录和鉴权失败请求。
- 不需要改每个接口。

问题：

- 业务语义弱，只能依赖 URL 规则猜测目标和动作。
- 不容易稳定拿到 Spring MVC Handler 信息。
- 对统一响应结构和异常链路的利用不充分。

### 方案二：纯 Spring MVC 方案

使用 `HandlerInterceptor`、`ResponseBodyAdvice`、`@RestControllerAdvice` 记录请求。

优点：

- 更接近 Spring 语义，便于识别 Controller、方法和返回体。
- 更容易根据 `Resp` 统一判定成功失败。

问题：

- 无法完整覆盖 Shiro 前置失败、未进入 MVC 的异常和拒绝请求。
- 仍然需要额外机制兜底“所有接口都进日志体系”。

### 方案三：混合方案

使用 `Filter + Interceptor + ResponseBodyAdvice + ExceptionBridge + 异步落库`。

优点：

- 能覆盖所有接口请求。
- 能利用 Spring MVC 补充更准确的业务语义。
- 不需要改每个接口。
- 最适合后续扩展日志级别、注解增强、脱敏策略、归档策略。

问题：

- 设计复杂度高于单一方案。

### 推荐结论

采用方案三。

原因：

- 仅靠 AOP 或 MVC 拦截器不能完整覆盖 Shiro 前置失败。
- 仅靠 Filter 虽然覆盖面足够，但业务语义和结果识别会偏弱。
- 混合方案最符合“最通用、最能扩展、又不用每个接口都改造”的要求。

## 总体架构

请求链路：

`HTTP Request -> OperationLogFilter -> Shiro -> OperationLogInterceptor -> Controller -> OperationLogResponseAdvice / DataRoomExceptionHandler -> OperationLogPublisher -> OperationLogPersistService -> DB`

建议拆分为以下组件：

### `OperationLogFilter`

职责：

- 拦截所有 `/dataRoom/**` 请求
- 生成 `traceId`
- 记录请求开始时间
- 包装请求体，支持后续读取 body
- 采集基础请求信息：URL、HTTP 方法、IP、User-Agent、Query 参数、原始 body
- 兜底捕获未进入 MVC 的异常和失败场景

### `OperationLogInterceptor`

职责：

- 仅在命中 Spring MVC `HandlerMethod` 时执行
- 识别操作目标类型、目标标识、操作动作、操作说明
- 识别业务类型、业务名称、业务说明
- 记录进入 Controller 的时间，用于计算 `handler_duration_ms`
- 将识别结果回填到当前请求的日志上下文

### `OperationLogResponseAdvice`

职责：

- 读取最终返回体
- 当返回体是 `Resp` 时，根据 `code` 统一判定 `success` 或 `failure`
- 回填 `response_code`、`response_message`、`result_status`

### `OperationLogExceptionBridge`

职责：

- 与 `DataRoomExceptionHandler` 协作
- 将异常类型、异常堆栈、异常消息补充到当前日志上下文
- 确保“异常已被全局处理并返回友好响应”的请求仍然记为失败日志

### `OperationLogPublisher`

职责：

- 在请求结束后异步投递日志写入任务
- 主线程只负责采集和投递，不直接写库

### `OperationLogPersistService`

职责：

- 执行日志落库
- 处理持久化失败时的内部降级

### `OperationLogResolver`

职责：

- 解析目标类型
- 解析动作类型
- 解析业务语义
- 生成操作说明
- 提取目标 ID / 名称
- 根据 URI 或策略判断完整记录还是摘要记录
- 统一执行脱敏、裁剪和参数摘要生成

## 数据模型

第一阶段新增一张主表：`dr_operation_log`

建议字段如下：

### 请求标识

- `id`
- `trace_id`
- `tenant_code`

### 操作者

- `operator_id`
- `operator_name`
- `operator_role`

### 操作语义

- `target_type`
- `target_id`
- `target_name`
- `action_type`
- `action_desc`
- `business_type`
- `business_name`
- `business_desc`

### 请求信息

- `request_uri`
- `request_method`
- `client_ip`
- `user_agent`
- `content_type`
- `query_params`
- `request_body`
- `request_param_summary`

### 执行结果

- `result_status`
- `response_code`
- `response_message`
- `exception_type`
- `exception_stack`

### 时间与性能

- `request_time`
- `duration_ms`
- `handler_duration_ms`

### 通用审计字段

- `create_date`
- `create_user`
- `update_date`
- `update_user`
- `del_flag`

字段约束说明：

- `duration_ms` 表示完整请求总耗时，从 Filter 进入到响应完成。
- `handler_duration_ms` 表示进入 Controller 后的业务处理耗时。
- `target_id`、`target_name` 允许为空，不要求为了补齐它们再额外查库。
- `business_type`、`business_name`、`business_desc` 允许为空，但当 Controller 方法显式声明注解时应优先落库。
- `query_params`、`request_body`、`request_param_summary`、`exception_stack` 使用普通长文本字段，避免第一阶段依赖数据库特定 JSON 类型。

## 自动识别规则

### 解析优先级

操作日志语义解析优先级固定如下：

1. Controller 方法上的操作日志注解
2. Controller 类上的默认操作日志注解
3. Controller 基础路径规则
4. 方法路径关键词规则
5. 请求参数与 `PathVariable` 辅助提取
6. 兜底值 `unknown` 或空值

其中“执行的是什么操作、什么业务”在存在方法注解时，必须以注解值为准，不再使用规则覆盖。

### 目标类型识别

按 Controller 基础路径映射：

- `/dataRoom/page/**` -> `page`
- `/dataRoom/dataSource/**` -> `datasource`
- `/dataRoom/dataset/**` -> `dataset`
- `/dataRoom/resource/**` -> `resource`
- `/dataRoom/map/**` -> `map`
- `/dataRoom/user/**` -> `user`
- `/dataRoom/captcha/**` -> `captcha`
- 认证失败、登录、登出等链路 -> `auth`
- 识别不到 -> `unknown`

### 动作类型识别

优先按方法路径关键词识别：

- `/list` -> `list`
- `/page` -> `list`
- `/detail/**` -> `detail`
- `/insert`、`/add` -> `create`
- `/update`、`/updateName`、`/updatePageConfig` -> `update`
- `/delete/**` -> `delete`
- `/publish` -> `publish`
- `/offline` -> `offline`
- `/upload`、`/uploadModelCover` -> `upload`
- `/createAndImport`、`/reimport` -> `import`
- `/run`、`/run/test` -> `run`
- `/login` -> `login`
- 识别不到时再回退到 HTTP 方法规则

### 业务类型识别

第一阶段默认业务类型可与目标类型保持一致，用于保证全量日志都有可检索的业务维度：

- `page`
- `datasource`
- `dataset`
- `resource`
- `map`
- `user`
- `auth`
- `captcha`

对于跨资源的复合业务，优先通过 Controller 方法注解显式定义，例如：

- 页面发布
- 页面预览
- 数据集测试执行
- Excel 导入
- 用户资料维护

### 目标 ID / 名称提取

提取优先级：

1. `PathVariable` 中的 `id`、`code`、`pageCode`
2. 请求体中的 `id`、`code`、`name`、`username`、`title`
3. 针对目标类型的常见字段规则

示例：

- `page`：优先 `code`、其次 `name`
- `datasource`：优先 `code`、其次 `name`
- `dataset`：优先 `code`、其次 `name`
- `resource`：优先 `id`、其次 `name`
- `map`：优先 `code`、其次 `name`
- `user`：优先 `id`、其次 `username`

### 操作说明生成

采用“注解优先，模板兜底”的方式生成，不要求每个接口手工编写。

优先级：

1. 方法注解中的自定义说明
2. 类注解中的默认说明
3. 规则模板生成说明

示例：

- `create page` -> `新增页面`
- `update dataset` -> `修改数据集`
- `delete datasource` -> `删除数据源`
- `publish page` -> `发布页面`
- `run dataset` -> `执行数据集`
- `upload resource` -> `上传素材`
- `login user` -> `用户登录`

若已提取到目标名称，可补充为：

- `发布页面：销售总览大屏`
- `删除数据源：mysql_demo`

### Controller 方法注解自定义

为了满足“执行的是什么操作、什么业务”可显式声明，建议新增操作日志注解，例如 `@OperationLogMeta`。

建议字段：

- `targetType`
- `actionType`
- `actionDesc`
- `businessType`
- `businessName`
- `businessDesc`
- `highFrequency`
- `detailLevel`

建议用法：

- 标在 Controller 类上，定义该控制器的默认业务语义
- 标在 Controller 方法上，覆盖类级默认值

示例语义：

- 页面发布接口：
  - `targetType = "page"`
  - `actionType = "publish"`
  - `actionDesc = "发布页面"`
  - `businessType = "page_publish"`
  - `businessName = "页面发布"`
  - `businessDesc = "发布可视化页面"`

- 数据集测试接口：
  - `targetType = "dataset"`
  - `actionType = "run"`
  - `actionDesc = "测试执行数据集"`
  - `businessType = "dataset_test"`
  - `businessName = "数据集测试"`
  - `businessDesc = "测试运行数据集"`

规则职责调整如下：

- 注解存在时，规则只负责补充空缺字段，不覆盖注解值
- 注解不存在时，仍由规则自动推断，保证不改接口也可运行

## 现有接口改造范围

当前仓库中的接口不需要统一逐个改造。改造范围分为三档：

### 第一档：完全不改接口方法

以下标准接口可直接依赖全局链路和规则推断，不要求新增方法级注解：

- `GET /list`
- `GET /detail/{id|code}`
- `POST /insert`
- `POST /update`
- `POST /delete/{id|code}`

这些接口在以下 Controller 中默认可先不改：

- `PageController`
- `DatasetController`
- `DataSourceController`
- `MapController`
- `ResourceController`
- `UserController`

原因：

- `targetType` 可由 Controller 基础路径稳定推断
- `actionType` 可由方法路径稳定推断
- `actionDesc`、`businessName` 可默认利用现有 `@Operation` 和 `@Tag`

### 第二档：建议加类级注解

建议给每个资源 Controller 增加一个默认注解，用于提供基础业务语义，但不改方法签名、不改业务逻辑：

- `PageController`
  - `targetType = "page"`
  - `businessType = "page"`
  - `businessName = "页面管理"`
- `DatasetController`
  - `targetType = "dataset"`
  - `businessType = "dataset"`
  - `businessName = "数据集管理"`
- `DataSourceController`
  - `targetType = "datasource"`
  - `businessType = "datasource"`
  - `businessName = "数据源管理"`
- `ExcelDataSourceController`
  - `targetType = "datasource"`
  - `businessType = "excel_datasource"`
  - `businessName = "Excel数据源"`
- `ResourceController`
  - `targetType = "resource"`
  - `businessType = "resource"`
  - `businessName = "素材库"`
- `MapController`
  - `targetType = "map"`
  - `businessType = "map"`
  - `businessName = "地图管理"`
- `UserController`
  - `targetType = "user"`
  - `businessType = "user"`
  - `businessName = "用户管理"`
- `CaptchaController`
  - `targetType = "captcha"`
  - `businessType = "auth_captcha"`
  - `businessName = "验证码"`

### 第三档：建议加方法级注解

仅对规则推断不够准确、或需要明确审计语义的接口增加方法级注解。

#### 页面相关

- `PageController.publish`
  - `actionType = "publish"`
  - `businessType = "page_publish"`
  - `businessName = "页面发布"`
- `PageController.offline`
  - `actionType = "offline"`
  - `businessType = "page_publish"`
  - `businessName = "页面下线"`
- `PageController.updatePageConfig`
  - `actionType = "update"`
  - `businessType = "page_design"`
  - `businessName = "页面设计保存"`
- `PageController.updatePageConfig4Preview`
  - `actionType = "preview"`
  - `businessType = "page_preview"`
  - `businessName = "页面预览保存"`
- `PageController.getPageConfig`
  - `businessType = "page_preview"`
  - `detailLevel = SUMMARY`
- `PageController.stageClear`
  - `actionType = "clear"`
  - `businessType = "page_stage"`
  - `businessName = "页面版本管理"`
- `PageController.stageRollback`
  - `actionType = "rollback"`
  - `businessType = "page_stage"`
  - `businessName = "页面版本回滚"`

#### 数据集相关

- `DatasetController.run`
  - `actionType = "run"`
  - `businessType = "dataset_run"`
  - `businessName = "数据集执行"`
  - `detailLevel = SUMMARY`
- `DatasetController.runTest`
  - `actionType = "run"`
  - `businessType = "dataset_test"`
  - `businessName = "数据集测试执行"`

#### Excel 数据源相关

- `ExcelDataSourceController.upload`
  - `actionType = "upload"`
  - `businessType = "excel_parse"`
  - `businessName = "Excel解析上传"`
- `ExcelDataSourceController.createAndImport`
  - `actionType = "import"`
  - `businessType = "excel_create_import"`
  - `businessName = "Excel建表导入"`
- `ExcelDataSourceController.reimport`
  - `actionType = "import"`
  - `businessType = "excel_reimport"`
  - `businessName = "Excel重新导入"`
- `ExcelDataSourceController.viewData`
  - `businessType = "excel_view_data"`
  - `detailLevel = SUMMARY`

#### 素材相关

- `ResourceController.upload`
  - `actionType = "upload"`
  - `businessType = "resource_upload"`
  - `businessName = "素材上传"`
- `ResourceController.updateModelConfig`
  - `actionType = "update"`
  - `businessType = "model_config"`
  - `businessName = "模型配置更新"`
- `ResourceController.uploadModelCover`
  - `actionType = "upload"`
  - `businessType = "model_cover"`
  - `businessName = "模型封面上传"`

#### 用户与认证相关

- `UserController.login`
  - `actionType = "login"`
  - `businessType = "auth_login"`
  - `businessName = "用户登录"`
- `UserController.updateProfile`
  - `actionType = "update"`
  - `businessType = "user_profile"`
  - `businessName = "个人资料维护"`
- `CaptchaController.generate`
  - `actionType = "generate"`
  - `businessType = "auth_captcha"`
  - `businessName = "验证码生成"`

### 改造量评估

按当前仓库规模，推荐方案下的改造量大致为：

- 类级注解：约 `8` 个 Controller
- 方法级注解：约 `15` 个关键接口
- 其余接口：`0` 改动，继续走规则推断

因此该方案满足“不用每个接口都改造”的约束。

### 第一期硬边界

第一期执行时，接口注解改造范围固定如下：

- 必补类级注解：
  - `PageController`
  - `DatasetController`
  - `DataSourceController`
  - `ExcelDataSourceController`
  - `ResourceController`
  - `MapController`
  - `UserController`
  - `CaptchaController`

- 必补方法级注解：
  - `PageController.publish`
  - `PageController.offline`
  - `PageController.updatePageConfig`
  - `PageController.updatePageConfig4Preview`
  - `PageController.getPageConfig`
  - `PageController.stageClear`
  - `PageController.stageRollback`
  - `DatasetController.run`
  - `DatasetController.runTest`
  - `ExcelDataSourceController.upload`
  - `ExcelDataSourceController.createAndImport`
  - `ExcelDataSourceController.reimport`
  - `ExcelDataSourceController.viewData`
  - `ResourceController.upload`
  - `ResourceController.updateModelConfig`
  - `ResourceController.uploadModelCover`
  - `UserController.login`
  - `UserController.updateProfile`
  - `CaptchaController.generate`

- 第一阶段明确不补方法级注解的接口：
  - 所有标准 `list/detail/insert/update/delete`
  - `UserController.current`
  - `UserController.roles`
  - `PageController.stageDelete`
  - `PageController.updateName`

若后续发现规则推断不足，再单独追加，不在第一期默认扩大范围。

## 参数记录策略

### 总原则

- 所有接口都进入日志体系
- 管理类接口尽量记录完整参数
- 高频运行态接口默认只记录摘要
- 文件上传接口只记录文件元信息，不记录文件内容
- 统一执行敏感字段脱敏和长度裁剪

### 存储字段

- `query_params`：记录 URL 查询参数
- `request_body`：记录请求体
- `request_param_summary`：记录摘要参数

### 高频接口摘要策略

高频接口包括但不限于：

- `/dataRoom/dataset/run`
- 页面预览配置获取接口
- 列表查询、明细查询等高频读接口

这些接口仍然生成日志，但默认只保留：

- 目标类型
- 动作类型
- 操作说明
- 操作者
- URL
- HTTP 方法
- `duration_ms`
- `handler_duration_ms`
- 结果状态
- `response_code`
- `request_param_summary`

摘要字段示例：

- `datasetCode=xxx`
- `pageCode=xxx,pageStatus=publish`
- `pageNum=1,pageSize=20`

### 文件上传记录策略

上传类接口只记录：

- 文件名
- 文件大小
- 文件类型
- 目标模块
- 是否成功
- 耗时
- 异常信息

不记录文件二进制内容。

## 脱敏与裁剪策略

### 默认脱敏字段

- `password`
- `oldPassword`
- `newPassword`
- `token`
- `authorization`
- `cookie`
- `secret`
- `accessKey`
- `secretKey`
- `privateKey`

### 脱敏方式

- 普通敏感文本统一替换为 `******`
- 长 token 保留前 6 后 4
- `Authorization` Header 仅保留 scheme，值替换为 `******`

### 长度上限

- `query_params` 最多 `2KB`
- `request_body` 最多 `16KB`
- `exception_stack` 最多 `16KB`

超出部分截断，并追加 `...<truncated>` 标记。

## 成功失败判定

### 返回体判定

- 当返回体为 `Resp` 且 `code == 200` 时，记为 `success`
- 当返回体为 `Resp` 且 `code != 200` 时，记为 `failure`

### 异常判定

- 抛出异常但被 `DataRoomExceptionHandler` 处理后返回时，仍然记为 `failure`
- Shiro 未登录、认证失败、无权限请求由 Filter 兜底，记为 `failure`

### 非 `Resp` 返回体

若未来存在非 `Resp` 返回体接口，则以异常情况和 HTTP 状态码作为辅助判定。

## 异步落库与降级策略

### 异步落库原则

- 主线程只负责采集和投递日志任务
- 不在 Controller 或 Filter 主链路直接写库
- 日志系统不能反向影响业务请求

### 降级规则

1. 日志写库失败不影响接口响应
2. 异步线程池满时，优先保留失败日志，允许丢弃低优先级成功日志
3. 超大请求体直接截断，不重试全文写入
4. 持久化异常只写应用内部日志，不向业务链路抛出

## 数据库兼容与索引

### 数据库兼容策略

第一阶段不依赖以下能力：

- 数据库原生 JSON 字段
- 全文索引
- 分区表
- 数据库特化函数

使用普通文本字段，保证 `h2`、`mysql`、`pg` 都可落地。

### 建议索引

- `idx_operation_log_request_time`
- `idx_operation_log_operator_name`
- `idx_operation_log_target_type`
- `idx_operation_log_action_type`
- `idx_operation_log_result_status`
- `idx_operation_log_trace_id`

若后续需要按资源追溯，再补组合索引：

- `(target_type, target_id, request_time)`

## 配置与扩展点

建议新增独立策略配置，例如 `OperationLogPolicy`，用于集中管理：

- 哪些 URI 记录完整参数
- 哪些 URI 只记录摘要
- 哪些字段需要脱敏
- 哪些 Header 需要忽略
- 各文本字段裁剪长度

后续可平滑扩展的能力：

- 特殊接口注解精确定义
- URI 白名单 / 黑名单
- 采样策略
- 日志归档与定期清理
- 日志查询 API 与管理界面
- 审计报表导出

### 注解增强

第一阶段以规则全覆盖为基础，同时支持对关键接口使用注解做精确定义。建议注解能力包括：

- `targetType`
- `actionType`
- `actionDesc`
- `businessType`
- `businessName`
- `businessDesc`
- `highFrequency`
- `logDetailLevel`

设计原则：

- 不要求给所有接口补注解
- 关键接口可以通过方法注解精确定义“执行的是什么操作、什么业务”
- 注解优先级高于规则推断
- 类级注解可给一组接口提供默认业务语义

## 第一阶段实施范围

第一阶段只做以下内容：

1. 新增 `dr_operation_log` 主表
2. 新增日志实体、Mapper、Service
3. 新增 `OperationLogFilter`
4. 新增 `OperationLogInterceptor`
5. 新增 `OperationLogResponseAdvice`
6. 与 `DataRoomExceptionHandler` 协作的异常桥接
7. 异步落库
8. URI 规则识别
9. 参数脱敏、裁剪与摘要策略
10. 方法级与类级注解解析支持
11. 基础索引
12. 对现有 Controller 仅补少量类级与关键方法级注解

第一阶段不做：

- 前端日志查询页面
- 分表、归档、冷热存储
- 大量 Controller 注解补齐
- 为每条日志补齐目标名称而额外查库
- 数据库 JSON 字段与高级检索能力

## 风险与控制

### 风险一：高频接口日志量过大

控制方式：

- 高频接口仅记录摘要
- 长文本裁剪
- 异步写库

### 风险二：敏感信息泄露

控制方式：

- 统一脱敏器
- 统一 Header 忽略与替换
- 上传接口不记录文件内容

### 风险三：日志系统影响主业务性能

控制方式：

- 主线程不直接写库
- 写库失败不影响接口响应
- 异步线程池满时允许丢弃低优先级成功日志

### 风险四：目标和动作识别不够准确

控制方式：

- 路径规则优先覆盖主流场景
- 为关键接口提供方法注解精确定义
- 不在第一阶段引入额外查库和高耦合逻辑

## 验收标准

- 所有 `/dataRoom/**` 请求都进入统一操作日志体系。
- 管理类接口可记录完整参数，高频运行态接口默认只记录摘要。
- 日志记录包含操作目标、执行操作、所属业务、操作说明、操作者、时间、URL、HTTP 方法、结果、异常信息。
- 日志记录包含两个耗时字段：`duration_ms`、`handler_duration_ms`。
- 未登录、无权限、业务异常、系统异常请求都能生成失败日志。
- 日志写库失败不影响主业务接口响应。
- 第一阶段实现不要求逐个接口改造 Controller 方法体。
- 当 Controller 方法显式声明操作日志注解时，注解值优先于规则推断。
- 当前现有接口仅需补充少量类级和关键方法级注解，其余接口可直接依赖规则推断。
