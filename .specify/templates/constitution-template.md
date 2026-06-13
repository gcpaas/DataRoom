# [PROJECT_NAME] 项目宪章
<!-- 示例：Spec Constitution、TaskFlow Constitution 等 -->

## 核心原则

### [PRINCIPLE_1_NAME]
<!-- 示例：一、库优先 -->
[PRINCIPLE_1_DESCRIPTION]
<!-- 示例：每个功能都从独立库开始；库必须自包含、可独立测试、有文档；必须有清晰目标，不能只为组织结构而存在 -->

### [PRINCIPLE_2_NAME]
<!-- 示例：二、CLI 接口 -->
[PRINCIPLE_2_DESCRIPTION]
<!-- 示例：每个库都通过 CLI 暴露能力；文本输入/输出协议：stdin/args → stdout，错误 → stderr；支持 JSON 与人类可读格式 -->

### [PRINCIPLE_3_NAME]
<!-- 示例：三、测试优先（不可协商） -->
[PRINCIPLE_3_DESCRIPTION]
<!-- 示例：TDD 强制执行：先写测试 → 用户确认 → 测试失败 → 再实现；严格遵守 Red-Green-Refactor 循环 -->

### [PRINCIPLE_4_NAME]
<!-- 示例：四、集成测试 -->
[PRINCIPLE_4_DESCRIPTION]
<!-- 示例：以下场景必须重点做集成测试：新增库契约测试、契约变更、服务间通信、共享 Schema -->

### [PRINCIPLE_5_NAME]
<!-- 示例：五、可观测性 / 六、版本与破坏性变更 / 七、保持简单 -->
[PRINCIPLE_5_DESCRIPTION]
<!-- 示例：文本 I/O 保证可调试性；必须有结构化日志；或者：采用 MAJOR.MINOR.BUILD 版本格式；或者：从简单开始，遵循 YAGNI 原则 -->

## [SECTION_2_NAME]
<!-- 示例：附加约束、安全要求、性能标准等 -->

[SECTION_2_CONTENT]
<!-- 示例：技术栈要求、合规标准、部署策略等；若项目存在统一接口约定，应在此明确，例如所有 HTTP 接口统一返回 `{"code": 0, "msg": "success", "data": <T>}` -->

## [SECTION_3_NAME]
<!-- 示例：开发流程、评审流程、质量门禁等 -->

[SECTION_3_CONTENT]
<!-- 示例：代码评审要求、测试门禁、发布审批流程等 -->

## 治理
<!-- 示例：宪章高于其他实践；修订需要文档、审批和迁移计划 -->

[GOVERNANCE_RULES]
<!-- 示例：所有 PR/评审都必须验证合规性；复杂度必须有正当理由；运行时开发指导见 [GUIDANCE_FILE] -->

**版本**: [CONSTITUTION_VERSION] | **批准日期**: [RATIFICATION_DATE] | **最后修订**: [LAST_AMENDED_DATE]
<!-- 示例：版本：2.1.1 | 批准日期：2025-06-13 | 最后修订：2025-07-16 -->
