# DataRoom Issue-Driven 需求计划

日期：2026-05-24

状态：需求规划草案，未进入开发计划

## 背景

本需求计划基于 Gitee DataRoom 当前 open issue 和本仓库源码现状整理。目标不是立即开发，而是形成后续版本应该优先补齐的功能路线，兼顾三类目标：

- Vue3 版本尽快达到可试用、可集成、可演示的稳定状态。
- 回应社区 issue 中反复出现的高频诉求。
- 补齐企业交付所需的数据源、权限、分享、安全、迁移和模板能力。

本次抓取 `https://gitee.com/gcpaas/DataRoom/issues` 的 open issue 共 95 条。源码观察以当前工作区为准，重点检查了后端页面、数据源、数据集、鉴权和前端设计器、组件注册、联动、定时器模块。

## 当前判断

DataRoom Vue3 版已经具备主要骨架：Spring Boot 3/JDK 17 后端、Vue 3/Vite 前端、页面生命周期、PageDesigner、VisualScreenDesigner、组件自动注册、数据源管理、数据集执行、资源管理、用户角色和分享者 token。

但 issue 暴露的主要矛盾不是“缺少单个组件”，而是四类基础能力还不够完整：

- 运行态稳定性不足：嵌入、部署、跨域、旧路径兼容和预览发布链路仍容易出错。
- 交互数据链路不足：筛选器、组件联动、全局变量、定时刷新、多级联动还没有形成稳定的标准模型。
- 交付迁移能力不足：大屏导入导出、跨页面复制、封面/资源打包、分享密码和过期时间缺失。
- 组件生态仍在迁移：表格、Tab、轮播、混合图、地图、3D、格式化和空状态等需求较集中。

因此后续版本不宜先铺开大量新组件，而应先稳住联动、刷新、部署和导入导出这些基础能力。

## 优先级模型

本计划使用以下排序规则：

- 阻塞程度：影响启动、保存、预览、发布、嵌入、刷新和联动的需求优先。
- issue 热度：重复出现的主题优先，例如联动、刷新、导入导出、数据源扩展、Tab/表格增强。
- 企业价值：权限、分享、数据源、迁移、模板、Docker 和集成场景优先。
- 架构依赖：会被多个功能复用的底座优先，例如动作系统、数据刷新协议、导入导出包模型。

## 需求路线

### P0：Vue3 可交付稳定性

目标：让当前 Vue3 版能够稳定启动、设计、预览、发布、嵌入和刷新，解决“能不能用”的问题。

#### R0.1 组件联动与参数传递标准化

Issue 信号：

