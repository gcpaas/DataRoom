# Excel Dataset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-class `excel` dataset type that edits like a SQL dataset without datasource selection, auto-creates from Excel datasource imports, and executes only SQL that references `excel_` tables.

**Architecture:** The backend adds `excel` as a dataset type, maps it to `RelationalDataset`, and introduces a dedicated `ExcelDatasetService` that uses the application `DataSource`. The frontend adds a dedicated Excel dataset editor copied from the SQL editor workflow with the datasource field removed.

**Tech Stack:** Spring Boot 3, MyBatis-Plus, JSqlParser via `mybatis-plus-jsqlparser`, Vue 3, TypeScript, Element Plus, CodeMirror.

---

### Task 1: Backend Dataset Type and SQL Validation Tests

**Files:**
- Modify: `dataroom-server/src/test/java/com/gccloud/gcpaas/core/constant/DatasetTypeSqlTest.java`
- Create: `dataroom-server/src/test/java/com/gccloud/gcpaas/core/dataset/service/ExcelDatasetServiceTest.java`

- [ ] **Step 1: Add failing tests for `excel` type registration**

Add tests to `DatasetTypeSqlTest`:

```java
@Test
void excelDatasetTypeUsesExcelWireValue() {
    DatasetType excelType = DatasetType.valueOf("EXCEL");

    assertEquals("excel", excelType.getType());
    assertEquals("excel", excelType.getValue());
}

@Test
void excelDatasetServiceBeanUsesExcelTypeName() throws Exception {
    Class<?> serviceClass = Class.forName("com.gccloud.gcpaas.core.dataset.service.ExcelDatasetService");

    Service service = serviceClass.getAnnotation(Service.class);

    assertNotNull(service);
    assertEquals("excel" + DataRoomConstant.Dataset.SERVICE_NAME, service.value());
}

@Test
void deserializeExcelDatasetEntity() throws Exception {
    String json = """
            {
              "name": "Excel销售统计",
              "datasetType": "excel",
              "dataset": {
                "datasetType": "excel",
                "sql": "select * from excel_sales"
              }
            }
            """;

    DatasetEntity entity = new ObjectMapper().readValue(json, DatasetEntity.class);

    assertEquals(DatasetType.EXCEL, entity.getDatasetType());
    RelationalDataset dataset = assertInstanceOf(RelationalDataset.class, entity.getDataset());
    assertEquals("select * from excel_sales", dataset.getSql());
}
```

- [ ] **Step 2: Add failing tests for SQL validation**

Create `ExcelDatasetServiceTest`:

```java
package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.core.exception.DataRoomException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ExcelDatasetServiceTest {

    @Test
    void validateSqlAllowsExcelTablesInSelectJoinSubqueryAndCte() {
        assertDoesNotThrow(() -> ExcelDatasetService.validateExcelSql("""
                with recent_sales as (
                  select id, customer_id from excel_sales where amount > 100
                )
                select s.id, c.name
                from recent_sales s
                join excel_customers c on c.id = s.customer_id
                where exists (
                  select 1 from excel_regions r where r.id = c.region_id
                )
                """));
    }

    @Test
    void validateSqlRejectsNonExcelTables() {
        DataRoomException ex = assertThrows(
                DataRoomException.class,
                () -> ExcelDatasetService.validateExcelSql("select * from excel_sales join sys_user u on u.id = excel_sales.user_id")
        );

        assertTrue(ex.getMessage().contains("Excel数据集只能查询excel_开头的表"));
        assertTrue(ex.getMessage().contains("sys_user"));
    }

    @Test
    void validateSqlRejectsNonSelectStatements() {
        DataRoomException ex = assertThrows(
                DataRoomException.class,
                () -> ExcelDatasetService.validateExcelSql("delete from excel_sales")
        );

        assertTrue(ex.getMessage().contains("仅允许执行select操作"));
    }

    @Test
    void validateSqlRejectsInvalidSqlWithParseMessage() {
        DataRoomException ex = assertThrows(
                DataRoomException.class,
                () -> ExcelDatasetService.validateExcelSql("select from")
        );

        assertTrue(ex.getMessage().contains("Excel数据集SQL解析失败"));
    }
}
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
mvn -q -pl dataroom-server -Dtest=DatasetTypeSqlTest,ExcelDatasetServiceTest test
```

Expected: fail because `DatasetType.EXCEL` and `ExcelDatasetService` do not exist.

### Task 2: Backend Excel Dataset Implementation

**Files:**
- Modify: `dataroom-server/src/main/java/com/gccloud/gcpaas/core/constant/DatasetType.java`
- Modify: `dataroom-server/src/main/java/com/gccloud/gcpaas/core/dataset/bean/BaseDataset.java`
- Create: `dataroom-server/src/main/java/com/gccloud/gcpaas/core/dataset/service/ExcelDatasetService.java`
- Test: `dataroom-server/src/test/java/com/gccloud/gcpaas/core/constant/DatasetTypeSqlTest.java`
- Test: `dataroom-server/src/test/java/com/gccloud/gcpaas/core/dataset/service/ExcelDatasetServiceTest.java`

- [ ] **Step 1: Add the `excel` enum value**

Update `DatasetType`:

```java
DIRECTORY("directory"),
JSON("json"),
HTTP("http"),
SQL("sql"),
EXCEL("excel"),
ES("es");

public static final String DIRECTORY_TYPE = "directory";
public static final String JSON_TYPE = "json";
public static final String HTTP_TYPE = "http";
public static final String SQL_TYPE = "sql";
public static final String EXCEL_TYPE = "excel";
public static final String ES_TYPE = "es";
```

