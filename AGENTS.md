# AGENTS.md

本文件用于指导 Qoder 或其他代码协作代理在本仓库中工作。执行任务前应先阅读本文件，并优先遵循这里记录的项目结构、开发命令和编码约定。

## 项目概览

DataRoom-Plus 是一个可视化大屏设计器，后端基于 Spring Boot 3.5 和 JDK 17，前端基于 Vue 3。系统支持拖拽式大屏设计，包含两类设计模式：

- `PageDesigner`：基于网格布局的仪表盘设计器。
- `VisualScreenDesigner`：像素级自由布局大屏设计器。

系统支持 MySQL、PostgreSQL、H2、Elasticsearch、HTTP、JSON、Groovy 等数据源或数据处理方式。

当前项目仍处于活跃开发阶段，尚未达到生产可用状态。

## 构建与开发命令

### 后端：Java / Maven

在项目根目录执行：

```bash
# 构建整个项目
mvn clean package -DskipTests

# 运行全部测试
mvn test

# 运行单个测试类
mvn test -Dtest=JsonUtilsTest

# 启动服务，默认使用 H2 数据库，端口 8081
mvn spring-boot:run -pl dataRoomServer
```

服务默认访问地址为 `http://localhost:8081/dataRoom`。接口文档地址为 `/doc.html`，使用 Knife4j / Swagger。

### 前端：Vue 3 / Vite

```bash
cd dataRoomFront

# 安装依赖
npm install

# 启动开发服务
npm run dev

# 生产构建，产物输出到 dataRoom/
npm run build

# 运行 lint 并自动修复
npm run lint

# 格式化代码
npm run format

# 类型检查
npm run type-check
```

Node.js 版本要求：`^20.19.0 || >=22.12.0`。

## 项目结构

```text
DataRoom/
├── dataroom-core/       # 核心库占位模块，目前内容较少
├── dataRoomServer/     # Spring Boot 主应用，后端代码集中在这里
│   └── src/main/java/com/gccloud/gcpaas/dataroom/core/
└── dataRoomFront/        # Vue 3 前端应用
```

