# VisualScreenDesigner 视口缩放设计

## 背景

VisualScreenDesigner 当前缩放体验以画布左上角为视觉锚点。用户放大时内容看起来从左上角向右下角扩散，缩小时则从右下角收回，不符合设计工具常见的操作习惯。

本设计采用完整 viewport 模型作为后续画布导航底座。本次只交付居中缩放体验，不同时实现右键拖拽画布、空格拖拽画布、迷你地图、缩放到选中组件或适配窗口。

## 目标

- 缩放时固定当前可见画布区域中心，视觉上从屏幕中间向外放大或向内缩小。
- 统一管理缩放和平移状态，为后续右键拖拽画布、空格 + 左键拖拽画布预留能力。
- 支持用户自定义画布尺寸，所有计算基于 `basicConfig.size.width` 和 `basicConfig.size.height`，不写死 1920x1080。
- 保持组件业务数据结构不变，组件坐标仍是相对于画布左上角的逻辑坐标。

## 非目标

- 不实现右键拖拽画布。
- 不实现空格 + 左键拖拽画布。
- 不实现迷你地图、缩放到选中组件、适配窗口、记住视口位置。
- 不修改页面保存数据结构和预览页缩放模式。

## 技术方案

新增独立的 viewport helper，例如 `data-room-ui/src/dataroom-packages/VisualScreenDesigner/viewport.ts`。该模块只处理视口数学，不直接读取 DOM，也不依赖 Vue。

核心模型包含：

- `scale`：当前缩放比例。
- `panX` / `panY`：画布在可见容器中的平移偏移，为后续拖拽画布预留。
- `canvasWidth` / `canvasHeight`：当前用户配置的画布逻辑尺寸。
- `viewportWidth` / `viewportHeight`：设计器画布区域的可见尺寸。

核心函数负责围绕屏幕锚点缩放：

```ts
zoomViewportAroundPoint({
  previousViewport,
  nextScale,
  anchorClientX,
  anchorClientY,
})
```

本次所有缩放入口传入的锚点都是可见容器中心：

```ts
anchorClientX = viewportWidth / 2
anchorClientY = viewportHeight / 2
```

函数需要保证缩放前锚点对应的画布逻辑点，缩放后仍落在同一个屏幕锚点位置。画布渲染层通过 `transform: translate(...) scale(...)` 应用 viewport 状态。

## 组件职责

`VisualScreenDesigner.vue` 负责：

- 读取画布可见容器尺寸。
- 从用户输入得到目标缩放百分比。
- 调用 viewport helper 计算新的 `scale`、`panX`、`panY`。
- 把 viewport 状态绑定到画布容器样式。
- 缩放完成后刷新 Moveable 选中框位置。

viewport helper 负责：

- 缩放百分比和比例转换。
- 缩放边界限制。
- 围绕指定屏幕点缩放。
- 根据画布尺寸和视口尺寸校正 viewport，避免画布在尺寸变化后完全脱离可见区域。

## 交互

本次保留现有缩放入口：

- 底部缩放控件的加号和减号。
- 缩放滑块。
- 画布区域内 `Ctrl + wheel`。

三个入口都调用同一个 viewport 更新流程。缩放后用户当前看到的画布中心内容应尽量保持在屏幕中心，避免左上角锚定造成的视觉漂移。

## 边界处理

- 缩放上限沿用当前设计的 `400%`。
- 缩放下限需要是正数，避免 `scale = 0` 导致矩阵、选框和命中计算异常。实现时可将当前 `0%` 调整为 `1%`，并同步测试和 UI 展示。
- 当用户修改画布宽高时，viewport 需要基于新的 `canvasWidth` / `canvasHeight` 重新校正。
- Moveable 的 `zoom` 使用当前 `scale`，拖拽、缩放、旋转写回的仍是画布逻辑坐标。
- Selecto 框选和右键菜单不能把缩放后的屏幕像素写入组件业务数据。

## 测试

单元测试覆盖 viewport helper：

- 围绕可见区域中心放大后，中心对应的画布逻辑点不变。
- 围绕可见区域中心缩小后，中心对应的画布逻辑点不变。
- 用户自定义画布尺寸下的缩放计算。
- 缩放上下限，尤其是最小正缩放值。
- 画布尺寸变化后的 viewport 校正。

结构测试覆盖 `VisualScreenDesigner.vue`：

- 缩放入口统一使用 viewport helper。
- Moveable 使用当前 viewport scale。
- 缩放后触发选框刷新。
- 画布尺寸来自 `basicConfig.size.width / height`，不存在固定 1920x1080 的缩放边界计算。

交付前至少运行：

```bash
cd data-room-ui
npm run type-check
```

如新增独立 spec，也需要运行对应测试命令。
