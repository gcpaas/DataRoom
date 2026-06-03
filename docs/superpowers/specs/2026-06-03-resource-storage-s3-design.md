# 素材库 S3 兼容存储设计

## 背景

DataRoom 当前素材库已抽出本地和 MinIO 两类存储实现，但 MinIO 和 RustFS 都兼容 S3 协议。继续使用 MinIO 专用 SDK 和 `minio` 配置命名会误导后续维护者，让业务代码看起来依赖某个具体对象存储产品。

本设计将对象存储能力调整为 S3 兼容存储。后端只关心 S3 协议和配置，MinIO、RustFS 或其他 S3 兼容服务只作为 endpoint 后面的具体实现存在。

## 目标

- 使用 `software.amazon.awssdk:s3:2.25.27` 替换 `io.minio:minio`。
- 存储类型只支持 `local` 和 `s3`。
- 配置从 `dataroom.resource.storage.minio.*` 改为 `dataroom.resource.storage.s3.*`。
- 旧 `type=minio` 和 `storage.minio.*` 不保留兼容。
- 将存储接口 `ResourceStorageService` 改名为 `IResourceStorageService`。
- 保持素材上传、更新、删除、封面、代理访问等业务行为不变。

## 非目标

- 不迁移历史本地资源或历史 MinIO 资源。
- 不新增数据库字段。
- 不改变前端素材库接口和页面逻辑。
- 不暴露对象存储 endpoint 给前端。
- 不新增预签名 URL、S3 ranged GET、多 bucket、多租户隔离等扩展能力。
- 不保留 `minio` 作为配置别名或存储类型别名。

## 方案选择

### 方案 A：彻底改成 S3 兼容存储

删除 MinIO SDK，新增 AWS SDK v2 S3 SDK。后端配置、类名、条件装配和存储类型统一改为 `s3`。MinIO 和 RustFS 使用同一套 S3 实现。

优点是语义准确，后续维护者不会误解为只支持 MinIO。缺点是已有 `minio` 配置需要手动改成 `s3`。

### 方案 B：保留 MinIO 命名但换 SDK

类名和配置仍使用 `minio`，内部改成 AWS SDK S3。

改动较小，但命名会继续误导维护者，不符合本次修正目标。

### 方案 C：同时支持 `s3` 和 `minio`

新增 `s3`，保留 `minio` 作为兼容配置。

迁移更温和，但会增加不必要的分支。用户已明确旧 `minio` 配置直接放弃，因此不采用。

采用方案 A。

## 配置设计

`application-base.yml` 中资源存储配置改为：

```yaml
dataroom:
  resource:
    storage:
      # 存储类型：local、s3
      type: local
      s3:
        endpoint: http://127.0.0.1:9000
        bucket: dataroom
        accessKey: dataroom
        secretKey: dataroom
        region: us-east-1
        pathStyleAccess: true
```

`ResourceBean.Storage` 中：

- `type` 默认仍为 `local`。
- `minio` 字段改为 `s3`。
- 内部配置类 `Minio` 改为 `S3`。
- `region` 默认 `us-east-1`。
- `pathStyleAccess` 默认 `true`，适配 RustFS 和 MinIO 这类常见 S3 兼容服务。

`type=s3` 时，`endpoint`、`bucket`、`accessKey`、`secretKey` 必填。旧 `type=minio` 不装配任何 S3 实现，表现为配置错误。

## 依赖设计

根 `pom.xml` 删除：

```xml
<minio.version>...</minio.version>
<dependency>
  <groupId>io.minio</groupId>
  <artifactId>minio</artifactId>
</dependency>
```

新增：

```xml
<dependency>
  <groupId>software.amazon.awssdk</groupId>
  <artifactId>s3</artifactId>
  <version>2.25.27</version>
</dependency>
```

## 存储接口

现有接口改名为 `IResourceStorageService`，方法语义保持不变：

```java
public interface IResourceStorageService {
    String getStorageType();
    StoredResource store(ResourceStoreRequest request) throws IOException;
    ResourceStream load(ResourceEntity resource, ResourceFileVariant variant) throws IOException;
    void delete(String objectKey) throws IOException;
}
```

