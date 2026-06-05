# 素材库 MinIO 存储支持设计

## 背景

DataRoom 当前素材上传只支持本地文件系统。后端在 `ResourceController` 中直接使用 `dataroom.resource.basePath` 写文件，并通过 Spring 静态资源映射暴露资源。这个模式在单机部署下可用，但不适合多实例部署或需要对象存储的环境。

本设计新增基于 S3 兼容协议的 MinIO 存储支持。第一版目标是以较小改动抽出存储层，保留现有资源元数据结构和前端使用方式，让前端通过 `url` 字段无感访问资源。

## 目标

- 通过 `dataroom.resource.storage.type` 选择资源存储实现。
- 支持 `local` 和 `minio` 两种存储类型。
- 对外提供统一的资源存储接口，由当前存储类型选择对应实现。
- MinIO 资源不直接暴露对象存储地址，统一通过后端公开代理接口访问。
- PageDesigner 和 VisualScreenDesigner 的背景图上传也创建素材库资源记录，上传后能在素材库 root 目录看到。
- 素材库上传、编辑重传、设计器背景上传使用统一上传接口。
- 第一版不做历史本地资源迁移，不支持同一套数据在 local/minio 间自动切换兼容。
- 第一版不新增资源表字段，复用 `path`、`url`、`thumbnail` 承载存储路径和访问地址。

## 非目标

- 不做本地资源到 MinIO 的迁移工具。
- 不做运行中动态切换存储类型后的历史数据兼容。
- 不引入完整资源业务 Service 层；第一版只抽存储层，`ResourceController` 仍负责资源元数据编排。
- 不实现私有资源、临时签名 URL、细粒度访问权限。
- 不要求 MinIO bucket 自动创建；部署配置应确保 bucket 已存在。
- 不改造目录资源的存储逻辑。目录仍是元数据记录，不涉及对象存储。

## 已确认的产品决策

- 非 local 存储资源使用代理地址：`/dataRoom/resource/file/{id}`。
- 代理读取接口暂时不鉴权，公开访问。
- MinIO 配置采用 `storage.type: minio` 和 `storage.minio.*` 的结构。
- 第一版复用现有 `ResourceEntity` 字段，不新增 `storageType`、`bucket`、`objectKey` 等字段。
- 上传接口统一为“上传文件并创建或更新资源记录”，不再把素材库文件上传设计为临时上传和二次 insert 两阶段。
- PageDesigner 和 VisualScreenDesigner 背景图上传使用同一个上传接口；未传名称时后端从文件名去后缀生成资源名称。
- 设计器背景图默认进入素材库 `root` 目录。
- 编辑资源重新上传也合并到同一个上传接口，传 `id` 表示更新已有资源。
- 上传请求可能同时包含主文件 `file` 和封面文件 `cover`。

## 方案取舍

### 方案 A：只抽存储层

新增 `ResourceStorageService` 及 local/minio 实现。`ResourceController` 继续负责资源类型判断、命名、数据库 CRUD 和接口返回。

优点是改动小，第一版风险低。缺点是 Controller 仍然较重，后续如果增加更多存储类型、权限、迁移、清理任务，仍可能需要继续拆分业务 Service。

### 方案 B：抽资源业务 Service 和存储 Service

新增 `ResourceService` 编排上传、更新、删除、代理读取，再通过 `ResourceStorageService` 写入不同存储。

优点是边界更清楚，长期扩展性更好。缺点是第一版改动更大，需要重排现有资源 Controller 逻辑。

### 方案 C：扩展 Spring 静态资源链

尝试让 MinIO 资源像本地静态文件一样由 Spring 资源链处理。

缺点是数据库关联、代理读取、Content-Type、Range、错误处理都不如显式 Controller 可控，不符合 `/file/{id}` 的代理目标。

### 结论

采用方案 A。第一版只抽存储层，保持功能范围聚焦；后续如果资源模块继续扩展，再考虑引入 `ResourceService`。

## 配置设计

`application-base.yml` 保留现有本地配置，并新增 storage 配置：

```yaml
dataroom:
  resource:
    basePath: ./dataRoomResource
    uiPath: ./dataRoomFront
    urlPrefix: http://127.0.0.1:${server.port}${server.servlet.context-path}/static/
    storage:
      type: local
      minio:
        endpoint: http://127.0.0.1:9000
        bucket: dataroom
        accessKey: minioadmin
        secretKey: minioadmin
        region: us-east-1
        pathStyleAccess: true
```

