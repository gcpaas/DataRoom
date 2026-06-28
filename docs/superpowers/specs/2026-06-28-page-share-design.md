# 大屏与页面分享功能设计

## 背景

DataRoom 当前已有页面和大屏的预览路由，并通过 `dataRoomToken` 参数写入前端认证 token。后端现有页面配置和数据集运行接口主要依赖 Shiro 角色校验，其中发布态页面访问和数据集运行可由 `sharer` 角色访问。

本功能为页面和大屏增加分享能力。一个页面维护一条分享配置，用户可生成分享链接，设置启用状态、过期时间和 IP 白名单。访问者通过分享链接匿名访问发布态页面，本质上由分享 token 获得受限的 `sharer` 权限。

## 已确认需求

- 页面和大屏均支持分享。
- 一个页面同一时间只维护一条分享配置。
- 分享链接复用现有预览路由，并追加 `dataRoomToken` 参数。
- 分享 token 使用固定前缀 `share_`。
- 分享 token 存入数据库时保留完整 token，包括 `share_` 前缀。
- 分享 token 不进入默认 JWT 或单点登录解析逻辑。
- 访问分享链接时只展示发布态页面。
- 可以先创建分享配置再发布页面；未发布时访问分享链接返回页面未发布或不存在。
- 支持启用/停用分享开关；停用后仍允许复制链接，但访问校验失败。
- 支持过期时间快捷操作：永不过期、一个月、一周、一天。
- 空过期时间表示永不过期。
- 过期时间早于当前时间时不允许保存。
- 支持 IP 白名单，一行一个；空白名单表示不限制。
- IP 白名单支持精确 IP 和 CIDR。
- 客户端 IP 提取与白名单校验统一由 Service 实现。
- 暂不限制分享 token 只能访问当前页面引用的数据集。

## 推荐方案

采用“分享记录表 + 分享 token 认证为受限 `sharer`”方案。

新增页面分享记录表保存分享 token、启用状态、过期时间和 IP 白名单。前端分享链接继续使用现有预览路由，后端在 Shiro 认证阶段识别 `share_` 前缀 token，将其作为数据库可撤销凭证校验，通过后授予 `sharer` 角色。

该方案的优势：

- 复用现有页面和大屏预览路由。
- 复用现有 `dataRoomToken` 前端注入机制。
- 复用已有 `@RequiresRoles(SHARER)` 接口权限。
- 支持关闭分享、刷新 token、更新过期时间和 IP 白名单后立即生效。
- 不污染现有 JWT 和单点登录 token 体系。

## 数据模型

新增表 `dr_page_share`，每个页面最多一条分享记录，用 `page_code` 唯一约束表达“一页一分享配置”。

建议字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 主键，沿用项目实体基类 |
| `page_code` | 页面编码，唯一 |
| `page_type` | 页面类型，用于生成普通页面或大屏预览路由 |
| `token` | 分享 token，格式为 `share_` + 随机不可猜测字符串 |
| `enabled` | 是否启用分享 |
| `expire_time` | 过期时间，`null` 表示永不过期 |
| `ip_whitelist` | IP 白名单文本，一行一个精确 IP 或 CIDR |
| 审计字段 | 沿用 `BaseEntity` 的创建、更新、用户和软删除字段 |

生成和保存规则：

- 首次生成分享链接时创建分享记录并生成 token。
- 已存在分享记录时，用户点击生成分享链接需要确认是否让历史分享链接失效。
- 用户选择“是”时，重新生成 `share_` token，旧链接立即失效。
- 用户选择“否”时，保留原 token，只更新启用状态、过期时间和 IP 白名单。
- 关闭分享只更新 `enabled=false`，不清空 token 和限制条件。
- 删除页面时同步删除或软删除分享记录，避免孤儿分享链接。

过期快捷项由前端填值：

- 永不过期：`expireTime=null`
- 一天：当前时间加 1 天
- 一周：当前时间加 7 天
- 一个月：当前时间加 1 个月

## 后端认证设计

`ShiroAuthFilter` 继续从请求中读取 `dataRoomToken`。

`ShiroAuthRealm` 增加分享 token 分流：

1. token 以 `share_` 开头：
   - 使用完整 token 查询 `dr_page_share`。
   - 校验分享记录存在。
   - 校验 `enabled=true`。
   - 校验 `expire_time` 未过期，`null` 表示永不过期。
   - 校验页面存在且为已发布态。
   - 使用 `ClientAccessService` 获取客户端 IP 并匹配 IP 白名单。
   - 校验通过后构造分享身份 Principal，并只授予 `sharer` 角色。
2. token 不以 `share_` 开头：
   - 完全走现有 JWT 或单点登录认证逻辑。

分享 token 不剥离前缀后进入默认逻辑，也不作为 JWT 解析。

首版分享身份不限制只能访问当前页面引用的数据集。它能访问已有 `sharer` 角色允许访问的接口，例如发布态页面配置和数据集运行接口，但不能访问 `developer` 或 `manager` 接口。

## 客户端 IP 与白名单校验

新增 `ClientAccessService`，统一提供两个能力：

- 获取客户端 IP。
- 校验客户端 IP 是否匹配白名单。

客户端 IP 提取顺序：

1. `X-Forwarded-For` 的第一个 IP。
2. `X-Real-IP`。
3. `request.getRemoteAddr()`。

白名单规则：

- 空白名单表示不限制。
- 每行一个规则。
- 支持精确 IPv4、精确 IPv6。
- 支持 IPv4 CIDR、IPv6 CIDR。
- 保存分享配置时校验格式；任一行不合法则返回明确行号。

