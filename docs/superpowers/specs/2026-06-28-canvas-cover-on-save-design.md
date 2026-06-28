# 设计器主动保存时生成画布封面设计

## 背景

DataRoom 的页面和大屏都有封面字段。当前页面基础信息存储在 `dr_page`，其中 `thumbnail` 用于封面；设计态、预览态、发布态配置快照存储在 `dr_page_stage`，其中 `page_config` 保存画布配置。

现在页面设计器和大屏设计器的主动保存只更新 `dr_page_stage.page_config`，不会自动更新 `dr_page.thumbnail`。用户希望在设计器中手动保存时自动截取画布作为封面，同时要兼容跨域图片、iframe、视频、WebGL 等内容导致浏览器截图失败的情况。封面是附加信息，不应影响设计内容保存。

## 目标

- 页面设计器和大屏设计器中，除前端自动历史备份外，所有用户主动保存都尝试生成并更新封面。
- 封面生成成功时，先上传封面资源，再更新 `dr_page.thumbnail`，然后继续保存设计配置。
- 封面生成、上传或更新失败时，继续保存设计配置，并提示用户封面更新失败。
- 自动历史备份保持现有行为，只保存配置历史，不截图、不上传、不更新封面。
- 后端新增一个只负责按页面编码更新封面的窄接口，避免把页面基础信息更新混入设计配置保存接口。

## 非目标

- 不改变页面生命周期：创建、设计、预览、发布流程保持不变。
- 不把封面写入 `dr_page_stage.page_config` 或历史快照。
- 不要求跨域资源一定能被截图；跨域失败是预期降级场景。
- 不新增后端截图能力。
- 不改变资源存储模型，封面截图继续复用素材上传能力。

## 受影响范围

### 前端

- `dataRoomFront/src/dataRoom/page-designer/PageDesigner.vue`
- `dataRoomFront/src/dataRoom/visual-screen-designer/VisualScreenDesigner.vue`
- `dataRoomFront/src/dataRoom/designer/utils/` 下新增或扩展主动保存封面工具函数
- `dataRoomFront/src/dataRoom/page/api.ts`
- `dataRoomFront/src/dataRoom/resource/api.ts` 或现有资源上传辅助工具

### 后端

- `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/PageController.java`
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/dto/` 新增封面更新 DTO
- 必要时补充页面接口测试

## 方案

采用“前端尽力更新封面 + 后端窄接口”的方案。

主动保存入口先执行封面更新流程。封面流程内部捕获并返回失败状态，不向外抛出阻断性异常。随后继续调用现有 `savePageWithHistoryBackup()` 保存设计配置和手动保存历史。

自动历史备份入口不调用封面流程，继续只调用 `pageApi.historyBackup()`。

## 前端设计

### 封面保存工具

新增一个通用工具函数，例如 `captureAndUpdatePageThumbnail()`，职责是：

1. 接收 `pageCode`、截图目标节点、资源名称等参数。
2. 等待 `nextTick()`，确保最新画布状态已渲染。
3. 使用项目已有依赖 `html-to-image` 将目标节点转换为 PNG Blob。
4. 调用 `/dataRoom/resource/upload` 上传 Blob，资源类型为图片，资源名称可使用页面编码和时间戳生成。
5. 从上传响应中读取资源访问地址，优先使用 `url`，缺失时使用 `path`。
6. 调用 `pageApi.updateThumbnail({ code, thumbnail })` 更新 `dr_page.thumbnail`。
7. 返回成功或失败结果；失败结果包含失败阶段和原始错误，供控制台打印和用户提示。

工具函数只处理封面，不保存设计配置。

### 主动保存包装

两个设计器的主动保存入口改为：

1. 获取当前页面配置 payload。
2. 调用封面保存工具尝试更新封面。
3. 调用现有 `savePageWithHistoryBackup()` 保存 `dr_page_stage.page_config` 并创建手动保存历史。
4. 根据设计配置保存结果显示现有成功或失败提示。
5. 如果设计配置保存成功但封面失败，显示警告提示。

封面失败提示建议：

- 截图失败：`保存成功，但封面截取失败`
- 上传或封面接口失败：`保存成功，但封面更新失败`

如果设计配置保存失败，则仍以设计配置失败为主，不显示“保存成功”类提示。

### 自动历史备份边界

自动历史备份控制器当前通过 `historyAutoBackupController` 调用 `pageApi.historyBackup()`。该路径保持不变，不调用封面保存工具。

### 保存并离开

保存并离开属于用户主动保存，需要调用同一套主动保存逻辑，因此也应尝试封面更新。封面失败时继续保存配置；配置保存成功后继续离开流程。

### 截图节点

页面设计器截取实际承载网格布局的画布区域，避免把顶部工具栏和右侧配置面板截入封面。可优先在模板中为目标节点增加 `ref`，避免依赖全局 `id` 查询。

大屏设计器截取 `.canvas-content` 对应的实际画布内容节点，避免把标尺、缩放控件、选区框和工具栏截入封面。截图应面向真实画布内容尺寸，不以当前视口裁剪结果作为封面。

### 截图限制

浏览器 DOM 截图可能因以下内容失败或不完整：

- 跨域图片未配置 CORS
- iframe 内容
- video 当前帧
- WebGL canvas 或第三方 canvas
- 字体、图片尚未加载完成

这些场景不做强制修复，统一走失败降级：继续保存配置并提示封面更新失败。

## 后端设计

### 新增接口

```text
POST /dataRoom/page/updateThumbnail
Content-Type: application/json