配置对象建议扩展为：

- `ResourceBean`
  - `basePath`
  - `urlPrefix`
  - `Storage storage`
- `ResourceStorageBean`
  - `String type`
  - `MinioStorageBean minio`
- `MinioStorageBean`
  - `endpoint`
  - `bucket`
  - `accessKey`
  - `secretKey`
  - `region`
  - `pathStyleAccess`

第一版支持的 `type`：

- `local`
- `minio`

## 后端结构

新增存储接口：

```java
public interface ResourceStorageService {
    String getStorageType();
    StoredResource store(ResourceStoreRequest request);
    ResourceStream load(ResourceEntity resource, ResourceFileVariant variant);
    void delete(String objectKey);
}
```

建议请求和返回模型：

```java
public class ResourceStoreRequest {
    private MultipartFile file;
    private String objectKey;
    private ResourceType resourceType;
}

public class StoredResource {
    private String objectKey;
    private String accessUrl;
    private Long size;
}

public class ResourceStream {
    private InputStream inputStream;
    private Long contentLength;
    private String contentType;
    private String fileName;
}

public enum ResourceFileVariant {
    MAIN,
    THUMBNAIL
}
```

实现类：

- `LocalResourceStorageServiceImpl`
  - `getStorageType()` 返回 `local`
  - 写入 `dataroom.resource.basePath`
  - 主文件访问地址保持 `/image/{uuid}.png` 等现有相对 URL
  - 封面访问地址保持对应本地相对 URL
- `MinioResourceStorageServiceImpl`
  - `getStorageType()` 返回 `minio`
  - 使用 MinIO Java SDK 写入 bucket
  - `path` 和 `thumbnail` 在数据库中保存 object key
  - 返回给前端前将主文件 URL 规范化为 `/dataRoom/resource/file/{id}`
  - 返回给前端前将封面 URL 规范化为 `/dataRoom/resource/file/{id}/thumbnail`

存储实现通过 Spring Boot 条件装配加载：

- `LocalResourceStorageServiceImpl` 使用 `@ConditionalOnProperty`，`dataroom.resource.storage.type=local` 或未配置时加载。
- `MinioResourceStorageServiceImpl` 使用 `@ConditionalOnProperty`，`dataroom.resource.storage.type=minio` 时加载。
- `ResourceController` 直接注入唯一的 `ResourceStorageService`。
- 配置为未知类型时不产生存储实现 Bean，应用启动阶段暴露配置错误。

第一版不新增 `ResourceService`。`ResourceController` 继续保留：

- 列表、详情、删除、更新模型配置等现有入口。
- 文件类型识别。
- object key 生成。
- `ResourceEntity` 构建和数据库写入。
- 调用存储服务写入、读取和删除对象。

## 统一上传接口

继续使用：

```http
POST /dataRoom/resource/upload
Content-Type: multipart/form-data
```

请求字段：

| 字段 | 必填 | 说明 |
|------|------|------|
| `file` | 新增文件资源时必填 | 主资源文件 |
| `cover` | 否 | 封面文件 |
| `id` | 否 | 传入时更新已有资源 |
| `name` | 否 | 资源名称；为空时从 `file.originalFilename` 去后缀生成 |
| `resourceType` | 否 | 资源类型；为空时按主文件扩展名识别 |
| `parentCode` | 否 | 目录编码；默认 `root` |
| `remark` | 否 | 备注 |

### 新增资源流程

不传 `id` 时为新增。

1. 校验 `file` 必填。
2. 后端使用 MyBatis-Plus `IdWorker.getIdStr()` 生成资源 id。虽然 `BaseEntity` 已配置 `IdType.ASSIGN_ID`，但 MinIO 代理 URL 需要在 insert 前拿到 id。
3. 从文件名解析扩展名、资源类型、文件大小。
4. 生成主文件 object key：`{subDir}/{uuid}.{ext}`。
5. 调用当前 `ResourceStorageService.store()` 写入主文件。
6. 如果传了 `cover`：
   - 生成封面 object key。
   - 调用当前存储实现写入封面。
   - local 下 `thumbnail` 存本地访问 URL。
   - minio 下数据库 `thumbnail` 存封面 object key，返回前规范化为代理 URL。
