# HTTP 数据源 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增可选 HTTP 数据源，集中维护基础地址和公共请求头，并让 HTTP 数据集支持数据源拼接、请求头合并和逐条加密。

**Architecture:** 后端沿用现有数据源/数据集多态 JSON 和 `DatasetEntity.dataSourceCode` 关系；新增 `HttpDatasource` 与 `KeyVal.encrypted`，在 `HttpDatasetService` 内完成 URL 解析、请求头合并、解密和参数替换。前端沿用现有 Element Plus 编辑器模式，新增 HTTP 数据源编辑器并扩展 HTTP 数据集编辑器。

**Tech Stack:** Java 17、Spring Boot 3.5、Jackson、MyBatis-Plus、JUnit 5、Vue 3、TypeScript、Element Plus、Vite。

---

## 文件结构

- 修改 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/bean/KeyVal.java`：增加 `encrypted` 字段。
- 新增 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/bean/HttpDatasource.java`：HTTP 数据源配置、脱敏、更新保留和基础校验。
- 修改 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/constant/DataSourceType.java`：增加 HTTP 类型。
- 修改 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/bean/BaseDataSource.java`：注册 HTTP 数据源多态子类型。
- 修改 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/DataSourceController.java`：保存 HTTP 数据源前校验。
- 修改 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/service/HttpDatasetService.java`：支持可选数据源、URL 拼接、header 合并和加密 header 解密。
- 修改 `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/DatasetController.java` 或相关详情路径：必要时补充 HTTP 数据集加密 header 脱敏/更新保留。
- 新增/修改后端测试：`HttpDatasourceJsonTest`、`HttpDatasetServiceTest`，必要时扩展数据集控制器测试。
- 修改 `dataRoomFront/src/dataRoom/data-source/api.ts`：增加 HTTP 数据源类型和通用 Header 类型。
- 新增 `dataRoomFront/src/dataRoom/data-source/components/HttpEditor.vue`：HTTP 数据源编辑器。
- 修改 `dataRoomFront/src/dataRoom/data-source/index.vue`：注册 HTTP 数据源类型、默认值和分组。
- 修改 `dataRoomFront/src/dataRoom/dataset/api.ts`：扩展 HTTP 数据集 header 类型。
- 修改 `dataRoomFront/src/dataRoom/dataset/components/HttpEditor.vue`：增加 HTTP 数据源选择、访问路径标签、请求头加密列、保存/测试加密处理。
- 修改 `dataRoomFront/src/dataRoom/dataset/index.vue`：创建 HTTP 数据集默认值时补齐新 header 结构。

## Task 1: 后端数据模型和序列化

**Files:**
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/bean/KeyVal.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/bean/HttpDatasource.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/constant/DataSourceType.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/bean/BaseDataSource.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/DataSourceController.java`
- Test: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/datasource/bean/HttpDatasourceJsonTest.java`

- [ ] **Step 1: 写 HTTP 数据源 JSON 测试**

创建 `HttpDatasourceJsonTest`，覆盖：

```java
@Test
void deserializeHttpDatasource() throws Exception {
    DataSourceEntity entity = objectMapper.readValue("""
            {
              "name":"公共 API",
              "dataSourceType":"http",
              "dataSource":{
                "dataSourceType":"http",
                "baseUrl":"https://api.example.com/base",
                "headerList":[{"key":"Authorization","val":"cipher","encrypted":true}]
              }
            }
            """, DataSourceEntity.class);
    assertEquals("http", entity.getDataSourceType().getValue());
    HttpDatasource http = assertInstanceOf(HttpDatasource.class, entity.getDataSource());
    assertEquals("https://api.example.com/base", http.getBaseUrl());
    assertTrue(http.getHeaderList().get(0).getEncrypted());
}
```

另写测试覆盖 `desensitize()` 将加密 value 改为 `******`，以及 `updatedSensitive()` 在 `val` 为 `******` 时沿用旧密文。

- [ ] **Step 2: 运行测试确认失败**

Run: `mvn test -pl dataRoomServer -Dtest=HttpDatasourceJsonTest`

Expected: 编译失败或测试失败，因为 `HttpDatasource` 和 `KeyVal.encrypted` 尚不存在。

- [ ] **Step 3: 实现模型**

实现：

```java
@Data
public class KeyVal {
    private String key;
    private String val;
    private Boolean encrypted;
}
```

