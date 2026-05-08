# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview

DataRoom-Plus is a visual big screen designer with a Spring Boot 3.5 (JDK 17) backend and Vue 3 frontend. It provides drag-and-drop dashboard design with two modes: grid-based PageDesigner and pixel-perfect VisualScreenDesigner. Supports MySQL, PostgreSQL, H2, Elasticsearch, HTTP, JSON, and Groovy data sources.

**Status:** Under active development, not production-ready.

## Build & Development Commands

### Backend (Java/Maven)

```bash
# Build entire project (from project root)
mvn clean package -DskipTests

# Run all tests
mvn test

# Run a single test class
mvn test -Dtest=JsonUtilsTest

# Start server (default H2 database, port 8081)
mvn spring-boot:run -pl dataroom-server
```

Server runs at `http://localhost:8081/dataRoom`. API docs at `/doc.html` (Knife4j/Swagger).

### Frontend (Vue 3/Vite)

```bash
cd data-room-ui

# Install dependencies
npm install

# Development server
npm run dev

# Production build (outputs to dataRoomFront/)
npm run build

# Lint and fix
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

Node.js requirement: `^20.19.0 || >=22.12.0`

## Architecture

### Module Layout

```
DataRoom/
├── dataroom-core/       # Placeholder core library module (minimal)
├── dataroom-server/     # Main Spring Boot application (all backend code here)
│   └── src/main/java/com/gccloud/gcpaas/core/
└── data-room-ui/        # Vue 3 frontend application
```

All backend code lives in `dataroom-server` under package `com.gccloud.gcpaas.core`.

### Backend Architecture

**Entry point:** `com.gccloud.gcpaas.server.DataRoomApplication` with `@MapperScan("com.gccloud.gcpaas.**")`

**Key packages under `com.gccloud.gcpaas.core`:**

| Package | Purpose |
|---------|---------|
| `page/` | Page/dashboard CRUD, publish lifecycle (PageController, PageService, PageStageService) |
| `dataset/` | Dataset execution layer with Factory pattern (DatasetController, DatasetServiceFactory) |
| `datasource/` | Data source connection management (DataSourceController, DatasourceService) |
| `entity/` | MyBatis-Plus entities extending BaseEntity (audit fields, soft delete) |
| `shiro/` | Shiro + JWT authentication (ShiroAuthRealm, ShiroAuthFilter) |
| `config/` | Spring config classes (DataRoomConfig, ShiroConfiguration, Knife4jWebMvcConfigurer) |
| `user/` | User login/auth (UserController, TokenService) |
| `captcha/` | Login captcha (CaptchaController with Caffeine cache) |

**REST API base paths:**
- `/dataRoom/page` - Page management
- `/dataRoom/dataset` - Dataset CRUD and execution
- `/dataRoom/dataSource` - Data source management
- `/dataRoom/user` - Authentication
- `/dataRoom/captcha` - Captcha generation
- `/dataRoom/resource` - File/resource management

**Database profiles:** `h2` (default for dev), `mysql`, `pg` - set via `spring.profiles.active` in `application.yml`.

**Dataset Factory Pattern:** `DatasetServiceFactory` resolves implementations by type:
- `RelationalDatasetService` - SQL execution with parameter binding
- `HttpDatasetService` - HTTP requests with JSONPath response parsing
- `JsonDatasetService` - Static JSON data
- Bean names follow `{DatasetType.value}DatasetService` convention

**Page Lifecycle:** Insert -> Design (PageStageEntity) -> Preview -> Publish. Each stage stores a full config snapshot as JSON in `dr_page_stage`.

**Polymorphic JSON:** `@JsonTypeInfo` + `@JsonSubTypes` used on `BaseDataset`, `BaseDataSource`, and `BasePageConfig` for type-safe deserialization.

### Frontend Architecture

**Source layout under `data-room-ui/src/dataroom-packages/`:**

| Directory | Purpose |
|-----------|---------|
| `PageDesigner/` | Grid-based dashboard designer (vue-grid-layout-v3, 16 columns) |
| `VisualScreenDesigner/` | Pixel-perfect designer (vue3-moveable + vue3-selecto, 1920x1080 default) |
| `components/` | Visual component library with auto-registration |
| `_components/` | Shared editor UI (ControlPanel, ComponentLib, toolbar, etc.) |
| `_common/` | Utilities, HTTP client (`_request.ts`), helper functions |
| `hooks/` | Composition hooks (useCanvasInst, useDrComponent, useTimerManager) |
| `dataSource/` | Data source management views and API |
| `dataset/` | Dataset management views and API |
| `page/` | Page list management views |

**Component Auto-Registration Convention:**

Each visual component is a directory under `components/` containing `install.ts` that exports:
```typescript
export const component       // The Vue component (defineAsyncComponent)
export const controlPanel    // Configuration panel component
export const getInstance     // Factory returning ChartConfig<T>
export const behaviors       // Interaction definitions (click, hover, etc.)
export const datasetFields   // Dataset field mappings
```

Auto-discovered by `AutoInstall.ts` via `import.meta.glob('./**/install.ts')`. To add a new component, create a directory following this convention - no manual registration needed.

**State Management:** Uses `provide/inject` (not a centralized Pinia store) for sharing canvas state. The `useCanvasInst` hook creates the canvas context that is provided to all child components via `provide(DrConst.CANVAS_INST, canvasInst)`.

**Data Flow in Components:**
1. Component mounts -> `useDrComponent` hook activates
2. Hook calls `autoRefreshData()` -> fills dataset params from global vars/fixed values
3. Calls `datasetApi.run4Chart()` -> backend executes dataset
4. Response -> `changeData()` callback updates component

**Interaction System:** Components define `behaviors` (events) that trigger `actions` (code execution). `canvasInst.triggerChartBehavior()` dispatches events between components.

**Router:** Hash-based routing (`createWebHashHistory`). Designer routes: `/dataRoom/pageDesigner/:pageCode` and `/dataRoom/visualScreenDesigner/:pageCode`.

**Vite Config:** Output to `dataRoomFront/`, base URL `./`, auto-imports for Element Plus and Vue APIs, custom `ReplaceThisPluginType` plugin that injects component type constants.

## Key Conventions

- Backend uses Lombok, MyBatis-Plus `ServiceImpl`, and Snowflake IDs
- Soft delete via `delFlag` field on all entities
- Audit fields auto-filled: `createDate`, `updateDate`, `createUser`, `updateUser`
- Frontend component directories always contain `index.vue` for main component and `panel/index.vue` for config panel
- API modules export an object with methods (e.g., `dataSourceApi.list()`, `datasetApi.run()`)
- HTTP client in `_common/_request.ts` handles auth token injection and error responses
- Three user roles: `manager`, `developer`, `sharer` - checked via Shiro `@RequiresRoles`
- Password encrypted with RSA on frontend, decrypted on backend
- Default users configured in `application-base.yml` (admin/developer/sharer)

## Tech Stack

- **Backend:** Spring Boot 3.5.10, MyBatis-Plus 3.5.12, Shiro 2.0.6 (Jakarta), JWT (jjwt 0.12.6), Knife4j 4.5.0, FastJSON 2, Caffeine
- **Frontend:** Vue 3.5, TypeScript 5.9, Vite 7, Element Plus, ECharts 6, Pinia 3, vue-grid-layout-v3, vue3-moveable, vue3-selecto
- **Databases:** H2 (dev), MySQL, PostgreSQL