- [ ] **Step 2: Map Excel dataset JSON to `RelationalDataset`**

Add to `BaseDataset` `@JsonSubTypes`:

```java
@JsonSubTypes.Type(value = RelationalDataset.class, name = DatasetType.EXCEL_TYPE),
```

- [ ] **Step 3: Implement `ExcelDatasetService`**

Create a focused service that:

- Builds input params like `SqlDatasetService`
- Runs `myBatisService.generateSql(sql, params)`
- Calls `validateExcelSql(sql)`
- Executes the query against injected `DataSource appDataSource`
- Uses `SqlDatasetService.resolveOutputType(...)`
- Throws `DataRoomException` for validation and execution failures

- [ ] **Step 4: Run backend targeted tests**

Run:

```bash
mvn -q -pl dataroom-server -Dtest=DatasetTypeSqlTest,ExcelDatasetServiceTest test
```

Expected: pass.

### Task 3: Frontend Types and Excel Dataset Editor

**Files:**
- Modify: `data-room-ui/src/dataroom-packages/constant/DatasetType.ts`
- Modify: `data-room-ui/src/dataroom-packages/dataset/api.ts`
- Create: `data-room-ui/src/dataroom-packages/dataset/components/ExcelEditor.vue`

- [ ] **Step 1: Add `excel` to frontend constants and types**

Update:

```ts
export const DatasetType = {
  DIRECTORY: 'directory',
  JSON: 'json',
  HTTP: 'http',
  SQL: 'sql',
  EXCEL: 'excel',
  ES: 'es'
} as const;
```

Update `BaseDataset`, add `ExcelDataset`, and include `excel` in `DatasetEntity.datasetType`, `DatasetEntity.dataset`, and `DatasetTreeNode.datasetType`.

- [ ] **Step 2: Create `ExcelEditor.vue`**

Create the component based on `SqlEditor.vue`, with these differences:

- No datasource props or computed datasource filtering
- `formData.datasetType` defaults to `excel`
- `formData.dataset.datasetType` defaults to `excel`
- No `dataSourceCode` field in defaults
- Validation rules only require `name`
- `test()` checks SQL, not datasource
- Template omits the datasource `<el-form-item>`

Keep the SQL editor, format button, input param parsing, output field table, preview table, and styles consistent with `SqlEditor.vue`. Do not add Element Plus internal style overrides or hardcoded colors.

### Task 4: Frontend Dataset Page and Excel Auto-Creation

**Files:**
- Modify: `data-room-ui/src/dataroom-packages/dataset/index.vue`
- Modify: `data-room-ui/src/dataroom-packages/dataSource/index.vue`
- Modify: `data-room-ui/src/dataroom-packages/dataSource/api.ts`

- [ ] **Step 1: Register Excel dataset editor in the dataset page**

In `dataset/index.vue`:

- Add `excel` to `wideEditorDatasetTypes`
- Add Excel数据集 to `addTypeOptions`
- Add `excel` to `datasetTypeMap` with the new component
- Allow `handleAddDataset` to receive `excel`
- Initialize new Excel datasets with `{ datasetType: 'excel', sql: '' }`

- [ ] **Step 2: Update Excel datasource auto-created dataset payload**

In `dataSource/index.vue`, change the `datasetApi.insert` payload from SQL to Excel:

```ts
await datasetApi.insert({
  name: editorData.name,
  datasetType: 'excel',
  dataset: {
    datasetType: 'excel',
    sql: `SELECT * FROM ${tableName} LIMIT 100`,
  },
  outputList,
})
```

Do not include `dataSourceCode`.

- [ ] **Step 3: Update Excel create request type if needed**

Keep `ExcelCreateRequest` focused on data source creation. Do not add dataset fields.

### Task 5: Verification

**Files:**
- Backend test files from Task 1
- Frontend modified files from Tasks 3 and 4

- [ ] **Step 1: Run backend targeted tests**

Run:

```bash
mvn -q -pl dataroom-server -Dtest=DatasetTypeSqlTest,ExcelDatasetServiceTest test
```

Expected: pass.

- [ ] **Step 2: Run frontend type-check**

Run:

```bash
cd data-room-ui
npm run type-check
```

Expected: pass.

- [ ] **Step 3: Run frontend lint**

Run:

```bash
cd data-room-ui
npm run lint
```

Expected: pass or only unrelated pre-existing issues. Fix issues caused by this task.

- [ ] **Step 4: Inspect changed files**

Run:

```bash
git diff --stat
git diff -- dataroom-server/src/main/java/com/gccloud/gcpaas/core/constant/DatasetType.java \
  dataroom-server/src/main/java/com/gccloud/gcpaas/core/dataset/bean/BaseDataset.java \
  dataroom-server/src/main/java/com/gccloud/gcpaas/core/dataset/service/ExcelDatasetService.java \
  data-room-ui/src/dataroom-packages/dataset/components/ExcelEditor.vue \
  data-room-ui/src/dataroom-packages/dataset/index.vue \
  data-room-ui/src/dataroom-packages/dataSource/index.vue \
  data-room-ui/src/dataroom-packages/dataset/api.ts
```

Expected: only Excel dataset feature changes, with the pre-existing `DrBarChart` diff left untouched.
