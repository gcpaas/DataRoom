# 系统默认素材库设计方案

## 背景

DataRoom 素材库当前仅展示用户上传的素材，系统不自带任何默认素材。用户希望将一批素材图片放入后端指定目录，并在素材库中新增一个 Tab 展示这些"系统默认素材"，供设计器和大屏直接选用。

默认素材从 classpath 静态资源目录读取，不写入数据库，天然只读，随系统发布。

## 目标

- 将默认素材图片放入 `dataRoomServer/src/main/resources/static/dataRoom/resource/image/` 目录，按子目录分类（如 `bg/` 表示背景图）。
- 在素材库 `resource/index.vue` 顶部新增 `el-tabs`，支持"我的素材"与"系统默认素材"切换。
- 系统默认素材通过后端接口动态扫描 classpath 返回，不落库。
- 素材可正常在设计器中选用，复用现有卡片网格、选中回调和详情预览。
- 分类可自由扩展，新增子目录即新增分类，无需硬编码。

## 非目标

- 不支持默认素材的上传、删除、重命名（classpath 只读）。
- 不新增数据库表或字段。
- 不修改现有用户素材的上传、存储、代理访问逻辑。
- 不支持子目录嵌套（仅一级分类，如 `bg/`、`icon/`，不支持 `bg/sub/`）。
- 默认素材不参与 S3 代理路径（`/dataRoom/resource/file/{id}`），直接走 classpath 静态资源映射。

## 访问路径链路

默认素材放在 classpath 下，复用现有 Spring Boot 静态资源映射，无需新增任何映射配置。

现有配置（`application-base.yml`）：

```yaml
spring:
  mvc:
    static-path-pattern: /static/**
  web:
    resources:
      static-locations: classpath:/static/, ..., file:${dataroom.resource.basePath}
```

链路推导：

```
classpath 位置: static/dataRoom/resource/image/bg/xxx.png
        ↓ (static-path-pattern: /static/**, classpath:/static/)
后端映射路径: /static/dataRoom/resource/image/bg/xxx.png
        ↓ (context-path: /dataRoom)
完整访问 URL: /dataRoom/static/dataRoom/resource/image/bg/xxx.png
```

后端接口返回的 `url` 字段值为 `/dataRoom/resource/image/bg/xxx.png`。前端 `getResourceUrl(url)` 判断该值不以 `http` 开头、不以 `/dataRoom/resource/file/` 开头，走第 3 分支拼接 `VITE_RESOURCE_BASE_URL`：

```
开发环境: http://localhost:8081/dataRoom/static + /dataRoom/resource/image/bg/xxx.png
        = http://localhost:8081/dataRoom/static/dataRoom/resource/image/bg/xxx.png ✓

生产环境: /dataRoom/static + /dataRoom/resource/image/bg/xxx.png
        = /dataRoom/static/dataRoom/resource/image/bg/xxx.png ✓
```

链路自洽，与现有用户上传素材的 URL 拼接逻辑完全一致。

## 目录结构

```
dataRoomServer/src/main/resources/static/dataRoom/resource/image/
├── bg/              # 背景图
│   ├── blue-bg.png
│   └── dark-bg.jpg
├── icon/            # 图标
│   └── logo.svg
└── decoration/      # 装饰图
    └── border.png
```

- 一级子目录即一个分类（`bg`、`icon`、`decoration` 等）。
- 分类名取子目录名，前端直接展示英文目录名，不做中文映射（保持简单，后续可加映射表）。
- 分类下直接放素材文件，支持图片格式：`jpg`、`jpeg`、`png`、`gif`、`bmp`、`svg`、`webp`。
- 新增分类只需新建子目录并放入文件，重启或调刷新接口后自动生效。

## 方案选择

### 方案 A：classpath 打包 + PathMatchingResourcePatternResolver 扫描（采用）

素材放在 `src/main/resources/static/` 下，打包进 jar。运行时用 Spring 的 `PathMatchingResourcePatternResolver` 扫描 classpath，构造内存列表返回。

优点：
- 随系统版本发布，部署只需单一 jar，无外部目录依赖。
- classpath 天然只读，默认素材不可被篡改，符合"系统自带"定位。
- 复用现有静态资源映射，无需新增配置。

