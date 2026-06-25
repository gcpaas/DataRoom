# UI 契约：新增 MQTT 数据源

## 数据源管理页面

**入口**: `dataRoomFront/src/dataRoom/data-source/index.vue`

**新增类型卡片**:

- 类型 key: `mqtt`
- 展示名称: `MQTT`
- 描述: 面向 MQTT Broker 的订阅型消息数据源

**新增/编辑表单字段**:

- 名称
- 服务地址
- 端口
- Client ID
- 认证方式：无认证、账号密码、TLS 单向认证
- 用户名：账号密码模式显示
- 密码：账号密码模式显示，编辑时留空表示不更新
- TLS CA 证书或证书内容：TLS 单向认证模式显示，编辑时留空表示不更新
- 默认主题
- 连接超时时间

**交互要求**:

- 必填项随认证方式切换。
- 连接测试结果显示成功、超时、认证失败、主题无权限、配置错误或服务不可达。
- 敏感字段编辑后不在详情中明文回显。
- 样式只控制外层布局、间距、滚动区域；Element Plus 表单控件使用默认样式和 props。

## 数据集管理页面

**入口**: `dataRoomFront/src/dataRoom/dataset/index.vue`

**新增数据集类型**:

- 类型 key: `mqtt`
- 展示名称: `MQTT`
- 编辑器: `dataRoomFront/src/dataRoom/dataset/components/MqttEditor.vue`

**编辑器字段**:

- MQTT 数据源选择器：只展示 `dataSourceType=mqtt` 的数据源。
- 订阅主题。
- 缓存条数：默认 5。
- JSON 字段映射：字段名、JSON 路径、字段类型、描述。
- 空数据策略。

**预览行为**:

- 尚未收到消息时显示空数据状态。
- 收到匹配 JSON 消息后，预览表格展示缓存内最新消息映射结果。
- 非 JSON 或字段解析失败时显示可操作错误提示。

## 图表绑定与运行态

**入口**:

- `dataRoomFront/src/dataRoom/hooks/use-dr-component/index.ts`
- `dataRoomFront/src/dataRoom/hooks/use-realtime-dataset/index.ts`
- `dataRoomFront/src/dataRoom/dataset/streaming-dataset.ts`

**行为要求**:

- MQTT 数据集在图表刷新时通过现有 `datasetApi.run4Chart()` 获取缓存结果。
- 若实现将 MQTT 标记为 streaming dataset，需保证运行态订阅启动/停止与页面生命周期一致。
- 图表收到空数组或错误状态时不崩溃，遵循现有组件数据处理方式。

## 设计规范约束

- 颜色、边框、文本、状态色只使用 Element Plus CSS 变量。
- 禁止新增 `--dr-*` 私有颜色变量。
- 禁止硬编码十六进制、RGB、HSL 或颜色英文名。
- 禁止 `:deep(.el-*)`、`::v-deep`、`/deep/`、`>>>`、全局 `.el-*` 选择器和 `!important` 覆盖 Element Plus 内部样式。
- 表单组件通过 Element Plus props 表达尺寸、状态和密度。
