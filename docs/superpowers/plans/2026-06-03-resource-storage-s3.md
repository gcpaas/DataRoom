# Resource Storage S3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the product-specific MinIO resource storage integration with an S3-compatible storage implementation while preserving existing resource upload, proxy read, update, delete, and local-storage behavior.

**Architecture:** Keep `ResourceController` as the metadata and request-flow orchestrator. Rename the storage SPI to `IResourceStorageService`, keep local storage unchanged except for the interface name, and replace the MinIO implementation with an AWS SDK v2 `S3Client` implementation selected by `dataroom.resource.storage.type=s3`.

**Tech Stack:** Spring Boot 3.5, Maven, MyBatis-Plus, AWS SDK for Java v2 S3 `2.25.27`, JUnit 5, AssertJ, Mockito.

---

## File Structure

- Modify `pom.xml`: remove `minio.version` and `io.minio:minio`; add `software.amazon.awssdk:s3:2.25.27`.
- Modify `dataroom-server/src/main/resources/application-base.yml`: replace `storage.minio` sample config with `storage.s3` and update type comments.
- Modify `dataroom-server/src/main/java/com/gccloud/gcpaas/core/config/bean/ResourceBean.java`: replace `Storage.minio` and `ResourceBean.Minio` with `Storage.s3` and `ResourceBean.S3`.
- Rename `dataroom-server/src/main/java/com/gccloud/gcpaas/core/resources/storage/ResourceStorageService.java` to `IResourceStorageService.java`: keep method signatures unchanged.
- Modify `dataroom-server/src/main/java/com/gccloud/gcpaas/core/resources/storage/LocalResourceStorageServiceImpl.java`: implement `IResourceStorageService`.
- Replace `dataroom-server/src/main/java/com/gccloud/gcpaas/core/resources/storage/MinioResourceStorageServiceImpl.java` with `S3ResourceStorageServiceImpl.java`: implement S3 upload, load, delete, bucket auto-create, and config validation.
- Modify `dataroom-server/src/main/java/com/gccloud/gcpaas/core/resources/storage/StoredResource.java`: update storage comment from `minio` to `s3`.
- Modify `dataroom-server/src/main/java/com/gccloud/gcpaas/core/resources/ResourceController.java`: inject `IResourceStorageService`, rename storage helpers to S3, keep all request behavior unchanged.
- Modify `dataroom-server/src/test/java/com/gccloud/gcpaas/core/resources/storage/IResourceStorageServiceConditionTest.java`: assert local and s3 conditional bean loading.
- Replace `dataroom-server/src/test/java/com/gccloud/gcpaas/core/resources/storage/MinioResourceStorageServiceImplTest.java` with `S3ResourceStorageServiceImplTest.java`: cover bucket auto-create and S3 configuration.
- Modify `dataroom-server/src/test/java/com/gccloud/gcpaas/core/resources/ResourceControllerTest.java`: use `IResourceStorageService` and `s3` storage type.

## Task 1: Update Tests For S3 Target

**Files:**
- Modify: `dataroom-server/src/test/java/com/gccloud/gcpaas/core/resources/storage/IResourceStorageServiceConditionTest.java`
- Create: `dataroom-server/src/test/java/com/gccloud/gcpaas/core/resources/storage/S3ResourceStorageServiceImplTest.java`
- Delete: `dataroom-server/src/test/java/com/gccloud/gcpaas/core/resources/storage/MinioResourceStorageServiceImplTest.java`
- Modify: `dataroom-server/src/test/java/com/gccloud/gcpaas/core/resources/ResourceControllerTest.java`

- [x] **Step 1: Change the storage condition test to the new interface and S3 type**

Update the condition test so the local case expects `IResourceStorageService`, no `S3ResourceStorageServiceImpl`, and the S3 case sets `dataroom.resource.storage.type=s3` and expects `S3ResourceStorageServiceImpl`.

- [x] **Step 2: Replace the MinIO implementation test with an S3 implementation test**

Create `S3ResourceStorageServiceImplTest` with a fake `S3Client` builder injected through a package-private constructor or factory seam in `S3ResourceStorageServiceImpl`. The test must prove that `store()` calls bucket existence check, creates the bucket when absent, and then uploads the object.

- [x] **Step 3: Update the controller test to use S3 naming**

Change `ResourceControllerTest` imports and fake storage service to implement `IResourceStorageService`. Use storage type `s3` in tests that assert proxy URL behavior.

- [x] **Step 4: Run the S3-targeted tests and verify RED**

Run:

```bash
mvn -q -pl dataroom-server -Dtest=IResourceStorageServiceConditionTest,S3ResourceStorageServiceImplTest,ResourceControllerTest -DforkCount=0 test
```

Expected: fail because production code still contains `ResourceStorageService` and `MinioResourceStorageServiceImpl`, and `S3ResourceStorageServiceImpl` does not exist yet.

## Task 2: Replace MinIO Configuration And Dependency

**Files:**
- Modify: `pom.xml`
- Modify: `dataroom-server/src/main/resources/application-base.yml`
- Modify: `dataroom-server/src/main/java/com/gccloud/gcpaas/core/config/bean/ResourceBean.java`

- [x] **Step 1: Replace Maven dependency**

Remove `<minio.version>` and the `io.minio:minio` dependency. Add:

```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.25.27</version>
</dependency>
```

- [x] **Step 2: Replace application storage sample config**

Set the storage comment to `local、s3` and replace `minio:` with:

```yaml
s3:
  endpoint: http://127.0.0.1:9000
  bucket: dataroom
  accessKey: dataroom
  secretKey: dataroom
  region: us-east-1
  pathStyleAccess: true
```

- [x] **Step 3: Replace ResourceBean Minio config with S3 config**

`ResourceBean.Storage` must contain:

```java
private S3 s3 = new S3();
```

and the nested config class must be named `S3` with fields `endpoint`, `bucket`, `accessKey`, `secretKey`, `region = "us-east-1"`, and `pathStyleAccess = true`.

## Task 3: Rename Storage SPI

**Files:**
- Rename: `dataroom-server/src/main/java/com/gccloud/gcpaas/core/resources/storage/ResourceStorageService.java` to `IResourceStorageService.java`
- Modify: `dataroom-server/src/main/java/com/gccloud/gcpaas/core/resources/storage/LocalResourceStorageServiceImpl.java`
- Modify: `dataroom-server/src/main/java/com/gccloud/gcpaas/core/resources/ResourceController.java`
- Modify: related tests

- [x] **Step 1: Rename the interface file and type**

The interface declaration must be:

```java
public interface IResourceStorageService {
    String getStorageType();
    StoredResource store(ResourceStoreRequest request) throws IOException;
    ResourceStream load(ResourceEntity resource, ResourceFileVariant variant) throws IOException;
    void delete(String objectKey) throws IOException;
}
```

- [x] **Step 2: Update local implementation and all references**

`LocalResourceStorageServiceImpl` must implement `IResourceStorageService`, and `ResourceController` plus tests must import and use `IResourceStorageService`.

## Task 4: Implement S3 Storage

**Files:**
- Create: `dataroom-server/src/main/java/com/gccloud/gcpaas/core/resources/storage/S3ResourceStorageServiceImpl.java`
- Delete: `dataroom-server/src/main/java/com/gccloud/gcpaas/core/resources/storage/MinioResourceStorageServiceImpl.java`

- [x] **Step 1: Implement conditional S3 service**

Annotate the service with:

```java
@Service
@ConditionalOnProperty(prefix = "dataroom.resource.storage", name = "type", havingValue = "s3")
```

`getStorageType()` must return `s3`.

- [x] **Step 2: Build AWS SDK v2 S3Client**

Create the client with endpoint override, static credentials, region, and path-style setting from `ResourceBean.S3`.

- [x] **Step 3: Implement bucket auto-create**

`store()` must call `headBucket`. If the bucket is missing, call `createBucket`. If concurrent creation reports bucket already exists or already owned, treat that as success.

- [x] **Step 4: Implement store, load, and delete**

`store()` uses `PutObjectRequest` and `RequestBody.fromInputStream`. `load()` uses `HeadObjectRequest` and `GetObjectRequest`. `delete()` uses `DeleteObjectRequest`.

- [x] **Step 5: Preserve exception logging contract**

Every new or modified `catch` block must log the stack trace with `ExceptionUtils.getStackTrace(e)` before preserving existing behavior or throwing `IOException`.

## Task 5: Keep Controller Behavior Stable

**Files:**
- Modify: `dataroom-server/src/main/java/com/gccloud/gcpaas/core/resources/ResourceController.java`
- Modify: `dataroom-server/src/main/java/com/gccloud/gcpaas/core/resources/storage/StoredResource.java`

- [x] **Step 1: Rename storage type helper**

Replace `isMinioStorage()` with:

```java
private boolean isS3Storage() {
    return "s3".equalsIgnoreCase(resourceStorageService.getStorageType());
}
```

Use it only where existing code normalized object-storage proxy URLs.

- [x] **Step 2: Keep proxy URLs unchanged**

S3 resources must still return `/dataRoom/resource/file/{id}` and `/dataRoom/resource/file/{id}/thumbnail`.

- [x] **Step 3: Update storage comments**

Change `StoredResource.accessUrl` comment to say S3 storage is normalized by the controller.

## Task 6: Verification

**Files:**
- Inspect all modified source, tests, and `pom.xml`.

- [x] **Step 1: Search for removed MinIO implementation references**

Run:

```bash
rg -n "io\\.minio|MinioResourceStorageServiceImpl|\\bResourceStorageService\\b|minio|MinIO|storage\\.minio|type=minio" pom.xml dataroom-server/src
```

Expected: no production references to MinIO SDK, MinIO storage implementation, old interface name, `storage.minio`, or `type=minio`. Historical test names must also be gone.

- [x] **Step 2: Run targeted storage tests**

Run:

```bash
mvn -q -pl dataroom-server -Dtest=IResourceStorageServiceConditionTest,S3ResourceStorageServiceImplTest,ResourceControllerTest -DforkCount=0 test
```

Expected: exit code 0.

- [x] **Step 3: Run catch logging rule test**

Run:

```bash
mvn -q -pl dataroom-server -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

Expected: exit code 0.

- [x] **Step 4: Run broader backend test check**

Run:

```bash
mvn -q -pl dataroom-server -DskipTests=false test
```

Expected: exit code 0, unless the environment blocks dependency downloads. If blocked, rerun the same command with escalation.

## Self-Review

- Spec coverage: dependency replacement, `local/s3` storage types, dropped `minio` compatibility, `IResourceStorageService`, S3 config fields, bucket auto-create, proxy URL behavior, and verification commands are mapped to tasks.
- Placeholder scan: no placeholder task remains; each step names exact files and commands.
- Type consistency: plan uses `IResourceStorageService`, `S3ResourceStorageServiceImpl`, and `ResourceBean.S3` consistently.