局限：
- 增删素材需重新打包部署。
- 不能用 `File` API 列目录（jar 内非文件系统），必须用 `PathMatchingResourcePatternResolver`。

### 方案 B：外部目录 + File API 扫描

素材放在运行时外部目录（如 `./dataRoomResource/builtin/`），用 `File` API 扫描。

优点：增删素材只需放文件，重启或刷新即可，无需重新打包。

局限：依赖外部目录存在；与"系统自带"定位相比，更像用户素材的延伸。

采用方案 A。用户已明确希望素材放入 `src/main/resources/static/` 目录。

## 后端设计

### classpath 扫描

不能用 `File` API（jar 内资源不是文件系统文件）。使用 Spring 的 `PathMatchingResourcePatternResolver`：

```java
ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
Resource[] resources = resolver.getResources(
    "classpath:/static/dataRoom/resource/image/**/*"
);
```

- 开发环境（IDE 运行）：classpath 指向 `src/main/resources`，扫描结果为 `FileUrlResource`，可直接读文件。
- 打包环境（jar 运行）：classpath 在 jar 内，扫描结果为 jar 内条目，`PathMatchingResourcePatternResolver` 同样支持。
- 两种环境统一用 `Resource` API 处理，不区分实现。

### BuiltinResourceService

新增 `BuiltinResourceService`，职责：

- `@PostConstruct` 启动时扫描 classpath，构造内存 `List<ResourceEntity>` 并缓存。
- 扫描路径：`classpath:/static/dataRoom/resource/image/**/*`。
- 遍历扫描结果，过滤掉目录（仅保留文件），解析出 `category`（相对路径中的子目录名）。
- 为每个文件构造 `ResourceEntity`，字段映射见下表。
- 提供 `getList(String category)` 按 category 过滤，`getCategories()` 返回去重后的分类列表。
- 线程安全：用不可变列表或 `CopyOnWriteArrayList` 缓存。

`ResourceEntity` 字段映射（内存构造，不入库）：

| 字段 | 取值 | 说明 |
|------|------|------|
| `id` | `builtin-{category}-{filename}` | 伪 id，保证唯一，不与 DB id 冲突 |
| `name` | 文件名去扩展名 | 显示名 |
| `originalName` | 文件名（含扩展名） | 原始名 |
| `resourceType` | `ResourceType.getByExtension(ext)` | 复用现有枚举，默认 IMAGE |
| `parentCode` | `builtin-{category}` | 用于前端按分类分组 |
| `path` | `static/dataRoom/resource/image/{category}/{filename}` | classpath 相对路径，仅记录 |
| `url` | `/dataRoom/resource/image/{category}/{filename}` | 前端访问路径，经 `getResourceUrl` 拼接 |
| `thumbnail` | 同 `url` | 图片本身即缩略图 |
| `size` | `resource.contentLength() / 1024` | KB，classpath 资源可读 contentLength |
| `remark` | `null` | 留空 |
| `config` | `null` | 留空 |

### BuiltinResourceController

