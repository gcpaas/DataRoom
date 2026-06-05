# Resource Storage MinIO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement local/minio resource storage selection, unified resource upload persistence, public proxy reads, and matching frontend upload flows.

**Architecture:** Keep `ResourceController` as the resource metadata orchestrator and extract only storage operations behind `ResourceStorageService`. The unified `/dataRoom/resource/upload` endpoint writes storage and persists `ResourceEntity` in one request; MinIO resources are returned through `/dataRoom/resource/file/{id}` and `/thumbnail` proxy URLs.

**Tech Stack:** Spring Boot 3, MyBatis-Plus, MinIO Java SDK 8.5.10, Vue 3, Element Plus upload.

---

## File Structure

- Modify `pom.xml`: add `minio.version` and `io.minio:minio`.
- Modify `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/config/bean/ResourceBean.java`: add nested storage config.
- Modify `dataRoomServer/src/main/resources/application-base.yml`: add `dataroom.resource.storage`.
- Create `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/resources/storage/ResourceStorageService.java`: storage SPI.
- Create `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/resources/storage/ResourceStoreRequest.java`: storage request DTO.
- Create `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/resources/storage/StoredResource.java`: storage write result DTO.
- Create `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/resources/storage/ResourceStream.java`: storage read result DTO.
- Create `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/resources/storage/ResourceFileVariant.java`: main/thumbnail selector.
- Create `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/resources/storage/LocalResourceStorageServiceImpl.java`: local file storage.
- Create `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/resources/storage/MinioResourceStorageServiceImpl.java`: MinIO storage.
- Use Spring Boot conditional annotations on storage implementations so `dataroom.resource.storage.type` loads exactly one `ResourceStorageService`.
- Modify `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/resources/ResourceController.java`: unified upload/save, proxy read, URL normalization, delete cleanup.
- Modify `dataRoomFront/src/dataroom-packages/resource/api.ts`: support upload form payload helper.
- Modify `dataRoomFront/src/dataroom-packages/resource/index.vue`: submit file resources through `/upload`, keep directory insert/update.
- Modify `dataRoomFront/src/dataroom-packages/PageDesigner/ControlPanel.vue`: ensure background uploads use unified endpoint response.
- Modify `dataRoomFront/src/dataroom-packages/VisualScreenDesigner/ControlPanel.vue`: same.
- Modify 3D model loading components if URL suffix is assumed directly.

## Task 1: Backend Config And Storage SPI

**Files:**
- Modify: `pom.xml`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/config/bean/ResourceBean.java`
- Modify: `dataRoomServer/src/main/resources/application-base.yml`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/resources/storage/*.java`

- [x] **Step 1: Add MinIO dependency**

Add:

```xml
<minio.version>9.0.1</minio.version>
```

and:

```xml
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>${minio.version}</version>
</dependency>
```

- [x] **Step 2: Add config beans**

Extend `ResourceBean` with nested `Storage` and `Minio` config classes:

```java
private Storage storage = new Storage();

@Data
public static class Storage {
    private String type = "local";
    private Minio minio = new Minio();
}
```

- [x] **Step 3: Add storage SPI DTOs**

Create focused DTOs under `core/resources/storage`:

```java
public interface ResourceStorageService {
    String getStorageType();
    StoredResource store(ResourceStoreRequest request) throws IOException;
    ResourceStream load(ResourceEntity resource, ResourceFileVariant variant) throws IOException;
    void delete(String objectKey);
}
```

- [x] **Step 4: Verify compile target**

Run: `mvn -q -DskipTests package`

Expected: compile reaches later tasks or passes after implementations exist.

## Task 2: Local And MinIO Implementations

**Files:**
- Create: `LocalResourceStorageServiceImpl.java`
- Create: `MinioResourceStorageServiceImpl.java`
- Add conditional loading annotations to the storage implementations.

- [x] **Step 1: Implement local storage**

Use `FileUtils.copyInputStreamToFile()` with `dataroom.resource.basePath` and return existing relative URLs.

- [x] **Step 2: Implement MinIO storage**

Build `MinioClient` from config and use `PutObjectArgs`, `GetObjectArgs`, `StatObjectArgs`, `RemoveObjectArgs`.

- [x] **Step 3: Implement factory**

Select implementation by `dataroom.resource.storage.type`; throw `IllegalArgumentException("不支持的资源存储类型: " + type)` when missing.

- [x] **Step 4: Run backend compile**

