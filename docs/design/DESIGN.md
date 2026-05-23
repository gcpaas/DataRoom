# DataRoom 设计系统

## 1. 视觉主题与氛围

DataRoom 是一个可视化大屏设计器，它的界面必须成为用户创作工作的安静、精准舞台。设计语言继承 Stripe 对表格式数据的克制与纪律，并统一使用 Element Plus 的内置主题变量。最终效果应是一个仅支持浅色模式的系统，像精密仪器一样干净、自信、严格对齐。

画布、文本、边框、填充、状态色和交互色都必须来自 Element Plus CSS 变量。界面层次通过清晰的边框、留白和背景分区表达。不要使用装饰性渐变，用户的大屏作品才是色彩来源，工具本身应保持中性。界面中每一个像素都用于框定创作，不与创作内容竞争。

字体使用 Inter（开源、可变字体）。所有文本字距保持 `0`，非表单数字和指标展示使用 `font-feature-settings: "tnum"`，这传达出它是一个数据优先的设计工具。只使用三种字重：400（阅读）、500（交互）、600（强调）。

**关键特征：**

- 应用界面颜色全部使用 Element Plus CSS 变量：仅浅色模式，不提供深色主题
- 主题色不允许业务自定义，主色、状态色、文字色、边框色和背景色均使用 Element Plus 内置变量
- 使用明确的 CSS 边框、分割线和留白组织界面层次
- 所有字号的字距保持 `0`，不使用负字距
- 非表单类数字、指标、尺寸展示使用等宽数字（`tnum`）
- 状态徽标使用胶囊形（9999px）并搭配 Element Plus 状态色变量
- 产品 UI 是主角：设计器画布就是首屏核心，界面 chrome 退后

## 2. 色彩体系与角色

### Element Plus 变量

禁止定义 DataRoom 私有颜色 token，例如 `--dr-blue`、`--dr-gray-*`、`--dr-success`。禁止在业务代码和规则文档中写入十六进制、RGB、HSL、颜色英文名等硬编码颜色。需要颜色时只能引用 Element Plus 暴露的 CSS 变量。

| Element Plus 变量 | 角色 |
|-------------------|------|
| `--el-color-primary` | 主交互色、激活态、选中态 |
| `--el-color-primary-light-9` | 主色浅背景、选中行、激活面板 |
| `--el-color-primary-light-8` | 主色浅边界、弱强调边框 |
| `--el-color-success` | 成功状态、在线标识、正向指标 |
| `--el-color-success-light-9` | 成功徽标背景 |
| `--el-color-warning` | 警告状态、需要关注 |
| `--el-color-warning-light-9` | 警告徽标背景 |
| `--el-color-danger` | 错误状态、破坏性操作、离线标识 |
| `--el-color-danger-light-9` | 错误徽标背景 |
| `--el-text-color-primary` | 主文本、标题 |
| `--el-text-color-regular` | 正文文本、常规说明 |
| `--el-text-color-secondary` | 次级文本、辅助说明 |
| `--el-text-color-placeholder` | 占位符、弱提示 |
| `--el-text-color-disabled` | 禁用文本、禁用图标 |
| `--el-border-color` | 标准边框、分割线 |
| `--el-border-color-light` | 弱边框、轻分割线 |
| `--el-border-color-lighter` | 极弱分割线、分组线 |
| `--el-bg-color` | 基础背景、内容背景 |
| `--el-bg-color-page` | 页面背景、设计器工作区背景 |
| `--el-fill-color-light` | 面板背景、侧边栏背景 |
| `--el-fill-color-lighter` | hover 背景、弱填充 |
| `--el-fill-color-extra-light` | 占位背景、极弱填充 |
| `--el-fill-color-blank` | 空白表面、卡片表面 |

### 禁止项

- 禁止新增或继续使用任何 `--dr-*` 颜色变量。
- 禁止在业务组件、配置面板、全局样式和设计规则中写硬编码色值。
- 禁止把某个业务色值包装成局部变量绕过规则。
- 禁止为了单个页面、单个面板或单个组件覆盖 Element Plus 主题色。

## 3. 字体规则

### 字体族

- **主字体**：`Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **等宽字体**：`'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace`
- **OpenType 特性**：全局使用 `"liga"`；数字、指标、尺寸单元格使用 `"tnum"`

### 层级