新增 `BuiltinResourceController`，路径 `/dataRoom/resource/builtin`：

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/dataRoom/resource/builtin/list` | 返回默认素材列表，可选 `category` 参数过滤 | DEVELOPER |
| GET | `/dataRoom/resource/builtin/categories` | 返回所有分类（子目录名列表） | DEVELOPER |

- classpath 只读，不提供 upload/delete/insert/update 接口。
- 不需要 Shiro 匿名放行（素材通过 classpath 静态资源映射访问，不走 Controller 代理）。
- 列表接口返回 `List<ResourceEntity>`，与现有 `/dataRoom/resource/list` 结构一致，前端可复用同一渲染逻辑。

## 前端设计

### API 封装

`dataRoomFront/src/dataRoom/resource/api.ts` 新增两个方法：

```typescript
export const resourceApi = {
  // ...现有方法不变
  builtinList(params?: { category?: string }): Promise<ResourceEntity[]>
  // GET /dataRoom/resource/builtin/list

  builtinCategories(): Promise<string[]>
  // GET /dataRoom/resource/builtin/categories
}
```

### 素材库 Tab 切换

`dataRoomFront/src/dataRoom/resource/index.vue` 顶部新增 `el-tabs`：

- Tab 1「我的素材」：现有逻辑完全不变。
- Tab 2「系统默认素材」：
  - 顶部或左侧展示分类列表（从 `builtinCategories()` 获取，以 chip 或下拉形式切换）。
  - 选中分类后调用 `builtinList({ category })` 获取该分类下素材。
  - 复用现有卡片网格（6 列 grid）、卡片点击预览、`selectable` 选中回调。
  - 隐藏"新增"按钮（只读，不显示新增/删除操作）。
  - 选中后通过 `getResourceUrl(resource.url)` 拼接访问地址，与用户素材行为一致。

### 设计器素材弹框

`dataRoomFront/src/dataRoom/designer/components/ResourceLib.vue` 包装了 `resource/index.vue`，以 `selectable=true` 运行。新增 Tab 后，该弹框自动获得"系统默认素材"能力，无需额外改动。

### 样式规范

遵循 `docs/design/DESIGN.md`：
- Tab 使用 Element Plus 默认 `el-tabs` 样式，不覆盖内部样式。
- 分类切换使用 `el-radio-group` 或 chip 组件，不硬编码颜色。
- 卡片网格复用现有样式，不新增 `--dr-*` 变量。

## 权衡与局限

| 维度 | classpath 方案（采用） | 外部目录方案 |
|------|---------------------|------------|
| 增删素材 | 需重新打包部署 | 放文件即可，重启或刷新 |
| 部署 | 单一 jar，无外部依赖 | 需维护外部目录 |
| 扫描方式 | PathMatchingResourcePatternResolver | File API |
| 只读性 | 天然只读，不可篡改 | 可被外部修改 |
| 适用场景 | 随系统发布的固定默认素材 | 需频繁增删的素材 |

## 涉及文件

### 后端新增

| 文件 | 说明 |
|------|------|
| `dataRoomServer/.../resources/builtin/BuiltinResourceService.java` | classpath 扫描 + 内存缓存 |
| `dataRoomServer/.../resources/builtin/BuiltinResourceController.java` | 默认素材列表 + 分类接口 |

### 前端修改

| 文件 | 说明 |
|------|------|
| `dataRoomFront/src/dataRoom/resource/api.ts` | 新增 `builtinList`、`builtinCategories` |
| `dataRoomFront/src/dataRoom/resource/index.vue` | 新增 `el-tabs` 切换 + 默认素材展示 |

### 素材放置

| 目录 | 说明 |
|------|------|
| `dataRoomServer/src/main/resources/static/dataRoom/resource/image/{category}/` | 默认素材存放处 |

## 错误处理

- classpath 扫描失败（目录不存在或无文件）：返回空列表，不抛异常，记录 warn 日志。
- 分类参数为空时：返回全部默认素材。
- 分类不存在时：返回空列表。
- 新增或修改的 `catch` 块必须记录异常栈，遵循项目规范，使用 `log.error(ExceptionUtils.getStackTrace(e));`。

## 验证步骤

1. 在 `dataRoomServer/src/main/resources/static/dataRoom/resource/image/bg/` 下放入若干图片。
2. 后端启动：`mvn spring-boot:run -pl dataRoomServer`。
3. 前端启动：`cd dataRoomFront && npm run dev`。
4. 访问素材库，切换到"系统默认素材"Tab。
5. 验证分类列表正确显示（如 `bg`）。
6. 验证卡片网格正确展示素材缩略图。
7. 验证点击卡片可预览大图。
8. 进入设计器，打开素材弹框，切换到"系统默认素材"，选择素材添加到画布。
9. 验证素材图片在画布中正确渲染。
10. 验证 `npm run type-check` 通过。
11. 涉及 Java `catch` 块时运行：

```bash
mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

## 验收标准

- 默认素材放入 `src/main/resources/static/dataRoom/resource/image/{分类}/` 后，前端素材库"系统默认素材"Tab 可正常展示。
- 分类列表动态来自子目录，新增子目录后重启即可显示新分类。
- 默认素材不写入数据库。
- 在设计器素材弹框中可选择默认素材并添加到画布，图片正常渲染。
- 现有用户素材的上传、管理功能不受影响。
- 不引入新的静态资源映射配置。
- 相关测试通过，或在交付说明中明确无法运行原因。