{
  "code": "PAGE_CODE",
  "thumbnail": "/dataRoom/resource/file/1800000000000000001"
}
```

响应：

```json
{
  "code": 0,
  "msg": "success",
  "data": true
}
```

### DTO

新增 `PageThumbnailUpdateDto`：

- `code`: 页面编码，必填。
- `thumbnail`: 封面地址，必填。

### 接口行为

- 需要 `DEVELOPER` 角色。
- 校验 `code` 不能为空。
- 校验 `thumbnail` 不能为空。
- 使用 `LambdaUpdateWrapper<PageEntity>` 按 `PageEntity.code` 更新：
  - `thumbnail`
  - `updateDate`
- 如果没有更新到记录，返回错误或抛出业务异常，提示页面不存在。
- 不更新 `dr_page_stage`。
- 不修改页面名称、页面类型、页面状态、目录编码等其他字段。

### 异常日志

如果新增或修改 `catch` 块，必须按项目约定记录完整异常栈：

```java
log.error(ExceptionUtils.getStackTrace(e));
```

本接口本身可以通过参数校验和业务异常表达错误，不需要为了正常校验场景新增 `catch`。

## 数据流

主动保存成功路径：

1. 用户点击保存，或在离开确认框选择保存并离开。
2. 前端截取当前设计器画布，得到 PNG Blob。
3. 前端上传 PNG 到素材库。
4. 后端保存资源文件和资源记录，返回资源访问地址。
5. 前端调用页面封面接口更新 `dr_page.thumbnail`。
6. 前端调用现有页面配置保存接口更新 `dr_page_stage.page_config`。
7. 前端调用现有历史备份接口创建手动保存历史。
8. 前端提示保存成功。

封面失败路径：

1. 用户触发主动保存。
2. 截图、上传或封面接口任一步失败。
3. 前端记录错误并保存失败阶段。
4. 前端继续调用现有页面配置保存和手动历史备份。
5. 如果配置保存成功，前端提示保存成功但封面更新失败。

自动历史备份路径：

1. 自动备份定时器或触发器判断需要备份。
2. 前端调用现有历史备份接口。
3. 不截图、不上传、不更新 `dr_page.thumbnail`。

## 用户反馈

主动保存时不需要新增额外弹窗。沿用 `ElMessage`：

- 配置保存成功且封面成功：`保存成功`
- 配置保存成功但封面截图失败：`保存成功，但封面截取失败`
- 配置保存成功但封面上传或更新失败：`保存成功，但封面更新失败`
- 配置保存成功但历史备份失败，同时封面也失败时，优先提示现有历史备份失败；封面错误写入控制台，避免连续多个警告干扰用户。
- 配置保存失败：沿用现有失败行为，不因为封面成功而提示保存成功。

## 测试与验证

### 前端

- 运行 `npm run type-check`。
- 如果改动涉及样式或模板结构明显调整，运行 `npm run lint`。
- 手动验证页面设计器顶部保存：
  - 封面成功上传并更新页面列表封面。
  - 配置仍正常保存。
- 手动验证大屏设计器顶部保存：
  - 截图不包含工具栏、右侧面板、标尺和缩放控件。
  - 配置仍正常保存。
- 手动验证保存并离开：
  - 会尝试更新封面。
  - 封面失败不阻断离开流程中的配置保存。
- 手动验证自动历史备份：
  - 不产生资源上传请求。
  - 不调用封面更新接口。
- 手动验证跨域图片或 iframe 导致截图失败：
  - 配置保存成功。
  - 用户看到封面失败提示。

### 后端

- 运行页面接口相关测试。
- 至少验证新增接口：
  - `code` 为空时返回业务错误。
  - `thumbnail` 为空时返回业务错误。
  - 页面不存在时返回业务错误。
  - 页面存在时只更新 `thumbnail` 和 `updateDate`。
- 如果实现过程中新增或修改 Java `catch` 块，额外运行：

```bash
mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

## 风险与处理

- 截图库无法完整渲染某些组件：按失败降级处理，不阻断保存。
- 封面上传成功但配置保存失败：封面可能已更新但设计配置未保存。该状态可接受，因为封面是附加信息，且配置保存失败会明确反馈给用户。
- 频繁主动保存产生较多封面资源：首版不做资源去重或旧封面清理，后续如需要可增加后台清理策略。
- 大屏缩放和平移影响截图：应截取真实画布内容节点，而不是视口容器。

## 交付标准

- 页面设计器和大屏设计器的主动保存都会尝试更新封面。
- 保存并离开会尝试更新封面。
- 自动历史备份不会更新封面。
- 封面失败不会阻断设计配置保存。
- 新增后端封面接口只更新 `dr_page.thumbnail`，不影响 `dr_page_stage`。
- 前端类型检查通过。