| 角色 | 字号 | 字重 | 行高 | 字距 | 用途 |
|------|------|------|------|------|------|
| Display Hero | 48px | 600 | 1.10 | 0 | 页面主视觉标题、空状态 |
| Display Section | 36px | 600 | 1.15 | 0 | 区块标题、主要功能标题 |
| Heading Large | 28px | 600 | 1.20 | 0 | 面板标题、对话框标题 |
| Heading Medium | 24px | 600 | 1.25 | 0 | 卡片标题、子区块 |
| Heading Small | 20px | 600 | 1.30 | 0 | 组件标题、分组标签 |
| Body Large | 16px | 400 | 1.60 | 0 | 功能说明、导语 |
| Body | 14px | 400 | 1.57 | 0 | 标准阅读文本、非 Element Plus 自定义标签 |
| Body Medium | 14px | 500 | 1.57 | 0 | 导航链接、强调标签 |
| Body Small | 12px | 400 | 1.50 | 0 | 辅助文本、说明、元数据 |
| Metric Display | 32px | 600 | 1.00 | 0 | KPI 数字、图表数值（使用 `tnum`） |
| Metric Body | 14px | 500 | 1.40 | 0 | 表格单元格、尺寸文本（使用 `tnum`） |
| Button | 14px | 500 | 1.00 | 0 | 非 Element Plus 自定义按钮文字 |
| Caption | 12px | 500 | 1.33 | 0 | 标签、徽标、微标签 |
| Mono Code | 13px | 400 | 1.50 | 0 | 代码编辑器、JSON 预览、表达式 |

### 原则

- **字距保持稳定**：所有文本使用 `letter-spacing: 0`。不要为标题、指标或中文文本设置负字距，避免影响可读性和组件库默认排版。
- **三种字重，角色严格**：400（正文/阅读）、500（UI/交互）、600（标题/强调）。界面中不要使用 bold（700）。
- **数据使用等宽数字**：非表单场景中展示像素尺寸（1920x1080）、图表值、数据集数量或坐标的文本，应使用 `font-feature-settings: "tnum"`。Element Plus 表单组件内部样式不单独覆盖。
- **Element Plus 表单组件不套用本表覆盖**：按钮、输入框、数字输入框、选择器、下拉框、折叠面板、表单文本等组件使用 Element Plus 默认字体、字号、行高、间距、边框和交互状态。
- **代码上下文使用等宽字体**：数据集表达式、JSON 预览、Groovy 脚本和 SQL 编辑器使用 13px JetBrains Mono。

## 4. 组件样式

### Element Plus 表单组件

按钮、输入框、数字输入框、选择器、下拉框、折叠面板、表单文本等表单组件必须使用 Element Plus 默认样式。业务组件只负责语义、布局和数据绑定，不负责重写组件库内部视觉。

**适用组件**

- `el-button`、`el-button-group`
- `el-input`、`el-input-number`、`el-textarea`
- `el-select`、`el-option`、`el-dropdown`、`el-cascader`
- `el-form`、`el-form-item`、`el-text`、`el-link`
- `el-radio`、`el-checkbox`、`el-switch`、`el-slider`
- `el-collapse`、`el-collapse-item`
- `el-date-picker`、`el-time-picker`、`el-color-picker`

**使用规则**

- 使用 Element Plus 提供的 `type`、`size`、`disabled`、`clearable`、`collapse`、`label-width`、`inline` 等 props 表达状态和密度。
- 业务样式只控制外层布局，例如宽度、排列、间距、滚动区域、面板容器，不修改 `.el-*` 内部结构。
- 不在业务组件中重写表单组件的颜色、边框、圆角、字号、行高、高度、内边距、hover、focus、disabled、placeholder 或下拉弹层样式。
- 禁止使用 `:deep(.el-*)`、`::v-deep`、`/deep/`、`>>>`、全局 `.el-*` 选择器或 `!important` 覆盖 Element Plus 默认样式。
- 如果默认样式不满足单个业务场景，也不得覆盖主题色变量取值；只能调整外层布局或选用 Element Plus 已有 props 和内置变量。

### 卡片与容器

**标准卡片**

- 背景：`var(--el-fill-color-blank)`
- 边框：`1px solid var(--el-border-color)`
- 圆角：8px
- 内边距：16px（紧凑）/ 24px（标准）
- Hover：边框颜色过渡到 `var(--el-border-color-darker)`

**面板卡片（面板、浮动工具）**

- 背景：`var(--el-fill-color-blank)`
- 边框：`1px solid var(--el-border-color)`
- 圆角：8px
- 内边距：16px–24px

**选中/激活卡片**