新增 `HttpDatasource`，字段为 `baseUrl`、`List<KeyVal> headerList`，实现 `validate()`、`desensitize()`、`updatedSensitive()`。`updatedSensitive()` 以 header key 大小写不敏感匹配旧值。

在 `DataSourceType` 增加 `HTTP("http")` 和 `HTTP_TYPE = "http"`；在 `BaseDataSource` 注册 `HttpDatasource`；在 `DataSourceController.insert/update` 中对 `HttpDatasource` 调用 `validate()`。

- [ ] **Step 4: 运行测试确认通过**

Run: `mvn test -pl dataRoomServer -Dtest=HttpDatasourceJsonTest`

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/bean/KeyVal.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/bean/HttpDatasource.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/constant/DataSourceType.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/bean/BaseDataSource.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/datasource/DataSourceController.java \
  dataRoomServer/src/test/java/com/gccloud/gcpaas/core/datasource/bean/HttpDatasourceJsonTest.java
git commit -m "feat: add http datasource model"
```

## Task 2: HTTP 数据集执行逻辑

**Files:**
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/service/HttpDatasetService.java`
- Test: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/dataset/service/HttpDatasetServiceTest.java`

- [ ] **Step 1: 写服务单元测试**

使用 `MockRestServiceServer` 或 mock `RestTemplate`，覆盖：

- 未选择数据源时完整 URL 可请求。
- 选择数据源时相对路径拼接为 `baseUrl/path`。
- 选择数据源时完整 URL 抛错并返回空数组。
- 数据源 `Authorization` 被数据集 `authorization` 覆盖。
- `encrypted=true` 的 header 解密后发出。

测试中通过反射注入 `RestTemplate`、`DatasourceService`、`DataRoomConfig`。

- [ ] **Step 2: 运行测试确认失败**

Run: `mvn test -pl dataRoomServer -Dtest=HttpDatasetServiceTest`

Expected: FAIL，因为当前服务直接请求 `HttpDataset.url`。

- [ ] **Step 3: 实现执行逻辑**

在 `HttpDatasetService` 中拆出私有方法：

- `buildParams(DatasetRunRequest, DatasetEntity)`
- `resolveUrl(HttpDataset, DatasetEntity, Map<String,Object>)`
- `mergeHeaders(List<KeyVal>, List<KeyVal>)`
- `resolveHeaderValue(KeyVal, Map<String,Object>)`
- `isAbsoluteHttpUrl(String)`
- `joinUrl(String, String)`

注入：

```java
@Resource
private DatasourceService datasourceService;
@Resource
private DataRoomConfig dataRoomConfig;
```

解密时使用 `RsaUtils.decryptByPrivateKey(keyVal.getVal(), dataRoomConfig.getPrivateKey())`。`encrypted` 为 `Boolean.TRUE` 才解密。

- [ ] **Step 4: 运行测试确认通过**

Run: `mvn test -pl dataRoomServer -Dtest=HttpDatasetServiceTest`

Expected: PASS。

- [ ] **Step 5: 异常日志规范验证**

Run: `mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test`

Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/dataset/service/HttpDatasetService.java \
  dataRoomServer/src/test/java/com/gccloud/gcpaas/core/dataset/service/HttpDatasetServiceTest.java
git commit -m "feat: resolve http dataset datasource requests"
```

## Task 3: 前端 HTTP 数据源

**Files:**
- Modify: `dataRoomFront/src/dataRoom/data-source/api.ts`
- Create: `dataRoomFront/src/dataRoom/data-source/components/HttpEditor.vue`
- Modify: `dataRoomFront/src/dataRoom/data-source/index.vue`

- [ ] **Step 1: 扩展前端类型**

在 `api.ts` 增加：

```ts
export interface KeyVal {
  key: string
  val: string
  encrypted?: boolean
}

export interface HttpDataSource {
  dataSourceType: 'http'
  baseUrl: string
  headerList?: KeyVal[]
}
```

将 `DataSourceEntity.dataSourceType` 联合类型加入 `'http'`。

- [ ] **Step 2: 新增 HTTP 数据源编辑器**

创建 `HttpEditor.vue`，参照 `EsEditor.vue` 和 `MqttEditor.vue`：

- `defaultHttpDataSource()` 返回 `{ dataSourceType: 'http', baseUrl: '', headerList: [] }`
- 表单校验 `name`、`dataSource.baseUrl`
- 请求头表格支持新增、删除、`encrypted` 勾选
- `getEncryptedData()` 对 `encrypted === true && val && val !== '******'` 的 value 调用 `encryptByRsa`

