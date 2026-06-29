# 【功能名称】实施计划

> **给自动化协作代理：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务逐步实施本计划。步骤使用复选框（`- [ ]`）语法跟踪进度。
>
> 用途：作为 `docs/superpowers/plans/YYYY-MM-DD-feature.md` 的中文实施计划模板。生成正式计划时，请删除本说明，并把每个任务写到可以独立执行、验证和提交的粒度。

**目标：** 【一句话说明本次实现目标。】

**架构：** 【一到两句话说明实现架构、复用的现有机制、核心模块边界。】

**技术栈：** Java 17、Spring Boot 3.5、MyBatis-Plus、Jackson、JUnit 5、Vue 3、TypeScript、Element Plus、Vite。【按实际功能补充或删减。】

---

## 文件结构

后端新增：

- `dataRoomServer/src/main/java/.../【NewClass.java】`：【说明】
- `dataRoomServer/src/test/java/.../【NewTest.java】`：【说明】

后端修改：

- `dataRoomServer/src/main/java/.../【ExistingClass.java】`：【说明】
- `dataRoomServer/src/main/resources/.../【schema.sql】`：【说明】

前端新增：

- `dataRoomFront/src/dataRoom/.../【NewComponent.vue】`：【说明】

前端修改：

- `dataRoomFront/src/dataRoom/.../【api.ts】`：【说明】
- `dataRoomFront/src/dataRoom/.../【index.vue】`：【说明】

文档修改：

- `docs/superpowers/specs/YYYY-MM-DD-【feature】-design.md`：【如需同步规格，说明原因】

## 任务 1：【任务名称】

**文件：**

- 新增：`【path/to/new-file】`
- 修改：`【path/to/existing-file】`
- 测试：`【path/to/test-file】`

- [ ] **步骤 1：写失败测试或验证用例**

说明先写哪些测试、断言哪些行为。优先把关键业务规则写成可重复运行的单元测试。

```java
@Test
void shouldDoSomething() {
    // 【示例断言】
}
```

- [ ] **步骤 2：运行测试确认失败**

运行：

```bash
mvn test -pl dataRoomServer -Dtest=【TestClass】
```

预期：失败，因为【尚未实现的类、方法或行为】。

- [ ] **步骤 3：实现后端逻辑**

实现要求：

- 【要求 1】
- 【要求 2】
- 【要求 3】
- 如果新增或修改 Java `catch` 块，必须记录异常栈：`log.error(ExceptionUtils.getStackTrace(e));`

- [ ] **步骤 4：运行测试确认通过**

运行：

```bash
mvn test -pl dataRoomServer -Dtest=【TestClass】
```

预期：通过。

- [ ] **步骤 5：提交**

```bash
git add 【changed-files】
git commit -m "feat: 【commit message】"
```

## 任务 2：【任务名称】

**文件：**

- 修改：`【path/to/backend-file】`
- 测试：`【path/to/backend-test】`

- [ ] **步骤 1：补充集成或服务测试**

覆盖：

- 【场景 1】
- 【场景 2】
- 【场景 3】

- [ ] **步骤 2：运行测试确认失败**

运行：

```bash
mvn test -pl dataRoomServer -Dtest=【TestClass】
```

预期：失败，因为【原因】。

- [ ] **步骤 3：实现服务集成**

实现要求：

- 【服务注入或调用关系】
- 【数据查询或保存规则】
- 【异常、日志、权限或脱敏规则】

- [ ] **步骤 4：运行测试确认通过**

运行：

```bash
mvn test -pl dataRoomServer -Dtest=【TestClass】
```

预期：通过。

- [ ] **步骤 5：异常日志规范验证**

如果本任务新增或修改 Java `catch` 块，运行：

```bash
mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

预期：通过。

- [ ] **步骤 6：提交**

```bash
git add 【changed-files】
git commit -m "feat: 【commit message】"
```

## 任务 3：前端实现

**文件：**

- 修改：`dataRoomFront/src/dataRoom/.../api.ts`
- 新增：`dataRoomFront/src/dataRoom/.../components/【Component.vue】`
- 修改：`dataRoomFront/src/dataRoom/.../index.vue`

- [ ] **步骤 1：扩展前端类型和 API**

实现要求：

- 【DTO/VO 类型】
- 【API 方法】
- 【默认值或类型联合】

- [ ] **步骤 2：实现页面或组件**

实现要求：

- 使用 Element Plus 默认组件样式。
- 业务样式只处理布局、间距、滚动区域和自定义容器。
- 不覆盖 Element Plus 内部样式。
- 不使用硬编码颜色、`--dr-*` 私有颜色变量、`!important` 或负字距。
- 【具体交互 1】
- 【具体交互 2】

- [ ] **步骤 3：接入入口和状态**

实现要求：

- 【入口位置】
- 【状态变量】
- 【打开、保存、关闭、刷新等逻辑】

- [ ] **步骤 4：运行前端检查**

运行：

```bash
cd dataRoomFront
npm run type-check
```

预期：通过。

涉及样式或格式规范时运行：

```bash
cd dataRoomFront
npm run lint
```

预期：通过。

- [ ] **步骤 5：提交**

```bash
git add 【changed-files】
git commit -m "feat(front): 【commit message】"
```

## 任务 4：全量验证和最终检查

**文件：**

- 任务 1-3 涉及的全部文件。

- [ ] **步骤 1：运行后端目标测试**

运行：

```bash
mvn test -pl dataRoomServer -Dtest=【TestClass1】,【TestClass2】,【TestClass3】
```

预期：通过。

- [ ] **步骤 2：运行异常日志规范测试**

如果实现新增或修改 Java `catch` 块，运行：

```bash
mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

预期：通过。

- [ ] **步骤 3：运行前端检查**

运行：

```bash
cd dataRoomFront
npm run type-check
npm run lint
```

预期：通过。

- [ ] **步骤 4：手工复核范围**

验证：

- 【核心业务规则 1】
- 【核心业务规则 2】
- 【权限、脱敏或兼容规则】
- 【前端关键交互】
- 【未引入硬编码颜色、Element Plus 内部样式覆盖、`!important` 或负字距】

- [ ] **步骤 5：提交最终实现**

```bash
git add 【changed-files】
git commit -m "feat: 【final commit message】"
```

## 实施备注

- 每个任务应尽量能独立测试和提交。
- 如果某个命令无法运行，需要在交付说明中写明原因。
- 不要把无关重构混入本计划。
- 如果实际实现发现规格遗漏，应先更新对应 spec，再继续实现。