后端业务代码主要位于 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/` 包下。

## 后端架构

### 应用入口

后端入口类为 `com.gccloud.gcpaas.dataroom.server.DataRoomApplication`，并通过 `@MapperScan("com.gccloud.gcpaas.**")` 扫描 MyBatis Mapper。

### 核心包说明

| 包路径 | 说明 |
|--------|------|
| `page/` | 页面和大屏 CRUD、发布生命周期管理，包含 `PageController`、`PageService`、`PageStageService` |
| `dataset/` | 数据集执行层，使用工厂模式分发不同类型数据集，包含 `DatasetController`、`DatasetServiceFactory` |
| `datasource/` | 数据源连接管理，包含 `DataSourceController`、`DatasourceService` |
| `entity/` | MyBatis-Plus 实体类，通常继承 `BaseEntity`，包含审计字段和软删除字段 |
| `shiro/` | Shiro、JWT 认证与鉴权，包含 `ShiroAuthRealm`、`ShiroAuthFilter` |
| `config/` | Spring 配置类，包含 `DataRoomConfig`、`ShiroConfiguration`、`Knife4jWebMvcConfigurer` |
| `user/` | 用户登录与认证，包含 `UserController`、`TokenService` |
| `captcha/` | 登录验证码，使用 Caffeine 缓存 |

### REST API 基础路径

| 路径 | 说明 |
|------|------|
| `/dataRoom/page` | 页面管理 |
| `/dataRoom/dataset` | 数据集 CRUD 与执行 |
| `/dataRoom/dataSource` | 数据源管理 |
| `/dataRoom/user` | 用户认证 |
| `/dataRoom/captcha` | 验证码生成 |
| `/dataRoom/resource` | 文件和资源管理 |

### 数据库配置

支持 `h2`、`mysql`、`pg` 三类数据库 profile。开发环境默认使用 `h2`，可在 `application.yml` 中通过 `spring.profiles.active` 切换。

### 数据集工厂模式

`DatasetServiceFactory` 根据数据集类型解析具体实现，Bean 命名约定为 `{DatasetType.value}DatasetService`。

当前主要实现：

| 实现类 | 说明 |
|--------|------|
| `SqlDatasetService` | 执行 SQL，支持参数绑定 |
| `HttpDatasetService` | 发起 HTTP 请求，并通过 JSONPath 解析响应 |
| `JsonDatasetService` | 使用静态 JSON 数据 |

### 页面生命周期

页面生命周期为：创建 -> 设计 -> 预览 -> 发布。设计阶段由 `PageStageEntity` 保存，`dr_page_stage` 表中存储完整页面配置快照 JSON。

### 多态 JSON

`BaseDataset`、`BaseDataSource`、`BasePageConfig` 使用 `@JsonTypeInfo` 和 `@JsonSubTypes` 做类型安全反序列化。新增子类型时必须同步维护注解配置，避免接口反序列化失败。

## 前端架构

前端主要源码位于 `dataRoomFront/src/dataRoom/`。

| 目录 | 说明 |
|------|------|
| `PageDesigner/` | 网格化仪表盘设计器，基于 `vue-grid-layout-v3`，默认 16 列 |
| `VisualScreenDesigner/` | 像素级大屏设计器，基于 `vue3-moveable` 和 `vue3-selecto`，默认画布 1920x1080 |
| `components/` | 可视化组件库，组件通过约定自动注册 |
| `_components/` | 设计器共享 UI，例如控制面板、组件库、工具栏 |
| `_common/` | 通用工具和 HTTP 客户端，核心请求封装为 `_request.ts` |
| `hooks/` | 组合式 hooks，例如 `useCanvasInst`、`useDrComponent`、`useTimerManager` |
| `dataSource/` | 数据源管理视图和 API |
| `dataset/` | 数据集管理视图和 API |
| `page/` | 页面列表管理视图 |

### 组件自动注册约定

每个可视化组件都是 `components/` 下的独立目录，目录内必须包含 `install.ts`，并导出以下内容：

```typescript
export const component       // Vue 组件，通常由 defineAsyncComponent 定义
export const controlPanel    // 组件配置面板
export const getInstance     // 创建 ChartConfig<T> 实例的工厂函数
export const behaviors       // 交互定义，例如 click、hover
export const datasetFields   // 数据集字段映射定义
```

组件由 `AutoInstall.ts` 通过 `import.meta.glob('./**/install.ts')` 自动发现。新增组件时只需按约定创建目录和文件，不需要手动注册。

### 配置面板规范

前端组件目录必须包含 `index.vue` 作为主组件，并包含 `panel/index.vue` 作为配置面板。

图表类组件的配置面板必须遵循 `docs/design/chart-component-config-panel-spec.md`：

- 可视化配置字段必须先在 `install.ts` 的 `PropsInterface` 和默认值中声明。
- 面板控件应直接绑定到 `chart.props`，避免复制整份 props 到本地状态。
- 当前参考实现为 `dataRoomFront/src/dataRoom/components/DrBarChart/panel/index.vue`。

### 前端设计规范

所有前端页面、设计器面板、组件库、配置面板和业务组件的样式必须遵循 `docs/design/DESIGN.md`。

执行任何涉及 Vue、SCSS、CSS、Element Plus 组件、页面布局或交互状态的修改前，必须先阅读该规范，并按其中约束实现：

- 颜色、文本、边框、填充、状态色和交互色必须使用 Element Plus CSS 变量。
- 禁止新增或继续使用 `--dr-*` 私有颜色变量，禁止硬编码十六进制、RGB、HSL 或颜色英文名。
- Element Plus 表单组件必须使用默认样式，通过 props 表达尺寸、状态和密度。
- 禁止使用 `:deep(.el-*)`、`::v-deep`、`/deep/`、`>>>`、全局 `.el-*` 选择器或 `!important` 覆盖 Element Plus 内部样式。
- 业务样式只负责外层布局、间距、滚动区域和项目自定义容器，不重写 Element Plus 的颜色、边框、圆角、字号、行高、高度、内边距、hover、focus、disabled、placeholder 或弹层样式。
- 所有文本字距保持 `0`，不要使用负字距；非表单数字和指标展示可使用 `font-feature-settings: "tnum"`。
- 需要修改主题时，不在业务组件中覆盖，应通过后续统一定制 Element Plus 主题完成。

### 状态管理

设计器内部主要使用 `provide/inject` 共享画布状态，而不是集中式 Pinia store。`useCanvasInst` 创建画布上下文，并通过 `provide(DrConst.CANVAS_INST, canvasInst)` 提供给子组件。

### 组件数据流

1. 组件挂载后，`useDrComponent` hook 生效。
2. hook 调用 `autoRefreshData()`，将全局变量和固定值填充到数据集参数中。
3. 前端调用 `datasetApi.run4Chart()`，后端执行数据集。
4. 请求响应后，通过 `changeData()` 回调更新组件数据。

### 交互系统

组件通过 `behaviors` 定义可触发事件，并由用户配置的 `actions` 执行动作。运行时通过 `canvasInst.triggerChartBehavior()` 在组件之间派发交互事件。

### 路由与构建

前端使用 Hash 路由，创建方式为 `createWebHashHistory`。

设计器主要路由：

| 路由 | 说明 |
|------|------|
| `/dataRoom/pageDesigner/:pageCode` | 网格化页面设计器 |
| `/dataRoom/visualScreenDesigner/:pageCode` | 像素级大屏设计器 |

Vite 构建输出目录为 `dataRoom/`，`base` 为 `./`。项目使用 Element Plus 和 Vue API 自动导入，并包含自定义 `ReplaceThisPluginType` 插件，用于注入组件类型常量。

## 关键开发约定

- 后端使用 Lombok、MyBatis-Plus `ServiceImpl` 和 Snowflake ID。
- 所有实体通过 `delFlag` 字段实现软删除。
- 审计字段自动填充，包括 `createDate`、`updateDate`、`createUser`、`updateUser`。
- 前端 API 模块统一导出对象方法，例如 `dataSourceApi.list()`、`datasetApi.run()`。
- HTTP 请求统一通过 `_common/_request.ts` 发起，该封装负责注入认证 token 和处理错误响应。
- 系统内置三类用户角色：`manager`、`developer`、`sharer`，后端通过 Shiro `@RequiresRoles` 校验。
- 密码在前端使用 RSA 加密传输，后端解密后处理。
- 默认用户配置位于 `application-base.yml`，包含 `admin`、`developer`、`sharer`。
- 修改图表配置结构时，要同步检查 `install.ts` 默认值、`index.vue` 渲染逻辑和 `panel/index.vue` 面板控件。
- 修改任何前端样式前，必须先阅读并遵循 `docs/design/DESIGN.md`；交付前检查是否存在硬编码颜色、`--dr-*` 颜色变量、Element Plus 内部样式覆盖、`!important`、负字距等违规项。
- 后端 Java 代码严禁捕获异常后不打印。禁止空 `catch`，也禁止 `catch` 后只忽略、兜底、返回或重新抛出但不记录异常栈。应引入 `org.apache.commons.lang3.exception.ExceptionUtils`，在 `catch` 中先执行 `log.error(ExceptionUtils.getStackTrace(e));`（测试代码可使用 `System.err.println(ExceptionUtils.getStackTrace(e));`），再保留原有其他处理逻辑不变。
- 修改前端组件后，至少运行 `npm run type-check`；涉及格式或样式规范时运行 `npm run lint`。
- 修改后端核心逻辑后，至少运行相关单测；涉及 Java `catch` 块时，必须额外运行 `mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test` 检查异常捕获日志规范；无法运行时需要在交付说明中明确原因。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Spring Boot 3.5.10、MyBatis-Plus 3.5.12、Shiro 2.0.6 Jakarta、JJWT 0.12.6、Knife4j 4.5.0、FastJSON 2、Caffeine |
| 前端 | Vue 3.5、TypeScript 5.9、Vite 7、Element Plus、ECharts 6、Pinia 3、vue-grid-layout-v3、vue3-moveable、vue3-selecto |
| 数据库 | H2、MySQL、PostgreSQL |

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/001-add-mqtt-datasource/plan.md
<!-- SPECKIT END -->