## 后端接口设计

新增接口建议放在 `/dataRoom/page/share` 下，均要求 `developer` 角色。

### 查询分享配置

`GET /dataRoom/page/share/detail/{pageCode}`

用途：

- 打开分享弹窗时获取当前页面分享配置。
- 如果不存在分享记录，返回默认配置。

返回内容建议包含：

- `pageCode`
- `pageType`
- `enabled`
- `expireTime`
- `ipWhitelist`
- `token`
- `shareUrl`
- `created`

### 保存或生成分享链接

`POST /dataRoom/page/share/save`

请求字段：

- `pageCode`
- `enabled`
- `expireTime`
- `ipWhitelist`
- `refreshToken`

处理规则：

- 如果不存在记录，创建记录并生成 token。
- 如果存在记录且 `refreshToken=true`，重新生成 token。
- 如果存在记录且 `refreshToken=false`，保留原 token。
- 保存前校验过期时间不能早于当前时间。
- 保存前校验 IP 白名单格式。
- 保存成功后返回最新分享配置和完整分享链接。

分享链接由后端返回，避免前端漏掉部署上下文路径。链接形态：

普通页面：

```text
{originAndContext}/#/dataRoom/pagePreviewer/published/{pageCode}?dataRoomToken={shareToken}
```

大屏：

```text
{originAndContext}/#/dataRoom/visualScreenPreview/published/{pageCode}?dataRoomToken={shareToken}
```

## 前端交互设计

入口：

- 页面列表卡片的更多菜单增加“分享”。
- 非目录页面显示分享入口。
- 点击后打开“分享页面”弹窗，并调用分享详情接口。

弹窗字段：

- 启用分享：`el-switch`。
- 过期时间：快捷按钮“永不过期 / 一个月 / 一周 / 一天”加日期时间选择器。
- IP 白名单：多行文本，一行一个精确 IP 或 CIDR；空表示不限制。
- 分享链接：只读输入框加复制按钮。
- 底部按钮：取消、生成分享链接。

生成逻辑：

- 当前页面没有分享 token 时，直接保存并生成 token。
- 当前页面已有分享 token 时，点击“生成分享链接”弹确认框：
  - 文案：“该页面已存在分享链接，是否让历史分享链接失效？”
  - 选择“是”：`refreshToken=true`，后端生成新 token。
  - 选择“否”：`refreshToken=false`，后端保留原 token，但更新启用状态、过期时间和 IP 白名单。
- 保存成功后刷新弹窗中的分享链接地址，并提示生成成功。

复制逻辑：

- 使用浏览器 Clipboard API。
- 没有链接时禁用复制按钮。
- 复制成功提示“已复制”。
- 分享开关关闭时仍允许复制链接；访问时由后端根据启用状态校验。

样式约束：

- 使用 Element Plus 默认组件样式。
- 业务样式只控制外层布局、间距、滚动区域和链接区域宽度。
- 不覆盖 `.el-*` 内部样式。
- 不使用硬编码颜色。
- 不新增 `--dr-*` 私有颜色变量。
- 不使用 `!important`。
- 字距保持 `0`。

## 错误处理

访问分享链接时，后端按顺序校验并返回明确错误：

- `share_` token 查不到记录：分享链接不存在或已失效。
- 分享记录已停用：分享链接已停用。
- 分享链接已过期：分享链接已过期。
- 页面不存在、被删除或未发布：页面未发布或不存在。
- IP 白名单不为空且当前 IP 不匹配：当前 IP 不允许访问该分享链接。

管理侧保存时：

- IP 白名单格式错误：返回具体行号。
- 过期时间早于当前时间：返回“过期时间不能早于当前时间”。
- 空过期时间表示永不过期。
- 允许未发布页面创建分享配置和链接；访问时再校验页面是否已发布。

## 测试计划

后端测试：

- 分享 token 生成时带 `share_` 前缀。
- 分享 token 入库保留完整 token。
- 刷新 token 后旧 token 不再可用。
- 不刷新 token 时 token 不变，但启用状态、过期时间和 IP 白名单更新生效。
- 关闭分享后访问失败，但链接仍可查询和复制。
- 过期时间为空时永不过期。
- 过期时间早于当前时间时保存失败。
- 未发布页面允许生成分享配置，但访问失败。
- 页面发布后同一分享链接可访问发布态页面。
- 精确 IPv4、精确 IPv6、IPv4 CIDR、IPv6 CIDR 匹配。
- 空白名单放行。
- `X-Forwarded-For`、`X-Real-IP`、`remoteAddr` 取值顺序。
- 分享 token 在 Shiro 中获得 `sharer` 角色。
- 分享 token 不能访问 `developer` 或 `manager` 接口。

前端验证：

- 运行 `npm run type-check`。
- 涉及弹窗样式时运行 `npm run lint`。
- 手工验证普通页面和大屏两种分享链接。
- 手工验证复制链接、启用/停用、过期时间、IP 白名单、刷新 token、保留 token 更新配置。

后端命令：

- 修改后端核心逻辑后运行相关 Maven 测试。
- 如果涉及 Java `catch` 块，额外运行：

```bash
mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

## 非目标

- 首版不支持一个页面生成多条分享链接。
- 首版不限制分享 token 只能访问当前页面引用的数据集。
- 首版不提供独立分享路由。
- 首版不把分享 token 做成 JWT。
- 首版不新增单独“关闭分享”按钮，关闭能力由弹窗中的启用开关表达。
