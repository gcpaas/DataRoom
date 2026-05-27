# VisualScreenDesigner 空格拖动画布设计

## 背景

`/dataRoom/visualScreenDesigner/:pageCode` 对应的编辑器已经通过 `designerViewport` 管理编辑态画布缩放和平移。当前已有滚轮平移、Ctrl+滚轮缩放、缩放控件、Moveable 组件编辑和 Selecto 框选。新增能力是在编辑态支持按住空格键后使用鼠标左键拖动画布。

## 目标

- 按住空格键时进入画布拖拽预备状态。
- 在画布区域按住空格并按下鼠标左键后，拖动鼠标时画布跟随鼠标移动。
- 空格键优先级高于组件拖拽、组件选中和框选：即使从组件上开始拖动，也拖动画布。
- 松开鼠标左键、释放空格键、窗口失焦或组件卸载时退出拖拽状态。
- 保留现有 Ctrl+滚轮缩放、普通滚轮平移、缩放控件、Moveable 组件编辑和 Selecto 框选行为。

## 非目标

- 不新增新的画布移动工具按钮。
- 不改变预览页行为。
- 不改变页面配置保存结构。
- 不重构现有缩放偏好和视口适配逻辑。

## 设计方案

在 `VisualScreenDesigner.vue` 内增加一个明确的画布拖拽模式，复用现有 `designerViewport.panX/panY` 状态。

核心状态：

- `spacePressed`：记录当前是否按下空格键。
- `isCanvasPanning`：记录当前是否正在通过空格加鼠标左键拖动画布。
- `canvasPanPointerId`：记录当前拖拽指针，用于 pointer capture 和取消。
- `lastCanvasPanPoint`：记录上一次指针位置，用于计算移动增量。

事件入口：

- 在 `window` 上监听 `keydown`、`keyup`、`blur`。
- 在 `.canvas-main` 上监听 `pointerdown`、`pointermove`、`pointerup`、`pointercancel`、`lostpointercapture`。

拖拽规则：

- `keydown` 检测 `event.code === 'Space'`，当事件目标不是输入、文本域、选择器或可编辑内容时，设置 `spacePressed = true` 并阻止页面滚动。
- `pointerdown` 检测 `spacePressed && event.button === 0`，满足时进入 `isCanvasPanning`，记录当前指针坐标并调用 `setPointerCapture`。
- `pointermove` 在拖拽中计算 `clientX/clientY` 差值，按同方向更新 `designerViewport.panX/panY`，使画布像被手抓住一样跟随鼠标移动。
- `pointerup`、`pointercancel`、`lostpointercapture`、`keyup Space`、`window blur` 统一结束拖拽并清理临时状态。

第三方编辑器协同：

- 当 `spacePressed` 或 `isCanvasPanning` 为真时，Moveable 的 `draggable`、`resizable`、`rotatable` 设置为 false。
- 当 `spacePressed` 或 `isCanvasPanning` 为真时，Selecto 禁止通过点击和拖动触发选择。
- Selecto 的 `dragStart` 回调在空格拖拽预备或进行中时主动 `stop()`，作为配置之外的保护。
- 每次拖动画布后调用 `updateMoveableRect()`，保持选中框位置与画布视口一致。

视觉反馈：

- 空格按下时 `.canvas-main` 增加预备态 class，光标显示为 grab。
- 正在拖拽时增加拖拽态 class，光标显示为 grabbing。
- 样式只使用 Element Plus 变量或浏览器内置 cursor，不新增硬编码颜色。

## 边界处理

- 如果焦点在 `input`、`textarea`、`select`、Element Plus 输入控件或 `contenteditable` 元素内，空格保持原有输入语义，不进入画布拖拽模式。
- 如果鼠标按下后释放空格，立即结束画布拖拽，避免继续拦截组件编辑。
- 如果 pointer capture 丢失或浏览器窗口失焦，立即清理拖拽状态。
- 如果按住空格但未按鼠标左键，只改变光标和编辑器交互优先级，不移动画布。

## 测试计划

- 扩展 `viewport.spec.ts` 或新增轻量测试，覆盖鼠标移动增量转换为画布 pan 的方向：鼠标向右移动时 `panX` 增大，鼠标向下移动时 `panY` 增大。
- 扩展 `visualScreenDesignerZoom.spec.ts` 或新增 VisualScreenDesigner 静态断言，确认组件包含空格键监听、pointer 拖拽入口、Moveable 禁用条件和 Selecto 禁用条件。
- 修改完成后运行 `npm run type-check`。
- 如果样式或 lint 规则受影响，运行 `npm run lint`。