实现类：

- `LocalResourceStorageServiceImpl` 实现 `IResourceStorageService`，`getStorageType()` 返回 `local`。
- `S3ResourceStorageServiceImpl` 实现 `IResourceStorageService`，`getStorageType()` 返回 `s3`。

## S3 实现设计

`S3ResourceStorageServiceImpl` 使用 AWS SDK v2：

- `S3Client.builder()`
- `endpointOverride(URI.create(config.getEndpoint()))`
- `Region.of(config.getRegion())`
- `StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey))`
- `serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(config.getPathStyleAccess()).build())`

上传前检查 bucket 是否存在。bucket 不存在时自动创建，延续当前 MinIO 实现行为。并发创建时，如果服务端返回 bucket 已存在或已归属当前账号，视为成功。

对象 key 仍由 `ResourceController` 生成，保持当前规则：

- 图片：`image/{uuid}.{ext}`
- 视频：`video/{uuid}.{ext}`
- 模型：`model/{uuid}.{ext}`

`store()` 写入对象后返回 object key 和 KB 单位 size。数据库中的 `path` 保存 object key。

`load()` 根据 `ResourceFileVariant` 选择主文件或封面 object key，先 `headObject` 获取 `contentLength` 和 `contentType`，再 `getObject` 返回输入流。

`delete()` 删除指定 object key。空 key 直接返回。

## Controller 行为

`ResourceController` 注入类型从 `ResourceStorageService` 改为 `IResourceStorageService`。

对象存储判断从 `isMinioStorage()` 改为 `isS3Storage()`：

```java
private boolean isS3Storage() {
    return "s3".equalsIgnoreCase(resourceStorageService.getStorageType());
}
```

除判断名称外，上传、更新、删除、封面、代理读取等流程不改变。

S3 下返回给前端的访问地址继续走后端代理：

- 主文件：`/dataRoom/resource/file/{id}`
- 封面：`/dataRoom/resource/file/{id}/thumbnail`

前端不需要知道对象存储 endpoint，也不需要区分 MinIO 或 RustFS。

读取响应继续由 `ResourceController.writeStream()` 处理，包括 content type、content length、inline 文件名和 Range 输出。本次不引入 S3 ranged GET。

## 错误处理

S3 上传、读取、删除失败统一转换为 `IOException`，由现有 Controller 流程处理：

- 上传失败：回滚本次新写入的 object。
- 读取找不到资源或对象：返回 404。
- 读取异常：返回 500。
- 删除异常：返回现有“删除素材文件失败”响应。

所有新增或修改的 `catch` 块都必须记录异常栈，遵循项目规范。优先使用 `log.error(ExceptionUtils.getStackTrace(e));`；已有 `log.warn/error(..., e)` 形式可保留。

## 测试计划

- 验证 `storage.type=local` 时本地存储实现仍可装配。
- 验证 `storage.type=s3` 时 S3 存储实现可装配，`getStorageType()` 返回 `s3`。
- 验证 `ResourceBean.Storage.s3` 配置字段绑定正确。
- 验证 Controller 在 S3 存储下仍返回代理 URL：
  - 主文件 `/dataRoom/resource/file/{id}`
  - 封面 `/dataRoom/resource/file/{id}/thumbnail`
- 验证代码中不再依赖 `io.minio:minio`。
- 修改涉及 `catch` 块时运行：

```bash
mvn -q -pl dataroom-server -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

如环境无法连接真实 RustFS 或 MinIO，第一版不要求真实 S3 集成测试；至少完成配置、装配和 Controller 行为测试。

## 验收标准

- `dataroom.resource.storage.type=local` 时，本地上传、访问、删除保持可用。
- `dataroom.resource.storage.type=s3` 时，新素材写入 S3 兼容服务。
- S3 bucket 不存在时会自动创建。
- 前端收到的对象存储资源 URL 仍是后端代理地址。
- 旧 `minio` 配置不再被支持。
- 代码中不再出现 MinIO SDK 依赖和 MinIO 专用存储实现命名。
- 相关测试通过，或在交付说明中明确无法运行原因。