- [ ] **Step 3: 注册数据源类型**

在 `data-source/index.vue`：

- 导入一个已有合适图标资源，或复用文本 icon `HTTP`。
- `dataSourceTypeMap` 新增 `http`，组件指向 `./components/HttpEditor.vue`。
- `dataSourceTypeGroups` 将 `http` 放入消息/接口类分组。
- `handleAdd()` 为 `http` 设置默认 `dataSource`。

- [ ] **Step 4: 运行类型检查**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add dataRoomFront/src/dataRoom/data-source/api.ts \
  dataRoomFront/src/dataRoom/data-source/components/HttpEditor.vue \
  dataRoomFront/src/dataRoom/data-source/index.vue
git commit -m "feat(front): add http datasource editor"
```

## Task 4: 前端 HTTP 数据集编辑器

**Files:**
- Modify: `dataRoomFront/src/dataRoom/dataset/api.ts`
- Modify: `dataRoomFront/src/dataRoom/dataset/components/HttpEditor.vue`
- Modify: `dataRoomFront/src/dataRoom/dataset/index.vue`

- [ ] **Step 1: 扩展类型和默认值**

在 `dataset/api.ts` 让 `HttpDataset.headerList` 使用带 `encrypted` 的结构：

```ts
headerList?: Array<{ key: string; val: string; encrypted?: boolean }>
```

在 `dataset/index.vue` 创建 HTTP 数据集默认值时保持 `headerList: []`。

- [ ] **Step 2: 修改数据集编辑器表单**

在 `HttpEditor.vue`：

- 导入 `computed` 和 `encryptByRsa`。
- 计算 `httpDataSourceList`：从 `props.dataSourceList` 过滤 `dataSourceType === 'http'`。
- 增加 `el-select` 绑定 `formData.dataSourceCode`，可清空。
- 标签“请求地址”改为“访问路径”，placeholder 根据是否选择数据源动态切换。
- 请求头表格增加 `encrypted` 列，使用 `el-checkbox`。
- 新增 `getEncryptedData()` 或在 `test()`、`getData()` 前统一克隆并加密 header value，避免直接把表单 value 改成密文造成编辑体验异常。

- [ ] **Step 3: 调整测试和保存入口**

确保 `test()` 调用 `datasetApi.test({ dataset: encryptedFormData })`，`getData()` 返回加密后的实体，`testAndSave()` 仍先测试再保存。

- [ ] **Step 4: 运行类型检查**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add dataRoomFront/src/dataRoom/dataset/api.ts \
  dataRoomFront/src/dataRoom/dataset/components/HttpEditor.vue \
  dataRoomFront/src/dataRoom/dataset/index.vue
git commit -m "feat(front): support http dataset datasource"
```

## Task 5: 集成验证和整理

**Files:**
- Review all changed files.

- [ ] **Step 1: 运行后端目标测试**

Run:

```bash
mvn test -pl dataRoomServer -Dtest=HttpDatasourceJsonTest,HttpDatasetServiceTest
```

Expected: PASS。

- [ ] **Step 2: 运行异常日志规范测试**

Run:

```bash
mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

Expected: PASS。

- [ ] **Step 3: 运行前端类型检查**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS。

- [ ] **Step 4: 检查前端样式约束**

Run:

```bash
rg -n "#[0-9a-fA-F]{3,8}|rgb\\(|hsl\\(|--dr-|:deep\\(.el-|::v-deep|/deep/|>>>|!important|letter-spacing:\\s*-" dataRoomFront/src/dataRoom/data-source dataRoomFront/src/dataRoom/dataset
```

Expected: 不出现本次新增或修改文件引入的违规样式。

- [ ] **Step 5: 查看最终状态**

Run:

```bash
git status --short
git log --oneline -5
```

Expected: 只有预期修改已提交，工作区干净或仅有用户既有无关改动。

## 自检

- 设计文档中的每个目标都映射到 Task 1-5。
- 没有要求数据库结构变更，因为数据源和数据集配置保存在既有 JSON 字段中。
- `KeyVal.encrypted` 对旧 JSON 兼容，`null` 等同于 `false`。
- HTTP 数据源可选：Task 2 覆盖有数据源和无数据源两条路径。
- 前端和后端都覆盖数据源请求头与数据集请求头的加密处理。