7. 设置 `ResourceEntity`：
   - `id`
   - `name`
   - `originalName`
   - `resourceType`
   - `parentCode`
   - `path`
   - `url`
   - `thumbnail`
   - `size`
   - `remark`
   - `config`
8. insert `dr_resource`。
9. 返回规范化后的最终 `ResourceEntity`。

### 更新资源流程

传 `id` 时为更新。

1. 查询旧资源，不存在则返回 `资源不存在`。
2. `file`、`cover`、元数据字段都可选，但至少要有一个可更新内容。
3. 如果传了 `file`：
   - 写入新主文件。
   - 更新 `path/url/originalName/size/resourceType/config`。
4. 如果传了 `cover`：
   - 写入新封面。
   - 更新 `thumbnail`。
5. 如果传了 `name/parentCode/remark/resourceType`：
   - 更新对应元数据。
6. 数据库 update 成功后，尝试删除旧主文件和旧封面对象。
7. 旧对象删除失败只记录 warn，不回滚用户更新。
8. 返回规范化后的最终 `ResourceEntity`。

### 目录资源

目录资源不涉及 `file` 或 `cover`。第一版仍走现有 `/insert` 和 `/update` 元数据接口，不通过 `/upload`。

## 代理读取接口

新增两个公开读取接口：

```http
GET /dataRoom/resource/file/{id}
GET /dataRoom/resource/file/{id}/thumbnail
```

要求：

- 不加 `@RequiresRoles`。
- 根据 `id` 查询 `ResourceEntity`。
- 当前 storage 为 `minio` 时：
  - `/file/{id}` 读取 `path` object key。
  - `/file/{id}/thumbnail` 读取 `thumbnail` object key。
- 当前 storage 为 `local` 时：
  - 代理接口可兼容读取本地文件，但本地资源主访问仍保持原静态 URL。
- 返回 `Content-Type`，根据文件名、object key 或 `ServletContext.getMimeType()` 推断。
- 返回 `Content-Disposition: inline`。
- 能拿到大小时设置 `Content-Length`。
- 代理主文件时支持 HTTP Range，以保证视频播放和拖动体验。

错误语义：

- 资源不存在：404。
- `path` 或 `thumbnail` 为空：404。
- 对象不存在：404。
- MinIO 连接或读取失败：500。

## URL 规范化

为了避免数据库字段在 MinIO 下既要保存 object key 又要给前端访问，Controller 返回资源前统一规范化访问地址。

local：

- `url` 不改，保持 `/image/{uuid}.png` 等静态地址。
- `thumbnail` 不改，保持本地静态地址。

minio：

- `url = /dataRoom/resource/file/{id}`。
- 如果 `thumbnail` 非空，返回对象中设置 `thumbnail = /dataRoom/resource/file/{id}/thumbnail`。
- 数据库中 `path` 仍保存主文件 object key。
- 数据库中 `thumbnail` 仍保存封面 object key。

规范化应用在：

- `/upload` 返回。
- `/list` 返回。
- `/detail/{id}` 返回。
- `updateModelConfig` 等修改资源字段的接口写库时保留数据库字段语义；后续通过 `/list` 或 `/detail/{id}` 返回资源时再做访问 URL 规范化。

## 前端影响

### 素材库

素材库新增/编辑弹窗改为“点确定时提交”：

- 文件选择只暂存在前端，不立即上传。
- 点确定时提交 multipart 到 `/dataRoom/resource/upload`。
- 新增文件资源不再调用 `/insert`。
- 编辑文件资源传 `id` 到 `/upload`，同一个接口完成元数据更新和可选重传。
- 目录资源保持现有 `/insert`、`/update`。

### PageDesigner 和 VisualScreenDesigner

背景图上传仍可保持选择文件后立即上传，但调用同一个 `/dataRoom/resource/upload`。

调用时可以只传：

- `file`

后端自动：

- 从文件名生成资源名称。
- 识别资源类型。
- 设置 `parentCode = root`。
- 写入数据库。
- 返回最终 `ResourceEntity`。

设计器继续使用 `response.data.url` 设置背景地址。由于资源已经入库，素材库 root 目录能看到该背景图。

### 资源 URL 使用

前端继续使用现有 `getResourceUrl()` 逻辑：

