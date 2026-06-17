<!--
同步影响报告
版本变更：1.0.2 -> 1.1.0
修订原则：
- I. Architecture-Preserving Changes -> 一、架构一致性优先
- II. Multi-Surface Contract Completeness -> 二、多表面契约必须同步
- III. Design-System Compliance -> 三、设计规范强约束
- IV. Evidence-Backed Verification -> 四、验证结果必须有证据
- V. Traceable Failures and Secure Defaults -> 五、失败可追踪与安全默认
新增章节：
- 无
移除章节：
- 无
- 其他中文化调整：
- ✅ 已更新 .specify/templates/checklist-template.md
- ✅ 已更新 .specify/templates/constitution-template.md
- ✅ 已更新 .specify/extensions/agent-context/commands/speckit.agent-context.update.md
- ✅ 已更新 .specify/extensions/agent-context/README.md
- ✅ 已更新 .specify/templates/plan-template.md
- ✅ 已更新 .specify/templates/spec-template.md
- ✅ 已更新 .specify/templates/tasks-template.md
- ✅ 已更新 API 响应包装约定
- ⚠ 待处理 .specify/templates/commands/*.md（目录不存在，无需同步命令模板）
后续 TODO：
- 无
-->
# DataRoom 项目宪章

## 核心原则

### 一、架构一致性优先
任何变更都 MUST 保持 DataRoom 双设计器模型、页面生命周期与后端类型驱动契约的一致性。
凡是新增或修改数据集类型、数据源类型、页面配置类型、页面阶段快照或组件类型时，MUST
在同一次变更中同步更新所有受影响的注册点、注解、工厂绑定、路由契约与存储结构。这包括
`@JsonSubTypes`、`DatasetServiceFactory` Bean 命名、组件自动注册机制，以及对应的
`install.ts` 和配置面板结构。理由：只改一部分会直接造成运行时反序列化失败、设计器状态漂
移和发布链路损坏。

### 二、多表面契约必须同步
任何涉及持久化结构、图表配置、组件 props、数据集参数或 API 载荷的功能变更，MUST 同步
更新全部受影响表面：默认值、渲染逻辑、配置面板、后端 DTO 或实体处理、文档以及兼容迁移
的持久化行为。只要仍有任一表面停留在旧契约上，该变更就视为未完成。理由：DataRoom
依赖同一份配置 JSON 在前端设计器、后端服务、预览和发布阶段之间流转，契约漂移本身就是
功能缺陷。若变更涉及 HTTP 接口，响应包装 MUST 保持统一 `{"code": 0, "msg":
"success", "data": <T>}` 结构；任何 contracts、计划文档、实现和测试都不得把内部
`data` 体误写成裸接口响应。

### 三、设计规范强约束
凡是涉及 Vue 模板、SCSS、CSS、Element Plus 使用方式、页面布局或设计器交互外壳的前端
改动，MUST 遵循 `docs/design/DESIGN.md`。颜色、文本、边框、填充和状态样式 MUST 使
用 Element Plus CSS 变量；严禁引入 `--dr-*` 私有颜色 token、硬编码颜色值、负字距、
`!important` 或覆盖 Element Plus 内部选择器。业务样式 MAY 控制布局、间距和自定义容
器，但 MUST NOT 重写 Element Plus 内部样式。理由：产品需要克制且一致的设计系统，
才能保证设计器长期可维护、可预测。

### 四、验证结果必须有证据
凡是变更所影响表面要求的验证尚未执行，或者没有明确记录阻塞原因，该变更就 MUST NOT 被
视为完成、可评审或可计入成果。最低要求如下：前端组件改动 MUST 运行 `npm run
type-check`；前端样式或格式敏感改动 MUST 额外运行 `npm run lint`；后端逻辑改动 MUST
运行相关 Maven 测试；任何修改到 Java `catch` 块的改动 MUST 运行 `mvn -q -pl
dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test`。计划、任务和最终
交付说明 MUST 明确写出验证命令，或者说明无法执行的具体原因。理由：DataRoom 仍在快
速演进，不能依赖“看起来没问题”的主观判断。

### 五、失败可追踪与安全默认
禁止静默处理失败。Java `catch` 块 MUST 在继续兜底、返回或重新抛出之前，先通过
`ExceptionUtils.getStackTrace(e)` 记录完整异常栈；测试代码若有意捕获异常，也 MUST 打
印异常栈。除非变更目标本身就是安全或审计机制重构，否则现有安全与审计默认行为 MUST 保
持不变，包括 Shiro 角色校验、JWT 请求处理、RSA 密码传输、`delFlag` 软删除以及审计字
段自动填充。理由：平台承载用户、数据源和页面管理能力，任何失败都必须可诊断，任何安全默
认都不能被顺手削弱。

## 项目约束

DataRoom 的实现工作 MUST 遵守仓库现有结构和技术边界。后端改动归属 `dataRoomServer`
中 `com.gccloud.gcpaas.core` 包，目标运行时为 Spring Boot 3.5 与 JDK 17，并保持现有
模块划分、profile 约定和 REST 路径约定。前端改动归属
`dataRoomFront/src/dataRoom`，目标技术栈为 Vue 3、TypeScript 5.9、Vite
与 Element Plus，并保持当前 Hash 路由、`provide/inject` 画布模型和基于 `install.ts`
的组件自动发现契约。若方案需要突破这些边界，计划文档 MUST 在 Complexity Tracking
中记录该违例，并说明为何仓库内已有的更简单方案不足以满足需求。

## 交付与成果门禁

任何 spec、plan 和 tasks 在实现开始前都 MUST 明确写出宪章影响面。Spec MUST 标识受
影响的架构表面、契约同步义务和所需验证；Plan MUST 在研究前和设计后两次通过
宪章检查；Tasks MUST 把功能触发的契约同步工作和验证工作写成明确任务，而
不是视为可选收尾。只有当必需产物、校验项和后续文档都已同步完成时，工作才算完成、可交付
或可计入成果。若团队决定延期某项必需更新，MUST 明确记录延期原因，并将其视为未完成范
围，而不是默认忽略。 任何 specs 目录下可交付的md文件内容都要使用中文，代码除外。

## 治理

本宪章约束 DataRoom 仓库内的需求定义、方案规划、实现与评审过程。`AGENTS.md`、
`docs/design/DESIGN.md` 以及后续 spec 产物都属于本宪章之下的执行性指导文件；若发生
冲突，在宪章未修订前以约束更严格者为准。

修订宪章时，相关模板和指导文件的同步更新 MUST 在同一次变更中提交。删除原则或实质性重
定义原则时，版本号 MUST 升级 MAJOR；新增原则、新增强制治理章节或新增交付门禁时，
版本号 MUST 升级 MINOR；仅进行不改变义务的措辞澄清时，版本号 MUST 升级 PATCH。

合规审查在三个时间点 MUST 执行：需求规格、方案批准、最终交付。若工作缺少必需的契约同
步更新、验证证据，或不满足设计规范与安全约束，评审人 MUST 拒绝通过。任何例外情况
MUST 记录在对应的计划或交付说明中，并附带批准背景和后续消除例外的退出条件。

**版本**: 1.1.0 | **批准日期**: 2026-06-11 | **最后修订**: 2026-06-12