Run: `mvn -q -DskipTests package`

Expected: exit 0 after all backend references are wired.

## Task 3: Unified Upload And Proxy Reads

**Files:**
- Modify: `ResourceController.java`

- [x] **Step 1: Refactor upload**

Change `/upload` to accept `id`, `file`, `cover`, `name`, `resourceType`, `parentCode`, `remark`. If `id` is blank, generate id with `IdWorker.getIdStr()`, write files, insert DB. If `id` exists, query row, write optional files, update DB.

- [x] **Step 2: Normalize resource URLs**

Add a helper that returns a copy for API responses:

```java
if ("minio".equals(currentType)) {
    copy.setUrl("/dataRoom/resource/file/" + copy.getId());
    if (StringUtils.isNotBlank(copy.getThumbnail())) {
        copy.setThumbnail("/dataRoom/resource/file/" + copy.getId() + "/thumbnail");
    }
}
```

- [x] **Step 3: Add proxy endpoints**

Add:

```java
@GetMapping("/file/{id}")
public void file(@PathVariable String id, HttpServletRequest request, HttpServletResponse response)
```

and:

```java
@GetMapping("/file/{id}/thumbnail")
public void thumbnail(@PathVariable String id, HttpServletRequest request, HttpServletResponse response)
```

No `@RequiresRoles` on either endpoint.

- [x] **Step 4: Support Range for main file**

Read `Range` header for main file responses and return `206 Partial Content` when present.

- [x] **Step 5: Update list/detail/delete**

Normalize list/detail responses. Delete storage objects before DB delete; on update, delete old objects after DB success.

## Task 4: Frontend Resource Upload Flow

**Files:**
- Modify: `dataRoomFront/src/dataroom-packages/resource/api.ts`
- Modify: `dataRoomFront/src/dataroom-packages/resource/index.vue`
- Preserve existing local file-name auto-fill helpers already present in the dirty worktree.

- [x] **Step 1: Add upload API helper**

Expose a method that posts multipart form data to `/dataRoom/resource/upload`.

- [x] **Step 2: Change file resource dialog submit**

Set resource `el-upload` to `auto-upload=false`. Keep selected main file and optional cover file in component state. On confirm, call unified upload. Directories continue using `insert/update`.

- [x] **Step 3: Preserve edit behavior**

When editing existing file resources, submit `id`, metadata, optional `file`, optional `cover`.

- [x] **Step 4: Verify frontend type check**

Run: `cd dataRoomFront && npm run type-check`

Expected: exit 0.

## Task 5: Designer Background Upload Compatibility

**Files:**
- Modify: `PageDesigner/ControlPanel.vue`
- Modify: `VisualScreenDesigner/ControlPanel.vue`

- [x] **Step 1: Ensure background uploads still use `/upload`**

Keep the immediate upload UX. The backend now persists a `ResourceEntity`, so continue reading `response.data.url`.

- [x] **Step 2: Verify resource list visibility**

Verified by `ResourceControllerTest`: upload without `parentCode` creates a persisted resource with `parentCode=root`, which is the path used by PageDesigner/VisualScreenDesigner background uploads.

## Task 6: Verification

**Files:**
- All modified backend and frontend files.

- [x] **Step 1: Backend verification**

Run: `mvn -q -DskipTests package`

Expected: exit 0.

- [x] **Step 2: Frontend verification**

Run: `cd dataRoomFront && npm run type-check`

Expected: exit 0.

- [x] **Step 3: Targeted frontend contract**

Run: `cd dataRoomFront && npx tsx src/dataroom-packages/resource/resourceForm.contract.ts` if the existing contract remains present.

Expected: exit 0.

- [x] **Step 4: Lint changed frontend files**

Run: `cd dataRoomFront && ./node_modules/.bin/eslint src/dataroom-packages/resource/index.vue src/dataroom-packages/resource/api.ts src/dataroom-packages/PageDesigner/ControlPanel.vue src/dataroom-packages/VisualScreenDesigner/ControlPanel.vue`

Expected: exit 0.

## Self-Review

- Spec coverage: storage type selection, local/minio implementations, unified upload, designer upload persistence, proxy reads, thumbnails, delete/update cleanup, and frontend flow are all mapped to tasks.
- Placeholder scan: no TBD/TODO placeholders.
- Type consistency: storage DTOs use `ResourceStoreRequest`, `StoredResource`, `ResourceStream`, and `ResourceFileVariant` consistently across tasks.