- 如果 `url` 是 `http/https`，直接使用。
- 如果是相对 URL，则拼接 `VITE_RESOURCE_BASE_URL`。

MinIO 代理 URL `/dataRoom/resource/file/{id}` 是相对 URL，前端无需感知存储类型。

### 3D 模型格式判断

代理 URL `/dataRoom/resource/file/{id}` 没有文件后缀。现有 3D 模型加载不能只依赖 URL 后缀判断格式。

模型加载逻辑需要优先从以下来源判断格式：

1. `resource.config.format`。
2. `resource.originalName` 后缀。
3. `resource.path` 后缀。
4. 最后才尝试 URL 后缀。

## 删除策略

删除资源时：

1. 查询资源记录。
2. 删除数据库记录前，先尝试删除对应存储对象。
3. 包含主文件和封面文件。
4. 存储删除失败时阻止删除并返回错误，避免数据库记录删除后对象不可控残留。

更新重传时：

1. 先写入新对象。
2. 数据库 update 成功后再尝试删除旧对象。
3. 旧对象删除失败只记录 warning，不回滚更新结果。

## 错误处理

- `storage.type` 不存在或找不到实现：返回明确业务错误或启动失败。
- MinIO 配置缺少 `endpoint/bucket/accessKey/secretKey`：初始化时报出缺失项。
- 新增文件资源时缺少 `file`：返回 `请上传文件`。
- 主文件上传成功但封面上传失败：整个请求失败，并尝试删除已上传主文件。
- 存储成功但数据库 insert/update 失败：尝试删除本次新上传对象。
- 更新资源时 `id` 不存在：返回 `资源不存在`。
- 未知扩展名第一版沿用当前行为，默认按 image 处理。

## 依赖

新增 MinIO Java SDK：

```xml
<dependency>
  <groupId>io.minio</groupId>
  <artifactId>minio</artifactId>
  <version>8.5.10</version>
</dependency>
```

实施阶段采用 `8.5.10`，该版本与当前本地 Maven 依赖树中的 OkHttp 4.12.0 可正常配合编译。

## 测试方案

### 后端单元测试

- `ResourceStorageService` 条件装配按 `storage.type` 加载 local/minio 唯一实现。
- object key 生成：image/video/model 子目录和扩展名保留。
- 文件类型识别：图片、视频、模型、未知扩展。
- MinIO URL 规范化：
  - 主文件 `/dataRoom/resource/file/{id}`。
  - 封面 `/dataRoom/resource/file/{id}/thumbnail`。
- 新增上传：未传 name 时从文件名去后缀生成。
- 更新上传：
  - 只传 `cover` 不覆盖主文件字段。
  - 只传 `file` 不清空封面。
  - 两个文件都传时同时更新主文件和封面。

### Controller 或集成测试

- `/upload` 不传 id + file：创建资源记录。
- `/upload` 不传 name：使用文件名生成资源名称。
- `/upload` 传 id + file：更新已有主文件。
- `/upload` 传 id + cover：更新封面。
- `/upload` 只传 file 的设计器场景：资源进入 root 目录。
- `/file/{id}` 能代理返回主文件，并支持 HTTP Range。
- `/file/{id}/thumbnail` 能代理返回封面。
- 删除资源时调用当前存储实现删除主文件和封面。

### MinIO 测试

第一版可优先 mock MinIO client 或 mock `ResourceStorageService` 测 Controller 行为。后续如果项目允许引入 Testcontainers，再补真实 MinIO 集成测试。

### 前端验证

- 素材库新增文件资源：点确定才上传并入库。
- 素材库编辑资源：可只改名称，也可重传主文件和封面。
- PageDesigner 背景上传后，素材库 root 可看到该图片。
- VisualScreenDesigner 背景上传后，素材库 root 可看到该图片。
- local 和 minio 下前端只使用返回的 `url/thumbnail`，不需要判断存储类型。

## 交付边界

第一版交付后应满足：

- `dataroom.resource.storage.type=local` 时现有本地上传和访问可用。
- `dataroom.resource.storage.type=minio` 时新上传资源写入 MinIO，并通过 `/dataRoom/resource/file/{id}` 访问。
- 统一 `/upload` 能处理素材库上传、编辑重传、设计器背景上传。
- 设计器上传背景图会自动进入素材库 root。
- 不提供历史资源迁移能力。
- 不保证切换 storage type 后历史资源仍然可访问。