- 背景：`var(--el-color-primary-light-9)`
- 边框：`2px solid var(--el-color-primary)`
- 圆角：8px

### 导航

**顶部栏**

- 背景：`var(--el-bg-color)`
- 高度：48px
- 底部分隔：`1px solid var(--el-border-color)`
- Logo 左对齐，导航居中，操作区右对齐
- 链接文字：14px，字重 500，`var(--el-text-color-primary)`
- 激活链接：文字颜色 `var(--el-color-primary)`

**侧边栏（设计器面板）**

- 背景：`var(--el-fill-color-light)`
- 宽度：240px（组件库）/ 300px（属性面板）
- 右侧分隔：`1px solid var(--el-border-color)`
- 分组标题：12px，字重 500，大写，`var(--el-text-color-secondary)`，底部间距 8px

**标签栏**

- 背景：不单独设置背景色，继承所在容器背景
- 标签文字：14px，字重 500；未激活 `var(--el-text-color-secondary)`，激活 `var(--el-text-color-primary)`
- 激活指示器：底部 2px `var(--el-color-primary)`
- 标签内边距：8px 12px
- 标签间距：4px

### 徽标与状态

**胶囊徽标**

- 背景：`var(--el-color-primary-light-9)`
- 文本：`var(--el-color-primary)`
- 内边距：2px 8px
- 圆角：9999px（完整胶囊）
- 字体：12px，字重 500

**状态点**

- 尺寸：6px 圆形
- 颜色：`var(--el-color-success)`（在线/已发布）、`var(--el-color-warning)`（草稿）、`var(--el-color-danger)`（错误）
- 与 12px 说明文字配对使用

### 设计器专属组件

**画布标尺**

- 背景：`var(--el-fill-color-light)`
- 刻度线：`var(--el-border-color)`
- 数字：Mono 10px，`var(--el-text-color-secondary)`，启用 `tnum`
- 当前位置高亮：`var(--el-color-primary)`，透明度 0.15

**组件缩略图（组件库面板中）**

- 背景：`var(--el-fill-color-blank)`
- 边框：`1px solid var(--el-border-color)`
- 圆角：6px
- 内边距：8px
- Hover：边框颜色变为 `var(--el-border-color-darker)` + 轻微 scale(1.02) 过渡
- 选中：`var(--el-color-primary-light-8)` + `var(--el-color-primary-light-9)` 背景

**属性输入行**

- 优先使用 `el-form` / `el-form-item` 组织标签和控件，输入类控件保持 Element Plus 默认样式
- 布局：左侧标签区域 + 右侧控件区域（flex 1），可通过 `label-width` 或外层网格控制宽度
- 间距：只在外层行容器上控制横向间距和行间距
- 分组分隔：1px `var(--el-border-color-lighter)` 分割线 + 12px 垂直间距

**配置面板层级**

- 配置面板使用「一级配置 -> 二级配置 -> 三级配置项」表达信息层级
- 一级配置是主配置域，例如图表配置面板中的「X 轴」「Y 轴」「图例」「系列样式」
- 二级配置是一级配置下的语义子区域，例如「X 轴」下的「轴线」「轴标签」「刻度线」「网格线」
- 三级配置项是最终字段，例如「名称」「颜色」「大小」「偏移量」「旋转角度」
- 二级配置标题可以在右侧放开关，开关只控制该二级配置下的三级配置项显隐，不清空配置值
- 三级配置项必须放在所属二级配置区域内部，不要与二级配置标题平级排列
- 三级配置项使用单列布局，一行只放 1 个配置项
- 三级配置项 label 放在表单组件左侧，配置面板内部字段优先使用 `.dr-config-panel__sub-label`，不要写内联 `style`
- `.dr-config-panel__sub-label` 后面的表单组件必须与 label 处于同一行，不允许换行
- 控件保持 Element Plus 默认样式，业务样式只控制二级容器的缩进、间距、label 宽度和分组关系

**属性折叠面板**

- 使用 `el-collapse` / `el-collapse-item` 默认样式，不覆盖标题、内容区、图标和边框样式
- 外层容器只控制折叠面板与父级属性面板的布局关系
- 不使用 `:deep()` 或全局 `.el-collapse*` 选择器调整内部标题高度、背景、边框、内边距
- 不为单个折叠面板修改主题色；只使用 Element Plus 当前内置变量

**拖拽手柄**

- 颜色：`var(--el-text-color-disabled)`
- Hover：`var(--el-text-color-regular)`
- 尺寸：12px grip 图标
- 光标：`grab` / `grabbing`

