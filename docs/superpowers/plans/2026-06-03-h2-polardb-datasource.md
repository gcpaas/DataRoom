# H2 And PolarDB Datasource Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add H2 and PolarDB datasource types with relational datasource behavior, default drivers, and frontend icons.

**Architecture:** Backend adds independent enum values and JSON subtype mappings backed by relational datasource beans. Frontend adds independent datasource keys that reuse the existing relational editor pattern with H2 and PolarDB-specific defaults.

**Tech Stack:** Spring Boot, Jackson polymorphic JSON, Vue 3, TypeScript, Element Plus, Vite.

---

### Task 1: Backend Type Support

**Files:**
- Modify: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/datasource/bean/DataSourceJsonTest.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/constant/DataSourceType.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/datasource/bean/BaseDataSource.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/datasource/bean/H2Datasource.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/datasource/bean/PolarDbDatasource.java`

- [ ] Add failing parameterized JSON cases for `h2` and `polardb`.
- [ ] Run `mvn -q -pl dataRoomServer -Dtest=DataSourceJsonTest test` and verify the new cases fail because the types are unknown.
- [ ] Add enum constants, type strings, JSON subtype mappings, and relational datasource beans.
- [ ] Run the same test and verify it passes.

### Task 2: Frontend Type And UI Support

**Files:**
- Modify: `dataRoomFront/src/dataroom-packages/constant/DataSourceType.ts`
- Modify: `dataRoomFront/src/dataroom-packages/dataSource/api.ts`
- Modify: `dataRoomFront/src/dataroom-packages/dataSource/index.vue`
- Create: `dataRoomFront/src/dataroom-packages/dataSource/components/H2Editor.vue`
- Create: `dataRoomFront/src/dataroom-packages/dataSource/components/PolarDbEditor.vue`
- Create: `dataRoomFront/src/dataroom-packages/dataSource/assets/image/H2.svg`
- Create: `dataRoomFront/src/dataroom-packages/dataSource/assets/image/PolarDB.svg`

- [ ] Copy the provided SVG icons into the datasource image directory.
- [ ] Add TypeScript datasource values for `h2` and `polardb`.
- [ ] Add datasource selector cards and async editor imports.
- [ ] Add default driver names: `org.h2.Driver` and `com.mysql.cj.jdbc.Driver`.
- [ ] Add dedicated editor components following existing relational editor structure.

### Task 3: Verification

**Files:**
- Inspect: all changed files above

- [ ] Run `mvn -q -pl dataRoomServer -Dtest=DataSourceJsonTest test`.
- [ ] Run `npm run type-check` in `dataRoomFront`.
- [ ] Search for `h2` and `polardb` to verify enum, JSON subtype, UI card, default driver, and editor wiring.
- [ ] Confirm icons exist at `H2.svg` and `PolarDB.svg`.
