# 大屏设计器缩放偏好设计

## 背景

大屏设计器路由为 `/dataRoom/visualScreenDesigner/:pageCode`。当前编辑器底部已经有浮动缩放工具栏，包含：

- 最佳缩放图标
- 减号按钮
- 范围滑块
- 加号按钮
- 当前缩放百分比文本

现有 `basicConfig.size.zoom` 字段已经用于预览页运行态缩放，继续保持该语义，不复用为编辑器缩放偏好。

## 目标

将用户上次选择的编辑器缩放偏好保存到 `pageConfig.basicConfig`：

- 如果用户选择“最佳”，下次打开设计器时根据当前 `canvas-viewport` 重新计算最佳缩放。
- 如果用户选择固定缩放值，下次打开设计器时直接使用保存的固定值。
- 持久化沿用现有页面保存流程。缩放交互只更新前端配置对象，点击保存后才写入后端。

## 字段设计

在 `VisualScreenPageBasicConfig` 根级新增字段：

```ts
zoom?: {
  mode: 'best' | 'fixed'
  value: number
}
```

默认值：

```ts
zoom: {
  mode: 'best',
  value: 100,
}
```

字段含义：

- `mode: 'best'`：打开设计器时根据当前可见 `canvas-viewport` 重新计算最佳缩放。
- `mode: 'fixed'`：打开设计器时直接应用 `value` 固定缩放百分比。
- `value`：工具栏展示的整数百分比，例如 `80` 表示 80%。

该字段只用于编辑器，不改变预览页行为。

## 交互设计

底部缩放工具栏中的最佳缩放图标变成可选中模式控件。

当 `basicConfig.zoom.mode === 'best'`：

- 最佳缩放图标展示选中态。
- 打开设计器后，等待 `canvas-viewport` 具备可用尺寸，再计算最佳缩放。
- 视口尺寸变化或左右面板显示状态变化时，由于可视区域变化，可以重新计算最佳缩放。

用户点击最佳缩放图标时：

- 设置 `basicConfig.zoom.mode = 'best'`。
- 立即计算并应用最佳缩放。
- 将 `basicConfig.zoom.value` 更新为当前展示百分比。

用户执行任意固定缩放操作时：

- 点击减号
- 点击加号
- 拖动范围滑块
- Ctrl + 滚轮缩放

设计器设置：

```ts
basicConfig.zoom.mode = 'fixed'
basicConfig.zoom.value = currentDisplayedZoomPercent
```

普通滚轮平移不修改 `basicConfig.zoom`。

## 数据流

打开页面：

1. `pageApi.getPageConfig(code, 'design')` 返回 `pageConfig`。
2. 设计器将 `pageConfig.basicConfig` 与默认配置合并，覆盖范围包括 `background`、`size`、`zoom`、`timers`。
3. 等 `canvas-viewport` 尺寸可用后，应用保存的缩放偏好：
   - `best`：根据当前可见视口计算最佳缩放。
   - `fixed`：应用 `zoom.value`。

编辑过程中：

- 用户缩放操作同时更新 `designerViewport` 和 `basicConfig.zoom`。
- 视口尺寸同步继续负责规范化 pan 和尺寸。
- 如果当前 `mode` 为 `best`，可视区域变化时重新计算最佳缩放。

保存时：

- 继续使用现有 `onSave()` 发送 `pageConfig.basicConfig`。
- 不新增 API。
- 不引入自动保存。

## 兼容设计

已有页面可能不存在 `basicConfig.zoom`。

兜底规则：

- 缺失 `zoom`：使用 `{ mode: 'best', value: 100 }`。
- `mode` 非法：使用 `best`。
- `value` 缺失或非法：使用 `100`。
- `value` 超出范围：通过现有缩放 clamp helper 限制到合法范围。

已有 `basicConfig.size.zoom` 保持不变，继续控制预览页缩放。

## 实现建议

建议抽小 helper，让初始化和用户交互共用同一套规则：

- 规范化持久化的设计器缩放配置
- 应用保存的设计器缩放偏好
- 手动缩放后标记当前缩放为 fixed
- 点击最佳缩放后标记当前缩放为 best

这样可以避免 `VisualScreenDesigner.vue` 在多个事件处理函数中分散维护持久化逻辑。

## 测试设计

新增或更新聚焦测试：

- `viewport.spec.ts`：如果缩放偏好 helper 放在 viewport 附近，覆盖配置规范化逻辑。
- `visualScreenDesignerZoom.spec.ts`：断言：
  - 默认配置存在 `basicConfig.zoom`。
  - 最佳缩放图标有选中态绑定。
  - 最佳缩放操作写入 `mode: 'best'`。
  - 手动缩放操作写入 `mode: 'fixed'`。
  - 打开页面时能区分应用保存的 `best` 和 `fixed`。

运行：

```bash
npx tsx dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.spec.ts
npx tsx dataRoomFront/src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts
cd dataRoomFront && npm run type-check
```

如果模板或状态样式改动较多，也运行：

```bash
cd dataRoomFront && npm run build
```
