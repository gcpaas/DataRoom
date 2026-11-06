# 素材库目录与素材上传

仅在新建素材目录、上传素材或组件需要引用素材地址时读取；流程与确认规则遵循主技能。

## 通用契约

- 素材上传仅提供 HTTP 直连接口（multipart 表单，服务端已开放 MCP 令牌认证），与网页上传同链路、落库格式一致。
- 新建素材目录有两条等价通道：MCP 工具 `insertResourceDirectory`（参数明确、推荐）与 HTTP `/resource/insert`。
- 不编造素材查询、编辑、删除、封面更新等 MCP 工具，不编造上传类 MCP 工具。
- 素材不返回 `code`，一律使用 `id`：目录 `id` 即子级素材/子目录的 `parentCode`。
- 根目录显式传 `parentCode: "root"`；其他目录使用真实目录 `id`。新增不填写主键、审计或删除标记字段。

## 新建素材目录（MCP 工具）

调用 `insertResourceDirectory`：

| 参数 | 必填 | 说明 |
|---|---|---|
| `name` | 是 | 目录名称 |
| `parentCode` | 否 | 上级目录编码，根目录传 `root`，不传默认 `root` |
| `remark` | 否 | 备注 |

- 返回目录 `id`（响应 `data` 字段），后续上传素材或建子目录时作为 `parentCode` 传入。
- 目录类型由工具固定为 `directory`，无需也无法传入文件相关字段。

## HTTP 直连上传

素材文件上传（本地文件或客户端已下载到本地的直链文件）走 HTTP multipart 直连。

**认证**：请求头 `Authorization: Bearer {MCP令牌}`。令牌即连接 MCP 服务所用令牌（`drmcp_` 开头），由用户在系统「MCP 令牌」管理中创建；令牌属主必须具备 developer 角色，否则接口返回 403。

**地址**：`{MCP服务基地址}/dataRoom/resource/upload`。MCP 服务基地址即 MCP 端点去掉末尾 `/mcp`，例如 MCP 端点为 `http://host:8081/dataRoom/mcp` 时，上传地址为 `http://host:8081/dataRoom/dataRoom/resource/upload`（注意控制器含字面量 `/dataRoom` 前缀，与 context-path 叠加形成双前缀）。

**请求**：`POST`，`Content-Type: multipart/form-data`，字段与网页上传一致：

| 字段 | 必填 | 说明 |
|---|---|---|
| `file` | 是 | 素材文件本体（multipart 文件部分） |
| `cover` | 否 | 封面文件 |
| `name` | 否 | 素材显示名称，缺省取文件名 |
| `resourceType` | 否 | `image` / `video` / `model`，缺省按扩展名推断 |
| `parentCode` | 否 | 所属目录编码，根目录传 `root` |
| `remark` | 否 | 备注 |
| `id` | 否 | 留空为新增；不要传值（本技能不提供编辑） |

- 类型按扩展名推断，支持：图片 `jpg/jpeg/png/gif/bmp/svg/webp`，视频 `mp4/avi/mov/wmv/flv/webm/m3u8/m4v`，模型 `glb/gltf/obj/stl`；文件无扩展名或扩展名不在上表时必须显式传 `resourceType`，否则按图片处理。
- 响应为 `Resp<ResourceEntity>` JSON，`data` 含 `id`、`name`、`resourceType`、`url`（访问地址）、`size`（KB）、`originalName`；3D 模型自动写入 `config.format`。
- `url` 可直接用于图片、视频、3D 模型等组件的素材地址配置；具体组件字段以 `getComponentConfig` 返回的配置定义为准。
- 单文件不超过 100MB（服务端 multipart 上限）；仅 `upload`、`insert` 两个接口开放 MCP 令牌认证，其余素材接口（list、delete、update 等）仍需网页登录，不尝试调用。

**目录（HTTP 通道）**：`POST {MCP服务基地址}/dataRoom/resource/insert`，请求头同上，JSON body 为 `{ "name": ..., "resourceType": "directory", "parentCode": ..., "remark": ... }`，响应 `data` 为目录 `id`。

## 使用约束

- 无素材查询工具：已存在目录的编码由用户在对话中提供，新建目录后以返回值为准，不猜测目录编码。
- 上传前与用户确认：文件来源（本地文件或需先下载的直链）、素材类型与目标目录；确认后再调用，避免错误入库。
- 参考图复刻时，图标、插画、装饰图按参考图坐标裁切后作为独立文件上传，不使用参考图整图切片充当单个图标；上传后以返回的 `url` 供图片组件引用。
- 同一文件重复上传会产生重复素材，不做查重；需要复用时使用先前返回的素材记录，不重复上传。
- 上传失败如实反馈原因（认证失败、超过大小限制、类型不支持等），不反复重试。
- 上传成功后仅报告素材名称、类型与返回的 `id`、`url`；不提供编辑、删除能力，录入错误需用户在素材库页面自行处理。