- [I9QKTY 组件联动无法正常使用](https://gitee.com/gcpaas/DataRoom/issues/I9QKTY)
- [I8VA8R 组件联动的值未覆盖数据集配置的参数值](https://gitee.com/gcpaas/DataRoom/issues/I8VA8R)
- [I7V9YX 新增筛选器及多级组件联动](https://gitee.com/gcpaas/DataRoom/issues/I7V9YX)
- [IAZDV6 选择框和 ECharts 组件联动报错](https://gitee.com/gcpaas/DataRoom/issues/IAZDV6)
- [IB2GW2 桑基图和下拉框/输入框联动失败](https://gitee.com/gcpaas/DataRoom/issues/IB2GW2)

源码现状：

- `dataRoomFront/src/dataroom-packages/hooks/use-canvas-inst/index.ts` 已有 `fillDatasetParams`、`triggerChartBehavior`、`updateGlobalVariableValue`。
- `dataRoomFront/src/dataroom-packages/_components/BehaviorConfigDialog.vue` 已有行为动作配置界面。
- `dataRoomFront/src/dataroom-packages/components/type/ChartAction.ts` 当前动作结构较简单，主要支持 `code`。

需求范围：

- 定义标准动作类型：更新全局变量、刷新目标组件、刷新多个组件、显示/隐藏组件、传递事件参数、执行自定义脚本。
- 筛选类组件，包括 Select、Radio、Input，触发后应能更新变量并刷新绑定组件。
- 支持一对多、多级联动：组件 A 触发变量，组件 B 刷新后可继续触发组件 C。
- 数据集参数优先级明确：联动参数高于组件默认参数，组件固定值高于数据集默认值。
- 行为执行失败时提供可见错误提示和控制台上下文，避免静默失败。

验收口径：

- Select/Input/Radio 能联动柱状图、折线图、表格、地图等至少 5 类组件。
- 同一筛选条件可以刷新多个目标组件。
- 参数为空、默认值、URL 变量、静态变量、联动变量都有明确行为。
- 预览态和发布态表现一致。

#### R0.2 定时刷新闭环

Issue 信号：

- [IBH76Y 大屏设置定时器刷新图表，页面图表数据无刷新](https://gitee.com/gcpaas/DataRoom/issues/IBH76Y)
- [I9CLF2 轮播表不支持定时刷新数据](https://gitee.com/gcpaas/DataRoom/issues/I9CLF2)
- [I90M3C 接口定时刷新配置](https://gitee.com/gcpaas/DataRoom/issues/I90M3C)
- [ICDAZZ 数据集管理的定时刷新在哪里](https://gitee.com/gcpaas/DataRoom/issues/ICDAZZ)

源码现状：

- `dataRoomFront/src/dataroom-packages/hooks/use-timer-manager/index.ts` 已有定时器管理，但主要执行 code action。
- `dataRoomFront/src/dataroom-packages/hooks/use-dr-component/index.ts` 已有 `autoRefreshData`，组件挂载时会自动拉取数据。
- `VisualScreenDesigner` 和预览页已有 `timers` 配置加载。

需求范围：

- 定时器配置支持选择目标组件和动作类型，不要求用户必须写代码。
- 定时器动作支持刷新单个组件、刷新组件组、刷新全页数据、更新变量后刷新。
- 防止定时器重复启动、页面卸载未清理、编辑态/预览态状态不一致。
- HTTP 数据集、关系型数据集、表格类组件、轮播类组件都纳入刷新验证。

验收口径：

- 发布页面打开后，定时器能稳定触发网络请求并更新画面。
- 切换页面、关闭预览、重新进入设计器后没有重复定时请求。
- 刷新失败不影响其他组件刷新。

#### R0.3 部署、嵌入与旧路径兼容

Issue 信号：

- [IBMTK4 V3 前端页面在开发环境下 iframe 引入后一直刷新](https://gitee.com/gcpaas/DataRoom/issues/IBMTK4)
- [I9NK2E docker 部署](https://gitee.com/gcpaas/DataRoom/issues/I9NK2E)
- [IBAI7F 跨域配置不生效](https://gitee.com/gcpaas/DataRoom/issues/IBAI7F)
- [IB18UL 跨域问题](https://gitee.com/gcpaas/DataRoom/issues/IB18UL)
- [ICYZGC 启动后设计器报 No handler found for GET /bigScreen/design/page](https://gitee.com/gcpaas/DataRoom/issues/ICYZGC)
- [I8NVDS 集成到项目 Error: No loader specified](https://gitee.com/gcpaas/DataRoom/issues/I8NVDS)

需求范围：

- 明确前后端部署路径、`base`、API 地址、静态资源路径和 Hash 路由规则。
- 提供 Docker 默认可运行配置和健康检查说明。
- 兼容旧版 `/bigScreen/*` 常见入口，至少给出重定向或明确错误页。
- iframe 嵌入模式不应触发无限刷新；支持只读预览和发布态嵌入。
- 跨域配置应覆盖开发、同域部署、前后端分离部署三类场景。

验收口径：

- 本地开发、Docker、后端静态资源托管三种模式可按文档启动。
- iframe 引入发布页面不会重复刷新。
- 旧入口访问时不会出现无上下文 404。

#### R0.4 数据集编辑与保存稳定性

Issue 信号：

- [ICUMDO 请确保数据集 SQL 加工脚本不为空且运行通过](https://gitee.com/gcpaas/DataRoom/issues/ICUMDO)
- [IARLSB 集成模式数据集新增原始数据保存报错](https://gitee.com/gcpaas/DataRoom/issues/IARLSB)
- [I8VFRH 清空数据处理脚本后配置未被清除](https://gitee.com/gcpaas/DataRoom/issues/I8VFRH)
- [IAQ1F1 集成 RuoYi 后 JSON 解析 Bad control character](https://gitee.com/gcpaas/DataRoom/issues/IAQ1F1)

需求范围：

- 数据集保存前验证应区分必填脚本、可选脚本和已清空脚本。
- 数据处理脚本清空后，应同步清理派生字段、提示字段和旧缓存。
- 数据集 JSON 序列化应处理换行、控制字符、脚本内容和嵌入场景。
- 保存失败时返回明确字段级错误，而不是泛化提示。

验收口径：

- JSON、HTTP、关系型、Excel 数据集都能新增、测试、保存、再次编辑。
- 清空脚本后预览字段恢复到原始字段。
- 报错信息能定位到数据源、SQL、参数、脚本或序列化问题。

### P1：数据能力扩展

目标：把 DataRoom 从“可连常见数据源”推进到“能覆盖国产化、文件、时序、离线和复用查询”的数据平台基础。

#### R1.1 数据源适配矩阵

Issue 信号：

- [ICCD42 达梦数据库适配](https://gitee.com/gcpaas/DataRoom/issues/ICCD42)
- [ICSUXL 数据源支持达梦数据库吗](https://gitee.com/gcpaas/DataRoom/issues/ICSUXL)
- [I7VXMV 建议增加 Hive 数据源](https://gitee.com/gcpaas/DataRoom/issues/I7VXMV)
- [I7VBE4 TDengine 支持计划](https://gitee.com/gcpaas/DataRoom/issues/I7VBE4)
- [I8W9RS 支撑库增加更多数据库](https://gitee.com/gcpaas/DataRoom/issues/I8W9RS)
- [IAYMY9 SQLServer 2008 分页不支持](https://gitee.com/gcpaas/DataRoom/issues/IAYMY9)

源码现状：

- 后端 `DataSourceType` 已有 MySQL、PostgreSQL、Oracle、Doris、SQLServer、Excel。
- 前端数据源管理界面已有 MySQL、PostgreSQL、Oracle、Doris、SQLServer、Excel 类型卡片和编辑器。

需求范围：

- 第一批新增达梦，作为国产化优先项。
- 第二批评估 Hive 和 TDengine，分别面向离线数仓和时序场景。
- 建立数据源适配清单：驱动、连接 URL、测试连接、SQL 方言、分页能力、字段类型映射。
- SQLServer 2008 作为兼容项处理分页差异。

验收口径：

- 新增数据源能完成连接测试、数据集执行、字段识别和组件绑定。
- 每个数据源有最小可用示例和错误排查说明。

#### R1.2 文件数据集与 Excel 能力补齐

Issue 信号：

- [IAY877 增加本地文件作为数据源或数据集，例如 xlsx、csv、txt](https://gitee.com/gcpaas/DataRoom/issues/IAY877)

源码现状：

- README 说明支持 Excel 文件。
- 后端已有 `ExcelDataSourceController`、`ExcelDataSourceService`、`ExcelDatasource`。
- 前端已有 Excel 数据源编辑器和查看数据入口。

需求范围：

- 明确 Excel 当前能力边界：支持 xlsx/csv，不支持 txt 时给出说明。
- 将“文件数据源”和“文件数据集”的产品概念统一，避免用户误解。
- 增加文件更新策略：覆盖导入、追加导入、重新解析字段。
- 允许文件数据源被导入导出包引用。

验收口径：

- 用户能从数据源管理完成文件上传、字段确认、数据预览、创建数据集、绑定组件。
- 重新上传文件后字段变更有提示，不静默破坏已有组件。

#### R1.3 数据缓存、共享请求与视图复用

Issue 信号：

- [I9IQME HTTP 请求的数据集缓存问题](https://gitee.com/gcpaas/DataRoom/issues/I9IQME)
- [I8Z3RS 相同组件、相同接口只访问一次接口对组件赋值](https://gitee.com/gcpaas/DataRoom/issues/I8Z3RS)
- [I8BBW3 有没有创建视图的功能](https://gitee.com/gcpaas/DataRoom/issues/I8BBW3)
- [I9GQDU 多组件的多组合数据库联查](https://gitee.com/gcpaas/DataRoom/issues/I9GQDU)

需求范围：

- 数据集运行请求按 `datasetCode + paramMap` 生成缓存键。
- 页面级请求合并：同一轮刷新中相同请求只发一次，多组件复用响应。
- HTTP 数据集参数替换不能污染原始配置。
- 提供“视图”或“复用查询”概念，允许多个大屏复用同一查询结果定义。

验收口径：

- 相同请求在同一刷新周期只发一次。
- 动态参数连续变化时不会使用上一次替换后的静态 URL 或 body。
- 视图变更后能明确影响哪些页面或组件。

#### R1.4 数据处理器、下钻和动态样式

Issue 信号：

- [I7YYY0 新增数据字段处理器](https://gitee.com/gcpaas/DataRoom/issues/I7YYY0)
- [I7XVKC 建议添加数据下钻功能](https://gitee.com/gcpaas/DataRoom/issues/I7XVKC)
- [I8V4ZF 数据样式设置动态更改，数据监听器](https://gitee.com/gcpaas/DataRoom/issues/I8V4ZF)
- [I8SECF 大数值千分位设置](https://gitee.com/gcpaas/DataRoom/issues/I8SECF)

需求范围：

- 组件数据绑定增加字段处理器：字段重命名、格式化、聚合、排序、过滤、提取 key/value。
- 增加下钻动作：点击数据项，携带当前行/点位参数，打开目标组件或弹层。
- 动态样式规则按字段值驱动，例如阈值颜色、行高亮、图标切换。
- 常见格式化能力配置化：千分位、单位、小数位、百分比、空值替代。

验收口径：

- 用户无需写代码即可完成常用数值格式化。
- 下钻能从图表点、表格行、地图区域传递参数到目标组件。
- 动态样式在预览态和发布态一致。

### P2：设计器与交付能力

目标：让大屏从“设计出来”升级为“可迁移、可复用、可分享、可管控”。

#### R2.1 大屏导入导出与项目包

Issue 信号：

- [I7X9BJ 大屏导入导出，最好同时导入导出数据源与数据集](https://gitee.com/gcpaas/DataRoom/issues/I7X9BJ)
- [I90M2I 大屏配置导入导出以及大屏项目打包导出](https://gitee.com/gcpaas/DataRoom/issues/I90M2I)
- [IB27B5 增加代码导出](https://gitee.com/gcpaas/DataRoom/issues/IB27B5)
- [ID94Z0 MinIO 存储下复制功能无法同步复制封面图片](https://gitee.com/gcpaas/DataRoom/issues/ID94Z0)

源码现状：

- 后端已有 `dr_page` 和 `dr_page_stage`，页面配置集中存储在 `PageStageEntity.pageConfig`。
- `PageEntity` 有 `thumbnail` 字段，但目前未形成跨存储复制/导出规则。

需求范围：

- 定义大屏导出包结构：页面元数据、页面配置、资源文件、封面、数据集、数据源引用、版本号。
- 导入时支持重命名、覆盖、生成新 code、数据源敏感信息处理。
- 资源存储适配本地和对象存储，封面必须随包复制。
- 代码导出先作为低优先级实验需求，不与配置包导出混淆。

验收口径：

- 从 A 环境导出的页面包能导入 B 环境并正常预览。
- 资源缺失、数据源缺失、版本不兼容时有明确提示。
- 导出包不明文包含数据库密码。

#### R2.2 跨页面复制粘贴与组件复用

Issue 信号：

- [I80DIN 跨浏览器窗口的组件复制粘贴](https://gitee.com/gcpaas/DataRoom/issues/I80DIN)
- [I8W2QK 能否把系统中的组件也变成 JSON 配置](https://gitee.com/gcpaas/DataRoom/issues/I8W2QK)
- [I7VA1Q G2Plot、ECharts 自定义业务组件提议](https://gitee.com/gcpaas/DataRoom/issues/I7VA1Q)

需求范围：

- 支持选中组件复制为 JSON 配置，粘贴到同页面或其他页面。
- 跨浏览器窗口先支持同域 localStorage/clipboard，跨域作为后续能力。
- 复制内容应包含组件 props、dataset 绑定、行为配置、子组件、资源引用。
- 粘贴后生成新 id，避免与原组件冲突。

验收口径：

- 同页面、同域不同页面均可复制粘贴组件。
- 粘贴后图层、位置、数据绑定和交互配置可继续编辑。

#### R2.3 分享、权限和访问控制

Issue 信号：

- [I8ARF3 大屏增加分享功能，设置分享密码和链接过期时间](https://gitee.com/gcpaas/DataRoom/issues/I8ARF3)
- [I8CDAA 大屏分组、资源库分组权限控制](https://gitee.com/gcpaas/DataRoom/issues/I8CDAA)

源码现状：

- 后端已有 `manager`、`developer`、`sharer` 三类角色。
- `TokenService.createSharerToken` 目前只生成通用 sharer token，没有页面范围、密码或过期策略。

需求范围：

- 页面级分享链接支持启用/停用、访问密码、过期时间、访问次数或访问范围。
- 分享 token 应绑定 pageCode 和状态，只能访问允许的发布态页面。
- 页面目录、资源目录增加角色或用户范围控制。
- 分享访问日志作为可选增强项。

验收口径：

- 未发布页面不能被分享访问。
- 过期、密码错误、停用链接都有明确提示。
- sharer 不能访问数据源管理、数据集管理、设计器编辑接口。

#### R2.4 设计器辅助体验

Issue 信号：

- [I9TMDR 前端设计器标尺信息不能保存](https://gitee.com/gcpaas/DataRoom/issues/I9TMDR)
- [I8VMAZ 撤销操作后设置颜色未恢复](https://gitee.com/gcpaas/DataRoom/issues/I8VMAZ)
- [I8RH9E 横向磁吸不生效](https://gitee.com/gcpaas/DataRoom/issues/I8RH9E)
- [I893HX 框选不跟手/位置不对](https://gitee.com/gcpaas/DataRoom/issues/I893HX)
- [I80DDQ 界面增加快捷键说明](https://gitee.com/gcpaas/DataRoom/issues/I80DDQ)
- [I8V30L 主页增加亮色主题切换](https://gitee.com/gcpaas/DataRoom/issues/I8V30L)

需求范围：

- 设计态保存标尺和辅助线，预览态不展示。
- 撤销/重做必须同步右侧面板状态，而不只是画布状态。
- 修复磁吸、框选、缩放白线等基础操作体验。
- 增加快捷键帮助入口。
- 主题切换纳入统一主题方案，不在业务组件内硬编码颜色。

验收口径：

- 重新进入设计器后，标尺和辅助线恢复。
- 撤销后画布和属性面板值一致。
- 快捷键说明覆盖复制、粘贴、删除、撤销、保存、预览等常见操作。

### P3：组件生态持续迭代

目标：按高频场景补齐组件，而不是一次性堆数量。

源码现状：

- 前端组件通过 `components/**/install.ts` 自动发现和注册。
- 当前工作区有 29 个组件目录，包括柱状图、折线图、面积图、地图、表格、指标卡、输入、选择、单选、Tab、3D 模型等。

#### R3.1 图表组件增强

Issue 信号：

- [IBJ3DN 折柱图](https://gitee.com/gcpaas/DataRoom/issues/IBJ3DN)
- [I8MKDN 柱状折线混合图](https://gitee.com/gcpaas/DataRoom/issues/I8MKDN)
- [IB2LOY 分组柱状图](https://gitee.com/gcpaas/DataRoom/issues/IB2LOY)
- [IAIWSC 甘特图组件](https://gitee.com/gcpaas/DataRoom/issues/IAIWSC)
- [IAJTVK 地图支持 2.5D](https://gitee.com/gcpaas/DataRoom/issues/IAJTVK)
- [I7WSPH 增加 3D 组件](https://gitee.com/gcpaas/DataRoom/issues/I7WSPH)
- [I93VMV 折线图 y 轴数值相同连线不显示](https://gitee.com/gcpaas/DataRoom/issues/I93VMV)
- [I8VLAK 面积图从 0 基准线填充未生效](https://gitee.com/gcpaas/DataRoom/issues/I8VLAK)

需求范围：

- 优先补折柱混合图和分组柱状图，因为实现成本低、复用面广。
- 甘特图、2.5D 地图、3D 组件作为专题组件，需要单独设计数据结构和性能边界。
- 修复已有图表配置不生效问题优先于新增同类图表。

#### R3.2 容器、Tab 和轮播

Issue 信号：

- [IB6M4D Tab 多面板，每个 Tab 面板支持拖入组件](https://gitee.com/gcpaas/DataRoom/issues/IB6M4D)
- [I9T988 图表 Tab 页支持选择表格](https://gitee.com/gcpaas/DataRoom/issues/I9T988)
- [I8YJZ4 图表 Tab 页加入表格、排名表、轮播表](https://gitee.com/gcpaas/DataRoom/issues/I8YJZ4)
- [I8JLAF 图表 Tab 页自动切换](https://gitee.com/gcpaas/DataRoom/issues/I8JLAF)
- [I8JLII 增加图表轮播功能](https://gitee.com/gcpaas/DataRoom/issues/I8JLII)
- [I8R28J 图表与 Tab 距离可调](https://gitee.com/gcpaas/DataRoom/issues/I8R28J)

需求范围：

- 将 Tab 从“切换数据/图表”升级为“容器组件”，支持子组件区域。
- 自动切换、轮播、间距配置作为 Tab/容器的通用能力。
- 表格类组件应能作为 Tab 内容。

#### R3.3 表格和展示细节

Issue 信号：

- [I8VIHM 增加轮播表配置](https://gitee.com/gcpaas/DataRoom/issues/I8VIHM)
- [I80CTN 轮播表无缝滚动](https://gitee.com/gcpaas/DataRoom/issues/I80CTN)
- [I8JLCN 表格和轮播表自定义行样式](https://gitee.com/gcpaas/DataRoom/issues/I8JLCN)
- [I8FX2B 空数据占位符](https://gitee.com/gcpaas/DataRoom/issues/I8FX2B)
- [IBZ5G2 指标卡默认值跟随数据](https://gitee.com/gcpaas/DataRoom/issues/IBZ5G2)
- [I9OGZ5 图表指标支持最小基数设置](https://gitee.com/gcpaas/DataRoom/issues/I9OGZ5)

需求范围：

- 表格支持空状态、行样式规则、滚动模式、刷新后保持滚动策略。
- 指标类组件支持默认值、空值、格式化、最小基数等配置。
- 所有组件应遵循统一数据绑定和空数据策略。

#### R3.4 控制组件与逆向控制

Issue 信号：

- [IBMEAX 控制功能组件，实现对显示数据的逆向控制](https://gitee.com/gcpaas/DataRoom/issues/IBMEAX)
- [I8QF57 对图表组件添加事件监听功能](https://gitee.com/gcpaas/DataRoom/issues/I8QF57)
- [I8XEA0 外链组件增加组件联动功能](https://gitee.com/gcpaas/DataRoom/issues/I8XEA0)

需求范围：

- 控制组件用于向后端接口发送命令，例如开关、滑块、按钮、表单提交。
- 需要安全边界：权限、确认、审计、接口白名单、失败回滚提示。
- 外链组件应能接收联动参数，例如 URL query 或 postMessage。

验收口径：

- 控制组件必须显式配置目标接口和确认策略。
- 发布态无权限用户不能执行控制动作。

### P4：文档、模板和社区体验

目标：减少重复提问，让用户能自己完成常见配置。

Issue 信号：

- [I7X46X 图表数据对接缺少数据格式提示和文档](https://gitee.com/gcpaas/DataRoom/issues/I7X46X)
- [I84IS8 演示环境增加各种功能演示模板](https://gitee.com/gcpaas/DataRoom/issues/I84IS8)
- [IA4Y27 3.0 版本时间](https://gitee.com/gcpaas/DataRoom/issues/IA4Y27)
- [I8J3OA 什么时候更新 3.0](https://gitee.com/gcpaas/DataRoom/issues/I8J3OA)
- [IDFT2U 是否会有 Vue3 版本](https://gitee.com/gcpaas/DataRoom/issues/IDFT2U)

需求范围：

- 每个组件提供示例数据结构、字段绑定说明、最小可运行数据集。
- 演示环境增加模板：参数联动、定时刷新、地图、表格、导入导出、分享。
- README 增加 Vue3 版路线状态、已支持能力、未完成能力、推荐分支说明。
- issue 模板引导用户填写版本、部署方式、复现配置和截图。

验收口径：

- 新用户能按文档完成一个数据源、一个数据集、一个联动大屏。
- 高频 issue 能在文档中找到对应说明或路线状态。

## 版本建议

### 近期版本：Vue3 可用性里程碑

范围：

- R0.1 组件联动
- R0.2 定时刷新
- R0.3 部署嵌入
- R0.4 数据集保存稳定性
- P4 中的 README 状态更新

目标：

- 对外宣布 Vue3 版进入“可试用”。
- 演示环境稳定展示联动、刷新、发布和嵌入。

### 中期版本：数据能力里程碑

范围：

- 达梦数据源
- 文件数据集边界整理
- 数据缓存/共享请求
- 数据处理器和格式化
- 基础下钻

目标：

- 支持更多企业数据接入。
- 降低组件数据绑定和格式化门槛。

### 后续版本：交付能力里程碑

范围：

- 大屏导入导出包
- 跨页面复制粘贴
- 分享密码和过期时间
- 页面/资源目录权限
- 模板中心

目标：

- 支持跨环境迁移和企业交付。
- 支持团队协作和权限控制。

### 长期版本：组件生态里程碑

范围：

- 折柱混合图、分组柱状图
- Tab 容器、多面板、图表轮播
- 轮播表增强
- 2.5D 地图、3D 组件、甘特图
- 控制组件

目标：

- 持续补齐行业大屏常见组件。
- 形成组件规范和示例数据生态。

## 暂不纳入本阶段的事项

- 不立即进入具体开发任务拆分。
- 不承诺所有历史 2.x issue 都在 Vue3 中复刻修复。
- 不优先做大规模 UI 重设计，除非影响当前需求可用性。
- 不优先做代码导出为完整独立应用，先完成配置包导入导出。
- 不把控制组件作为普通展示组件处理，必须先设计权限和安全边界。

## 风险与依赖

- 联动和定时刷新是多个需求的共同前置，若不先稳定，Tab、下钻、控制组件都会反复返工。
- 数据源扩展会引入驱动许可证、方言、分页和类型映射风险，需要逐个验证。
- 导入导出涉及资源、数据源敏感信息和版本兼容，必须先定义包结构。
- 分享能力涉及安全边界，不能只靠前端隐藏入口。
- 组件生态需求很多，必须按组件规范逐个补齐默认值、字段映射、面板和示例数据。

## 成功指标

- Vue3 版 README 不再只强调“未开发完成”，而能列出稳定可用能力和限制。
- open issue 中联动、刷新、部署、导入导出、数据源扩展等高频主题可以被路线覆盖。
- 新用户能在 30 分钟内完成数据源、数据集、组件绑定、联动和发布预览。
- 一个大屏能从开发环境导出并导入到另一环境，资源和封面完整。
- 发布态页面能通过受控分享链接访问，并遵守密码和过期时间。

## 需求评审问题

后续评审建议重点确认：

- P0 是否作为下一个版本唯一主线，避免同时开太多组件需求。
- 达梦、Hive、TDengine 的先后顺序是否符合目标用户。
- 导入导出包是否需要覆盖数据源敏感信息迁移，还是只迁移引用。
- 分享链接是否需要访问日志和访问次数限制。
- Tab 容器和图表轮播是否合并为一个容器体系设计。