**选择框（画布上）**

- 边框：1px dashed `var(--el-color-primary)`
- 填充：`var(--el-color-primary)`，透明度 0.06
- 无圆角

**缩放手柄（画布上）**

- 尺寸：8px 正方形
- 背景：`var(--el-bg-color)`
- 边框：2px solid `var(--el-color-primary)`
- 激活：填充 `var(--el-color-primary)`

## 5. 布局原则

### 间距系统

基础单位：4px

| Token | 值 | 用途 |
|-------|----|------|
| `--space-1` | 4px | 微间距（图标到文字、行内元素） |
| `--space-2` | 8px | 紧凑内边距、相关元素间距 |
| `--space-3` | 12px | 表单行之间的标准间距 |
| `--space-4` | 16px | 卡片内边距（紧凑）、区块间距（较紧） |
| `--space-5` | 20px | — |
| `--space-6` | 24px | 卡片内边距（标准）、面板内部间距 |
| `--space-8` | 32px | 区块间距、弹窗内部间距 |
| `--space-10` | 40px | 大区块间距 |
| `--space-12` | 48px | 页面级区块节奏 |
| `--space-16` | 64px | 主要区块分隔 |

### 栅格与容器

- **页面列表视图**：最大宽度 1200px，居中
- **设计器工作区**：全视口，三列布局（组件库 240px | 画布 flex-1 | 属性面板 300px）
- **画布**：占据工具栏和面板之外的剩余空间，距离边缘 8px
- **组件库网格**：缩略图使用 2 列；列表视图使用 1 列
- **属性面板**：单列，标签-输入行布局

### 留白理念

- **界面 chrome 隐形化**：工具栏、面板和控件使用最少垂直空间，让画布获得最大面积。
- **密集但可呼吸**：属性面板行间距 4px，分组间距 12px。足够适合高频用户，也足够清晰易读。
- **页面视图的区块节奏**：卡片组之间 32px，网格中单个卡片之间 16px。

### 圆角尺度

| Token | 值 | 用途 |
|-------|----|------|
| `--radius-sm` | 4px | 行内代码、小标签、颜色色块 |
| `--radius-md` | 6px | 非 Element Plus 自定义控件、紧凑卡片 |
| `--radius-lg` | 8px | 标准卡片、面板、弹窗 |
| `--radius-xl` | 12px | 重点卡片、图片容器、对话框外壳 |
| `--radius-pill` | 9999px | 徽标、状态胶囊、开关轨道 |

## 6. 设计器画布规则

设计器画布（用户构建仪表盘的位置）有一套区别于应用 chrome 的视觉规则：

**画布背景**

- 默认：`var(--el-bg-color-page)`，用于区分画布和应用 chrome
- 网格点：`var(--el-border-color)`，16px 间隔（PageDesigner 网格模式）
- 无网格：干净背景（VisualScreenDesigner 像素模式）

**画布选择状态**

- 选中组件：1px solid `var(--el-color-primary)` 外框，四角和边中点有 8px 正方形手柄
- 多选：dashed `var(--el-color-primary)` 外框，仅在包围盒上显示手柄
- Hover（未选中）：1px dashed `var(--el-border-color)` 外框

**画布组件 chrome**

- 未选中时组件不渲染额外 chrome
- 选中：细主色外框、缩放手柄、可选旋转手柄
- 拖拽幽灵：0.6 透明度副本

**对齐辅助线**

- 颜色：`var(--el-color-danger)`，高可见性
- 样式：1px solid
- 距离标签：10px mono 字体，使用 `var(--el-color-danger)` 背景、`var(--el-color-white)` 文字、胶囊形

## 7. 应做与禁忌

### 应做

- 颜色全部使用 Element Plus CSS 变量，不新增业务自定义颜色
- Element Plus 表单组件使用默认样式，不覆盖 Element Plus 主题色变量取值
- 非表单类数字展示（尺寸、坐标、图表值、数量）应用 `font-feature-settings: "tnum"`
- 只使用三种字重：400（阅读）、500（交互）、600（强调），不要使用 700/bold
- 所有文本字距保持 `0`，不使用负字距
- 让用户画布作品成为色彩来源，工具本身保持中性
- 非 Element Plus 自定义交互元素需要提供清晰的键盘聚焦样式
- 面板和侧边栏背景使用 `var(--el-fill-color-light)`，通过背景分区、边框和留白建立层次

### 禁忌

