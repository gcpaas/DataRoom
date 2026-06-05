# Excel Dataset Design

## Background

DataRoom currently supports SQL datasets through `datasetType: "sql"`. SQL datasets require a selected datasource and execute through `SqlDatasetService`. Excel datasources already import uploaded Excel or CSV data into application-owned database tables whose names start with `excel_`. Existing Excel datasource creation automatically creates a SQL dataset that points at the Excel datasource.

The new requirement is to introduce a first-class Excel dataset:

- Display name: Excel数据集
- Wire type: `excel`
- Editing experience: same SQL editing workflow as SQL datasets, but without a datasource selector
- Execution datasource: the backend application's configured datasource
- Security rule: every table referenced by the SQL must be an `excel_` table
- Excel datasource upload auto-created datasets must use `datasetType: "excel"`

Historical SQL datasets that were previously auto-created from Excel datasources are not migrated.

## Backend Design

Add `EXCEL("excel")` and `EXCEL_TYPE = "excel"` to `DatasetType`.

Keep the dataset payload shape aligned with SQL datasets by mapping `datasetType: "excel"` to `RelationalDataset` in `BaseDataset`. No new dataset config class is needed because the Excel dataset stores only SQL.

Add a dedicated `ExcelDatasetService` registered as:

```java
@Service(value = DatasetType.EXCEL_TYPE + DataRoomConstant.Dataset.SERVICE_NAME)
```

The service follows the existing `DatasetServiceFactory` naming convention. It does not read or require `DatasetEntity.dataSourceCode`. It executes against the Spring application `DataSource` injected into the service.

The service should share compatible behavior with SQL datasets where appropriate:

- Build input parameters from `DatasetEntity.inputList`
- Apply runtime input values from `DatasetRunRequest.inputParam`
- Use `MyBatisService.generateSql(...)` for existing `#{param}` SQL generation
- Use `SqlDatasetService.resolveOutputType(...)` for output field type inference
- Return result rows as `List<Map<String, Object>>`

## SQL Validation

Excel datasets only allow SELECT statements.

Validation runs after parameter replacement, against the final SQL string. Use the existing JSqlParser dependency from `mybatis-plus-jsqlparser` instead of adding a new parser dependency.

Validation rules:

- SQL must parse successfully.
- SQL must be a query statement.
- Every parsed real table reference must start with `excel_`.
- Table aliases do not participate in validation.
- Quoted table names are normalized by removing wrapping quote characters before checking.
- Schema-qualified references are rejected unless the final table name itself starts with `excel_`; any non-Excel table discovered by the parser is rejected.
- The validation should cover parser-discoverable table references in `FROM`, `JOIN`, subqueries, and CTEs.

Failure behavior:

- Non-query SQL: `仅允许执行select操作`
- Parse failure: `Excel数据集SQL解析失败：<reason>`
- Non-Excel table: `Excel数据集只能查询excel_开头的表：<table>`

Unlike the current SQL dataset behavior, validation and execution failures for Excel datasets must surface as explicit errors. They must not be converted into an empty result set.

## Frontend Design

Add `excel` to frontend dataset types and tree node types.

Add a dedicated Excel dataset editor component under the dataset module, for example:

```text
dataRoomFront/src/dataroom-packages/dataset/components/ExcelEditor.vue
```

The component should be implemented by referencing `SqlEditor.vue`, not by parameterizing or reusing it.

Editor behavior:

- Default `datasetType: "excel"`
- Form fields: dataset name, SQL editor, input parameter configuration, output field list
- No datasource dropdown
- No `dataSourceCode` validation
- Test requires only dataset name and SQL
- SQL formatting, input parameter parsing, output field update, and preview table behavior should match `SqlEditor.vue`

Update the dataset page:

- Add an Excel dataset option to the add-type dialog
- Add `excel` to `datasetTypeMap`
- Use the new Excel editor component
- Treat `excel` as a wide editor dialog type
- Show the Excel dataset display name consistently in add/edit titles and tree/list type metadata

Update Excel datasource creation flow:

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

The auto-created Excel dataset must not include `dataSourceCode`.

## Non-Goals

- Do not migrate existing SQL datasets that were created from Excel datasources.
- Do not modify Excel datasource table creation or import storage behavior.
- Do not change the Excel datasource editor in data source management except for the auto-created dataset payload.
- Do not add a table picker, SQL autocomplete, or custom SQL helper UI.
- Do not change SQL dataset behavior except for any low-risk extraction needed to avoid duplication.

## Verification

Backend:

- `DatasetType` exposes `excel` as the wire value.
- `BaseDataset` deserializes `datasetType: "excel"` to `RelationalDataset`.
- `ExcelDatasetService` uses the expected factory bean name.
- SQL validation allows basic SELECT, JOIN, subquery, and CTE queries where every table starts with `excel_`.
- SQL validation rejects non-SELECT SQL, parser failures, and any referenced table that does not start with `excel_`.
- Validation failures throw explicit exceptions.

Frontend:

- Type definitions include `excel`.
- The dataset add dialog includes Excel数据集.
- Excel dataset editor saves and tests without `dataSourceCode`.
- Excel datasource creation auto-creates `datasetType: "excel"` without `dataSourceCode`.

Commands:

- Run targeted Maven tests for dataset type and Excel dataset SQL validation.
- Run `npm run type-check` after frontend changes.
- Run `npm run lint` if style or lint-sensitive frontend code is changed.