- 不要引入深色模式：本系统仅支持浅色模式
- 不要在应用 chrome 上使用彩色背景（只允许用户画布内容有颜色）
- 不要在界面中使用 700（bold）字重
- 不要定义或使用 `--dr-*`、十六进制、RGB、HSL、颜色英文名等自定义颜色
- 不要把 `var(--el-color-primary)` 用于正文文本，它只用于交互元素和激活状态
- 不要给应用 chrome 添加装饰性渐变、图案或插画
- 不要通过业务组件 CSS 修改 Element Plus 的按钮、输入框、数字输入框、选择器、下拉框、折叠面板或表单文本默认样式
- 不要使用 `:deep(.el-*)`、`::v-deep`、`/deep/`、`>>>`、全局 `.el-*` 选择器或 `!important` 覆盖 Element Plus 组件库
- 不要为了单个页面、面板或组件修改 Element Plus 主题色变量取值
- 不要与用户画布内容竞争；设计器 chrome 必须比作品本身更安静

## 8. Agent 提示词指南

### 快速颜色参考

- 主 CTA / 激活：`var(--el-color-primary)`
- 主色浅背景：`var(--el-color-primary-light-9)`
- 背景：`var(--el-bg-color)`
- 页面背景：`var(--el-bg-color-page)`
- 标题文本：`var(--el-text-color-primary)`
- 正文文本：`var(--el-text-color-regular)`
- 弱化文本：`var(--el-text-color-secondary)`
- 边框：`var(--el-border-color)`
- 弱边框：`var(--el-border-color-lighter)`
- 面板背景：`var(--el-fill-color-light)`
- 表单组件：使用 Element Plus 默认样式；不覆盖主题色变量取值

### 示例组件提示词

- “创建一个设计器工具栏：背景使用 `var(--el-bg-color)`，48px 高度，底部使用 1px `var(--el-border-color)` 分隔线。工具图标 20px，颜色 `var(--el-text-color-regular)`，激活工具图标为 `var(--el-color-primary)`，并有 `var(--el-color-primary-light-9)` 的圆形背景。分组分隔线为 1px `var(--el-border-color)` 垂直线，高度 24px。”

- “设计一个组件库面板：背景 `var(--el-fill-color-light)`，宽度 240px。分组标题：12px、字重 500、大写、颜色 `var(--el-text-color-secondary)`。组件缩略图使用 2 列网格：卡片背景 `var(--el-fill-color-blank)`，1px `var(--el-border-color)` 边框，6px 圆角，8px 内边距。Hover：边框颜色加深 + scale(1.02)。选中：`var(--el-color-primary-light-9)` 背景 + `var(--el-color-primary-light-8)` 边界。”

- “构建一个属性输入行：使用 `el-form` / `el-form-item` 组织标签和控件，右侧控件使用 `el-input`、`el-input-number`、`el-select` 等 Element Plus 默认样式。只在外层控制标签宽度、行间距和控件区域布局，不用 `:deep()` 覆盖 `.el-*` 内部样式。”

- “设计一个项目列表页面卡片：背景 `var(--el-fill-color-blank)`，1px `var(--el-border-color)` 边框，8px 圆角。顶部 16:9 缩略图，使用 `var(--el-fill-color-extra-light)` 占位。标题：14px，字重 600，`var(--el-text-color-primary)`。元数据：12px，字重 400，`var(--el-text-color-secondary)`。状态徽标：胶囊形（9999px 圆角），使用 Element Plus 语义色变量背景。”

- “创建一个数据集指标展示：数字使用 32px、字重 600、`var(--el-text-color-primary)`，并启用 `tnum`。下方标签使用 12px、字重 400、`var(--el-text-color-secondary)`。可选趋势箭头：上涨使用 `var(--el-color-success)`，下跌使用 `var(--el-color-danger)`。”

### 迭代指南

1. 字距统一为 `0`，不要为标题、指标或中文文本设置负字距
2. 只使用三种字重：400（阅读）、500（交互）、600（强调）
3. 色彩必须服务于功能：交互/激活使用 `var(--el-color-primary)`，其余使用 Element Plus 文本、边框、填充和背景变量
4. 面板使用 `var(--el-fill-color-light)` 背景；页面背景使用 `var(--el-bg-color)` 或 `var(--el-bg-color-page)`
5. Element Plus 表单组件保持默认样式；不要在业务组件中覆盖 `.el-*` 内部结构
6. 非表单数字展示启用 `tnum`；像素值、坐标、尺寸文本必须对齐
7. 设计器 chrome 在任何时候都应该比用户画布作品更轻
